"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { ArrowLeft, Video, Phone, Check, FileText, Activity } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"

interface Consultation {
  id: string
  doctor: string
  type: "video" | "phone" | "in-person"
  date: string
  time: string
  status: "scheduled" | "completed" | "cancelled"
}

interface ReferralCase {
  id: string
  consultationId: string
  note: string
  status: "generated" | "shared" | "in-treatment" | "completed"
  createdAt: string
  updatedAt?: string
  slaDeadline?: string
  breachedAt?: string
  matchedFacility?: string
  capacityScore?: number
}

export default function DoctorConsultation() {
  const router = useRouter()
  const { content } = useLanguage()
  const { toast } = useToast()
  const [consultations] = useState<Consultation[]>([
    { id: "1", doctor: "Dr. Sharma", type: "video", date: "2025-02-10", time: "10:00 AM", status: "scheduled" },
    { id: "2", doctor: "Dr. Patel", type: "phone", date: "2025-02-01", time: "2:00 PM", status: "completed" },
  ])
  const [symptoms, setSymptoms] = useState("Severe headache, swelling in feet")
  const [bp, setBp] = useState("150/96")
  const [gestWeeks, setGestWeeks] = useState(32)
  const [referrals, setReferrals] = useState<ReferralCase[]>([])
  const [loadingReferrals, setLoadingReferrals] = useState(true)
  const [referralError, setReferralError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const patientId = "demo-mother"

  useEffect(() => {
    const loadReferrals = async () => {
      setLoadingReferrals(true)
      setReferralError("")
      try {
        const response = await fetch(`/api/referrals?patientId=${patientId}`)
        const data = await response.json()
        if (data?.success && Array.isArray(data.referrals)) {
          setReferrals(data.referrals)
        } else {
          setReferralError("Unable to load referrals")
        }
      } catch {
        setReferralError("Unable to load referrals")
      } finally {
        setLoadingReferrals(false)
      }
    }

    void loadReferrals()
  }, [])

  const getTypeIcon = (type: string) => {
    return type === "video" ? <Video className="w-5 h-5" /> : <Phone className="w-5 h-5" />
  }

  const generateReferral = async (consultation: Consultation) => {
    setSubmitting(true)
    const note = [
      `Referral Type: Maternal risk follow-up`,
      `Consultation: ${consultation.type} with ${consultation.doctor}`,
      `Gestational Age: ${gestWeeks} weeks`,
      `Current BP: ${bp}`,
      `Reported Symptoms: ${symptoms}`,
      `Priority: ${bp.startsWith("15") || bp.startsWith("16") ? "Urgent" : "Routine"}`,
      `Recommended Facility: CHC / District Hospital`,
    ].join("\n")

    try {
      const tempId = `optimistic-${Date.now()}`
      setReferrals((prev) => [
        {
          id: tempId,
          consultationId: consultation.id,
          note,
          status: "generated",
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ])

      const response = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": `referral-${consultation.id}-${Date.now()}` },
        body: JSON.stringify({
          patientId,
          consultationId: consultation.id,
          note,
          status: "generated",
        }),
      })
      const data = await response.json()
      if (data?.success && data.referral) {
        setReferrals((prev) => [data.referral, ...prev.filter((item) => item.id !== tempId)])
      }
    } catch {
      const fallbackReferral: ReferralCase = {
        id: `${Date.now()}`,
        consultationId: consultation.id,
        note,
        status: "generated",
        createdAt: new Date().toISOString(),
      }
      setReferrals((prev) => [fallbackReferral, ...prev])
    } finally {
      setSubmitting(false)
    }

    toast({
      title: "Referral note generated",
      description: "Structured referral created and ready to share.",
    })
  }

  const advanceReferralStatus = async (id: string) => {
    const current = referrals.find((item) => item.id === id)
    if (!current) return

    const nextStatus =
      current.status === "generated"
        ? "shared"
        : current.status === "shared"
          ? "in-treatment"
          : current.status === "in-treatment"
            ? "completed"
            : "completed"

    try {
      const response = await fetch("/api/referrals", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Idempotency-Key": `referral-status-${id}-${Date.now()}` },
        body: JSON.stringify({ id, status: nextStatus }),
      })
      const data = await response.json()
      if (data?.success && data.referral) {
        setReferrals((prev) => prev.map((item) => (item.id === id ? data.referral : item)))
        return
      }
    } catch {
      // Fallback local state update below.
    }

    setReferrals((prev) => prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item)))
  }

  const statusBadgeClass = (status: ReferralCase["status"]) => {
    if (status === "completed") return "bg-success/15 text-success"
    if (status === "in-treatment") return "bg-warning/15 text-warning"
    if (status === "shared") return "bg-trust/15 text-trust"
    return "bg-muted text-foreground"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-care/10 to-background">
      <div className="bg-gradient-to-r from-care to-care/80 p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Doctor Consultations</h1>
            <p className="text-white/80 text-sm">Book and manage consultations</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <Card className="p-4 border-2 border-care/20">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-care" /> Structured Referral Note
          </h2>
          <div className="grid md:grid-cols-3 gap-3 mb-3">
            <label className="text-sm">
              Gestational Weeks
              <input
                type="number"
                min={1}
                max={42}
                aria-label="Gestational weeks"
                value={gestWeeks}
                onChange={(e) => setGestWeeks(Number(e.target.value))}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2"
              />
            </label>
            <label className="text-sm">
              Blood Pressure
              <input
                aria-label="Blood pressure"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2"
              />
            </label>
            <label className="text-sm md:col-span-1">
              Symptoms
              <input
                aria-label="Symptoms"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2"
              />
            </label>
          </div>
          <p className="text-xs text-muted-foreground">Generate referral from any scheduled consultation below.</p>
        </Card>

        {consultations.map((consultation) => (
          <Card key={consultation.id} className="p-4 border-2 border-care/20">
            <div className="flex items-start gap-3 mb-3">
              {getTypeIcon(consultation.type)}
              <div className="flex-1">
                <h3 className="font-semibold">{consultation.doctor}</h3>
                <p className="text-sm text-muted-foreground">{consultation.type === "video" ? "Video Call" : "Phone Call"}</p>
              </div>
              {consultation.status === "completed" && <Check className="w-5 h-5 text-success" />}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-semibold">{new Date(consultation.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="font-semibold">{consultation.time}</p>
              </div>
            </div>
            {consultation.status === "scheduled" && (
              <div className="flex gap-2">
                <Button className="w-full bg-care text-white">Join Consultation</Button>
                <Button variant="outline" className="w-full" disabled={submitting} onClick={() => void generateReferral(consultation)}>
                  Generate Referral
                </Button>
              </div>
            )}
          </Card>
        ))}

        {loadingReferrals && <Card className="p-4 text-sm text-muted-foreground">Loading referral timeline...</Card>}
        {referralError && <Card className="p-4 text-sm text-alert">{referralError}</Card>}

        {!loadingReferrals && referrals.length > 0 && (
          <Card className="p-4 border-2 border-trust/20">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-trust" /> Referral Tracking
            </h2>
            <div className="space-y-3">
              {referrals.map((ref) => (
                <div key={ref.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">Referral #{ref.id.slice(-5)}</p>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClass(ref.status)}`}>
                      {ref.status}
                    </span>
                  </div>
                  <pre className="text-xs whitespace-pre-wrap text-foreground/80 bg-muted/40 rounded-md p-2 mb-2">{ref.note}</pre>
                  {(ref.slaDeadline || ref.matchedFacility) && (
                    <p className="text-xs text-muted-foreground mb-2">
                      SLA: {ref.slaDeadline ? new Date(ref.slaDeadline).toLocaleString() : "-"} | Facility: {ref.matchedFacility || "TBD"}
                      {typeof ref.capacityScore === "number" ? ` (${ref.capacityScore}/100)` : ""}
                    </p>
                  )}
                  {ref.status !== "completed" && (
                    <Button size="sm" variant="outline" onClick={() => void advanceReferralStatus(ref.id)}>
                      Update to Next Status
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
