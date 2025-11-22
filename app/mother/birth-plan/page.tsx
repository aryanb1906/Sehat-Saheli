"use client"

import { useState, useRef } from "react"
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, FileText } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"

export default function BirthPlan() {
  const router = useRouter()
  const { content } = useLanguage()
  const [preferences, setPreferences] = useState({
    location: "Hospital",
    birthPosition: "Natural",
    painManagement: "Breathing techniques",
    support: "Husband and mother",
  })

  const printRef = useRef<HTMLDivElement | null>(null)
  const { toast } = useToast()

  const loadScript = (src: string) =>
    new Promise<void>((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve()
      const s = document.createElement("script")
      s.src = src
      s.async = true
      s.onload = () => resolve()
      s.onerror = () => reject(new Error(`Failed to load ${src}`))
      document.head.appendChild(s)
    })

  const downloadPDF = async () => {
    if (!printRef.current) return

    // Load html2canvas and jsPDF from CDN if not already available
    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js")
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js")

      // @ts-ignore
      const html2canvas = (window as any).html2canvas
      // @ts-ignore
      const { jsPDF } = (window as any).jspdf || (window as any).jspdfDefault || {}

      if (!html2canvas || !jsPDF) throw new Error("Required libraries not available")

      const canvas = await html2canvas(printRef.current, { scale: 2 })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ unit: "mm", format: "a4" })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const imgProps = (pdf as any).getImageProperties
        ? pdf.getImageProperties(imgData)
        : { width: canvas.width, height: canvas.height }
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
      pdf.save("birth-plan.pdf")
    } catch (err) {
      // Fallback: open print dialog
      // eslint-disable-next-line no-console
      console.error(err)
      window.print()
    }
  }

  const saveBirthPlan = () => {
    try {
      localStorage.setItem('birthPlan', JSON.stringify(preferences))
      toast({ title: 'Saved', description: 'Birth plan saved locally.' })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to save birth plan', err)
      toast({ title: 'Error', description: 'Could not save birth plan.' })
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-warm/10 to-background">
      <div className="bg-linear-to-r from-warm to-warm/80 p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">My Birth Plan</h1>
            <p className="text-white/80 text-sm">Create your personalized birth plan</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div ref={printRef}>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Delivery Location</label>
                <select
                  className="w-full p-2 border rounded bg-background"
                  value={preferences.location}
                  onChange={(e) => setPreferences((p) => ({ ...p, location: e.target.value }))}
                >
                  <option>Hospital</option>
                  <option>Birthing Center</option>
                  <option>Home</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Birth Position Preference</label>
                <select
                  className="w-full p-2 border rounded bg-background"
                  value={preferences.birthPosition}
                  onChange={(e) => setPreferences((p) => ({ ...p, birthPosition: e.target.value }))}
                >
                  <option>Natural Position</option>
                  <option>Sitting</option>
                  <option>Squatting</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Pain Management</label>
                <textarea
                  className="w-full p-2 border rounded bg-background"
                  rows={3}
                  value={preferences.painManagement}
                  onChange={(e) => setPreferences((p) => ({ ...p, painManagement: e.target.value }))}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Support People</label>
                <textarea
                  className="w-full p-2 border rounded bg-background"
                  rows={3}
                  value={preferences.support}
                  onChange={(e) => setPreferences((p) => ({ ...p, support: e.target.value }))}
                />
              </div>
            </div>
          </Card>
        </div>

        <Button className="w-full bg-warm text-white" onClick={saveBirthPlan}>
          <Save className="w-4 h-4 mr-2" /> Save Birth Plan
        </Button>
        <Button variant="outline" className="w-full" onClick={downloadPDF}>
          <FileText className="w-4 h-4 mr-2" /> Download PDF
        </Button>
      </div>
    </div>
  )
}
