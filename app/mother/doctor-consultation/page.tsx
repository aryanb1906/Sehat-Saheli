"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Video, Phone, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"

interface Consultation {
  id: string
  doctor: string
  type: "video" | "phone" | "in-person"
  date: string
  time: string
  status: "scheduled" | "completed" | "cancelled"
}

export default function DoctorConsultation() {
  const router = useRouter()
  const { content } = useLanguage()
  const [consultations] = useState<Consultation[]>([
    { id: "1", doctor: "Dr. Sharma", type: "video", date: "2025-02-10", time: "10:00 AM", status: "scheduled" },
    { id: "2", doctor: "Dr. Patel", type: "phone", date: "2025-02-01", time: "2:00 PM", status: "completed" },
  ])

  const getTypeIcon = (type: string) => {
    return type === "video" ? <Video className="w-5 h-5" /> : <Phone className="w-5 h-5" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-care/10 to-background">
      <div className="bg-gradient-to-r from-care to-care/80 p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Doctor Consultations</h1>
            <p className="text-white/80 text-sm">Book and manage consultations</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {consultations.map((consultation) => (
          <Card key={consultation.id} className="p-4 border-2 border-care/20">
            <div className="flex items-start gap-3 mb-3">
              {getTypeIcon(consultation.type)}
              <div className="flex-1">
                <h3 className="font-semibold">{consultation.doctor}</h3>
                <p className="text-sm text-muted-foreground">{consultation.type === "video" ? "Video Call" : "Phone Call"}</p>
              </div>
              {consultation.status === "completed" && <Check className="w-5 h-5 text-success" />}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-semibold">{new Date(consultation.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="font-semibold">{consultation.time}</p>
              </div>
            </div>
            {consultation.status === "scheduled" && (
              <Button className="w-full bg-care text-white">Join Consultation</Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
