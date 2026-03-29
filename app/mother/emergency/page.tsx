"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Phone, User, AlertCircle, Ambulance, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function Emergency() {
  const router = useRouter()
  const [sosSent, setSosSent] = useState(false)

  const emergencyContacts = [
    { name: "ASHA Worker - Meera Devi", number: "+91 98765 43210", type: "ASHA" },
    { name: "Local Hospital", number: "102", type: "Hospital" },
    { name: "Ambulance Service", number: "108", type: "Ambulance" },
  ]

  const emergencyCard = {
    motherName: "Anita Kumari",
    dueDate: "2026-06-22",
    bloodGroup: "B+",
    allergies: "No known drug allergy",
    highRiskFlag: "Elevated BP history",
  }

  const transportOptions = [
    { name: "Govt Ambulance", eta: "8-12 min", contact: "108", fallback: false },
    { name: "Community Driver", eta: "15-20 min", contact: "+91 98765 00011", fallback: true },
    { name: "Backup Auto Service", eta: "20-25 min", contact: "+91 98765 22233", fallback: true },
  ]

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`
  }

  const triggerSOS = async () => {
    try {
      await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "trigger-sos",
          data: {
            userId: "demo-mother",
            location: { lat: 20.59, lng: 78.96 },
            reason: "Emergency from maternal danger signs",
          },
        }),
      })
      setSosSent(true)
    } catch {
      setSosSent(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-princess-1/20 via-white to-princess-1/10 pb-10">
      {/* Header */}
      <div className="mx-3 mt-4 overflow-hidden rounded-3xl bg-gradient-to-r from-princess-4 to-primary p-6 text-white shadow-lg shadow-princess-4/20 border border-white/20 md:mx-6 2xl:mx-auto 2xl:max-w-7xl">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Emergency Help
            </h1>
            <p className="text-white/80 text-sm">Quick access to help</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <Card className="p-4 border-alert/30 bg-alert/5">
          <h2 className="font-semibold mb-2">Emergency Card</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><span className="text-muted-foreground">Name:</span> {emergencyCard.motherName}</p>
            <p><span className="text-muted-foreground">Due Date:</span> {new Date(emergencyCard.dueDate).toLocaleDateString()}</p>
            <p><span className="text-muted-foreground">Blood Group:</span> {emergencyCard.bloodGroup}</p>
            <p><span className="text-muted-foreground">Allergy:</span> {emergencyCard.allergies}</p>
          </div>
          <p className="text-xs text-warning mt-2">Risk Note: {emergencyCard.highRiskFlag}</p>
        </Card>

        {/* Warning Card */}
        <Card className="p-4 bg-alert/20 border-alert">
          <p className="text-sm leading-relaxed text-center font-semibold">
            ⚠️ For life-threatening emergencies, call 108 immediately
          </p>
          <Button onClick={triggerSOS} className="w-full mt-3 bg-alert text-white hover:bg-alert/90">
            <AlertCircle className="w-4 h-4 mr-2" />
            Trigger SOS to Family + ASHA
          </Button>
          {sosSent && <p className="text-xs text-center mt-2">SOS alert sent to saved contacts.</p>}
        </Card>

        {/* Emergency Contacts */}
        {emergencyContacts.map((contact, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-alert/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-alert" />
                </div>
                <div>
                  <h3 className="font-semibold">{contact.name}</h3>
                  <p className="text-sm text-muted-foreground">{contact.number}</p>
                </div>
              </div>
              <Button
                onClick={() => handleCall(contact.number)}
                size="icon"
                className="bg-alert hover:bg-alert/90 w-14 h-14 rounded-full"
              >
                <Phone className="w-6 h-6" />
              </Button>
            </div>
          </Card>
        ))}

        <Card className="p-4 border-trust/30">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Ambulance className="w-5 h-5 text-trust" />
            Transport Directory (ETA + Backup)
          </h3>
          <div className="space-y-2">
            {transportOptions.map((option) => (
              <div key={option.name} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium text-sm">{option.name}</p>
                  <p className="text-xs text-muted-foreground">ETA: {option.eta}</p>
                </div>
                <div className="flex items-center gap-2">
                  {option.fallback && <span className="text-[10px] rounded bg-warning/10 px-2 py-1 text-warning">Fallback</span>}
                  <Button size="sm" variant="outline" onClick={() => handleCall(option.contact)}>
                    <Car className="w-4 h-4 mr-1" />
                    Call
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
