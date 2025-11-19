"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { ArrowLeft, AlertTriangle, MapPin, Phone, Users } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"

export default function SOSEmergency() {
  const router = useRouter()
  const { content } = useLanguage()
  const { toast } = useToast()
  const [emergencyContacts] = useState([
    { name: "Husband - Rajesh", phone: "+91 98765 43210", relation: "Spouse" },
    { name: "Mother", phone: "+91 87654 32109", relation: "Mother" },
    { name: "Nearest Hospital", phone: "108", relation: "Emergency" },
  ])

  const handleSOSClick = () => {
    toast({
      title: "SOS Alert Sent",
      description: "Emergency contacts have been notified with your location",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-alert/10 to-background">
      <div className="bg-gradient-to-r from-alert to-alert/80 p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">SOS Emergency</h1>
            <p className="text-white/80 text-sm">One-tap emergency alert system</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <Button onClick={handleSOSClick} className="w-full h-24 bg-alert text-white text-2xl font-bold hover:bg-alert/90">
          <AlertTriangle className="w-8 h-8 mr-3 animate-pulse" /> SOS - EMERGENCY
        </Button>

        <Card className="p-4 bg-alert/5 border-2 border-alert/30">
          <div className="flex gap-3">
            <MapPin className="w-5 h-5 text-alert shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">Your Location</h3>
              <p className="text-sm text-muted-foreground">Latitude: 28.7041, Longitude: 77.1025</p>
              <p className="text-xs text-muted-foreground mt-1">Will be shared with emergency contacts</p>
            </div>
          </div>
        </Card>

        <div>
          <h3 className="font-semibold mb-3">Emergency Contacts</h3>
          <div className="space-y-3">
            {emergencyContacts.map((contact, idx) => (
              <Card key={idx} className="p-4 border-2 border-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold">{contact.name}</p>
                    <p className="text-xs text-muted-foreground">{contact.relation}</p>
                  </div>
                  <Button size="icon" className="bg-alert text-white">
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm font-mono">{contact.phone}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
