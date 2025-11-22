"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Phone, Calendar, FileText, AlertTriangle, TrendingUp, Heart, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getPatientById, getHealthLogsByPatient, getAppointmentsByPatient } from "@/lib/demo-database"
import { useLanguage } from "@/lib/language-context"

export default function PatientDetail({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const { id } = unwrappedParams
  const router = useRouter()
  const { content } = useLanguage()
  const patient = getPatientById(id)
  const healthLogs = getHealthLogsByPatient(id)
  const appointments = getAppointmentsByPatient(id)

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <p className="text-lg">{content.patientNotFound || "Patient not found"}</p>
          <Button onClick={() => router.back()} className="mt-4">
            {content.goBack || "Go Back"}
          </Button>
        </Card>
      </div>
    )
  }

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

  const sendEmergencySMS = async () => {
    try {
      await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: patient.phone,
          message: `URGENT: ${patient.name}, please contact your ASHA worker immediately regarding your health checkup.`,
          patientName: patient.name,
        }),
      })
      alert(content.smsSentSuccess || "Emergency SMS sent successfully!")
    } catch (error) {
      console.error("[v0] SMS send error:", error)
      alert(content.smsFailure || "Failed to send SMS. Please call the patient directly.")
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-trust/10 to-background">
      {/* Header */}
      <div className="bg-linear-to-r from-trust to-accent p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{patient.name}</h1>
            <p className="text-white/80 text-sm">
              {patient.age} {content.years || "years"} • {patient.weeks} {content.weeksPregnant || "weeks pregnant"}
            </p>
            <p className="text-white/70 text-xs mt-1">{patient.village}</p>
          </div>
          <Button
            size="icon"
            className="bg-white text-trust hover:bg-white/90"
            onClick={() => (window.location.href = `tel:${patient.phone}`)}
          >
            <Phone className="w-5 h-5" />
          </Button>
        </div>
        <Badge className={`${getRiskColor(patient.risk)} text-base px-4 py-1`}>
          {patient.risk} {content.riskPatient || "Risk Patient"}
        </Badge>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{content.hemoglobin || "Hemoglobin"}</p>
            <p className="text-lg font-bold text-warning">{patient.hemoglobin} g/dL</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{content.lastCheckup || "Last Checkup"}</p>
            <p className="text-lg font-bold">{new Date(patient.lastCheckup).toLocaleDateString("en-IN")}</p>
          </Card>
        </div>

        {/* Alert if high risk */}
        {patient.risk === "High" && (
          <Card className="p-4 bg-alert/10 border-alert">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-alert mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-alert mb-1">{content.highRiskAlert || "High Risk Alert"}</p>
                <p className="text-sm leading-relaxed mb-3">
                  {content.requiresAttention || "This patient requires immediate attention. Contact within 24 hours."}
                </p>
                <Button size="sm" className="bg-alert hover:bg-alert/90" onClick={sendEmergencySMS}>
                  {content.sendEmergencySMS || "Send Emergency SMS"}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="vitals" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vitals">{content.vitals || "Vitals"}</TabsTrigger>
            <TabsTrigger value="history">{content.history || "History"}</TabsTrigger>
            <TabsTrigger value="appointments">{content.appointments || "Appointments"}</TabsTrigger>
          </TabsList>

          <TabsContent value="vitals" className="space-y-4 mt-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-alert" />
                {content.currentVitals || "Current Vitals"}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{content.bloodPressure || "Blood Pressure"}</p>
                  <p
                    className={`text-lg font-bold ${patient.bloodPressure.startsWith("14") || patient.bloodPressure.startsWith("15") ? "text-alert" : "text-success"}`}
                  >
                    {patient.bloodPressure}
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{content.weight || "Weight"}</p>
                  <p className="text-lg font-bold">{patient.weight} kg</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{content.hemoglobin || "Hemoglobin"}</p>
                  <p className={`text-lg font-bold ${patient.hemoglobin < 11 ? "text-warning" : "text-success"}`}>
                    {patient.hemoglobin} g/dL
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{content.mentalHealth || "Mental Health"}</p>
                  <p className="text-lg font-bold text-care">{patient.mentalHealthScore}/10</p>
                </div>
              </div>
            </Card>

            {patient.symptoms.length > 0 && (
              <Card className="p-5 bg-warning/10 border-warning">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-warning" />
                  {content.currentSymptoms || "Current Symptoms"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {patient.symptoms.map((symptom, index) => (
                    <Badge key={index} variant="outline" className="border-warning text-warning">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            <Button className="w-full h-12 bg-trust hover:bg-trust/90">
              <TrendingUp className="w-5 h-5 mr-2" />
              {content.updateVitals || "Update Vitals"}
            </Button>
          </TabsContent>

          <TabsContent value="history" className="space-y-3 mt-4">
            {healthLogs.length > 0 ? (
              healthLogs.map((log) => (
                <Card key={log.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">{log.mood}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.date).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{log.notes}</p>
                  {log.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {log.symptoms.map((symptom, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">{content.noHealthLogs || "No health logs yet"}</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="appointments" className="space-y-3 mt-4">
            {appointments.length > 0 ? (
              appointments.map((apt) => (
                <Card key={apt.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-trust" />
                      <span className="font-semibold">{apt.type}</span>
                    </div>
                    <Badge className={apt.status === "upcoming" ? "bg-trust" : "bg-success"}>{apt.status}</Badge>
                  </div>
                  <p className="text-sm font-medium mb-1">
                    {new Date(apt.date).toLocaleDateString("en-IN")} at {apt.time}
                  </p>
                  <p className="text-xs text-muted-foreground">{apt.location}</p>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">{content.noAppointments || "No upcoming appointments"}</p>
              </Card>
            )}

            <Button variant="outline" className="w-full h-12 bg-transparent">
              <Calendar className="w-5 h-5 mr-2" />
              {content.scheduleAppointment || "Schedule Appointment"}
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
