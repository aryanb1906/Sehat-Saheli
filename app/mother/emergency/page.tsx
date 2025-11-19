"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Phone, User, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function Emergency() {
  const router = useRouter()

  const emergencyContacts = [
    { name: "ASHA Worker - Meera Devi", number: "+91 98765 43210", type: "ASHA" },
    { name: "Local Hospital", number: "102", type: "Hospital" },
    { name: "Ambulance Service", number: "108", type: "Ambulance" },
  ]

  const handleCall = (number: string) => {
    // In a real app, this would trigger a phone call
    alert(`Calling ${number}...`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-alert/10 to-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-alert to-alert/80 p-6 text-white">
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
        {/* Warning Card */}
        <Card className="p-4 bg-alert/20 border-alert">
          <p className="text-sm leading-relaxed text-center font-semibold">
            ⚠️ For life-threatening emergencies, call 108 immediately
          </p>
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
      </div>
    </div>
  )
}
