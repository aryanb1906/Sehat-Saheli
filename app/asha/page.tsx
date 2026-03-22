"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
    AlertTriangle,
    ArrowRight,
    BarChart3,
    CheckCircle,
    CheckCircle2,
    ClipboardList,
    Clock3,
    GraduationCap,
    Home,
    Menu,
    Search,
    UserRound,
    Users,
    Volume2,
    Wifi,
    WifiOff,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/language-context"
import { NotificationCenter } from "@/components/notification-center"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardSection } from "@/components/dashboard-section"

interface Patient {
    id: string
    name: string
    age: number
    weeks: number
    risk: "Low" | "Medium" | "High"
    lastCheckup: string
}

type SyncState = "synced" | "syncing" | "queued"

export default function ASHADashboard() {
    const router = useRouter()
    const { content } = useLanguage()
    const [searchQuery, setSearchQuery] = useState("")
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(true)
    const [syncState, setSyncState] = useState<SyncState>("synced")

    useEffect(() => {
        const loadPatients = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/asha-patients?ashaWorkerId=asha_001&q=${encodeURIComponent(searchQuery)}`)
                const data = await res.json()
                setPatients(data.patients || [])
            } catch (error) {
                console.error("Failed to load ASHA patients", error)
            } finally {
                setLoading(false)
            }
        }

        loadPatients()
    }, [searchQuery])

    useEffect(() => {
        const states: SyncState[] = ["synced", "syncing", "queued"]
        let idx = 0
        const timer = setInterval(() => {
            idx = (idx + 1) % states.length
            setSyncState(states[idx])
        }, 9000)

        return () => clearInterval(timer)
    }, [])

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case "High":
                return "bg-alert text-white"
            case "Medium":
                return "bg-warning text-foreground"
            default:
                return "bg-success text-white"
        }
    }

    const stats = useMemo(
        () => ({
            total: patients.length,
            high: patients.filter((p) => p.risk === "High").length,
            medium: patients.filter((p) => p.risk === "Medium").length,
            low: patients.filter((p) => p.risk === "Low").length,
        }),
        [patients],
    )

    const filteredPatients = patients
    const criticalCases = stats.high
    const followUps = Math.max(0, stats.medium + stats.high)

    const productivity = [
        {
            title: "Priority home visits",
            value: Math.max(3, stats.high),
            note: "Start with red-risk mothers before noon",
            tone: "border-alert/30 bg-alert/10",
        },
        {
            title: "Overdue follow-ups",
            value: Math.max(4, followUps),
            note: "Call and reschedule missed ANC checkups",
            tone: "border-warning/30 bg-warning/10",
        },
        {
            title: "Escalations pending",
            value: Math.max(1, Math.floor(stats.high / 2)),
            note: "Escalate severe symptoms to PHC/doctor",
            tone: "border-trust/30 bg-trust/10",
        },
    ]

    const syncLabel =
        syncState === "synced" ? "Synced" : syncState === "syncing" ? "Syncing field data" : "Queued (offline)"

    return (
        <div className="min-h-screen bg-gradient-to-b from-trust/10 via-background to-background dark:from-[#141B28] dark:via-[#12141A] dark:to-[#111318]">
            <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role="asha" />

            <div className="mx-auto w-full max-w-6xl px-4 py-5 md:px-6 md:py-8">
                <Card className="animate-fade-up overflow-hidden border-border/70 bg-white shadow-sm dark:border-[#2A3040] dark:bg-[#1A1E27]">
                    <div className="bg-gradient-to-r from-trust to-accent px-5 py-6 text-white dark:from-[#2A3D56] dark:to-[#3A3552] md:px-7">
                        <div className="mb-5 flex items-center justify-between">
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setSidebarOpen(true)}>
                                <Menu className="h-6 w-6" />
                            </Button>
                            <div className="flex items-center gap-2">
                                <Badge className="border-white/30 bg-white/20 text-white">
                                    {syncState === "queued" ? <WifiOff className="mr-1 h-3.5 w-3.5" /> : <Wifi className="mr-1 h-3.5 w-3.5" />}
                                    {syncLabel}
                                </Badge>
                                <div className="text-white">
                                    <NotificationCenter />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{content.ashaDashboard || "ASHA Dashboard"}</h1>
                                <p className="mt-2 text-base font-medium text-white/90">{content.welcomeBack || "Welcome back"}, Meera Devi</p>
                            </div>
                            <div className="rounded-xl bg-white/20 px-4 py-3 backdrop-blur-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-white/85">Today</p>
                                <p className="mt-1 text-lg font-semibold">{stats.total} patients assigned</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 border-t border-border/70 bg-muted/20 p-5 dark:bg-[#141925] md:grid-cols-4 md:p-6">
                        <Card className="border-border/70 bg-white p-4 shadow-none dark:border-[#2A3040] dark:bg-[#1A1E27]">
                            <div className="flex items-center gap-3">
                                <Users className="h-7 w-7 text-trust" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground dark:text-white">{stats.total}</p>
                                    <p className="text-xs font-medium text-muted-foreground">{content.totalPatients || "Total Patients"}</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="border-alert/30 bg-alert/10 p-4 shadow-none dark:bg-alert/20">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-7 w-7 text-alert" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground dark:text-white">{stats.high}</p>
                                    <p className="text-xs font-medium text-muted-foreground">{content.highRisk || "High Risk"}</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="border-warning/30 bg-warning/10 p-4 shadow-none dark:bg-warning/20">
                            <div className="flex items-center gap-3">
                                <Clock3 className="h-7 w-7 text-warning" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground dark:text-white">{stats.medium}</p>
                                    <p className="text-xs font-medium text-muted-foreground">{content.mediumRisk || "Medium Risk"}</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="border-success/30 bg-success/10 p-4 shadow-none dark:bg-success/20">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-7 w-7 text-success" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground dark:text-white">{stats.low}</p>
                                    <p className="text-xs font-medium text-muted-foreground">{content.lowRisk || "Low Risk"}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </Card>

                <DashboardSection title="ASHA Productivity Panel" subtitle="Field priorities first" className="mt-7 animate-fade-up animate-fade-up-delay-1">
                    <div className="grid gap-4 md:grid-cols-3">
                        {productivity.map((item) => (
                            <Card key={item.title} className={`p-4 shadow-none ${item.tone}`}>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.title}</p>
                                <p className="mt-2 text-3xl font-bold">{item.value}</p>
                                <p className="mt-1 text-sm text-foreground/80">{item.note}</p>
                            </Card>
                        ))}
                    </div>
                </DashboardSection>

                <DashboardSection title="Quick Actions" subtitle="Daily workflow" className="mt-7 animate-fade-up animate-fade-up-delay-2">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <button
                            className="group flex min-h-[126px] flex-col justify-between rounded-xl bg-trust p-5 text-left text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                            onClick={() => router.push("/asha/training")}
                        >
                            <div className="flex items-start justify-between">
                                <GraduationCap className="h-7 w-7" />
                                <ArrowRight className="h-5 w-5 opacity-80 transition group-hover:translate-x-0.5" />
                            </div>
                            <div>
                                <p className="text-base font-semibold">Continue Training</p>
                                <p className="mt-1 text-sm text-white/90">3 modules in progress</p>
                            </div>
                        </button>

                        <button
                            className="group flex min-h-[126px] flex-col justify-between rounded-xl border border-border bg-white p-5 text-left text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                            onClick={() => router.push("/asha/appointment-reminders")}
                        >
                            <div className="flex items-start justify-between">
                                <Clock3 className="h-7 w-7 text-trust" />
                                <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-0.5" />
                            </div>
                            <div>
                                <p className="text-base font-semibold">Appointment Reminders</p>
                                <p className="mt-1 text-sm text-muted-foreground">Manage visit schedules quickly</p>
                            </div>
                        </button>

                        <button
                            className="group flex min-h-[126px] flex-col justify-between rounded-xl border border-border bg-white p-5 text-left text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                            onClick={() => router.push("/asha/home-visits")}
                        >
                            <div className="flex items-start justify-between">
                                <ClipboardList className="h-7 w-7 text-trust" />
                                <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-0.5" />
                            </div>
                            <div>
                                <p className="text-base font-semibold">Home Visits</p>
                                <p className="mt-1 text-sm text-muted-foreground">Track and update field visits</p>
                            </div>
                        </button>
                    </div>
                </DashboardSection>

                <DashboardSection title="Patient Directory" subtitle="Search and open profile" className="mt-7 animate-fade-up animate-fade-up-delay-3 pb-24 md:pb-8">
                    <Card className="border-border/70 bg-white p-3 shadow-sm dark:border-[#2A3040] dark:bg-[#1A1E27] md:p-4">
                        <div className="flex items-center gap-3">
                            <Search className="h-5 w-5 text-muted-foreground" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={content.searchPatients || "Search patients..."}
                                className="h-11 border-0 bg-muted/50"
                            />
                        </div>
                    </Card>

                    {loading ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Card key={index} className="border-border/70 bg-white p-4 shadow-sm dark:border-[#2A3040] dark:bg-[#1A1E27]">
                                    <div className="space-y-3">
                                        <Skeleton className="h-5 w-40 dark:bg-white/15" />
                                        <Skeleton className="h-4 w-56 dark:bg-white/15" />
                                        <Skeleton className="h-3 w-44 dark:bg-white/15" />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        filteredPatients.map((patient) => (
                            <Card
                                key={patient.id}
                                className="cursor-pointer border-border/80 bg-white p-4 shadow-sm transition-all hover:border-trust/40 hover:bg-trust/5 dark:border-[#2A3040] dark:bg-[#1A1E27] dark:hover:bg-trust/20"
                                onClick={() => router.push(`/asha/patient/${patient.id}`)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="mb-1 text-lg font-semibold text-foreground">{patient.name}</h3>
                                        <p className="mb-2 text-sm text-muted-foreground">
                                            {content.age || "Age"}: {patient.age} • {patient.weeks} {content.weeksPregnant || "weeks pregnant"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {content.lastCheckup || "Last checkup"}: {new Date(patient.lastCheckup).toLocaleDateString("en-IN")}
                                        </p>
                                    </div>
                                    <div className={`rounded-full px-4 py-2 text-sm font-semibold ${getRiskColor(patient.risk)}`}>
                                        {patient.risk} {content.risk || "Risk"}
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}

                    {!loading && filteredPatients.length === 0 && (
                        <Card className="border-border/70 bg-white p-6 text-center shadow-sm dark:border-[#2A3040] dark:bg-[#1A1E27]">
                            <p className="text-sm text-muted-foreground">No patients found for this search.</p>
                        </Card>
                    )}
                </DashboardSection>
            </div>

            <button
                onClick={() => router.push("/asha")}
                className="fixed bottom-6 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-trust px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.03] hover:shadow-xl active:scale-[0.98]"
            >
                <Volume2 className="h-4 w-4" />
                Voice Assist
            </button>

            <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-2xl border border-border/70 bg-white/95 p-2 shadow-lg backdrop-blur md:hidden">
                <div className="grid grid-cols-4 gap-1">
                    <button onClick={() => router.push("/asha")} className="flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium text-trust">
                        <Home className="h-4 w-4" />
                        Home
                    </button>
                    <button onClick={() => router.push("/asha/home-visits")} className="flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium text-muted-foreground hover:bg-muted">
                        <ClipboardList className="h-4 w-4" />
                        Visits
                    </button>
                    <button onClick={() => router.push("/asha")} className="flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium text-muted-foreground hover:bg-muted">
                        <UserRound className="h-4 w-4" />
                        Patients
                    </button>
                    <button onClick={() => router.push("/asha/analytics")} className="flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium text-muted-foreground hover:bg-muted">
                        <BarChart3 className="h-4 w-4" />
                        Analytics
                    </button>
                </div>
            </div>
        </div>
    )
}
