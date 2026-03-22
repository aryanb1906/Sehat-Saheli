"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, AlertTriangle, AlertCircle, CheckCircle, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"

interface DangerSign {
    sign: string
    severity: "critical" | "high" | "medium"
    action: string
    description: string
}

export default function DangerSignsMonitor() {
    const router = useRouter()
    const { content } = useLanguage()
    const { toast } = useToast()
    const [dangerSigns, setDangerSigns] = useState<DangerSign[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDangerSigns()
    }, [])

    const fetchDangerSigns = async () => {
        try {
            const response = await fetch("/api/emergency?type=danger-signs")
            const data = await response.json()
            setDangerSigns(data.dangerSigns)
        } catch (error) {
            console.error("Failed to fetch danger signs:", error)
        } finally {
            setLoading(false)
        }
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "critical":
                return "border-alert/50 bg-alert/10"
            case "high":
                return "border-warning/50 bg-warning/10"
            default:
                return "border-blue-300/50 bg-blue-50/10"
        }
    }

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case "critical":
                return <AlertTriangle className="w-6 h-6 text-alert" />
            case "high":
                return <AlertCircle className="w-6 h-6 text-warning" />
            default:
                return <CheckCircle className="w-6 h-6 text-blue-600" />
        }
    }

    const triggerSOS = async () => {
        try {
            const response = await fetch("/api/emergency", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "trigger-sos",
                    data: {
                        userId: "user_001",
                        location: { lat: 20.5937, lng: 78.9629 },
                        reason: "Emergency - Danger Sign Detected",
                    },
                }),
            })

            const data = await response.json()
            toast({
                title: "🚨 SOS Triggered!",
                description: "Emergency services have been notified. Help is on the way.",
            })
        } catch (error) {
            console.error("Failed to trigger SOS:", error)
            toast({
                title: "Error",
                description: "Failed to trigger SOS. Please try again or call 108 directly.",
                variant: "destructive",
            })
        }
    }

    const call108 = async () => {
        try {
            await fetch("/api/emergency", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "call-108",
                    data: {
                        location: { lat: 20.5937, lng: 78.9629 },
                        reason: "Pregnant woman emergency",
                    },
                }),
            })

            toast({
                title: "🚑 Ambulance Requested",
                description: "Emergency ambulance is on its way to your location.",
            })
        } catch (error) {
            console.error("Failed to call ambulance:", error)
            toast({
                title: "Error",
                description: "Failed to request ambulance. Please call 108 directly.",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-alert/10 to-background">
            <div className="bg-gradient-to-r from-alert to-warning p-6 text-white sticky top-0 z-50">
                <div className="flex items-center gap-4 mb-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold">Danger Signs</h1>
                </div>
            </div>

            <div className="p-6 max-w-4xl mx-auto">
                {loading ? (
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        {[...Array(2)].map((_, i) => (
                            <Card key={i} className="p-6">
                                <Skeleton className="h-12 w-full mb-4" />
                                <Skeleton className="h-10 w-full" />
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <Card className="p-6 bg-alert/15 border-alert/50">
                            <div className="text-center">
                                <div className="text-4xl mb-3">🆘</div>
                                <h3 className="font-bold text-lg mb-2 leading-relaxed">Emergency SOS</h3>
                                <Button
                                    className="w-full bg-alert text-white h-11"
                                    onClick={() => triggerSOS()}
                                >
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Trigger SOS
                                </Button>
                            </div>
                        </Card>

                        <Card className="p-6 bg-warning/15 border-warning/50">
                            <div className="text-center">
                                <div className="text-4xl mb-3">🚑</div>
                                <h3 className="font-bold text-lg mb-2 leading-relaxed">Call Ambulance (108)</h3>
                                <Button
                                    className="w-full bg-warning text-white h-11"
                                    onClick={() => call108()}
                                >
                                    <Phone className="w-4 h-4 mr-2" />
                                    Call 108
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {!loading && dangerSigns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <AlertCircle className="w-12 h-12 text-primary/30 mb-4" />
                        <p className="text-lg font-semibold leading-relaxed">No danger signs recorded</p>
                        <p className="text-sm text-foreground/60 mt-2 leading-relaxed">Watch for warning signs during pregnancy</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-bold mb-4 text-alert leading-relaxed">🔴 CRITICAL Signs</h2>
                        <div className="space-y-3 mb-8">
                            {[
                                { sign: "Severe Vaginal Bleeding", description: "More blood than a normal period" },
                                { sign: "Severe Abdominal Pain", description: "Unbearable pain" },
                                { sign: "Loss of Consciousness", description: "Fainting episodes" },
                            ].map((item, i) => (
                                <Card key={i} className={`p-4 border-2 ${getSeverityColor("critical")}`}>
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-6 h-6 text-alert flex-shrink-0" />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-alert leading-relaxed">{item.sign}</h3>
                                            <p className="text-sm text-foreground/70 mt-1 leading-relaxed">{item.description}</p>
                                            <p className="text-sm font-semibold text-alert mt-2 leading-relaxed">⚡ Call 108 immediately</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
