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
  distance: number
  rating: number
  services: string[]
  phone: string
  address: string
}

export default function HospitalFinder() {
  const router = useRouter()
  const { content } = useLanguage()
  const [hospitals] = React.useState<Hospital[]>([
    {
      id: "1",
      name: "Metro Hospital",
      distance: 2.5,
      rating: 4.8,
      services: ["24/7 Emergency", "ICU", "Labour Room"],
      phone: "+91 11 4000 4000",
      address: "123 Main St, Delhi",
    },
    {
      id: "2",
      name: "City Medical Center",
      distance: 5.2,
      rating: 4.5,
      services: ["Emergency", "Labour", "Pediatric"],
      phone: "+91 11 4100 4100",
      address: "456 Park Ave, Delhi",
    },
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-success/10 to-background">
      <div className="bg-gradient-to-r from-success to-success/80 p-6 text-white">
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
        {hospitals.map((hospital) => (
          <Card key={hospital.id} className="p-4 border-2 border-success/20">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{hospital.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold">{hospital.rating}</span>
                  <span className="text-xs text-muted-foreground">• {hospital.distance} km away</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {hospital.address}
            </p>

            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-2">Services</p>
              <div className="flex flex-wrap gap-2">
                {hospital.services.map((service) => (
                  <span key={service} className="px-2 py-1 bg-success/10 text-success text-xs rounded">
                    {service}
                  </span>
                ))}
              </div>
            </div>

            <Button className="w-full bg-success text-white">
              <Phone className="w-4 h-4 mr-2" /> Call Now
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
