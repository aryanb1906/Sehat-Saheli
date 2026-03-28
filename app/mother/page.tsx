"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
    Activity,
    AlertTriangle,
    Baby,
    BookOpen,
    Calendar,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Dumbbell,
    FileText,
    Heart,
    MapPin,
    Menu,
    MessageCircle,
    Mic,
    Phone,
    Pill,
    Route,
    Share2,
    ShieldAlert,
    ShieldCheck,
    TrendingUp,
    Users,
    Utensils,
    Video,
    Volume2,
    Wifi,
    WifiOff,
    Zap,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { NotificationCenter } from "@/components/notification-center"
import { AppSidebar } from "@/components/app-sidebar"
import { useLanguage } from "@/lib/language-context"
import { DashboardSection } from "@/components/dashboard-section"
import { VoiceActionEventDetail, VOICE_ACTION_EVENT } from "@/lib/voice-assistant/types"

type RiskStatus = "Low" | "Medium" | "High"
type ToolCategory = "tracking" | "medical" | "support"
type SyncState = "synced" | "syncing" | "queued"
type BudgetMode = "low" | "medium" | "high"

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

interface ChecklistItem {
    id: string
    label: string
    done: boolean
}

const RISK_META: Record<RiskStatus, { value: number; chip: string; reason: string }> = {
    Low: {
        value: 24,
        chip: "bg-success/15 text-success",
        reason: "Vitals stable. No major risk symptoms detected.",
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

const SYNC_UI: Record<SyncState, { label: string; icon: LucideIcon; className: string }> = {
    synced: {
        label: "Synced",
        icon: Wifi,
        className: "bg-success/15 text-success border-success/30",
    },
    syncing: {
        label: "Syncing",
        icon: Wifi,
        className: "bg-trust/15 text-trust border-trust/30",
    },
    queued: {
        label: "Queued (offline)",
        icon: WifiOff,
        className: "bg-warning/15 text-foreground border-warning/30",
    },
}

export default function MotherDashboard() {
    const router = useRouter()
    const { content, language } = useLanguage()
    const isHindi = language === "hi"
    const tr = (en: string, hi: string) => (isHindi ? hi : en)

    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [userName, setUserName] = useState("Priya")
    const [pregnancyWeek, setPregnancyWeek] = useState(24)
    const [riskStatus, setRiskStatus] = useState<RiskStatus>("Low")
    const [activeCategory, setActiveCategory] = useState<ToolCategory>("tracking")
    const [hydrated, setHydrated] = useState(false)
    const [syncState, setSyncState] = useState<SyncState>("synced")
    const [budgetMode, setBudgetMode] = useState<BudgetMode>("low")
    const [mood, setMood] = useState("calm")
    const [checklist, setChecklist] = useState<ChecklistItem[]>([
        { id: "ifa", label: "Take iron + folic acid tablet", done: false },
        { id: "water", label: "Drink 8 glasses of water", done: true },
        { id: "walk", label: "15-minute gentle walk", done: false },
        { id: "kick", label: "Record baby movement count", done: false },
    ])

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

    useEffect(() => {
        const states: SyncState[] = ["synced", "syncing", "queued"]
        let idx = 0
        const timer = setInterval(() => {
            idx = (idx + 1) % states.length
            setSyncState(states[idx])
        }, 8000)

        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        const onVoiceAction = (event: Event) => {
            const detail = (event as CustomEvent<VoiceActionEventDetail>).detail
            if (!detail) return

            if (detail.intent === "MARK_TASK_COMPLETE") {
                setChecklist((prev) => {
                    const targetIndex = prev.findIndex((item) => !item.done)
                    if (targetIndex === -1) return prev
                    return prev.map((item, index) => (index === targetIndex ? { ...item, done: true } : item))
                })
                return
            }

            if (detail.intent === "SHOW_CHECKLIST") {
                const checklistEl = document.getElementById("mother-checklist-section")
                checklistEl?.scrollIntoView({ behavior: "smooth", block: "center" })
            }
        }

        window.addEventListener(VOICE_ACTION_EVENT, onVoiceAction)
        return () => window.removeEventListener(VOICE_ACTION_EVENT, onVoiceAction)
    }, [])

    const primaryActions = useMemo<PrimaryAction[]>(
        () => [
            {
                title: content.talkToSaheli || "Talk to Saheli",
                subtitle: tr("Chat with AI care guide", "AI देखभाल मार्गदर्शक से बात करें"),
                route: "/mother/talk",
                icon: Mic,
                tone: "primary",
            },
            {
                title: tr("Emergency Drill Mode", "आपातकालीन ड्रिल मोड"),
                subtitle: tr("Practice critical first-10-minute actions", "पहले 10 मिनट के जरूरी कदम अभ्यास करें"),
                route: "/mother/emergency",
                icon: ShieldAlert,
                tone: "danger",
            },
            {
                title: tr("Family View Dashboard", "परिवार डैशबोर्ड"),
                subtitle: tr("Share progress with family caregivers", "परिवार के साथ प्रगति साझा करें"),
                route: "/mother/family-sharing",
                icon: Users,
                tone: "soft",
            },
            {
                title: content.myHealthLog || "My Health Log",
                subtitle: tr("Track daily symptoms and vitals", "दैनिक लक्षण और वाइटल्स ट्रैक करें"),
                route: "/mother/health-log",
                icon: BookOpen,
                tone: "soft",
            },
        ],
        [content, isHindi],
    )

    const toolsByCategory: Record<ToolCategory, ToolItem[]> = {
        tracking: [
            { label: content.motherPregnancyTracker || "Pregnancy Tracker", route: "/mother/pregnancy-tracker", icon: Baby },
            { label: content.motherVitalSigns || "Vital Signs", route: "/mother/vital-signs", icon: TrendingUp },
            { label: content.motherKickCounter || "Kick Counter", route: "/mother/kick-counter", icon: Activity },
            { label: content.motherNutritionTracker || "Nutrition Tracker", route: "/mother/nutrition", icon: Utensils },
            { label: content.motherPregnancyExercises || "Pregnancy Exercises", route: "/mother/exercises", icon: Dumbbell },
            { label: content.motherLaborSigns || "Labor Signs", route: "/mother/labor-signs", icon: Zap },
        ],
        medical: [
            { label: content.myAppointments || "My Appointments", route: "/mother/appointments", icon: Calendar },
            { label: content.motherDoctorConsultation || "Doctor Consultation", route: "/mother/doctor-consultation", icon: Video },
            { label: content.motherMedications || "Medications", route: "/mother/medications", icon: Pill },
            { label: content.motherMedicalRecords || "Medical Records", route: "/mother/medical-records", icon: FileText },
            { label: content.motherBirthPlan || "Birth Plan", route: "/mother/birth-plan", icon: Heart },
            { label: content.motherHospitalFinder || "Hospital Finder", route: "/mother/hospital-finder", icon: MapPin },
        ],
        support: [
            { label: content.healthTips || "Health Tips", route: "/mother/tips", icon: MessageCircle },
            { label: content.communitySupport, route: "/mother/community", icon: Users },
            { label: content.motherFamilySharing || "Family Sharing", route: "/mother/family-sharing", icon: Share2 },
            { label: content.motherPregnancyJournal || "Pregnancy Journal", route: "/mother/pregnancy-journal", icon: BookOpen },
            { label: content.motherSOSEmergency || "SOS Emergency", route: "/mother/sos-emergency", icon: AlertTriangle },
        ],
    }

    const riskMeta = RISK_META[riskStatus]
    const syncMeta = SYNC_UI[syncState]

    const checklistDone = checklist.filter((item) => item.done).length
    const checklistProgress = Math.round((checklistDone / checklist.length) * 100)

    const riskTimeline = [
        { day: "Today", status: riskStatus, note: "Fatigue and hydration monitored" },
        { day: "Yesterday", status: "Medium", note: "Mild headache reported" },
        { day: "2 days ago", status: "Low", note: "Vitals stable, no alert" },
    ]

    const sharedNotes = [
        { role: "ASHA", text: "Home visit scheduled for tomorrow 9:30 AM", time: "10:15 AM" },
        { role: "Doctor", text: "Continue iron tablet after lunch for 14 days", time: "Yesterday" },
        { role: "Family", text: "Husband confirmed transport support for next checkup", time: "Yesterday" },
    ]

    const localResources = [
        { title: "PHC Kalinga Nagar", distance: "3.2 km", type: "PHC", route: "/mother/hospital-finder" },
        { title: "108 Ambulance Point", distance: "5.1 km", type: "Emergency", route: "/mother/sos-emergency" },
        { title: "Maa Lab & Blood Bank", distance: "6.4 km", type: "Blood Support", route: "/mother/hospital-finder" },
    ]

    const budgetMeals: Record<BudgetMode, string[]> = {
        low: ["Poha + boiled chana", "Rice + dal + seasonal sabzi", "Banana + peanut chikki"],
        medium: ["Ragi dosa + curd", "Chapati + rajma + salad", "Egg bhurji + millet roti"],
        high: ["Paneer millet bowl", "Fish curry + red rice", "Dry fruit smoothie + sprouts"],
    }

    const milestones = [
        { title: "Week 12 complete", done: pregnancyWeek >= 12 },
        { title: "Week 20 anatomy scan", done: pregnancyWeek >= 20 },
        { title: "Week 28 kick monitoring", done: pregnancyWeek >= 28 },
        { title: "Week 36 birth readiness", done: pregnancyWeek >= 36 },
    ]

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
                            <div className="flex items-center gap-2">
                                <Badge className={`border ${syncMeta.className}`}>
                                    <syncMeta.icon className="mr-1 h-3.5 w-3.5" />
                                    {syncMeta.label}
                                </Badge>
                                <NotificationCenter />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                {hydrated ? (
                                    <>
                                        <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-white md:text-4xl">
                                            {content.greeting || "Namaste"}, {userName}
                                        </h1>
                                        <p className="mt-2 text-sm font-medium text-foreground/80 dark:text-white/85 md:text-base">
                                            {tr(
                                                "You are doing great today. Let us keep mother and baby safe.",
                                                "आज आप बहुत अच्छा कर रही हैं। माँ और शिशु को सुरक्षित रखें।",
                                            )}
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
                                <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70">{content.pregnancyWeek || "Pregnancy Week"}</p>
                                {hydrated ? (
                                    <p className="mt-1 text-xl font-bold text-foreground dark:text-white">{tr("Week", "हफ्ता")} {pregnancyWeek}</p>
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
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{tr("Risk Indicator", "जोखिम संकेतक")}</p>
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

                            <p className="mt-3 text-sm text-foreground/80 dark:text-white/80">{riskMeta.reason}</p>
                        </Card>

                        <Card className="border border-[#E3F2FD] bg-[#F5FAFF] p-5 shadow-none dark:border-[#2A3E52] dark:bg-[#1A2533]">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{content.dailyChecklist || tr("Smart Daily Checklist", "स्मार्ट दैनिक चेकलिस्ट")}</p>
                            <h3 className="mt-2 text-lg font-semibold text-foreground">{checklistDone}/{checklist.length} tasks complete</h3>
                            <div className="mt-3 h-2.5 rounded-full bg-trust/10">
                                <div className="h-2.5 rounded-full bg-gradient-to-r from-trust to-care transition-all" style={{ width: `${checklistProgress}%` }} />
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">Completion: {checklistProgress}%</p>
                        </Card>
                    </div>
                </Card>

                <DashboardSection title={content.primaryActionsTitle || tr("Primary Actions", "मुख्य कार्य")} subtitle={tr("Most-used features", "सबसे अधिक उपयोग की जाने वाली सुविधाएँ")} className="mt-6 animate-fade-up animate-fade-up-delay-1">
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

                <DashboardSection title="Daily Care + Mood" className="mt-6 animate-fade-up animate-fade-up-delay-2">
                    <div id="mother-checklist-section" className="grid gap-4 lg:grid-cols-2">
                        <Card className="border-border/70 bg-white p-5 shadow-sm dark:border-[#2A3040] dark:bg-[#1A1E27]">
                            <div className="space-y-3">
                                {checklist.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setChecklist((prev) => prev.map((p) => (p.id === item.id ? { ...p, done: !p.done } : p)))}
                                        className="flex w-full items-center gap-3 rounded-lg border border-border/70 p-3 text-left transition hover:bg-muted/50"
                                    >
                                        <CheckCircle2 className={`h-5 w-5 ${item.done ? "text-success" : "text-muted-foreground"}`} />
                                        <p className={`text-sm ${item.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{item.label}</p>
                                    </button>
                                ))}
                            </div>
                        </Card>

                        <Card className="border-border/70 bg-white p-5 shadow-sm dark:border-[#2A3040] dark:bg-[#1A1E27]">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mood strip</p>
                            <h3 className="mt-2 text-lg font-semibold">How are you feeling now?</h3>
                            <div className="mt-4 grid grid-cols-3 gap-2">
                                {[
                                    { id: "calm", label: "Calm" },
                                    { id: "stressed", label: "Stressed" },
                                    { id: "anxious", label: "Anxious" },
                                ].map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => setMood(m.id)}
                                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${mood === m.id ? "border-care bg-care/10 text-care" : "border-border/70 hover:bg-muted/50"}`}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-4 rounded-xl border border-care/20 bg-care/5 p-3 text-sm text-foreground/80">
                                {mood === "calm" && "Great. Keep this routine and continue hydration + light walk."}
                                {mood === "stressed" && "Try 4-7-8 breathing for 3 minutes and talk to Saheli if stress persists."}
                                {mood === "anxious" && "You are not alone. Open mental-health support and notify your ASHA worker."}
                            </div>
                            <Button className="mt-4 w-full" variant="outline" onClick={() => router.push("/mother/mental-health")}>
                                Open Mental Wellness
                            </Button>
                        </Card>
                    </div>
                </DashboardSection>

                <DashboardSection title="Risk Timeline + Shared Notes" subtitle="One source of truth" className="mt-6 animate-fade-up animate-fade-up-delay-3">
                    <div className="grid gap-4 lg:grid-cols-2">
                        <Card className="border-border/70 bg-white p-5 shadow-sm dark:border-[#2A3040] dark:bg-[#1A1E27]">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Real-time Risk Timeline</p>
                            <div className="mt-4 space-y-3">
                                {riskTimeline.map((row) => (
                                    <div key={row.day} className="flex items-start justify-between rounded-lg border border-border/70 p-3">
                                        <div>
                                            <p className="text-sm font-semibold">{row.day}</p>
                                            <p className="text-xs text-muted-foreground">{row.note}</p>
                                        </div>
                                        <Badge variant="outline">{row.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="border-border/70 bg-white p-5 shadow-sm dark:border-[#2A3040] dark:bg-[#1A1E27]">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Shared Notes</p>
                                <Badge className="border-success/30 bg-success/10 text-success">Care Team Synced</Badge>
                            </div>
                            <div className="mt-4 space-y-3">
                                {sharedNotes.map((note, index) => (
                                    <div key={`${note.role}-${index}`} className="rounded-lg border border-border/70 p-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold">{note.role}</p>
                                            <p className="text-xs text-muted-foreground">{note.time}</p>
                                        </div>
                                        <p className="mt-1 text-sm text-foreground/85">{note.text}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </DashboardSection>

                <DashboardSection title="Trust-Verified Guidance" subtitle="Reviewed by maternal experts" className="mt-6 animate-fade-up">
                    <div className="grid gap-4 lg:grid-cols-2">
                        <Card className="border-border/70 bg-white p-5 shadow-sm dark:border-[#2A3040] dark:bg-[#1A1E27]">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h4 className="text-lg font-semibold">Critical warning signs</h4>
                                    <p className="mt-1 text-sm text-muted-foreground">Bleeding, severe headache, blurred vision, reduced movement</p>
                                </div>
                                <Badge className="border-success/30 bg-success/10 text-success">
                                    <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                                    Nurse reviewed
                                </Badge>
                            </div>
                            <Button variant="outline" className="mt-4 w-full" onClick={() => router.push("/mother/danger-signs")}>Open Danger Signs</Button>
                        </Card>

                        <Card className="border-border/70 bg-white p-5 shadow-sm dark:border-[#2A3040] dark:bg-[#1A1E27]">
                            <h4 className="text-lg font-semibold">Nutrition Planner with Budget Mode</h4>
                            <div className="mt-3 grid grid-cols-3 gap-2">
                                {(["low", "medium", "high"] as BudgetMode[]).map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setBudgetMode(mode)}
                                        className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${budgetMode === mode ? "border-care bg-care/10 text-care" : "border-border/70"}`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                            <ul className="mt-4 space-y-2 text-sm text-foreground/85">
                                {budgetMeals[budgetMode].map((meal) => (
                                    <li key={meal} className="rounded-md bg-muted/40 px-3 py-2">{meal}</li>
                                ))}
                            </ul>
                            <Button className="mt-4 w-full" onClick={() => router.push("/mother/nutrition-planner")}>Open Full Planner</Button>
                        </Card>
                    </div>
                </DashboardSection>

                <DashboardSection title="Milestones + Resources" className="mt-6 animate-fade-up pb-24 md:pb-10">
                    <div className="grid gap-4 lg:grid-cols-2">
                        <Card className="border-border/70 bg-white p-5 shadow-sm dark:border-[#2A3040] dark:bg-[#1A1E27]">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pregnancy Progress Milestones</p>
                            <div className="mt-4 space-y-3">
                                {milestones.map((m) => (
                                    <div key={m.title} className="flex items-center gap-3 rounded-lg border border-border/70 p-3">
                                        <CheckCircle2 className={`h-5 w-5 ${m.done ? "text-success" : "text-muted-foreground"}`} />
                                        <p className="text-sm">{m.title}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="border-border/70 bg-white p-5 shadow-sm dark:border-[#2A3040] dark:bg-[#1A1E27]">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Local Resource Map Cards</p>
                            <div className="mt-4 space-y-3">
                                {localResources.map((resource) => (
                                    <div key={resource.title} className="rounded-lg border border-border/70 p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold">{resource.title}</p>
                                                <p className="text-xs text-muted-foreground">{resource.type} • {resource.distance}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => router.push(resource.route)}>
                                                    <Route className="mr-1 h-3.5 w-3.5" />Route
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => router.push("/mother/sos-emergency")}>Call</Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </DashboardSection>

                <DashboardSection title="Tools" subtitle="Organized by category" className="mt-6 animate-fade-up">
                    <div className="grid grid-cols-3 gap-2 rounded-xl border border-border/80 bg-white p-2 dark:border-[#2A3040] dark:bg-[#1A1E27]">
                        <button
                            onClick={() => setActiveCategory("tracking")}
                            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${activeCategory === "tracking" ? "bg-[#FADADD] text-foreground" : "text-muted-foreground hover:bg-muted"}`}
                        >
                            Tracking
                        </button>
                        <button
                            onClick={() => setActiveCategory("medical")}
                            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${activeCategory === "medical" ? "bg-[#E3F2FD] text-foreground" : "text-muted-foreground hover:bg-muted"}`}
                        >
                            Medical
                        </button>
                        <button
                            onClick={() => setActiveCategory("support")}
                            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${activeCategory === "support" ? "bg-[#DFF5E1] text-foreground" : "text-muted-foreground hover:bg-muted"}`}
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

            <button
                onClick={() => router.push("/mother/talk")}
                className="fixed bottom-20 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-trust px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.03] hover:shadow-xl active:scale-[0.98]"
            >
                <Volume2 className="h-4 w-4" />
                Voice
            </button>
        </div>
    )
}
