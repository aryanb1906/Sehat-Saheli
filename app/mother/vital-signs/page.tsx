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
    <div className="min-h-screen bg-gradient-to-br from-princess-1/20 via-white to-princess-1/10 pb-10">
      <div className="mx-3 mt-4 overflow-hidden rounded-3xl bg-gradient-to-r from-princess-4 to-primary p-6 text-white shadow-lg shadow-princess-4/20 border border-white/20 md:mx-6 2xl:mx-auto 2xl:max-w-7xl">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white hover:bg-white/20 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Vital Signs Tracker</h1>
            <p className="text-white/80 text-sm">Weight, blood pressure & heart rate</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4 max-w-xl mx-auto mb-20">
        {vitals.map((vital, idx) => (
          <Card key={idx} className="p-5 border border-princess-1 hover:border-princess-4/50 hover:shadow-lg transition-all shadow-[0_4px_16px_rgba(255,194,205,0.08)] bg-white group rounded-3xl">
            <div className="flex items-start justify-between mb-4 border-b border-princess-1/40 pb-3">
              <span className="text-[15px] font-bold text-[#660022]" suppressHydrationWarning>
                {new Date(vital.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </span>
              <div className="flex bg-princess-1/30 p-2 rounded-full group-hover:bg-princess-2/30 transition-colors">
                  <TrendingUp className="w-4 h-4 text-primary group-hover:text-princess-4 transition-colors" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              <div className="bg-princess-1/10 p-3 rounded-2xl">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Weight</p>
                <p className="font-bold text-xl text-foreground">{vital.weight} <span className="text-sm text-foreground/60 font-medium">kg</span></p>
              </div>
              <div className="bg-princess-1/10 p-3 rounded-2xl">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Blood Pressure</p>
                <p className="font-bold text-xl text-foreground">{vital.bp_systolic}<span className="text-muted-foreground/50">/</span>{vital.bp_diastolic}</p>
              </div>
              <div className="bg-princess-1/10 p-3 rounded-2xl">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Pulse</p>
                <p className="font-bold text-xl text-foreground">{vital.pulse} <span className="text-sm text-foreground/60 font-medium">bpm</span></p>
              </div>
              <div className="bg-princess-1/10 p-3 rounded-2xl flex flex-col justify-center">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Status</p>
                <div className="inline-flex items-center">
                    <span className="font-bold text-[13px] bg-success/15 text-success px-2 py-0.5 rounded-full inline-block">Normal</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="fixed bottom-6 right-6 z-40 md:right-[calc(50%-260px)]">
          <Button 
            className="h-14 w-14 rounded-full bg-primary hover:bg-princess-4 shadow-[0_8px_30px_rgba(252,52,104,0.4)] hover:-translate-y-1 transition-all !p-0"
            onClick={() => router.push("#")}
            aria-label="Log new vital sign"
          >
              <Plus className="h-6 w-6 text-white" />
          </Button>
      </div>
    </div>
  )
}
