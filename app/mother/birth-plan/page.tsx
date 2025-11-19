"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, FileText } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"

export default function BirthPlan() {
  const router = useRouter()
  const { content } = useLanguage()
  const [preferences, setPreferences] = useState({
    location: "Hospital",
    birthPosition: "Natural",
    painManagement: "Breathing techniques",
    support: "Husband and mother",
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm/10 to-background">
      <div className="bg-gradient-to-r from-warm to-warm/80 p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">My Birth Plan</h1>
            <p className="text-white/80 text-sm">Create your personalized birth plan</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Delivery Location</label>
              <select className="w-full p-2 border rounded bg-background">
                <option>Hospital</option>
                <option>Birthing Center</option>
                <option>Home</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Birth Position Preference</label>
              <select className="w-full p-2 border rounded bg-background">
                <option>Natural Position</option>
                <option>Sitting</option>
                <option>Squatting</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Pain Management</label>
              <textarea className="w-full p-2 border rounded bg-background" rows={3} defaultValue={preferences.painManagement} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Support People</label>
              <textarea className="w-full p-2 border rounded bg-background" rows={3} defaultValue={preferences.support} />
            </div>
          </div>
        </Card>

        <Button className="w-full bg-warm text-white">
          <Save className="w-4 h-4 mr-2" /> Save Birth Plan
        </Button>
        <Button variant="outline" className="w-full">
          <FileText className="w-4 h-4 mr-2" /> Download PDF
        </Button>
      </div>
    </div>
  )
}
