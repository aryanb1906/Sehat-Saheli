"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Pill, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface Medication {
  id: string
  name: string
  dosage: string
  time: string
  taken: boolean
}

export default function Medications() {
  const router = useRouter()
  const { toast } = useToast()
  const [medications, setMedications] = useState<Medication[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newMed, setNewMed] = useState({ name: "", dosage: "", time: "" })

  useEffect(() => {
    const saved = localStorage.getItem("medications")
    if (saved) {
      setMedications(JSON.parse(saved))
    } else {
      const demo: Medication[] = [
        { id: "1", name: "Iron Supplement", dosage: "100mg", time: "09:00", taken: false },
        { id: "2", name: "Folic Acid", dosage: "5mg", time: "09:00", taken: false },
        { id: "3", name: "Calcium", dosage: "500mg", time: "21:00", taken: false },
      ]
      setMedications(demo)
      localStorage.setItem("medications", JSON.stringify(demo))
    }
  }, [])

  const saveMedications = (meds: Medication[]) => {
    setMedications(meds)
    localStorage.setItem("medications", JSON.stringify(meds))
  }

  const addMedication = () => {
    if (!newMed.name || !newMed.dosage || !newMed.time) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      })
      return
    }

    const medication: Medication = {
      id: Date.now().toString(),
      ...newMed,
      taken: false,
    }
    saveMedications([...medications, medication])
    setNewMed({ name: "", dosage: "", time: "" })
    setShowAdd(false)
    toast({
      title: "Added!",
      description: "Medication reminder added",
    })
  }

  const toggleTaken = (id: string) => {
    const updated = medications.map((m) => (m.id === id ? { ...m, taken: !m.taken } : m))
    saveMedications(updated)
    toast({
      title: "Updated!",
      description: "Medication status updated",
    })
  }

  const deleteMedication = (id: string) => {
    saveMedications(medications.filter((m) => m.id !== id))
    toast({
      title: "Deleted!",
      description: "Medication removed",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm/10 via-care/10 to-background">
      <div className="bg-gradient-to-r from-trust to-accent p-6 text-white">
        <Button variant="ghost" size="icon" className="text-white mb-4" onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-3xl font-bold mb-2">Medications</h1>
        <p className="text-white/90">Track your daily medications</p>
      </div>

      <div className="p-6 space-y-6">
        <Button onClick={() => setShowAdd(!showAdd)} className="w-full h-12 gap-2">
          <Plus className="w-5 h-5" />
          Add Medication
        </Button>

        {showAdd && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4">New Medication</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Medication Name</label>
                <Input
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  placeholder="e.g., Iron Supplement"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Dosage</label>
                <Input
                  value={newMed.dosage}
                  onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                  placeholder="e.g., 100mg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Time</label>
                <Input
                  type="time"
                  value={newMed.time}
                  onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addMedication} className="flex-1">
                  Add
                </Button>
                <Button variant="outline" onClick={() => setShowAdd(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-3">
          <h2 className="text-xl font-bold">Today's Medications</h2>
          {medications.length === 0 ? (
            <Card className="p-8 text-center">
              <Pill className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No medications added yet</p>
            </Card>
          ) : (
            medications.map((med) => (
              <Card key={med.id} className={`p-4 ${med.taken ? "bg-success/10 border-success" : ""}`}>
                <div className="flex items-center gap-4">
                  <Button
                    variant={med.taken ? "default" : "outline"}
                    size="icon"
                    className={med.taken ? "bg-success hover:bg-success/90" : ""}
                    onClick={() => toggleTaken(med.id)}
                  >
                    <Check className="w-5 h-5" />
                  </Button>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${med.taken ? "line-through text-muted-foreground" : ""}`}>
                      {med.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {med.dosage} • {med.time}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteMedication(med.id)}>
                    <Trash2 className="w-5 h-5 text-alert" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
