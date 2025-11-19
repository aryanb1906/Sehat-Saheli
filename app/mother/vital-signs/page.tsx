"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, TrendingUp } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"

interface VitalReading {
  date: string
  weight: number
  bp_systolic: number
  bp_diastolic: number
  pulse: number
}

export default function VitalSigns() {
  const router = useRouter()
  const { content } = useLanguage()
  const [vitals, setVitals] = useState<VitalReading[]>([
    { date: "2025-01-15", weight: 65, bp_systolic: 120, bp_diastolic: 80, pulse: 72 },
    { date: "2025-01-08", weight: 64.5, bp_systolic: 118, bp_diastolic: 78, pulse: 70 },
    { date: "2025-01-01", weight: 64, bp_systolic: 115, bp_diastolic: 75, pulse: 68 },
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/10 to-background">
      <div className="bg-gradient-to-r from-accent to-accent/80 p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Vital Signs Tracker</h1>
            <p className="text-white/80 text-sm">Weight, blood pressure & heart rate</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {vitals.map((vital, idx) => (
          <Card key={idx} className="p-4 border-2 border-accent/20">
            <div className="flex items-start justify-between mb-3">
              <span className="font-semibold">{new Date(vital.date).toLocaleDateString()}</span>
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Weight</p>
                <p className="font-bold text-lg">{vital.weight} kg</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Blood Pressure</p>
                <p className="font-bold">{vital.bp_systolic}/{vital.bp_diastolic}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pulse</p>
                <p className="font-bold">{vital.pulse} bpm</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-bold text-success">Normal</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
