"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, FileText, Download, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"

interface MedicalRecord {
  id: string
  type: string
  date: string
  title: string
  notes: string
}

export default function MedicalRecords() {
  const router = useRouter()
  const { content } = useLanguage()
  const { toast } = useToast()
  const [records, setRecords] = useState<MedicalRecord[]>([
    {
      id: "1",
      type: "Ultrasound",
      date: "2025-01-15",
      title: "20-week Ultrasound",
      notes: "Baby growing normally, weight: 350g",
    },
    {
      id: "2",
      type: "Blood Test",
      date: "2025-01-10",
      title: "Hemoglobin Test",
      notes: "Hemoglobin: 11.2 g/dL (Normal)",
    },
  ])

  const handleDelete = (id: string) => {
    setRecords(records.filter(r => r.id !== id))
    toast({ title: content.deletedSuccessfully })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-trust/10 to-background">
      <div className="bg-gradient-to-r from-trust to-trust/80 p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Medical Records</h1>
            <p className="text-white/80 text-sm">Your test results and reports</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {records.map((record) => (
          <Card key={record.id} className="p-4 border-2 border-trust/20 hover:border-trust/50">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-trust mt-1" />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{record.title}</h3>
                    <p className="text-sm text-muted-foreground">{record.type}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{new Date(record.date).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{record.notes}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs">
                    <Download className="w-3 h-3 mr-1" /> Download
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs text-alert" onClick={() => handleDelete(record.id)}>
                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
