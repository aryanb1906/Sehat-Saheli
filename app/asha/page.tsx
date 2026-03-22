"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { Users, AlertTriangle, CheckCircle, TrendingUp, Search, Menu, BarChart3, GraduationCap, ArrowRight, Clock3, ClipboardList } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/lib/language-context"
import { NotificationCenter } from "@/components/notification-center"
import { AppSidebar } from "@/components/app-sidebar"

interface Patient {
  id: string
  name: string
  age: number
  weeks: number
  risk: "Low" | "Medium" | "High"
  lastCheckup: string
}

export default function ASHADashboard() {
  const router = useRouter()
  const { content } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const res = await fetch(`/api/asha-patients?ashaWorkerId=asha_001&q=${encodeURIComponent(searchQuery)}`)
        const data = await res.json()
        setPatients(data.patients || [])
      } catch (error) {
        console.error("Failed to load ASHA patients", error)
      } finally {
        setLoading(false)
      }
    }

    loadPatients()
  }, [searchQuery])

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High":
        return "bg-alert text-white"
      case "Medium":
        return "bg-warning text-foreground"
      default:
        return "bg-success text-white"
    }
  }

  const stats = {
    total: patients.length,
    high: patients.filter((p) => p.risk === "High").length,
    medium: patients.filter((p) => p.risk === "Medium").length,
    low: patients.filter((p) => p.risk === "Low").length,
  }

  const filteredPatients = patients

  return (
    <div className="min-h-screen bg-gradient-to-b from-trust/10 via-background to-background">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role="asha" />

      <div className="mx-auto w-full max-w-6xl px-4 py-5 md:px-6 md:py-8">
        <Card className="overflow-hidden border-border/70 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-trust to-accent px-5 py-6 text-white md:px-7">
            <div className="mb-5 flex items-center justify-between">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-6 h-6" />
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => router.push("/asha/analytics")}>
                  <BarChart3 className="w-6 h-6" />
                </Button>
                <div className="text-white">
                  <NotificationCenter />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{content.ashaDashboard || "ASHA Dashboard"}</h1>
                <p className="mt-2 text-base font-medium text-white/90">{content.welcomeBack || "Welcome back"}, Meera Devi</p>
              </div>
              <div className="rounded-xl bg-white/20 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/85">Today</p>
                <p className="mt-1 text-lg font-semibold">{stats.total} patients assigned</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-t border-border/70 bg-muted/20 p-5 md:grid-cols-4 md:p-6">
            <Card className="border-border/70 bg-white p-4 shadow-none">
              <div className="flex items-center gap-3">
                <Users className="w-7 h-7 text-trust" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-xs font-medium text-muted-foreground">{content.totalPatients || "Total Patients"}</p>
                </div>
              </div>
            </Card>

            <Card className="border-alert/30 bg-alert/10 p-4 shadow-none">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-7 h-7 text-alert" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.high}</p>
                  <p className="text-xs font-medium text-muted-foreground">{content.highRisk || "High Risk"}</p>
                </div>
              </div>
            </Card>

            <Card className="border-warning/30 bg-warning/10 p-4 shadow-none">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-warning" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.medium}</p>
                  <p className="text-xs font-medium text-muted-foreground">{content.mediumRisk || "Medium Risk"}</p>
                </div>
              </div>
            </Card>

            <Card className="border-success/30 bg-success/10 p-4 shadow-none">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-7 h-7 text-success" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.low}</p>
                  <p className="text-xs font-medium text-muted-foreground">{content.lowRisk || "Low Risk"}</p>
                </div>
              </div>
            </Card>
          </div>
        </Card>

        <section className="mt-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Quick Actions</h2>
            <p className="text-sm font-medium text-muted-foreground">Daily workflow</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              className="group flex min-h-[126px] flex-col justify-between rounded-xl bg-trust p-5 text-left text-white shadow-sm"
              onClick={() => router.push('/asha/training')}
            >
              <div className="flex items-start justify-between">
                <GraduationCap className="h-7 w-7" />
                <ArrowRight className="h-5 w-5 opacity-80 transition group-hover:translate-x-0.5" />
              </div>
              <div>
                <p className="text-base font-semibold">Continue Training</p>
                <p className="mt-1 text-sm text-white/90">3 modules in progress</p>
              </div>
            </button>

            <button
              className="group flex min-h-[126px] flex-col justify-between rounded-xl border border-border bg-white p-5 text-left text-foreground shadow-sm"
              onClick={() => router.push('/asha/appointment-reminders')}
            >
              <div className="flex items-start justify-between">
                <Clock3 className="h-7 w-7 text-trust" />
                <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-0.5" />
              </div>
              <div>
                <p className="text-base font-semibold">Appointment Reminders</p>
                <p className="mt-1 text-sm text-muted-foreground">Manage visit schedules quickly</p>
              </div>
            </button>

            <button
              className="group flex min-h-[126px] flex-col justify-between rounded-xl border border-border bg-white p-5 text-left text-foreground shadow-sm"
              onClick={() => router.push('/asha/home-visits')}
            >
              <div className="flex items-start justify-between">
                <ClipboardList className="h-7 w-7 text-trust" />
                <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-0.5" />
              </div>
              <div>
                <p className="text-base font-semibold">Home Visits</p>
                <p className="mt-1 text-sm text-muted-foreground">Track and update field visits</p>
              </div>
            </button>
          </div>
        </section>

        <section className="mt-7 space-y-3 pb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Patient Directory</h2>
            <p className="text-sm font-medium text-muted-foreground">Search and open profile</p>
          </div>

          <Card className="border-border/70 bg-white p-3 shadow-sm md:p-4">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={content.searchPatients || "Search patients..."}
                className="h-11 border-0 bg-muted/50"
              />
            </div>
          </Card>

          {loading ? (
            <Card className="p-4 border-border/70 bg-white">
              <p className="text-sm text-muted-foreground">Loading patients...</p>
            </Card>
          ) : filteredPatients.map((patient) => (
            <Card
              key={patient.id}
              className="cursor-pointer border-border/80 bg-white p-4 shadow-sm transition-all hover:border-trust/40 hover:bg-trust/5"
              onClick={() => router.push(`/asha/patient/${patient.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-semibold text-foreground">{patient.name}</h3>
                  <p className="mb-2 text-sm text-muted-foreground">
                    {content.age || "Age"}: {patient.age} • {patient.weeks} {content.weeksPregnant || "weeks pregnant"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {content.lastCheckup || "Last checkup"}: {new Date(patient.lastCheckup).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-full font-semibold text-sm ${getRiskColor(patient.risk)}`}>
                  {patient.risk} {content.risk || "Risk"}
                </div>
              </div>
            </Card>
          ))}

          {!loading && filteredPatients.length === 0 && (
            <Card className="border-border/70 bg-white p-6 text-center shadow-sm">
              <p className="text-sm text-muted-foreground">No patients found for this search.</p>
            </Card>
          )}
        </section>
      </div>
    </div>
  )
}
