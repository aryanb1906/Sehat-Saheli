"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Users, AlertTriangle, CheckCircle, TrendingUp, Search, Menu, BarChart3, GraduationCap } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { demoPatients } from "@/lib/demo-database"
import { useLanguage } from "@/lib/language-context"
import { NotificationCenter } from "@/components/notification-center"
import { AppSidebar } from "@/components/app-sidebar"

export default function ASHADashboard() {
  const router = useRouter()
  const { content } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const patients = demoPatients

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

  const filteredPatients = patients.filter((patient) => patient.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-gradient-to-br from-trust/10 to-background">
      {/* AppSidebar */}
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role="asha" />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-trust to-accent p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          {/* Menu Button */}
          <Button variant="ghost" size="icon" className="text-white" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-white" onClick={() => router.push("/asha/analytics")}>
              <BarChart3 className="w-6 h-6" />
            </Button>
            <div className="text-white">
              <NotificationCenter />
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">{content.ashaDashboard || "ASHA Dashboard"}</h1>
        <p className="text-white/90">{content.welcomeBack || "Welcome back"}, Meera Devi</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-trust" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">{content.totalPatients || "Total Patients"}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-alert/10 border-alert">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-alert" />
              <div>
                <p className="text-2xl font-bold">{stats.high}</p>
                <p className="text-xs text-muted-foreground">{content.highRisk || "High Risk"}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-warning/10 border-warning">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{stats.medium}</p>
                <p className="text-xs text-muted-foreground">{content.mediumRisk || "Medium Risk"}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-success/10 border-success">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{stats.low}</p>
                <p className="text-xs text-muted-foreground">{content.lowRisk || "Low Risk"}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={content.searchPatients || "Search patients..."}
            className="pl-10 h-12"
          />
        </div>

        {/* Patient List */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold">{content.myPatients || "My Patients"}</h2>
          
          <Card 
            className="p-4 cursor-pointer bg-gradient-to-r from-trust/10 to-accent/10 border-2 border-trust/30 hover:shadow-lg transition-all"
            onClick={() => router.push('/asha/training')}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-trust/20 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-trust" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Continue Your Training</h3>
                <p className="text-sm text-muted-foreground">3 modules in progress</p>
              </div>
              <Button className="bg-trust hover:bg-trust/90">
                Start Learning
              </Button>
            </div>
          </Card>

          {filteredPatients.map((patient) => (
            <Card
              key={patient.id}
              className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/asha/patient/${patient.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{patient.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
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
        </div>
      </div>
    </div>
  )
}
