"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, RotateCcw, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface KickSession {
  date: string
  time: string
  kicks: number
  duration: number
}

export default function KickCounter() {
  const router = useRouter()
  const { toast } = useToast()
  const [kicks, setKicks] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [history, setHistory] = useState<KickSession[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("kickHistory")
    if (saved) {
      setHistory(JSON.parse(saved))
    }
  }, [])

  const startSession = () => {
    setKicks(0)
    setStartTime(new Date())
  }

  const addKick = () => {
    setKicks(kicks + 1)

    // Play haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  const endSession = () => {
    if (!startTime) return

    const duration = Math.round((new Date().getTime() - startTime.getTime()) / 60000) // minutes

    const session: KickSession = {
      date: new Date().toLocaleDateString("en-IN"),
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      kicks,
      duration,
    }

    const updatedHistory = [session, ...history].slice(0, 10)
    setHistory(updatedHistory)
    localStorage.setItem("kickHistory", JSON.stringify(updatedHistory))

    toast({
      title: "Session Saved!",
      description: `Recorded ${kicks} kicks in ${duration} minutes`,
    })

    setKicks(0)
    setStartTime(null)
  }

  const resetSession = () => {
    setKicks(0)
    setStartTime(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm/10 via-care/10 to-background">
      <div className="bg-gradient-to-r from-care to-warm p-6 text-white">
        <Button variant="ghost" size="icon" className="text-white mb-4" onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-3xl font-bold mb-2">Baby Kick Counter</h1>
        <p className="text-white/90">Track your baby's movements</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Counter Card */}
        <Card className="p-8 text-center bg-gradient-to-br from-care/10 to-warm/10">
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2">Total Kicks</p>
            <h2 className="text-7xl font-bold text-care">{kicks}</h2>
          </div>

          {startTime && (
            <div className="mb-6 p-4 bg-background/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Session Duration</p>
              <p className="text-2xl font-semibold">
                {Math.floor((new Date().getTime() - startTime.getTime()) / 60000)} min
              </p>
            </div>
          )}

          <div className="space-y-3">
            {!startTime ? (
              <Button onClick={startSession} className="w-full h-16 text-lg" size="lg">
                Start Counting
              </Button>
            ) : (
              <>
                <Button onClick={addKick} className="w-full h-20 text-2xl bg-care hover:bg-care/90" size="lg">
                  <Plus className="w-8 h-8 mr-2" />
                  Count Kick
                </Button>
                <div className="flex gap-2">
                  <Button onClick={endSession} variant="default" className="flex-1" size="lg">
                    Save Session
                  </Button>
                  <Button onClick={resetSession} variant="outline" className="flex-1 bg-transparent" size="lg">
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-6 bg-trust/5 border-trust">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-trust" />
            Kick Count Guidelines
          </h3>
          <div className="space-y-2 text-sm">
            <p>• Count kicks when baby is usually active (after meals)</p>
            <p>• You should feel at least 10 movements in 2 hours</p>
            <p>• Contact your doctor if you notice decreased movement</p>
            <p>• Every baby has their own pattern - learn yours</p>
          </div>
        </Card>

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold">Recent Sessions</h2>
            {history.map((session, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{session.kicks} kicks</p>
                    <p className="text-sm text-muted-foreground">
                      {session.date} at {session.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-semibold">{session.duration} min</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
