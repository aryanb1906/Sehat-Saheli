"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Phone, Star } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"

interface Hospital {
  id: string
  name: string
  distance?: number
  rating?: number
  services?: string[]
  phone?: string | null
  address?: string | null
  lat?: number
  lon?: number
}

export default function HospitalFinder() {
  const router = useRouter()
  const { content } = useLanguage()
  const [hospitals, setHospitals] = React.useState<Hospital[]>([])
  const [city, setCity] = React.useState<string>("")
  const [address, setAddress] = React.useState<string>("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [center, setCenter] = React.useState<{ lat: number; lon: number } | null>(null)
  return (
    <div className="min-h-screen bg-linear-to-br from-success/10 to-background">
      <div className="bg-linear-to-r from-success to-success/80 p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Hospital Finder</h1>
            <p className="text-white/80 text-sm">Find nearby hospitals & emergency facilities</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              aria-label="City"
              placeholder="Enter city (e.g. Udaipur, India)"
              value={city}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
              className="col-span-1 md:col-span-2 p-2 border rounded bg-background"
            />
            <input
              aria-label="Address (optional)"
              placeholder="Address or landmark (optional)"
              value={address}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && fetchHospitals()}
              className="p-2 border rounded bg-background"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <Button onClick={fetchHospitals} className="bg-success text-white">Search</Button>
            <Button variant="ghost" onClick={() => { setCity(''); setAddress(''); setHospitals([]); setError(null); }}>Clear</Button>
          </div>
        </Card>

        {loading && (
          <Card className="p-4">Searching for hospitals in {city}...</Card>
        )}

        {error && (
          <Card className="p-4 border border-destructive">Error: {error}</Card>
        )}

        {!loading && hospitals.length === 0 && !error && (
          <Card className="p-4">No hospitals found yet. Enter a city and press Search.</Card>
        )}

        {hospitals.map((hospital) => (
          <Card key={hospital.id} className="p-4 border-2 border-success/20">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{hospital.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {/* <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> */}
                  <span className="text-sm font-semibold">{hospital.rating ?? '-'}</span>
                  {hospital.distance !== undefined && (
                    <span className="text-xs text-muted-foreground">• {hospital.distance} km away</span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {hospital.address || 'Address not available'}
            </p>

            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-2">Services</p>
              <div className="flex flex-wrap gap-2">
                {(hospital.services || []).map((service) => (
                  <span key={service} className="px-2 py-1 bg-success/10 text-success text-xs rounded">
                    {service}
                  </span>
                ))}
              </div>
            </div>

            <Button className="w-full bg-success text-white" onClick={() => callNumber(hospital.phone)}>
              <Phone className="w-4 h-4 mr-2" /> {hospital.phone ? 'Call Now' : 'No phone'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )

  async function fetchHospitals() {
    if (!city || city.trim().length === 0) {
      setError('Please enter a city name')
      return
    }

    setError(null)
    setLoading(true)
    setHospitals([])

    try {
      // Build the geocode query: prefer full address if provided, otherwise city
      const geocodeQuery = (address && address.trim().length > 0) ? `${address}, ${city}` : city

      // 1) Geocode using Nominatim to get coordinates
      const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(geocodeQuery)}&format=json&limit=1&addressdetails=1`
      const nomRes = await fetch(nomUrl)
      if (!nomRes.ok) throw new Error('Failed to geocode location')
      const places = await nomRes.json()
      if (!places || places.length === 0) throw new Error('Location not found')

      const lat = parseFloat(places[0].lat)
      const lon = parseFloat(places[0].lon)

      // 2) Query Overpass for hospitals around the coordinates (5km radius)
      const radius = 5000
      const overpassQL = `[out:json][timeout:25];(node["amenity"="hospital"](around:${radius},${lat},${lon});way["amenity"="hospital"](around:${radius},${lat},${lon});relation["amenity"="hospital"](around:${radius},${lat},${lon}););out center;`;
      const overpassUrl = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(overpassQL)
      const ovRes = await fetch(overpassUrl)
      if (!ovRes.ok) throw new Error('Failed to fetch hospitals')
      const ovJson = await ovRes.json()

      const items = (ovJson.elements || []).map((el: any) => {
        const elLat = el.type === 'node' ? el.lat : el.center?.lat
        const elLon = el.type === 'node' ? el.lon : el.center?.lon
        return {
          id: `${el.type}/${el.id}`,
          name: el.tags?.name || 'Unnamed Hospital',
          phone: el.tags?.phone || el.tags?.['contact:phone'] || null,
          address: [el.tags?.['addr:street'], el.tags?.['addr:housenumber'], el.tags?.village, el.tags?.city]
            .filter(Boolean)
            .join(', '),
          services: [],
          rating: undefined,
          distance: undefined,
          lat: elLat,
          lon: elLon,
        } as unknown as Hospital
      }).slice(0, 50)

      setHospitals(items)
    } catch (err: any) {
      setError(err?.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  function callNumber(phone?: string | null) {
    if (!phone) return alert('Phone number not available')
    // open dialer
    window.location.href = `tel:${phone}`
  }

}
