"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, Video, CheckCircle2, Lock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/lib/language-context"

export default function ASHATraining() {
  const router = useRouter()
  const { content } = useLanguage()
  const [modules] = useState([
    {
      id: 1,
      title: "Antenatal Care Basics",
      description: "Learn about prenatal checkups and screenings",
      duration: "30 min",
      progress: 100,
      completed: true,
      type: "video",
    },
    {
      id: 2,
      title: "High-Risk Pregnancy Recognition",
      description: "Identify warning signs and risk factors",
      duration: "45 min",
      progress: 100,
      completed: true,
      type: "video",
    },
    {
      id: 3,
      title: "Emergency Response Protocol",
      description: "Handle pregnancy emergencies effectively",
      duration: "25 min",
      progress: 60,
      completed: false,
      type: "interactive",
    },
    {
      id: 4,
      title: "Nutrition Counseling",
      description: "Guide mothers on proper pregnancy nutrition",
      duration: "20 min",
      progress: 0,
      completed: false,
      type: "reading",
    },
    {
      id: 5,
      title: "Mental Health Support",
      description: "Provide emotional and psychological support",
      duration: "35 min",
      progress: 0,
      completed: false,
      type: "video",
      locked: true,
    },
  ])

  const completedCount = modules.filter((m) => m.completed).length
  const totalProgress = Math.round(modules.reduce((sum, m) => sum + m.progress, 0) / modules.length)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-trust/5 to-background">
      <div className="bg-gradient-to-r from-trust to-accent p-6 text-white">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">ASHA Training Modules</h1>
            <p className="text-white/80 text-sm">Continuous learning for better care</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <Card className="p-6 bg-gradient-to-br from-trust/10 to-accent/10 border-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Your Progress</h2>
              <p className="text-sm text-muted-foreground">
                {completedCount}/{modules.length} modules completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-trust">{totalProgress}%</div>
            </div>
          </div>
          <Progress value={totalProgress} className="h-3" />
        </Card>

        <div>
          <h2 className="text-lg font-semibold mb-4">Training Modules</h2>
          <div className="space-y-4">
            {modules.map((module) => (
              <Card
                key={module.id}
                className={`p-4 hover:shadow-lg transition-all ${module.completed ? "bg-success/5" : ""} ${
                  module.locked ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                      module.completed
                        ? "bg-success/20"
                        : module.locked
                          ? "bg-muted"
                          : "bg-trust/20"
                    }`}
                  >
                    {module.locked ? (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    ) : module.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    ) : module.type === "video" ? (
                      <Video className="w-6 h-6 text-trust" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-trust" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{module.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {module.duration}
                      </Badge>
                      <Badge
                        className={`text-xs ${
                          module.type === "video"
                            ? "bg-trust/10 text-trust"
                            : module.type === "interactive"
                              ? "bg-accent/10 text-accent"
                              : "bg-success/10 text-success"
                        }`}
                      >
                        {module.type}
                      </Badge>
                    </div>

                    {!module.completed && !module.locked && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{module.progress}%</span>
                        </div>
                        <Progress value={module.progress} className="h-2" />
                      </div>
                    )}

                    <Button
                      className={`w-full ${
                        module.completed
                          ? "bg-success/10 text-success hover:bg-success/20"
                          : module.locked
                            ? "bg-muted"
                            : "bg-trust hover:bg-trust/90"
                      }`}
                      disabled={module.locked}
                    >
                      {module.locked ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Complete previous modules
                        </>
                      ) : module.completed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Completed
                        </>
                      ) : module.progress > 0 ? (
                        "Continue Learning"
                      ) : (
                        "Start Module"
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
