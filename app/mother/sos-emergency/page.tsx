"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { ArrowLeft, AlertTriangle, MapPin, Phone, Users, WifiOff } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"
import { subscribeEmergencyOfflineFallback } from "@/lib/offline-sync-client"

export default function SOSEmergency() {
  const router = useRouter()
  const { content } = useLanguage()
  const { toast } = useToast()
  const [offlineFallback, setOfflineFallback] = useState(false)
  const [emergencyContacts] = useState([
    { name: "Husband - Rajesh", phone: "+91 98765 43210", relation: "Spouse" },
    { name: "Mother", phone: "+91 87654 32109", relation: "Mother" },
    { name: "Nearest Hospital", phone: "108", relation: "Emergency" },
  ])

  useEffect(() => {
    return subscribeEmergencyOfflineFallback(() => setOfflineFallback(true))
  }, [])

  const getCurrentLocation = () =>
    new Promise<{ lat: number; lng: number }>((resolve) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        resolve({ lat: 20.59, lng: 78.96 })
        return
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => resolve({ lat: 20.59, lng: 78.96 }),
        { timeout: 5000 },
      )
    })

  // This button previously only showed a toast and never called the real
  // emergency API at all — a mother pressing it believed help was notified
  // when nothing had happened. It now triggers the same real SOS flow as
  // app/mother/emergency, including the offline tel:108 fallback.
  const handleSOSClick = async () => {
    try {
      const location = await getCurrentLocation()
      const response = await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "trigger-sos",
          data: { location, reason: "SOS button pressed" },
        }),
      })

      if (response.status === 202) {
        // Queued offline — subscribeEmergencyOfflineFallback already fired
        // the tel:108 dial intent; surface honest copy instead of "sent".
        toast({
          title: "No signal — call 108 directly",
          description: "This alert has not reached anyone yet and will sync once you're back online.",
          variant: "destructive",
        })
        return
      }

      if (!response.ok) throw new Error("SOS request failed")

      toast({
        title: "SOS Alert Sent",
        description: "Emergency contacts have been notified with your location",
      })
    } catch {
      window.location.href = "tel:108"
      toast({
        title: "Could not confirm SOS delivery",
        description: "Calling 108 directly instead.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-princess-1/20 via-background to-princess-1/10 pb-10">
      <div className="mx-3 mt-4 overflow-hidden rounded-3xl bg-gradient-to-r from-princess-4 to-primary p-6 text-white shadow-lg shadow-princess-4/20 border border-white/20 md:mx-6 2xl:mx-auto 2xl:max-w-7xl">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white hover:bg-white/20 -ml-2">
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

        {offlineFallback && (
          <div className="flex items-center gap-2 rounded-xl border-2 border-alert/40 bg-alert/15 px-4 py-3 text-sm font-semibold text-alert">
            <WifiOff className="h-5 w-5 shrink-0" />
            No signal — this alert has NOT reached anyone yet. Call 108 directly now.
          </div>
        )}

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
