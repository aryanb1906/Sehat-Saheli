"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, TrendingUp, Users, Activity, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"

interface ASHAMetric {
    ashaId: string
    ashaName: string
    patientsManaged: number
    tasksCompleted: number
    taskCompletionRate: number
    highRiskIdentifications: number
    vaccinations: number
    ancVisits: number
    averageRating: number
}

export default function AnalyticsDashboard() {
    const router = useRouter()
    const { content } = useLanguage()
    const { toast } = useToast()
    const [metrics, setMetrics] = useState<ASHAMetric[]>([])
    const [selectedMetric, setSelectedMetric] = useState("engagement")
    const [loading, setLoading] = useState(true)

    const funnel = {
        registered: 245,
        ancCompleted: 202,
        institutionalDelivery: 181,
        pncCompleted: 149,
    }

    const villageHeatmap = [
        { village: "Rampur", highRisk: 11, trend: "+2 this week" },
        { village: "Sundarpur", highRisk: 8, trend: "stable" },
        { village: "Nandgaon", highRisk: 6, trend: "-1 this week" },
        { village: "Bhagatpur", highRisk: 5, trend: "+1 this week" },
    ]

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {
        try {
            const response = await fetch("/api/analytics?type=asha-performance")
            const data = await response.json()
            setMetrics(data.ashaMetrics)
        } catch (error) {
            console.error("Failed to fetch analytics:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-accent/10 to-background">
            <div className="bg-gradient-to-r from-accent to-trust p-6 text-white sticky top-0 z-50">
                <div className="flex items-center gap-4 mb-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
                </div>
                <p className="text-white/90 leading-relaxed">Track performance & impact metrics</p>
            </div>

            <div className="p-6 max-w-6xl mx-auto">
                {loading ? (
                    <>
                        {/* Skeleton KPI Cards */}
                        <div className="grid md:grid-cols-4 gap-4 mb-8">
                            {[...Array(4)].map((_, i) => (
                                <Card key={i} className="p-6">
                                    <Skeleton className="h-8 w-16 mb-3" />
                                    <Skeleton className="h-6 w-full" />
                                </Card>
                            ))}
                        </div>

                        {/* Skeleton ASHA Cards */}
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <Card key={i} className="p-6">
                                    <Skeleton className="h-6 w-32 mb-4" />
                                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                                        {[...Array(4)].map((_, j) => (
                                            <Skeleton key={j} className="h-8 w-full" />
                                        ))}
                                    </div>
                                    <Skeleton className="h-10 w-full" />
                                </Card>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Key Metrics */}
                        <div className="grid md:grid-cols-4 gap-4 mb-8">
                            <Card className="p-6 bg-gradient-to-br from-care/20 to-warm/20 border-care/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-foreground/70 text-sm leading-relaxed">Total Patients</p>
                                        <p className="text-3xl font-bold leading-relaxed">245</p>
                                    </div>
                                    <Users className="w-8 h-8 text-care" />
                                </div>
                            </Card>

                            <Card className="p-6 bg-gradient-to-br from-success/20 to-care/20 border-success/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-foreground/70 text-sm leading-relaxed">High-Risk Cases</p>
                                        <p className="text-3xl font-bold leading-relaxed">34</p>
                                    </div>
                                    <Activity className="w-8 h-8 text-success" />
                                </div>
                            </Card>

                            <Card className="p-6 bg-gradient-to-br from-trust/20 to-accent/20 border-trust/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-foreground/70 text-sm leading-relaxed">Avg Completion Rate</p>
                                        <p className="text-3xl font-bold leading-relaxed">91%</p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-trust" />
                                </div>
                            </Card>

                            <Card className="p-6 bg-gradient-to-br from-warning/20 to-accent/20 border-warning/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-foreground/70 text-sm leading-relaxed">Team Rating</p>
                                        <p className="text-3xl font-bold leading-relaxed">4.6/5</p>
                                    </div>
                                    <Award className="w-8 h-8 text-warning" />
                                </div>
                            </Card>
                        </div>

                        {/* ASHA Performance */}
                        <h2 className="text-xl font-bold mb-4 leading-relaxed">ASHA Worker Performance</h2>
                        {metrics.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <TrendingUp className="w-12 h-12 text-primary/30 mb-4" />
                                <p className="text-lg font-semibold leading-relaxed">No analytics data available</p>
                                <p className="text-sm text-foreground/60 mt-2 leading-relaxed">Metrics will appear as ASHA workers complete tasks</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {metrics.map((asha) => (
                                    <Card key={asha.ashaId} className="p-6 hover:shadow-lg transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold leading-relaxed">{asha.ashaName}</h3>
                                                <p className="text-sm text-foreground/60 leading-relaxed">ASHA ID: {asha.ashaId}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-accent leading-relaxed">⭐ {asha.averageRating}</div>
                                                <p className="text-xs text-foreground/60 leading-relaxed">Rating</p>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-4 gap-4 mb-4">
                                            <div>
                                                <p className="text-xs text-foreground/60 leading-relaxed">Patients</p>
                                                <p className="text-2xl font-bold leading-relaxed">{asha.patientsManaged}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-foreground/60 leading-relaxed">Tasks Done</p>
                                                <p className="text-2xl font-bold leading-relaxed">{asha.tasksCompleted}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-foreground/60 leading-relaxed">Completion Rate</p>
                                                <p className="text-2xl font-bold text-success leading-relaxed">
                                                    {asha.taskCompletionRate}%
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-foreground/60 leading-relaxed">High-Risk IDs</p>
                                                <p className="text-2xl font-bold text-warning leading-relaxed">
                                                    {asha.highRiskIdentifications}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mb-3">
                                            <div className="flex justify-between text-xs mb-1 leading-relaxed">
                                                <span>Completion Progress</span>
                                                <span>{asha.taskCompletionRate}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-success transition-all"
                                                    style={{ width: `${asha.taskCompletionRate}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full h-10"
                                            onClick={() => toast({
                                                title: "📊 Detailed Report",
                                                description: `Loading ${asha.ashaName}'s full performance report...`,
                                            })}
                                        >
                                            View Detailed Report
                                        </Button>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Cohort Funnel */}
                        <Card className="p-6 mt-8 border-trust/25 bg-trust/5">
                            <h2 className="text-lg font-bold mb-4">Maternal Care Funnel</h2>
                            <div className="grid md:grid-cols-4 gap-3">
                                <div className="rounded-lg bg-background p-3 border">
                                    <p className="text-xs text-muted-foreground">Registered</p>
                                    <p className="text-2xl font-bold">{funnel.registered}</p>
                                </div>
                                <div className="rounded-lg bg-background p-3 border">
                                    <p className="text-xs text-muted-foreground">ANC Completed</p>
                                    <p className="text-2xl font-bold">{funnel.ancCompleted}</p>
                                </div>
                                <div className="rounded-lg bg-background p-3 border">
                                    <p className="text-xs text-muted-foreground">Institutional Delivery</p>
                                    <p className="text-2xl font-bold">{funnel.institutionalDelivery}</p>
                                </div>
                                <div className="rounded-lg bg-background p-3 border">
                                    <p className="text-xs text-muted-foreground">PNC Completed</p>
                                    <p className="text-2xl font-bold">{funnel.pncCompleted}</p>
                                </div>
                            </div>
                        </Card>

                        {/* High-Risk Village Heatmap */}
                        <Card className="p-6 mt-6 border-warning/25 bg-warning/5">
                            <h2 className="text-lg font-bold mb-4">High-Risk Village Heatmap</h2>
                            <div className="space-y-2">
                                {villageHeatmap.map((row) => (
                                    <div key={row.village} className="flex items-center justify-between rounded-lg border bg-background p-3">
                                        <div>
                                            <p className="font-medium text-sm">{row.village}</p>
                                            <p className="text-xs text-muted-foreground">{row.trend}</p>
                                        </div>
                                        <span className="rounded-full bg-alert/10 px-3 py-1 text-xs font-semibold text-alert">
                                            {row.highRisk} high-risk
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Intervention Effectiveness */}
                        <Card className="p-6 mt-6 border-success/25 bg-success/5">
                            <h2 className="text-lg font-bold mb-4">Intervention Effectiveness</h2>
                            <div className="grid md:grid-cols-3 gap-3">
                                <div className="rounded-lg border bg-background p-3">
                                    <p className="text-xs text-muted-foreground">Follow-up Closure Rate</p>
                                    <p className="text-2xl font-bold text-success">88%</p>
                                </div>
                                <div className="rounded-lg border bg-background p-3">
                                    <p className="text-xs text-muted-foreground">Danger Sign Escalation in &lt; 2h</p>
                                    <p className="text-2xl font-bold text-trust">79%</p>
                                </div>
                                <div className="rounded-lg border bg-background p-3">
                                    <p className="text-xs text-muted-foreground">Missed ANC Recovery</p>
                                    <p className="text-2xl font-bold text-warning">64%</p>
                                </div>
                            </div>
                        </Card>
                    </>
                )}
            </div>
        </div>
    )
}
