"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { ArrowLeft, Zap, Clock, AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"

export default function LaborSigns() {
  const router = useRouter()
  const { content } = useLanguage()
  const [contractionCount, setContractionCount] = useState(0)
  const [lastContraction, setLastContraction] = useState<Date | null>(null)

  const handleContractionClick = () => {
    const now = new Date()
    setLastContraction(now)
    setContractionCount(c => c + 1)
  }

  const laborSigns = [
    { title: "Regular Contractions", description: "Painful contractions 5-10 minutes apart" },
    { title: "Vaginal Discharge", description: "Increased discharge or bloody show" },
    { title: "Water Breaking", description: "Sudden gush or continuous leaking of fluids" },
    { title: "Lower Back Pain", description: "Severe lower back pain with contractions" },
    { title: "Pelvic Pressure", description: "Feeling of baby dropping into pelvis" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-alert/10 to-background">
      <div className="bg-gradient-to-r from-alert to-alert/80 p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Labor Signs Tracker</h1>
            <p className="text-white/80 text-sm">Monitor contractions and labor signs</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <Card className="p-6 bg-gradient-to-br from-alert/10 to-alert/5 border-2 border-alert/30">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" /> Contraction Timer
          </h3>
          <div className="text-center mb-4">
            <p className="text-3xl font-bold text-alert">{contractionCount}</p>
            <p className="text-sm text-muted-foreground">Total Contractions</p>
          </div>
          <Button onClick={handleContractionClick} className="w-full bg-alert text-white">
            <Zap className="w-4 h-4 mr-2" /> Log Contraction
          </Button>
        </Card>

        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Common Labor Signs
          </h3>
          {laborSigns.map((sign, idx) => (
            <Card key={idx} className="p-4 border-2 border-muted/30">
              <h4 className="font-semibold mb-1">{sign.title}</h4>
              <p className="text-sm text-muted-foreground">{sign.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
