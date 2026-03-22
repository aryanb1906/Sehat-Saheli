"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Mic, BookOpen, Phone, Heart, Activity, Calendar, MessageCircle, Menu, Baby, Pill, TrendingUp, Utensils, Dumbbell, Users, FileText, Video, Share2, Zap, AlertTriangle, MapPin, ArrowRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import { NotificationCenter } from "@/components/notification-center"
import { AppSidebar } from "@/components/app-sidebar"

type IconType = React.ComponentType<{ className?: string }>

export default function MotherDashboard() {
  const router = useRouter()
  const { content } = useLanguage()
  const [riskStatus, setRiskStatus] = useState<"Low" | "Medium" | "High">("Low")
  const [userName, setUserName] = useState("Priya")
  const [pregnancyWeek, setPregnancyWeek] = useState(24)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const quickActions: Array<{
    title: string
    subtitle: string
    icon: IconType
    route: string
    tone: string
  }> = [
      {
        title: content.talkToSaheli,
        subtitle: "Voice and chat support",
        icon: Mic,
        route: "/mother/talk",
        tone: "bg-trust text-white",
      },
      {
        title: content.myHealthLog,
        subtitle: "Daily health updates",
        icon: BookOpen,
        route: "/mother/health-log",
        tone: "bg-white text-foreground border border-border",
      },
      {
        title: content.mentalHealth,
        subtitle: "Mood check and breathing",
        icon: Heart,
        route: "/mother/mental-health",
        tone: "bg-white text-foreground border border-border",
      },
      {
        title: content.emergencyCall,
        subtitle: "Immediate emergency support",
        icon: Phone,
        route: "/mother/emergency",
        tone: "bg-alert text-white",
      },
    ]

  const featureCards: Array<{
    label: string
    icon: IconType
    route: string
  }> = [
      { label: content.myAppointments, icon: Calendar, route: "/mother/appointments" },
      { label: content.healthTips, icon: MessageCircle, route: "/mother/tips" },
      { label: "Pregnancy Tracker", icon: Baby, route: "/mother/pregnancy-tracker" },
      { label: "Medications & Reminders", icon: Pill, route: "/mother/medications" },
      { label: "Baby Kick Counter", icon: TrendingUp, route: "/mother/kick-counter" },
      { label: "Nutrition Tracker", icon: Utensils, route: "/mother/nutrition" },
      { label: "Pregnancy Exercises", icon: Dumbbell, route: "/mother/exercises" },
      { label: "Community Support", icon: Users, route: "/mother/community" },
      { label: "Medical Records", icon: FileText, route: "/mother/medical-records" },
      { label: "Vital Signs Tracker", icon: TrendingUp, route: "/mother/vital-signs" },
      { label: "Doctor Consultation", icon: Video, route: "/mother/doctor-consultation" },
      { label: "Family Sharing", icon: Share2, route: "/mother/family-sharing" },
      { label: "Labor Signs Tracker", icon: Zap, route: "/mother/labor-signs" },
      { label: "Birth Plan", icon: Heart, route: "/mother/birth-plan" },
      { label: "SOS Emergency", icon: AlertTriangle, route: "/mother/sos-emergency" },
      { label: "Pregnancy Journal", icon: BookOpen, route: "/mother/pregnancy-journal" },
      { label: "Hospital Finder", icon: MapPin, route: "/mother/hospital-finder" },
    ]

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
            <div className="min-h-screen bg-gradient-to-b from-warm/10 via-background to-background">
              <span>{content.mentalHealth}</span>

              <div className="mx-auto w-full max-w-6xl px-4 py-5 md:px-6 md:py-8">
                <Card className="overflow-hidden border-border/70 bg-white shadow-sm">
                  <div className="bg-gradient-to-r from-warm to-care px-5 py-6 text-white md:px-7">
                    <div className="mb-5 flex items-center justify-between">
                      <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setSidebarOpen(true)}>
                        <Menu className="w-6 h-6" />
                      </Button>
                      <div className="text-white">
                        <NotificationCenter />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                          {content.greeting}, {userName}
                        </h1>
                        <p className="mt-2 text-base font-medium text-white/90">{content.greetingQuestion}</p>
                      </div>
                      <div className="rounded-xl bg-white/20 px-4 py-3 backdrop-blur-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-white/85">Pregnancy Progress</p>
                        <p className="mt-1 text-lg font-semibold">Week {pregnancyWeek}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 border-t border-border/70 bg-muted/20 p-5 md:grid-cols-[1.5fr_1fr] md:p-6">
                    <Card className={`border-0 p-5 shadow-none ${getRiskColor()}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90 mb-1">{content.healthStatus}</p>
                          <h2 className="text-2xl font-bold flex items-center gap-2">
                            {getRiskIcon()} {getRiskText()}
                          </h2>
                        </div>
                        <Activity className="w-10 h-10 opacity-90" />
                      </div>
                    </Card>

                    <Card className="border-border/70 bg-white p-5 shadow-none">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Next Step</p>
                      <h3 className="mt-2 text-lg font-semibold text-foreground">Keep your routine on track</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Log symptoms and continue daily check-ins for better guidance.</p>
                      <Button className="mt-4 w-full" onClick={() => router.push("/mother/health-log")}>Update Health Log</Button>
                    </Card>
                  </div>
                </Card>

                <section className="mt-7 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">Priority Actions</h2>
                    <p className="text-sm font-medium text-muted-foreground">Daily essentials</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {quickActions.map((action) => {
                      const Icon = action.icon
                      return (
                        <button
                          key={action.route}
                          onClick={() => router.push(action.route)}
                          className={`group flex min-h-[148px] flex-col justify-between rounded-xl p-5 text-left shadow-sm transition-transform duration-150 hover:-translate-y-0.5 ${action.tone}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <Icon className="h-8 w-8" />
                            <ArrowRight className="h-5 w-5 opacity-70 transition group-hover:translate-x-0.5" />
                          </div>
                          <div>
                            <p className="text-base font-semibold">{action.title}</p>
                            <p className={`mt-1 text-sm ${action.tone.includes("text-white") ? "text-white/90" : "text-muted-foreground"}`}>
                              {action.subtitle}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </section>

                <section className="mt-7 space-y-3 pb-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">All Tools</h2>
                    <p className="text-sm font-medium text-muted-foreground">Everything in one place</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {featureCards.map((item) => {
                      const Icon = item.icon
                      return (
                        <button
                          key={item.route}
                          onClick={() => router.push(item.route)}
                          className="flex min-h-[92px] items-center justify-between rounded-xl border border-border/80 bg-white px-4 py-3 text-left shadow-sm transition-all hover:border-trust/40 hover:bg-trust/5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-trust/10 text-trust">
                              <Icon className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-semibold text-foreground">{item.label}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )
                    })}
                    variant="outline"
                </section>
                )
