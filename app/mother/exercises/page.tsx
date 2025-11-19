"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { ArrowLeft, Play, CheckCircle2, Clock, Star } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/language-context"

export default function PregnancyExercises() {
  const router = useRouter()
  const { content } = useLanguage()
  const [exercises] = useState([
    {
      id: 1,
      name: "Gentle Walking",
      duration: "20-30 min",
      difficulty: "Easy",
      benefits: "Improves circulation, reduces swelling",
      completed: true,
    },
    {
      id: 2,
      name: "Prenatal Yoga",
      duration: "15 min",
      difficulty: "Easy",
      benefits: "Reduces stress, improves flexibility",
      completed: false,
    },
    {
      id: 3,
      name: "Pelvic Floor Exercises",
      duration: "10 min",
      difficulty: "Medium",
      benefits: "Prepares for delivery, reduces back pain",
      completed: false,
    },
    {
      id: 4,
      name: "Breathing Exercises",
      duration: "5-10 min",
      difficulty: "Easy",
      benefits: "Calms mind, prepares for labor",
      completed: true,
    },
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <div className="bg-gradient-to-r from-accent to-success p-6 text-white">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Pregnancy Exercises</h1>
            <p className="text-white/80 text-sm">Safe exercises for your journey</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <Card className="p-6 bg-gradient-to-br from-success/10 to-accent/10 border-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">2/4</h2>
              <p className="text-sm text-muted-foreground">Exercises completed today</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
              <Star className="w-8 h-8 text-success fill-success" />
            </div>
          </div>
        </Card>

        <div>
          <h2 className="text-lg font-semibold mb-4">Recommended Exercises</h2>
          <div className="space-y-4">
            {exercises.map((exercise) => (
              <Card
                key={exercise.id}
                className={`p-4 hover:shadow-lg transition-all ${exercise.completed ? "bg-success/5" : ""}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{exercise.name}</h3>
                      {exercise.completed && <CheckCircle2 className="w-5 h-5 text-success" />}
                    </div>
                    <div className="flex gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {exercise.duration}
                      </Badge>
                      <Badge
                        className={`text-xs ${
                          exercise.difficulty === "Easy"
                            ? "bg-success/10 text-success"
                            : "bg-warn/10 text-warn"
                        }`}
                      >
                        {exercise.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{exercise.benefits}</p>
                  </div>
                </div>
                <Button
                  className={`w-full ${exercise.completed ? "bg-muted" : "bg-accent hover:bg-accent/90"}`}
                  disabled={exercise.completed}
                >
                  {exercise.completed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Exercise
                    </>
                  )}
                </Button>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-6 bg-alert/10 border-alert/20">
          <h3 className="font-semibold text-alert mb-2">Safety Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Always consult your doctor before starting any exercise</li>
            <li>• Stop immediately if you feel dizzy, short of breath, or pain</li>
            <li>• Stay hydrated and avoid overheating</li>
            <li>• Avoid exercises lying flat on your back after first trimester</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
