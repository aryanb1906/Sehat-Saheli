"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, TrendingUp, Users, Activity, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

interface Patient {
  id: string
  name: string
  risk: "Low" | "Medium" | "High"
  hemoglobin: number
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { content } = useLanguage()
  const [patients, setPatients] = useState<Patient[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/asha-patients?ashaWorkerId=asha_001")
        const data = await res.json()
        setPatients(data.patients || [])
      } catch (error) {
        console.error("Failed to load analytics data", error)
      }
    }

    load()
  }, [])

  const riskData = useMemo(() => [
    {
      name: content.lowRisk || "Low Risk",
      value: patients.filter((p) => p.risk === "Low").length,
      color: "#10b981",
    },
    {
      name: content.mediumRisk || "Medium Risk",
      value: patients.filter((p) => p.risk === "Medium").length,
      color: "#f59e0b",
    },
    {
      name: content.highRisk || "High Risk",
      value: patients.filter((p) => p.risk === "High").length,
      color: "#ef4444",
    },
  ], [content.highRisk, content.lowRisk, content.mediumRisk, patients])

  const weeklyData = [
    { week: "Week 1", checkups: 8 },
    { week: "Week 2", checkups: 12 },
    { week: "Week 3", checkups: 10 },
    { week: "Week 4", checkups: 15 },
  ]

  const hemoglobinData = patients.map((p) => ({
    name: p.name.split(" ")[0],
    hemoglobin: p.hemoglobin,
  }))

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-trust to-accent p-6 text-white">
        <Button variant="ghost" size="icon" className="text-white mb-4" onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-3xl font-bold">{content.analyticsDashboard || "Analytics Dashboard"}</h1>
        <p className="text-white/90">{content.healthInsights || "Health insights and trends"}</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-trust" />
              <div>
                <p className="text-2xl font-bold">{patients.length}</p>
                <p className="text-xs text-muted-foreground">{content.totalPatients || "Total Patients"}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{patients.length * 3}</p>
                <p className="text-xs text-muted-foreground">{content.checkupsMonth || "Checkups/Month"}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{patients.length ? Math.round((patients.filter((p) => p.risk !== "High").length / patients.length) * 100) : 0}%</p>
                <p className="text-xs text-muted-foreground">{content.followUpRate || "Follow-up Rate"}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-care" />
              <div>
                <p className="text-2xl font-bold">{Math.max(1, Math.round(patients.length / 2))}</p>
                <p className="text-xs text-muted-foreground">{content.thisWeek || "This Week"}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">{content.riskDistribution || "Risk Distribution"}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={riskData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">{content.weeklyCheckups || "Weekly Checkups"}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="checkups" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">{content.hemoglobinLevels || "Hemoglobin Levels"}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hemoglobinData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 15]} />
              <Tooltip />
              <Bar dataKey="hemoglobin" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-muted-foreground mt-2">
            {content.normalRange || "Normal range"}: 11-14 g/dL {content.duringPregnancy || "during pregnancy"}
          </p>
        </Card>
      </div>
    </div>
  )
}
