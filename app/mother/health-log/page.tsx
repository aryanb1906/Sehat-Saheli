"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Activity, Heart, Thermometer, Pill, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"

interface HealthEntry {
  date: string
  type: "checkup" | "symptom" | "medication"
  title: string
  description: string
  status: "normal" | "warning" | "alert"
}

export default function HealthLog() {
  const router = useRouter()
  const { content } = useLanguage()
  const { toast } = useToast()
  const [entries, setEntries] = useState<HealthEntry[]>([
    {
      date: "2025-01-10",
      type: "checkup",
      title: "Regular Checkup",
      description: "Blood pressure: 120/80, Weight: 65kg",
      status: "normal",
    },
    {
      date: "2025-01-08",
      type: "symptom",
      title: "Mild Headache",
      description: "Headache in the morning, resolved after rest",
      status: "warning",
    },
    {
      date: "2025-01-05",
      type: "medication",
      title: "Prenatal Vitamins",
      description: "Taking daily folic acid supplement",
      status: "normal",
    },
  ])

  const handleDelete = (index: number) => {
    if (confirm(`${content.deleteEntry}?`)) {
      setEntries(entries.filter((_, i) => i !== index))
      toast({
        title: content.deletedSuccessfully,
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "alert":
        return "border-alert bg-alert/10"
      case "warning":
        return "border-warning bg-warning/10"
      default:
        return "border-success bg-success/10"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "checkup":
        return <Activity className="w-5 h-5" />
      case "symptom":
        return <Thermometer className="w-5 h-5" />
      case "medication":
        return <Pill className="w-5 h-5" />
      default:
        return <Heart className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-success/10 to-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-success to-success/80 p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{content.healthLogTitle}</h1>
            <p className="text-white/80 text-sm">{content.myHealthLogSubtitle}</p>
          </div>
          <Button
            onClick={() => router.push("/mother/health-log/add")}
            size="icon"
            className="bg-white text-success hover:bg-white/90"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Entries */}
      <div className="p-6 space-y-4">
        {entries.length === 0 ? (
          <Card className="p-8 text-center">
            <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">{content.noEntries}</p>
            <Button onClick={() => router.push("/mother/health-log/add")} className="bg-success">
              <Plus className="w-4 h-4 mr-2" />
              {content.addEntry}
            </Button>
          </Card>
        ) : (
          entries.map((entry, index) => (
            <Card key={index} className={`p-4 border-2 ${getStatusColor(entry.status)}`}>
              <div className="flex items-start gap-3">
                <div className="mt-1">{getTypeIcon(entry.type)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{entry.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString("en-IN")}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-alert"
                        onClick={() => handleDelete(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{entry.description}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
