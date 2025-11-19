"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Heart, Smile, Frown, Meh } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function MentalHealth() {
  const router = useRouter()
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [showTips, setShowTips] = useState(false)

  const moods = [
    { value: "happy", label: "Happy", icon: Smile, color: "bg-success" },
    { value: "okay", label: "Okay", icon: Meh, color: "bg-warning" },
    { value: "sad", label: "Sad", icon: Frown, color: "bg-alert" },
  ]

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood)
    setShowTips(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-care/10 to-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-care to-care/80 p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Mental Health Check</h1>
            <p className="text-white/80 text-sm">Your feelings matter</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Mood Selection */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Heart className="w-6 h-6 text-care" />
            How are you feeling today?
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {moods.map((mood) => (
              <Button
                key={mood.value}
                onClick={() => handleMoodSelect(mood.value)}
                variant="outline"
                className={`h-24 flex-col gap-2 ${
                  selectedMood === mood.value ? `${mood.color} text-white border-transparent` : ""
                }`}
              >
                <mood.icon className="w-8 h-8" />
                <span>{mood.label}</span>
              </Button>
            ))}
          </div>
        </Card>

        {/* Tips */}
        {showTips && (
          <Card className="p-6 bg-care/10 border-care">
            <h3 className="font-semibold mb-4">Mental Wellness Tips</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-care mt-1">•</span>
                <span className="text-sm leading-relaxed">Take deep breaths and practice relaxation exercises</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-care mt-1">•</span>
                <span className="text-sm leading-relaxed">Talk to someone you trust about your feelings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-care mt-1">•</span>
                <span className="text-sm leading-relaxed">Get adequate rest and maintain a healthy routine</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-care mt-1">•</span>
                <span className="text-sm leading-relaxed">Contact your ASHA worker if you need support</span>
              </li>
            </ul>
          </Card>
        )}
      </div>
    </div>
  )
}
