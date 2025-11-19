"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Users, Share2, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"

interface FamilyMember {
  id: string
  name: string
  relation: string
  canView: boolean
  canEdit: boolean
}

export default function FamilySharing() {
  const router = useRouter()
  const { content } = useLanguage()
  const [members, setMembers] = useState<FamilyMember[]>([
    { id: "1", name: "Rajesh", relation: "Husband", canView: true, canEdit: false },
    { id: "2", name: "Mother", relation: "Mother", canView: true, canEdit: false },
  ])

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
        {members.map((member) => (
          <Card key={member.id} className="p-4 border-2 border-success/20">
            <div className="flex items-start gap-3 mb-3">
              <Users className="w-5 h-5 text-success mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.relation}</p>
              </div>
              <Button variant="ghost" size="icon" className="text-alert">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 bg-success/10 text-success rounded">Can View</span>
              {member.canEdit && <span className="px-2 py-1 bg-accent/10 text-accent rounded">Can Edit</span>}
            </div>
          </Card>
        ))}
        <Button className="w-full bg-success text-white mt-4">
          <Plus className="w-4 h-4 mr-2" /> Add Family Member
        </Button>
      </div>
    </div>
  )
}
