"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function RescheduleAppointment() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    date: "",
    time: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.date || !formData.time) {
      alert("Please select both date and time")
      return
    }

    toast({
      title: "Appointment Rescheduled!",
      description: `Your appointment has been moved to ${new Date(formData.date).toLocaleDateString("en-IN")} at ${formData.time}`,
    })
    router.push("/mother/appointments")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-trust/10 to-background">
      <div className="bg-gradient-to-r from-trust to-accent p-6 text-white">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Reschedule Appointment</h1>
            <p className="text-white/80 text-sm">Choose a new date and time</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="date">New Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">New Time *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-3">
              <Button type="button" onClick={() => router.back()} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-trust hover:bg-trust/90">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
