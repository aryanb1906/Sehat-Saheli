"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Baby, Calendar, Activity, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export default function PregnancyTracker() {
  const router = useRouter()
  const { toast } = useToast()
  const [pregnancyWeek, setPregnancyWeek] = useState(24)
  const [dueDate, setDueDate] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const savedWeek = localStorage.getItem("pregnancyWeek")
    const savedDueDate = localStorage.getItem("dueDate")
    if (savedWeek) setPregnancyWeek(Number.parseInt(savedWeek))
    if (savedDueDate) setDueDate(savedDueDate)
  }, [])

  const saveTracker = () => {
    localStorage.setItem("pregnancyWeek", pregnancyWeek.toString())
    localStorage.setItem("dueDate", dueDate)
    setIsEditing(false)
    toast({
      title: "Saved!",
      description: "Pregnancy tracker updated successfully",
    })
  }

  const trimester = pregnancyWeek <= 13 ? "First" : pregnancyWeek <= 27 ? "Second" : "Third"

  const milestones = [
    { week: 12, text: "End of first trimester" },
    { week: 20, text: "Halfway through pregnancy" },
    { week: 28, text: "Third trimester begins" },
    { week: 37, text: "Full term" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm/10 via-care/10 to-background">
      <div className="bg-gradient-to-r from-warm to-care p-6 text-white">
        <Button variant="ghost" size="icon" className="text-white mb-4" onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-3xl font-bold mb-2">Pregnancy Tracker</h1>
        <p className="text-white/90">Track your pregnancy journey</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Current Week Card */}
        <Card className="p-6 bg-gradient-to-br from-trust/10 to-care/10">
          <div className="text-center">
            <Baby className="w-16 h-16 mx-auto mb-4 text-trust" />
            <h2 className="text-5xl font-bold mb-2">{pregnancyWeek}</h2>
            <p className="text-xl text-muted-foreground mb-4">Weeks Pregnant</p>
            <div className="inline-block bg-care/20 rounded-full px-4 py-2">
              <p className="font-semibold">{trimester} Trimester</p>
            </div>
          </div>
        </Card>

        {/* Edit Section */}
        {isEditing ? (
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Pregnancy Week</label>
                <Input
                  type="number"
                  min="1"
                  max="42"
                  value={pregnancyWeek}
                  onChange={(e) => setPregnancyWeek(Number.parseInt(e.target.value) || 0)}
                  className="text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Due Date</label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="text-lg" />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveTracker} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="text-xl font-semibold">
                  {dueDate
                    ? new Date(dueDate).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Not set"}
                </p>
              </div>
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
            </div>
            {dueDate && (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-trust" />
                  <div>
                    <p className="text-sm text-muted-foreground">Days Remaining</p>
                    <p className="text-2xl font-bold">
                      {Math.max(
                        0,
                        Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Progress Bar */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Pregnancy Progress</h3>
          <div className="relative">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-trust to-care transition-all duration-500"
                style={{ width: `${(pregnancyWeek / 40) * 100}%` }}
              />
            </div>
            <p className="text-center mt-2 text-sm text-muted-foreground">
              {Math.round((pregnancyWeek / 40) * 100)}% Complete
            </p>
          </div>
        </Card>

        {/* Milestones */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Upcoming Milestones
          </h3>
          <div className="space-y-3">
            {milestones
              .filter((m) => m.week >= pregnancyWeek)
              .map((milestone) => (
                <div key={milestone.week} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-trust/20 flex items-center justify-center flex-shrink-0">
                    <p className="text-sm font-bold">{milestone.week}w</p>
                  </div>
                  <div>
                    <p className="font-medium">{milestone.text}</p>
                    <p className="text-sm text-muted-foreground">{milestone.week - pregnancyWeek} weeks away</p>
                  </div>
                </div>
              ))}
          </div>
        </Card>

        {/* Baby Development */}
        <Card className="p-6 bg-gradient-to-br from-care/5 to-warm/5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-care" />
            Baby Development at Week {pregnancyWeek}
          </h3>
          <div className="space-y-3 text-sm">
            {pregnancyWeek <= 13 && (
              <>
                <p>• Baby's organs are forming rapidly</p>
                <p>• About the size of a lime or small lemon</p>
                <p>• Heart is beating and visible on ultrasound</p>
              </>
            )}
            {pregnancyWeek > 13 && pregnancyWeek <= 27 && (
              <>
                <p>• Baby can hear sounds and may respond to your voice</p>
                <p>• Rapid brain development occurring</p>
                <p>• You may start feeling baby movements (quickening)</p>
                <p>• Baby is growing eyelashes and eyebrows</p>
              </>
            )}
            {pregnancyWeek > 27 && (
              <>
                <p>• Baby's lungs are maturing</p>
                <p>• Baby is gaining weight rapidly</p>
                <p>• Regular movement patterns established</p>
                <p>• Baby can open and close eyes</p>
                <p>• Getting ready for birth!</p>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
