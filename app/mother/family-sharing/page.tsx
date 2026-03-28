"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Users, Trash2, ShieldCheck, Send, CalendarCheck2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"

interface FamilyMember {
  id: string
  name: string
  relation: string
  canView: boolean
  phone?: string
}

export default function FamilySharing() {
  const router = useRouter()
  const { content } = useLanguage()
  const { toast } = useToast()
  const [sharingEnabled, setSharingEnabled] = useState(true)
  const [members, setMembers] = useState<FamilyMember[]>([
    { id: "1", name: "Rajesh", relation: "Husband", canView: true, phone: "+91-98XXXXXX11" },
    { id: "2", name: "Mother", relation: "Mother", canView: true, phone: "+91-98XXXXXX22" },
  ])

  const timeline = [
    { id: "t1", label: "Birth transport identified", done: true },
    { id: "t2", label: "Hospital bag checklist reviewed", done: true },
    { id: "t3", label: "Blood donor backup confirmed", done: false },
    { id: "t4", label: "Next ANC checkup date shared", done: false },
  ]

  const sendNudge = (type: "transport" | "donor" | "checkup") => {
    const templates = {
      transport: "Reminder: Please confirm transport arrangement for delivery readiness.",
      donor: "Reminder: Please confirm blood donor backup details for emergency readiness.",
      checkup: "Reminder: ANC checkup is due soon. Please support clinic visit planning.",
    }

    toast({
      title: "Nudge sent",
      description: templates[type],
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-success/10 to-background">
      <div className="bg-gradient-to-r from-success to-success/80 p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Family Sharing</h1>
            <p className="text-white/80 text-sm">Share updates with loved ones</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <Card className="p-4 border-2 border-success/20">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-success mt-0.5" />
              <div>
                <h3 className="font-semibold">Consent-Based Family Sharing</h3>
                <p className="text-sm text-muted-foreground">Family receives read-only pregnancy updates only after your consent.</p>
              </div>
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sharingEnabled}
                onChange={(e) => setSharingEnabled(e.target.checked)}
              />
              Sharing enabled
            </label>
          </div>
        </Card>

        <Card className="p-4 border-2 border-trust/20">
          <div className="flex items-center gap-2 mb-3">
            <CalendarCheck2 className="w-5 h-5 text-trust" />
            <h3 className="font-semibold">Shared Pregnancy Timeline</h3>
          </div>
          <div className="space-y-2">
            {timeline.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <p className="text-sm">{item.label}</p>
                <span className={`text-xs font-semibold ${item.done ? "text-success" : "text-warning"}`}>
                  {item.done ? "Done" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {members.map((member) => (
          <Card key={member.id} className="p-4 border-2 border-success/20">
            <div className="flex items-start gap-3 mb-3">
              <Users className="w-5 h-5 text-success mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.relation}</p>
                {member.phone && <p className="text-xs text-muted-foreground mt-1">{member.phone}</p>}
              </div>
              <Button variant="ghost" size="icon" className="text-alert">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 bg-success/10 text-success rounded">Read-only access</span>
            </div>
          </Card>
        ))}

        <Card className="p-4 border-2 border-warning/25 bg-warning/5">
          <h3 className="font-semibold mb-3">Send Family Nudges</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={!sharingEnabled} onClick={() => sendNudge("transport")}>
              <Send className="w-4 h-4 mr-2" />
              Transport Prep
            </Button>
            <Button variant="outline" disabled={!sharingEnabled} onClick={() => sendNudge("donor")}>
              <Send className="w-4 h-4 mr-2" />
              Blood Donor Prep
            </Button>
            <Button variant="outline" disabled={!sharingEnabled} onClick={() => sendNudge("checkup")}>
              <Send className="w-4 h-4 mr-2" />
              Checkup Reminder
            </Button>
          </div>
        </Card>

        <Button className="w-full bg-success text-white mt-4">
          <Plus className="w-4 h-4 mr-2" /> Add Family Member
        </Button>
      </div>
    </div>
  )
}
