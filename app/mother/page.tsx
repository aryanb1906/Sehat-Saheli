"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Mic, BookOpen, Phone, Heart, Activity, Calendar, MessageCircle, Menu, Baby, Pill, TrendingUp, Utensils, Dumbbell, Users, FileText, Video, Share2, Zap, AlertTriangle, MapPin } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import { NotificationCenter } from "@/components/notification-center"
import { AppSidebar } from "@/components/app-sidebar"

export default function MotherDashboard() {
  const router = useRouter()
  const { content } = useLanguage()
  const [riskStatus, setRiskStatus] = useState<"Low" | "Medium" | "High">("Low")
  const [userName, setUserName] = useState("Priya")
  const [pregnancyWeek, setPregnancyWeek] = useState(24)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const savedRisk = localStorage.getItem("motherRiskStatus")
    if (savedRisk) {
      setRiskStatus(savedRisk as "Low" | "Medium" | "High")
    }
    const savedWeek = localStorage.getItem("pregnancyWeek")
    if (savedWeek) {
      setPregnancyWeek(Number.parseInt(savedWeek))
    }
  }, [])

  const getRiskColor = () => {
    switch (riskStatus) {
      case "High":
        return "bg-alert text-white"
      case "Medium":
        return "bg-warning text-foreground"
      default:
        return "bg-success text-white"
    }
  }

  const getRiskIcon = () => {
    switch (riskStatus) {
      case "High":
        return "🔴"
      case "Medium":
        return "🟡"
      default:
        return "🟢"
    }
  }

  const getRiskText = () => {
    switch (riskStatus) {
      case "High":
        return content.highRisk
      case "Medium":
        return content.mediumRisk
      default:
        return content.lowRisk
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm/10 via-care/10 to-background">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role="mother" />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-warm to-care p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" className="text-white" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
          <div className="text-white">
            <NotificationCenter />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">
          {content.greeting}, {userName}! 🙏
        </h1>
        <p className="text-white/90">{content.greetingQuestion}</p>
        <div className="mt-3 bg-white/20 backdrop-blur-sm rounded-lg p-3 inline-block">
          <p className="text-sm font-medium">Week {pregnancyWeek} of Pregnancy</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Health Status Card */}
        <Card className={`p-6 ${getRiskColor()}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">{content.healthStatus}</p>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {getRiskIcon()} {getRiskText()}
              </h2>
            </div>
            <Activity className="w-12 h-12 opacity-80" />
          </div>
        </Card>

        {/* Main Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => router.push("/mother/talk")}
            className="h-32 bg-gradient-to-br from-trust to-trust/80 hover:from-trust/90 hover:to-trust/70 text-white flex flex-col items-center justify-center gap-3 text-lg font-semibold"
          >
            <Mic className="w-10 h-10" />
            <span>{content.talkToSaheli}</span>
          </Button>

          <Button
            onClick={() => router.push("/mother/health-log")}
            className="h-32 bg-gradient-to-br from-success to-success/80 hover:from-success/90 hover:to-success/70 text-white flex flex-col items-center justify-center gap-3 text-lg font-semibold"
          >
            <BookOpen className="w-10 h-10" />
            <span>{content.myHealthLog}</span>
          </Button>

          <Button
            onClick={() => router.push("/mother/mental-health")}
            className="h-32 bg-gradient-to-br from-care to-care/80 hover:from-care/90 hover:to-care/70 text-white flex flex-col items-center justify-center gap-3 text-lg font-semibold"
          >
            <Heart className="w-10 h-10" />
            <span>{content.mentalHealth}</span>
          </Button>

          <Button
            onClick={() => router.push("/mother/emergency")}
            className="h-32 bg-gradient-to-br from-alert to-alert/80 hover:from-alert/90 hover:to-alert/70 text-white flex flex-col items-center justify-center gap-3 text-lg font-semibold"
          >
            <Phone className="w-10 h-10" />
            <span>{content.emergencyCall}</span>
          </Button>
        </div>

        {/* Additional Features */}
        <div className="space-y-3">
          <Button
            onClick={() => router.push("/mother/appointments")}
            variant="outline"
            className="w-full h-16 justify-start gap-4 text-lg"
          >
            <Calendar className="w-6 h-6" />
            <span>{content.myAppointments}</span>
          </Button>

          <Button
            onClick={() => router.push("/mother/tips")}
            variant="outline"
            className="w-full h-16 justify-start gap-4 text-lg"
          >
            <MessageCircle className="w-6 h-6" />
            <span>{content.healthTips}</span>
          </Button>

          <Button
            onClick={() => router.push("/mother/pregnancy-tracker")}
            variant="outline"
            className="w-full h-16 justify-start gap-4 text-lg"
          >
            <Baby className="w-6 h-6" />
            <span>Pregnancy Tracker</span>
          </Button>

          <Button
            onClick={() => router.push("/mother/medications")}
            variant="outline"
            className="w-full h-16 justify-start gap-4 text-lg bg-gradient-to-r from-success/5 to-success/10 hover:from-success/10 hover:to-success/20 border-success/30"
          >
            <Pill className="w-6 h-6 text-success" />
            <span>Medications & Reminders</span>
          </Button>

          <Button
            onClick={() => router.push("/mother/kick-counter")}
            variant="outline"
            className="w-full h-16 justify-start gap-4 text-lg bg-gradient-to-r from-accent/5 to-accent/10 hover:from-accent/10 hover:to-accent/20 border-accent/30"
          >
            <TrendingUp className="w-6 h-6 text-accent" />
            <span>Baby Kick Counter</span>
          </Button>

          <Button
            onClick={() => router.push("/mother/nutrition")}
            variant="outline"
            className="w-full h-16 justify-start gap-4 text-lg bg-gradient-to-r from-success/5 to-success/10 hover:from-success/10 hover:to-success/20 border-success/30"
          >
            <Utensils className="w-6 h-6 text-success" />
            <span>Nutrition Tracker</span>
          </Button>

          <Button
            onClick={() => router.push("/mother/exercises")}
            variant="outline"
            className="w-full h-16 justify-start gap-4 text-lg bg-gradient-to-r from-accent/5 to-accent/10 hover:from-accent/10 hover:to-accent/20 border-accent/30"
          >
            <Dumbbell className="w-6 h-6 text-accent" />
            <span>Pregnancy Exercises</span>
          </Button>

          <Button
            onClick={() => router.push("/mother/community")}
            variant="outline"
            className="w-full h-16 justify-start gap-4 text-lg bg-gradient-to-r from-care/5 to-care/10 hover:from-care/10 hover:to-care/20 border-care/30"
          >
            <Users className="w-6 h-6 text-care" />
            <span>Community Support</span>
          </Button>

          <Button
            onClick={() => router.push("/mother/medical-records")}
            variant="outline"
            className="w-full h-16 justify-start gap-4 text-lg bg-gradient-to-r from-trust/5 to-trust/10 hover:from-trust/10 hover:to-trust/20 border-trust/30"
          >
            <FileText className="w-6 h-6 text-trust" />
            <span>Medical Records</span>
          </Button>

          <Button
            onClick={() => router.push("/mother/vital-signs")}
            variant="outline"
            className="w-full h-16 justify-start gap-4 text-lg bg-gradient-to-r from-accent/5 to-accent/10 hover:from-accent/10 hover:to-accent/20 border-accent/30"
          >
            <TrendingUp className="w-6 h-6 text-accent" />
            <span>Vital Signs Tracker</span>
          </Button>

          <Button
            onClick={() => router.push("/mother/doctor-consultation")}
            variant="outline"
            className="w-full h-16 justify-start gap-4 text-lg bg-gradient-to-r from-care/5 to-care/10 hover:from-care/10 hover:to-care/20 border-care/30"
          >
            <Video className="w-6 h-6 text-care" />
            <span>Doctor Consultation</span>
          </Button>

          <Button
            onClick={() => router.push("/mother/family-sharing")}
            variant="outline"
            className="w-full h-16 justify-start gap-4 text-lg bg-gradient-to-r from-warm/5 to-warm/10 hover:from-warm/10 hover:to-warm/20 border-warm/30"
          >
            <Share2 className="w-6 h-6 text-warm" />
            <span>Family Sharing</span>
          </Button>

          <Button
            onClick={() => router.push("/mother/labor-signs")}
            variant="outline"
            className="w-full h-16 justify-start gap-4 text-lg bg-gradient-to-r from-alert/5 to-alert/10 hover:from-alert/10 hover:to-alert/20 border-alert/30"
          >
            <Zap className="w-6 h-6 text-alert" />
            <span>Labor Signs Tracker</span>
          </Button>

          <Button
            onClick={() => router.push("/mother/birth-plan")}
            variant="outline"
            className="w-full h-16 justify-start gap-4 text-lg bg-gradient-to-r from-warm/5 to-warm/10 hover:from-warm/10 hover:to-warm/20 border-warm/30"
          >
            <Heart className="w-6 h-6 text-warm" />
            <span>Birth Plan</span>
          </Button>

          <Button
            onClick={() => router.push("/mother/sos-emergency")}
            variant="outline"
            className="w-full h-16 justify-start gap-4 text-lg bg-gradient-to-r from-alert/5 to-alert/10 hover:from-alert/10 hover:to-alert/20 border-alert/30"
          >
            <AlertTriangle className="w-6 h-6 text-alert" />
            <span>SOS Emergency</span>
          </Button>

          <Button
            onClick={() => router.push("/mother/pregnancy-journal")}
            variant="outline"
            className="w-full h-16 justify-start gap-4 text-lg bg-gradient-to-r from-care/5 to-care/10 hover:from-care/10 hover:to-care/20 border-care/30"
          >
            <BookOpen className="w-6 h-6 text-care" />
            <span>Pregnancy Journal</span>
          </Button>

          <Button
            onClick={() => router.push("/mother/hospital-finder")}
            variant="outline"
            className="w-full h-16 justify-start gap-4 text-lg bg-gradient-to-r from-success/5 to-success/10 hover:from-success/10 hover:to-success/20 border-success/30"
          >
            <MapPin className="w-6 h-6 text-success" />
            <span>Hospital Finder</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
