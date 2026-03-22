"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
    Activity,
    AlertTriangle,
    Baby,
    BookOpen,
    Calendar,
    ChevronRight,
    Dumbbell,
    FileText,
    Heart,
    MapPin,
    Menu,
    MessageCircle,
    Mic,
    Phone,
    Pill,
    Share2,
    ShieldAlert,
    TrendingUp,
    Users,
    Utensils,
    Video,
    Zap,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { NotificationCenter } from "@/components/notification-center"
import { AppSidebar } from "@/components/app-sidebar"
import { useLanguage } from "@/lib/language-context"
import { DashboardSection } from "@/components/dashboard-section"

type RiskStatus = "Low" | "Medium" | "High"
type ToolCategory = "tracking" | "medical" | "support"

interface PrimaryAction {
    title: string
    subtitle: string
    route: string
    icon: LucideIcon
    tone: "primary" | "soft" | "danger"
}

interface ToolItem {
    label: string
    route: string
    icon: LucideIcon
}

const RISK_META: Record<RiskStatus, { value: number; chip: string; reason: string }> = {
    Low: {
        value: 24,
        chip: "bg-success/15 text-success",
        reason: "Vitals stable. No risk symptoms detected.",
    },
    Medium: {
        value: 58,
        chip: "bg-warning/20 text-foreground",
        reason: "Monitor hydration and fatigue for the next 24 hours.",
    },
    High: {
        value: 88,
        chip: "bg-alert/20 text-alert",
        reason: "High-risk symptoms detected. Contact your doctor today.",
    },
}

export default function MotherDashboard() {
    const router = useRouter()
    const { content } = useLanguage()

    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [userName, setUserName] = useState("Priya")
    const [pregnancyWeek, setPregnancyWeek] = useState(24)
    const [riskStatus, setRiskStatus] = useState<RiskStatus>("Low")
    const [activeCategory, setActiveCategory] = useState<ToolCategory>("tracking")
    const [hydrated, setHydrated] = useState(false)

    useEffect(() => {
        const savedRisk = localStorage.getItem("motherRiskStatus")
        const savedWeek = localStorage.getItem("pregnancyWeek")
        const savedName = localStorage.getItem("motherName")

        if (savedRisk === "Low" || savedRisk === "Medium" || savedRisk === "High") {
            setRiskStatus(savedRisk)
        }

        if (savedWeek) {
            const week = Number.parseInt(savedWeek, 10)
            if (!Number.isNaN(week)) setPregnancyWeek(week)
        }

        if (savedName) {
            setUserName(savedName)
        }

        setHydrated(true)
    }, [])

    const primaryActions = useMemo<PrimaryAction[]>(
        () => [
            {
                title: content.talkToSaheli || "Talk to Saheli",
                subtitle: "Chat with AI care guide",
                route: "/mother/talk",
                icon: Mic,
                tone: "primary",
            },
            {
                title: content.emergencyCall || "Emergency Call",
                subtitle: "Fast access to urgent support",
                route: "/mother/emergency",
                icon: Phone,
                tone: "danger",
            },
            {
                title: content.myHealthLog || "My Health Log",
                subtitle: "Track daily symptoms and vitals",
                route: "/mother/health-log",
                icon: BookOpen,
                tone: "soft",
            },
            {
                title: content.mentalHealth || "Mental Health",
                subtitle: "Mood check and calm breathing",
                route: "/mother/mental-health",
                icon: Heart,
                tone: "soft",
            },
        ],
        [content],
    )

    const toolsByCategory: Record<ToolCategory, ToolItem[]> = {
        tracking: [
            { label: "Pregnancy Tracker", route: "/mother/pregnancy-tracker", icon: Baby },
            { label: "Vital Signs Tracker", route: "/mother/vital-signs", icon: TrendingUp },
            { label: "Baby Kick Counter", route: "/mother/kick-counter", icon: Activity },
            { label: "Nutrition Tracker", route: "/mother/nutrition", icon: Utensils },
            { label: "Pregnancy Exercises", route: "/mother/exercises", icon: Dumbbell },
            { label: "Labor Signs Tracker", route: "/mother/labor-signs", icon: Zap },
        ],
        medical: [
            { label: content.myAppointments || "My Appointments", route: "/mother/appointments", icon: Calendar },
            { label: "Doctor Consultation", route: "/mother/doctor-consultation", icon: Video },
            { label: "Medications & Reminders", route: "/mother/medications", icon: Pill },
            { label: "Medical Records", route: "/mother/medical-records", icon: FileText },
            { label: "Birth Plan", route: "/mother/birth-plan", icon: Heart },
            { label: "Hospital Finder", route: "/mother/hospital-finder", icon: MapPin },
        ],
        support: [
            { label: content.healthTips || "Health Tips", route: "/mother/tips", icon: MessageCircle },
            { label: "Community Support", route: "/mother/community", icon: Users },
            { label: "Family Sharing", route: "/mother/family-sharing", icon: Share2 },
            { label: "Pregnancy Journal", route: "/mother/pregnancy-journal", icon: BookOpen },
            { label: "SOS Emergency", route: "/mother/sos-emergency", icon: AlertTriangle },
        ],
    }

    const riskMeta = RISK_META[riskStatus]

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FDF2F4] via-background to-background dark:from-[#1A1418] dark:via-[#12141A] dark:to-[#111318]">
            <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role="mother" />

            <div className="mx-auto w-full max-w-6xl px-4 py-5 md:px-6 md:py-8">
                <Card className="animate-fade-up overflow-hidden border-border/70 bg-white shadow-sm dark:border-[#2A3040] dark:bg-[#1A1E27]">
                    <div className="bg-gradient-to-r from-[#FADADD] to-[#F5E2F7] px-5 py-6 dark:from-[#3E2A35] dark:to-[#3A2B46] md:px-7">
                        <div className="mb-5 flex items-center justify-between">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-foreground hover:bg-white/60"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu className="h-6 w-6" />
                            </Button>
                            <NotificationCenter />
                        </div>

                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                {hydrated ? (
                                    <>
                                        <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-white md:text-4xl">
                                            Namaste, {userName} 🌸
                                        </h1>
                                        <p className="mt-2 text-sm font-medium text-foreground/80 dark:text-white/85 md:text-base">
                                            You are doing great today 💛
                                        </p>
                                    </>
                                ) : (
                                    <div className="space-y-2">
                                        <Skeleton className="h-8 w-64 bg-white/60 dark:bg-white/20" />
                                        <Skeleton className="h-4 w-52 bg-white/50 dark:bg-white/20" />
                                    </div>
                                )}
                            </div>

                            <div className="rounded-xl border border-white/60 bg-white/65 px-4 py-3 backdrop-blur-sm dark:border-white/20 dark:bg-white/10">
                                <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Pregnancy Week</p>
                                {hydrated ? (
                                    <p className="mt-1 text-xl font-bold text-foreground dark:text-white">Week {pregnancyWeek}</p>
                                ) : (
                                    <Skeleton className="mt-2 h-6 w-24 bg-white/55 dark:bg-white/20" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 border-t border-border/70 bg-[#FCFCFC] p-5 dark:bg-[#141925] md:grid-cols-[1.4fr_1fr] md:p-6">
                        <Card className="border border-[#DFF5E1] bg-[#F4FFF5] p-5 shadow-none dark:border-[#2C4A37] dark:bg-[#1A2A22]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Risk Indicator</p>
                                    <h2 className="mt-2 flex items-center gap-2 text-xl font-bold text-foreground">
                                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${riskMeta.chip}`}>{riskStatus} Risk</span>
                                    </h2>
                                </div>
                                <Activity className="h-9 w-9 text-success" />
                            </div>

                            <div className="mt-4 h-2.5 rounded-full bg-[#EAF4EC]">
                                <div
                                    className="h-2.5 rounded-full bg-gradient-to-r from-[#B7E7BE] to-[#58B56C] transition-all"
                                    style={{ width: `${riskMeta.value}%` }}
                                />
                            </div>

                            {hydrated ? (
                                <p className="mt-3 text-sm text-foreground/80 dark:text-white/80">{riskMeta.reason}</p>
                            ) : (
                                <div className="mt-3 space-y-2">
                                    <Skeleton className="h-4 w-full dark:bg-white/15" />
                                    <Skeleton className="h-4 w-40 dark:bg-white/15" />
                                </div>
                            )}
                        </Card>

                        <Card className="border border-[#E3F2FD] bg-[#F5FAFF] p-5 shadow-none dark:border-[#2A3E52] dark:bg-[#1A2533]">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Today at a Glance</p>
                            <h3 className="mt-2 text-lg font-semibold text-foreground">Stay hydrated and complete your health log</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Small daily updates improve recommendations and early alerts.</p>
                            <Button className="mt-4 w-full bg-trust hover:bg-trust/90" onClick={() => router.push("/mother/health-log")}>
                                Update Health Log
                            </Button>
                        </Card>
                    </div>
                </Card>

                <DashboardSection title="Primary Actions" subtitle="Most-used features" className="mt-6 animate-fade-up animate-fade-up-delay-1">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {primaryActions.map((action) => {
                            const Icon = action.icon
                            const toneClass =
                                action.tone === "danger"
                                    ? "border-alert/30 bg-alert text-white"
                                    : action.tone === "primary"
                                        ? "border-[#BEDBF6] bg-[#E3F2FD] text-foreground"
                                        : "border-[#F2DFDF] bg-[#FFF7F7] text-foreground"

                            return (
                                <button
                                    key={action.route}
                                    onClick={() => router.push(action.route)}
                                    className={`group flex min-h-[132px] flex-col justify-between rounded-2xl border p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] ${toneClass}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <Icon className="h-7 w-7" />
                                        <ChevronRight className="h-5 w-5 opacity-70 transition group-hover:translate-x-0.5" />
                                    </div>
                                    <div>
                                        <p className="text-base font-semibold">{action.title}</p>
                                        <p className={`mt-1 text-sm ${action.tone === "danger" ? "text-white/90" : "text-muted-foreground"}`}>
                                            {action.subtitle}
                                        </p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </DashboardSection>

                <DashboardSection title="Daily Insights" className="mt-6 animate-fade-up animate-fade-up-delay-2">
                    <Card className="border-border/70 bg-white p-5 shadow-sm dark:border-[#2A3040] dark:bg-[#1A1E27]">
                        <div className="space-y-4">
                            <div className="rounded-xl border border-warning/25 bg-warning/10 p-3">
                                <p className="text-sm font-semibold text-foreground">🟡 Today's Tip</p>
                                <p className="mt-1 text-sm text-foreground/80">Drink more water. You may be slightly dehydrated.</p>
                            </div>
                            <div className="rounded-xl border border-alert/25 bg-alert/10 p-3">
                                <p className="text-sm font-semibold text-foreground">🟠 Alert</p>
                                <p className="mt-1 text-sm text-foreground/80">Mild fatigue detected. Consider 20 minutes of rest.</p>
                            </div>
                            <div className="rounded-xl border border-success/30 bg-success/10 p-3">
                                <p className="text-sm font-semibold text-foreground">🟢 Baby Update</p>
                                <p className="mt-1 text-sm text-foreground/80">Week {pregnancyWeek}: Baby is about the size of corn 🌽.</p>
                            </div>
                        </div>
                    </Card>
                </DashboardSection>

                <DashboardSection title="Tools" subtitle="Organized by category" className="mt-6 animate-fade-up animate-fade-up-delay-3 pb-20">
                    <div className="grid grid-cols-3 gap-2 rounded-xl border border-border/80 bg-white p-2 dark:border-[#2A3040] dark:bg-[#1A1E27]">
                        <button
                            onClick={() => setActiveCategory("tracking")}
                            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${activeCategory === "tracking" ? "bg-[#FADADD] text-foreground" : "text-muted-foreground hover:bg-muted"
                                }`}
                        >
                            Tracking
                        </button>
                        <button
                            onClick={() => setActiveCategory("medical")}
                            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${activeCategory === "medical" ? "bg-[#E3F2FD] text-foreground" : "text-muted-foreground hover:bg-muted"
                                }`}
                        >
                            Medical
                        </button>
                        <button
                            onClick={() => setActiveCategory("support")}
                            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${activeCategory === "support" ? "bg-[#DFF5E1] text-foreground" : "text-muted-foreground hover:bg-muted"
                                }`}
                        >
                            Support
                        </button>
                    </div>

                    {hydrated ? (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {toolsByCategory[activeCategory].map((item) => {
                                const Icon = item.icon
                                return (
                                    <button
                                        key={item.route}
                                        onClick={() => router.push(item.route)}
                                        className="flex min-h-[88px] items-center justify-between rounded-xl border border-border/80 bg-white px-4 py-3 text-left shadow-sm transition-all duration-200 hover:border-trust/40 hover:bg-trust/5 hover:shadow-md active:scale-[0.99] dark:border-[#2A3040] dark:bg-[#1A1E27] dark:hover:bg-trust/20"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-trust/10 text-trust">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <p className="text-sm font-semibold text-foreground dark:text-white">{item.label}</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <Card key={index} className="border-border/70 bg-white p-4 dark:border-[#2A3040] dark:bg-[#1A1E27]">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded-lg dark:bg-white/15" />
                                        <Skeleton className="h-4 w-36 dark:bg-white/15" />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </DashboardSection>
            </div>

            <button
                onClick={() => router.push("/mother/sos-emergency")}
                className="fixed bottom-6 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-alert px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.03] hover:shadow-xl active:scale-[0.98]"
            >
                <ShieldAlert className="h-4 w-4" />
                SOS
            </button>
        </div>
    )
}
