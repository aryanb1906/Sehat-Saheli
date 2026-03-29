"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, LocateFixed, RefreshCw, Search, SlidersHorizontal,
  MapPinOff, Wifi, AlertCircle, ChevronDown, ChevronUp,
  TriangleAlert, Hospital as HospitalIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import type { Hospital, HospitalFinderResponse, LocationPermissionState, UserLocation } from "@/types/hospital"
import HospitalCard from "./HospitalCard"
import HospitalSkeleton from "./HospitalSkeleton"

// ── Dynamic Leaflet import (SSR disabled) ────────────────────────────────────
const HospitalMap = dynamic(() => import("./HospitalMap"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full rounded-2xl border border-border bg-muted flex items-center justify-center"
      style={{ height: 380 }}
    >
      <div className="text-center space-y-2">
        <div className="animate-spin text-3xl">🗺️</div>
        <p className="text-sm text-muted-foreground">Loading map…</p>
      </div>
    </div>
  ),
})

// ── Nominatim geocoding (city → lat/lon) ────────────────────────────────────
async function geocodeCity(city: string): Promise<{ lat: number; lon: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ", India")}&format=json&limit=1&countrycodes=in`
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "SehatSaheli/1.0 (maternal health app)" },
    })
    const data = await res.json()
    if (!data?.length) return null
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}

// ── Types ────────────────────────────────────────────────────────────────────
type FilterMode = "all" | "emergency"
type SortMode = "distance" | "name" | "emergency"

// ── Component ────────────────────────────────────────────────────────────────
export default function HospitalFinder() {
  const router = useRouter()

  // Location state
  const [locationState, setLocationState] = useState<LocationPermissionState>("idle")
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)

  // City fallback (manual entry)
  const [cityInput, setCityInput] = useState("")
  const [showManualInput, setShowManualInput] = useState(false)

  // Fetch state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [apiMeta, setApiMeta] = useState<Pick<HospitalFinderResponse, "total" | "radiusKm" | "cachedAt" | "source"> | null>(null)

  // UI state
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showMap, setShowMap] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filterMode, setFilterMode] = useState<FilterMode>("all")
  const [sortMode, setSortMode] = useState<SortMode>("distance")
  const [radiusKm, setRadiusKm] = useState(5)

  const lastFetchRef = useRef<{ lat: number; lon: number; radius: number } | null>(null)

  // ── Fetch hospitals from our backend API ─────────────────────────────────
  const fetchHospitals = useCallback(async (lat: number, lon: number, radiusMetres: number) => {
    setLoading(true)
    setError(null)
    setHospitals([])
    setSelectedId(null)
    lastFetchRef.current = { lat, lon, radius: radiusMetres }

    try {
      const res = await fetch(
        `/api/hospital-finder?lat=${lat}&lon=${lon}&radius=${radiusMetres}`,
        { cache: "no-store" }
      )
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || `Server error ${res.status}`)
      }
      const data: HospitalFinderResponse = await res.json()
      setHospitals(data.hospitals)
      setApiMeta({
        total: data.total,
        radiusKm: data.radiusKm,
        cachedAt: data.cachedAt,
        source: data.source,
      })
    } catch (e: any) {
      setError(e?.message || "Failed to load hospitals. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }, [])

  // ── GPS Location request ─────────────────────────────────────────────────
  const requestGPS = useCallback(async () => {
    if (!navigator?.geolocation) {
      setLocationState("unavailable")
      setShowManualInput(true)
      return
    }

    setLocationState("requesting")

    // Check if permissions API is available to handle 'prompt' state gracefully
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const status = await navigator.permissions.query({ name: "geolocation" as PermissionName })
        if (status.state === "denied") {
          setLocationState("denied")
          setShowManualInput(true)
          return
        }
        
        // Listen for user changing permission in browser settings
        status.onchange = () => {
          if (status.state === "granted") {
            requestGPS()
          }
        }
      }
    } catch (e) {
      console.warn("Permissions API not supported:", e)
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: UserLocation = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }
        setUserLocation(loc)
        setLocationState("granted")
        // Use functional state for latest radius if radiusKm hasn't settled yet
        fetchHospitals(loc.lat, loc.lon, radiusKm * 1000)
      },
      (err) => {
        console.warn("GPS error:", err)
        // Check for common permission denial (code 1)
        if (err.code === 1) {
          setLocationState("denied")
        } else {
          setLocationState("unavailable")
        }
        setShowManualInput(true)
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, // Slightly longer timeout to allow user to react to prompt
        maximumAge: 0   // Force fresh location
      }
    )
  }, [fetchHospitals, radiusKm])

  // Auto-request GPS on mount
  useEffect(() => {
    const initGPS = async () => {
      // First check if already granted to avoid unnecessary state flickering
      if (navigator.permissions && navigator.permissions.query) {
        const status = await navigator.permissions.query({ name: "geolocation" as PermissionName })
        if (status.state === "granted") {
          requestGPS()
          return
        }
      }
      // Otherwise, trigger the prompt
      requestGPS()
    }
    
    initGPS()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Manual city search ───────────────────────────────────────────────────
  const handleCitySearch = useCallback(async () => {
    if (!cityInput.trim()) return
    setLoading(true)
    setError(null)

    const coords = await geocodeCity(cityInput.trim())
    if (!coords) {
      setLoading(false)
      setError(`Could not find "${cityInput}". Try a different city name.`)
      return
    }
    setUserLocation({ ...coords, accuracy: 5000 })
    setLocationState("granted")
    fetchHospitals(coords.lat, coords.lon, radiusKm * 1000)
  }, [cityInput, fetchHospitals, radiusKm])

  // ── Refresh with updated radius ──────────────────────────────────────────
  const handleRadiusChange = useCallback((val: number[]) => {
    setRadiusKm(val[0])
  }, [])

  const applyRadius = useCallback(() => {
    if (!userLocation) return
    fetchHospitals(userLocation.lat, userLocation.lon, radiusKm * 1000)
  }, [userLocation, radiusKm, fetchHospitals])

  // ── Derived: filtered + sorted list ─────────────────────────────────────
  const displayHospitals = React.useMemo(() => {
    let list = hospitals.slice()
    if (filterMode === "emergency") list = list.filter((h) => h.emergency)
    if (sortMode === "name") list.sort((a, b) => a.name.localeCompare(b.name))
    else if (sortMode === "emergency") list.sort((a, b) => (b.emergency ? 1 : 0) - (a.emergency ? 1 : 0))
    else list.sort((a, b) => a.distance - b.distance) // "distance" always default
    return list
  }, [hospitals, filterMode, sortMode])

  const emergencyCount = hospitals.filter((h) => h.emergency).length

  // ── Scroll to selected card ──────────────────────────────────────────────
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  useEffect(() => {
    if (selectedId) {
      cardRefs.current.get(selectedId)?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [selectedId])

  // ── Render helpers ───────────────────────────────────────────────────────
  function renderLocationBanner() {
    if (locationState === "requesting") {
      return (
        <Card className="p-4 flex items-center gap-3 bg-trust/5 border-trust/30">
          <div className="animate-spin text-xl">📡</div>
          <div>
            <p className="font-semibold text-sm">Getting your location…</p>
            <p className="text-xs text-muted-foreground">Please allow location access when prompted</p>
          </div>
        </Card>
      )
    }
    if (locationState === "denied") {
      return (
        <Card className="p-4 bg-warning/5 border-warning/30">
          <div className="flex items-start gap-3">
            <TriangleAlert className="w-5 h-5 text-warning mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Location access denied</p>
              <p className="text-xs text-muted-foreground mb-3">
                Your browser blocked location access. Enable it in browser settings, or search by city below.
              </p>
              <Button size="sm" variant="outline" onClick={requestGPS} className="gap-2">
                <LocateFixed className="w-4 h-4" /> Try Again
              </Button>
            </div>
          </div>
        </Card>
      )
    }
    if (locationState === "unavailable") {
      return (
        <Card className="p-4 bg-muted border-border">
          <div className="flex items-center gap-3">
            <MapPinOff className="w-5 h-5 text-muted-foreground shrink-0" />
            <div>
              <p className="font-semibold text-sm">GPS not available</p>
              <p className="text-xs text-muted-foreground">Search by city name instead</p>
            </div>
          </div>
        </Card>
      )
    }
    if (locationState === "granted" && userLocation) {
      return (
        <Card className="p-3 flex items-center gap-3 bg-success/5 border-success/30">
          <div className="relative flex-shrink-0">
            <div className="w-3 h-3 rounded-full bg-success" />
            <div className="absolute inset-0 rounded-full bg-success animate-ping opacity-60" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-success">Location found</p>
            <p className="text-xs text-muted-foreground truncate">
              {userLocation.lat.toFixed(4)}°N, {userLocation.lon.toFixed(4)}°E
              {userLocation.accuracy < 200 && " · ±" + Math.round(userLocation.accuracy) + "m"}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={requestGPS}
            className="gap-1.5 shrink-0"
            title="Refresh location"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </Card>
      )
    }
    return null
  }

  function renderEmpty() {
    if (loading || hospitals.length > 0 || !userLocation) return null
    if (error) return null
    return (
      <Card className="p-8 text-center space-y-3">
        <div className="text-5xl">🏥</div>
        <p className="font-semibold">No hospitals found nearby</p>
        <p className="text-sm text-muted-foreground">
          Try increasing the search radius or searching in a different location.
        </p>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            setRadiusKm((r) => Math.min(r + 5, 20))
            if (userLocation) fetchHospitals(userLocation.lat, userLocation.lon, (radiusKm + 5) * 1000)
          }}
        >
          Expand to {radiusKm + 5} km
        </Button>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-princess-1/20 via-white to-princess-1/10 pb-10">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mx-3 mt-4 overflow-hidden rounded-3xl bg-gradient-to-r from-princess-4 to-primary p-5 text-white sticky top-4 z-30 shadow-lg shadow-princess-4/20 border border-white/20 md:mx-6 2xl:mx-auto 2xl:max-w-7xl ">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <HospitalIcon className="w-5 h-5" />
              Hospital Finder
            </h1>
            <p className="text-white/80 text-xs">Nearby hospitals & emergency care</p>
          </div>
          {/* Emergency count badge */}
          {emergencyCount > 0 && (
            <Badge className="bg-red-500/20 text-white border-red-300/40 gap-1 shrink-0">
              <AlertCircle className="w-3 h-3" />
              {emergencyCount} Emergency
            </Badge>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4 pb-20">
        {/* ── Location banner ──────────────────────────────────────────────── */}
        {renderLocationBanner()}

        {/* ── Manual city fallback ─────────────────────────────────────────── */}
        {(showManualInput || locationState === "idle") && (
          <Card className="p-4 space-y-3">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Search className="w-4 h-4 text-success" />
              Search by City
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Jaipur, Udaipur, Bhopal…"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCitySearch()}
                className="flex-1"
                aria-label="City name"
              />
              <Button
                onClick={handleCitySearch}
                disabled={loading || !cityInput.trim()}
                className="bg-success text-white hover:bg-success/90 gap-2 shrink-0"
              >
                <Search className="w-4 h-4" />
                Search
              </Button>
            </div>
            {!showManualInput && (
              <Button
                variant="link"
                size="sm"
                className="text-success p-0 h-auto"
                onClick={() => setShowManualInput(true)}
              >
                Search by city instead →
              </Button>
            )}
          </Card>
        )}

        {/* ── Quick GPS button when idle ────────────────────────────────────── */}
        {locationState === "idle" && (
          <Button
            onClick={requestGPS}
            className="w-full gap-2 bg-success text-white hover:bg-success/90 h-12"
          >
            <LocateFixed className="w-5 h-5" />
            Use My Current Location (GPS)
          </Button>
        )}

        {/* ── Filter & sort controls ───────────────────────────────────────── */}
        {hospitals.length > 0 && (
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Result count */}
                <span className="text-sm text-muted-foreground">
                  Showing <b>{displayHospitals.length}</b> of {hospitals.length}
                  {apiMeta && ` within ${apiMeta.radiusKm} km`}
                </span>
                {apiMeta?.source === "cache" && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Wifi className="w-3 h-3" /> Cached
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters((f) => !f)}
                className="gap-1.5"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </Button>
            </div>

            {showFilters && (
              <div className="mt-4 space-y-4 border-t pt-4">
                {/* Filter: type */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">FILTER BY TYPE</p>
                  <div className="flex gap-2 flex-wrap">
                    {(["all", "emergency"] as FilterMode[]).map((f) => (
                      <Button
                        key={f}
                        size="sm"
                        variant={filterMode === f ? "default" : "outline"}
                        onClick={() => setFilterMode(f)}
                        className={filterMode === f ? "bg-success text-white" : ""}
                      >
                        {f === "all" ? `All (${hospitals.length})` : `Emergency (${emergencyCount})`}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">SORT BY</p>
                  <div className="flex gap-2 flex-wrap">
                    {([
                      ["distance", "📍 Distance"],
                      ["name", "🔤 Name"],
                      ["emergency", "🚨 Emergency first"],
                    ] as [SortMode, string][]).map(([s, label]) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={sortMode === s ? "default" : "outline"}
                        onClick={() => setSortMode(s)}
                        className={sortMode === s ? "bg-success text-white" : ""}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Radius */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    SEARCH RADIUS: <span className="text-success">{radiusKm} km</span>
                  </p>
                  <Slider
                    min={1}
                    max={20}
                    step={1}
                    value={[radiusKm]}
                    onValueChange={handleRadiusChange}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>1 km</span>
                    <span>20 km</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={applyRadius}
                    disabled={loading || !userLocation}
                    className="bg-success text-white gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Apply Radius
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* ── Map toggle ───────────────────────────────────────────────────── */}
        {userLocation && hospitals.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-muted-foreground">Map View</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMap((m) => !m)}
              className="gap-1.5 text-success"
            >
              {showMap ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showMap ? "Hide" : "Show"} Map
            </Button>
          </div>
        )}

        {/* ── Leaflet Map ──────────────────────────────────────────────────── */}
        {userLocation && hospitals.length > 0 && showMap && (
          <HospitalMap
            userLocation={userLocation}
            hospitals={displayHospitals}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        )}

        {/* ── Error state ──────────────────────────────────────────────────── */}
        {error && (
          <Card className="p-4 bg-destructive/5 border-destructive/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-destructive">Something went wrong</p>
                <p className="text-xs text-muted-foreground mt-1">{error}</p>
                {userLocation && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 gap-2"
                    onClick={() => fetchHospitals(userLocation.lat, userLocation.lon, radiusKm * 1000)}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* ── Loading skeletons ────────────────────────────────────────────── */}
        {loading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <HospitalSkeleton key={i} />
            ))}
          </div>
        )}

        {/* ── Empty state ──────────────────────────────────────────────────── */}
        {renderEmpty()}

        {/* ── Hospital list ─────────────────────────────────────────────────── */}
        {!loading && displayHospitals.length > 0 && (
          <div className="space-y-3">
            {displayHospitals.map((hospital, index) => (
              <div
                key={hospital.id}
                ref={(el) => { if (el) cardRefs.current.set(hospital.id, el) }}
              >
                <HospitalCard
                  hospital={hospital}
                  index={index}
                  isSelected={selectedId === hospital.id}
                  onSelect={() => setSelectedId((prev) => prev === hospital.id ? null : hospital.id)}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── Footer note ──────────────────────────────────────────────────── */}
        {hospitals.length > 0 && (
          <p className="text-xs text-center text-muted-foreground pb-4">
            Data from{" "}
            <a
              href="https://www.openstreetmap.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              OpenStreetMap
            </a>{" "}
            via Overpass API · Updated {apiMeta?.cachedAt ? new Date(apiMeta.cachedAt).toLocaleTimeString() : "—"}
          </p>
        )}
      </div>
    </div>
  )
}
