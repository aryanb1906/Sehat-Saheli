"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function AddAppointment() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    type: "",
    location: "",
    doctor: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.date || !formData.time || !formData.type || !formData.doctor) {
      alert("Please fill in all required fields")
      return
    }

    toast({
      title: "Appointment Scheduled!",
      description: `Your ${formData.type} is scheduled for ${new Date(formData.date).toLocaleDateString("en-IN")} at ${formData.time}`,
    })
    router.back()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-trust/10 to-background">
      <div className="bg-gradient-to-r from-trust to-accent p-6 text-white">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Schedule Appointment</h1>
            <p className="text-white/80 text-sm">Book your next medical visit</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
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
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Appointment Type *</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="e.g., Regular Checkup, Ultrasound, Blood Test"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctor">Doctor Name *</Label>
              <Input
                id="doctor"
                value={formData.doctor}
                onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                placeholder="e.g., Dr. Anjali Sharma"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Primary Health Center, Village"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special instructions or things to remember..."
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full bg-trust hover:bg-trust/90">
              <Save className="w-4 h-4 mr-2" />
              Schedule Appointment
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
