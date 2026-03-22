"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
    Activity,
    AlertTriangle,
    ArrowRight,
    Baby,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock3,
    Globe,
    Heart,
    Hospital,
    Mic,
    Phone,
    Quote,
    Shield,
    ShieldCheck,
    Sparkles,
    Star,
    Stethoscope,
    TrendingUp,
    Users,
    Volume2,
    Zap,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type ImpactStat = {
    label: string
    value: number
    suffix: string
    color: string
}

function CountUp({ target, suffix }: { target: number; suffix: string }) {
    const [value, setValue] = useState(0)

    useEffect(() => {
        const durationMs = 1200
        const steps = 30
        const increment = target / steps
        let current = 0

        const timer = setInterval(() => {
            current += increment
            if (current >= target) {
                setValue(target)
                clearInterval(timer)
                return
            }
            setValue(Math.round(current))
        }, durationMs / steps)

        return () => clearInterval(timer)
    }, [target])

    return (
        <span>
            {value}
            {suffix}
        </span>
    )
}

export default function LandingPage() {
    const router = useRouter()
    const [tipIndex, setTipIndex] = useState(0)
    const [thoughtIndex, setThoughtIndex] = useState(0)

    const handleDemoLogin = () => {
        router.push("/language")
    }

    useEffect(() => {
        const tipTimer = setInterval(() => {
            setTipIndex((prev) => (prev + 1) % 3)
        }, 5000)

        const thoughtTimer = setInterval(() => {
            setThoughtIndex((prev) => (prev + 1) % 3)
        }, 7000)

        return () => {
            clearInterval(tipTimer)
            clearInterval(thoughtTimer)
        }
    }, [])

    const impactStats: ImpactStat[] = [
        { label: "Women helped in pilot blocks", value: 3200, suffix: "+", color: "from-warm to-care" },
        { label: "High-risk alerts escalated early", value: 87, suffix: "%", color: "from-trust to-accent" },
        { label: "AI responses delivered in local language", value: 8, suffix: "+", color: "from-success to-trust" },
        { label: "Average response time for urgent guidance", value: 2, suffix: " min", color: "from-alert to-warm" },
    ]

    const encouragements = [
        {
            quote: "A calm mother and informed family create a safer pregnancy journey.",
            source: "Daily Saheli encouragement",
        },
        {
            quote: "Every small healthy choice today supports a stronger tomorrow for your baby.",
            source: "Maternal care guidance",
        },
        {
            quote: "You are not alone. ASHA and Saheli are with you through every trimester.",
            source: "Community-first care",
        },
    ]

    const rotatingTips = [
        {
            title: "Today: Iron + Folic Acid",
            note: "Take after food and set a reminder. Skipping doses can increase anemia risk.",
            priority: "High priority",
            gradient: "from-alert/20 to-alert/5",
        },
        {
            title: "Baby Update: Week 24",
            note: "Your baby now responds to sound. Talk, sing, and rest on your left side.",
            priority: "This week",
            gradient: "from-care/20 to-warm/10",
        },
        {
            title: "Health Tip: Hydration Check",
            note: "Keep a 2L water goal. Dehydration can trigger headache and fatigue.",
            priority: "Daily",
            gradient: "from-trust/20 to-success/10",
        },
    ]

    const safetyTips = [
        {
            label: "Emergency",
            title: "Bleeding, severe headache, blurred vision",
            body: "These can indicate serious complications. Do not wait at home.",
            action: "Call ASHA or nearest facility now",
            icon: AlertTriangle,
            tint: "border-alert/40 bg-alert/5",
            badge: "text-alert bg-alert/10 border-alert/30",
        },
        {
            label: "Important",
            title: "Fewer baby movements after 28 weeks",
            body: "Track kick counts after meals. Noticeable drop should be checked immediately.",
            action: "Use kick counter and contact support",
            icon: Baby,
            tint: "border-warm/40 bg-warm/5",
            badge: "text-warm bg-warm/10 border-warm/30",
        },
        {
            label: "Daily care",
            title: "Sleep, food, hydration, stress",
            body: "Small daily routines prevent avoidable risk and support healthy fetal growth.",
            action: "Open personalized daily checklist",
            icon: Heart,
            tint: "border-care/40 bg-care/5",
            badge: "text-care bg-care/10 border-care/30",
        },
    ]

    const featureGroups = [
        {
            title: "For Mothers",
            subtitle: "Simple guidance in your own voice and language",
            items: [
                { icon: Mic, text: "Voice-first AI chat in Hindi, Odia, Bengali, Tamil and more" },
                { icon: Calendar, text: "Week-wise pregnancy guidance with daily reminders" },
                { icon: Zap, text: "One-tap SOS to family, ASHA, and emergency helplines" },
            ],
        },
        {
            title: "For ASHA Workers",
            subtitle: "Prioritize home visits with risk-focused visibility",
            items: [
                { icon: Users, text: "Patient lists with red, amber, green risk priority" },
                { icon: Stethoscope, text: "Follow-up notes, vitals tracking, and danger-sign logs" },
                { icon: Activity, text: "Escalation dashboard for supervisors and PHC teams" },
            ],
        },
        {
            title: "For Families & Community",
            subtitle: "Shared accountability around maternal safety",
            items: [
                { icon: Shield, text: "Trusted health content verified by maternal care experts" },
                { icon: Phone, text: "Family notifications for medicine and appointment adherence" },
                { icon: Globe, text: "Low-network experience for rural and remote geographies" },
            ],
        },
    ]

    const testimonials = [
        {
            name: "Sunita Devi",
            role: "Pregnant Mother • Kendrapara, Odisha",
            quote:
                "I used to panic at night when I felt unusual pain. Now I can ask Saheli in Odia and get clear guidance instantly.",
            initial: "S",
        },
        {
            name: "Rani Kumari",
            role: "ASHA Worker • Gaya, Bihar",
            quote:
                "Earlier I tracked notes in paper diaries. With SehatSaheli, I know exactly which mother needs urgent home visit first.",
            initial: "R",
        },
        {
            name: "Meenakshi",
            role: "New Mother • Tiruvannamalai, Tamil Nadu",
            quote:
                "The reminders and emotional support made my pregnancy less scary. I felt heard and supported every day.",
            initial: "M",
        },
    ]

    const languageDistribution = useMemo(
        () => [
            { language: "Hindi", users: 42 },
            { language: "Odia", users: 18 },
            { language: "Bengali", users: 16 },
            { language: "Tamil", users: 12 },
            { language: "Others", users: 12 },
        ],
        [],
    )

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(253,186,116,0.15),transparent_35%),radial-gradient(circle_at_90%_20%,rgba(96,165,250,0.14),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(251,113,133,0.12),transparent_35%)] bg-background">
            <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
                <div className="container mx-auto flex items-center justify-between px-4 py-4 md:px-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-gradient-to-br from-warm to-care p-2.5 shadow-lg">
                            <Heart className="h-6 w-6 text-white" fill="currentColor" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold md:text-2xl">SehatSaheli</h1>
                            <p className="text-xs text-muted-foreground">सेहत सहेली • Care that speaks your language</p>
                        </div>
                    </div>

                    <nav className="hidden items-center gap-5 text-sm md:flex">
                        <a href="#problem" className="text-muted-foreground transition-colors hover:text-foreground">
                            Why Now
                        </a>
                        <a href="#features" className="text-muted-foreground transition-colors hover:text-foreground">
                            Features
                        </a>
                        <a href="#flow" className="text-muted-foreground transition-colors hover:text-foreground">
                            How It Works
                        </a>
                        <a href="#impact" className="text-muted-foreground transition-colors hover:text-foreground">
                            Impact
                        </a>
                    </nav>

                    <Button onClick={handleDemoLogin} className="bg-gradient-to-r from-warm to-care text-white hover:opacity-90">
                        Start Journey
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </header>

            <main>
                <section className="container mx-auto grid items-center gap-10 px-4 py-12 md:px-6 md:py-20 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-6">
                        <Badge className="border-care/30 bg-care/10 px-3 py-1 text-care">
                            <Sparkles className="mr-1 h-3.5 w-3.5" />
                            Trusted AI Companion for Pregnancy Care
                        </Badge>

                        <h2 className="text-4xl font-bold leading-tight text-balance md:text-6xl">
                            Maternal Healthcare for Bharat,
                            <span className="bg-gradient-to-r from-warm via-care to-trust bg-clip-text text-transparent"> human-first and voice-first.</span>
                        </h2>

                        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                            SehatSaheli helps mothers, ASHA workers, and families act early on risk signs with local-language AI,
                            practical care plans, and emergency pathways designed for rural India.
                        </p>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button size="lg" onClick={handleDemoLogin} className="h-12 bg-gradient-to-r from-warm to-care px-8 text-white">
                                Talk to Saheli Now
                                <Mic className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-12 border-2"
                                onClick={() => document.getElementById("product")?.scrollIntoView({ behavior: "smooth" })}
                            >
                                See Product In Action
                            </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 border-t border-border/70 pt-5">
                            <div>
                                <p className="text-2xl font-bold text-care">24x7</p>
                                <p className="text-xs text-muted-foreground">AI companion support</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-trust">8+</p>
                                <p className="text-xs text-muted-foreground">Indian languages</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-success">Offline</p>
                                <p className="text-xs text-muted-foreground">Low-network friendly</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Card className="overflow-hidden border-care/30 bg-gradient-to-br from-background to-care/5 p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge className="border-success/30 bg-success/10 text-success">Live Monitoring</Badge>
                                    <Badge variant="outline" className="text-xs">
                                        Verified by ASHA workflows
                                    </Badge>
                                </div>
                                <Shield className="h-5 w-5 text-care" />
                            </div>

                            <h3 className="text-2xl font-bold">High-risk screening that drives real action</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                AI risk scores combine symptoms, vitals, and missed checkups to flag urgent cases for ASHA response.
                            </p>

                            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                                <div className="rounded-xl border border-alert/30 bg-alert/10 p-3">
                                    <p className="text-lg font-bold text-alert">12</p>
                                    <p className="text-xs text-muted-foreground">High priority</p>
                                </div>
                                <div className="rounded-xl border border-warm/30 bg-warm/10 p-3">
                                    <p className="text-lg font-bold text-warm">29</p>
                                    <p className="text-xs text-muted-foreground">Follow-up due</p>
                                </div>
                                <div className="rounded-xl border border-success/30 bg-success/10 p-3">
                                    <p className="text-lg font-bold text-success">64</p>
                                    <p className="text-xs text-muted-foreground">Stable track</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="border-warm/30 bg-gradient-to-r from-warm/10 via-care/10 to-trust/10 p-5">
                            <p className="text-sm font-medium text-muted-foreground">Today&apos;s encouragement</p>
                            <p className="mt-2 text-base leading-relaxed md:text-lg">{encouragements[thoughtIndex].quote}</p>
                            <p className="mt-2 text-xs text-muted-foreground">{encouragements[thoughtIndex].source}</p>
                        </Card>
                    </div>
                </section>

                <section id="problem" className="border-y border-border/60 bg-secondary/20 py-12">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="mb-8 flex flex-wrap items-center gap-3">
                            <Badge className="border-alert/30 bg-alert/10 text-alert">Why this matters</Badge>
                            <Badge variant="outline">Built for field realities</Badge>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-3">
                            <Card className="border-alert/30 bg-alert/5 p-5">
                                <h3 className="text-lg font-semibold">Delayed symptom escalation</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Warning signs are often recognized late, especially where specialist access is limited.
                                </p>
                            </Card>
                            <Card className="border-warm/30 bg-warm/5 p-5">
                                <h3 className="text-lg font-semibold">Language and confidence barriers</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Mothers hesitate to ask questions in unfamiliar medical terms or non-native language.
                                </p>
                            </Card>
                            <Card className="border-trust/30 bg-trust/5 p-5">
                                <h3 className="text-lg font-semibold">Overloaded frontline workers</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    ASHA teams handle many households and need smarter risk triage, not more paperwork.
                                </p>
                            </Card>
                        </div>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-14 md:px-6">
                    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                        <Card className={`border p-6 ${rotatingTips[tipIndex].gradient}`}>
                            <div className="mb-3 flex items-center justify-between">
                                <Badge variant="outline" className="bg-background/70">
                                    <Clock3 className="mr-1 h-3.5 w-3.5" />
                                    Live daily card
                                </Badge>
                                <Badge className="border-alert/30 bg-alert/10 text-alert">{rotatingTips[tipIndex].priority}</Badge>
                            </div>
                            <h3 className="text-2xl font-bold">{rotatingTips[tipIndex].title}</h3>
                            <p className="mt-2 text-muted-foreground">{rotatingTips[tipIndex].note}</p>
                            <Button size="sm" className="mt-4" onClick={handleDemoLogin}>
                                Open personalized guide
                            </Button>
                        </Card>

                        <Card className="border border-care/30 bg-gradient-to-br from-background to-care/5 p-6">
                            <h3 className="text-2xl font-bold">Built for Bharat, not just metros</h3>
                            <p className="mt-2 text-muted-foreground">
                                SehatSaheli is designed for villages, block-level health programs, and multilingual households.
                            </p>
                            <ul className="mt-4 space-y-3 text-sm">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
                                    Voice conversations reduce typing and literacy barriers.
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
                                    Offline-friendly flows support low connectivity regions.
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
                                    Family-facing reminders improve medicine and checkup adherence.
                                </li>
                            </ul>
                        </Card>
                    </div>
                </section>

                <section className="bg-secondary/20 py-14">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                            <Card className="border-border/70 bg-white p-6">
                                <Badge className="border-care/30 bg-care/10 text-care">Personalized onboarding</Badge>
                                <h3 className="mt-3 text-2xl font-bold">Set up in under 60 seconds</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Choose language, trimester, first-time pregnancy status, network quality, and nearby facility preference.
                                </p>
                                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                    {["Language", "Trimester", "First pregnancy", "Network quality", "Nearest facility"].map((item) => (
                                        <div key={item} className="rounded-lg border border-border/70 bg-secondary/30 px-3 py-2 text-sm">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                                <Button className="mt-5" onClick={handleDemoLogin}>
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Start personalized setup
                                </Button>
                            </Card>

                            <Card className="border-border/70 bg-white p-6">
                                <h3 className="text-2xl font-bold">Family + emergency readiness</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Keep family informed and practice emergency actions before real incidents.
                                </p>
                                <div className="mt-4 space-y-3">
                                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/mother/family-sharing")}>
                                        <Users className="mr-2 h-4 w-4" />
                                        Open Family View Dashboard
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/mother/emergency")}>
                                        <AlertTriangle className="mr-2 h-4 w-4" />
                                        Start Emergency Drill Mode
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </section>

                <section id="features" className="bg-gradient-to-b from-secondary/30 to-transparent py-16">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="mb-10 text-center">
                            <Badge className="border-care/30 bg-care/10 text-care">Feature ecosystem</Badge>
                            <h3 className="mt-4 text-4xl font-bold">One platform, three stakeholder journeys</h3>
                            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                                Product design maps to how care actually moves from home to ASHA to facility.
                            </p>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-3">
                            {featureGroups.map((group) => (
                                <Card key={group.title} className="h-full border-border/70 p-6 transition-all hover:-translate-y-1 hover:shadow-xl">
                                    <h4 className="text-xl font-bold">{group.title}</h4>
                                    <p className="mt-1 text-sm text-muted-foreground">{group.subtitle}</p>
                                    <div className="mt-5 space-y-3">
                                        {group.items.map((item) => (
                                            <div key={item.text} className="flex items-start gap-3 rounded-xl bg-secondary/30 p-3">
                                                <item.icon className="mt-0.5 h-4.5 w-4.5 text-care" />
                                                <p className="text-sm text-foreground/90">{item.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-16 md:px-6">
                    <div className="mb-10 text-center">
                        <Badge className="border-success/30 bg-success/10 text-success">Trust + verification</Badge>
                        <h3 className="mt-4 text-4xl font-bold">Clinically verified safety tips</h3>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {safetyTips.map((tip) => (
                            <Card key={tip.title} className={`border p-5 ${tip.tint}`}>
                                <div className="mb-2 flex items-center justify-between">
                                    <Badge className={tip.badge}>{tip.label}</Badge>
                                    <Badge variant="outline" className="text-xs">
                                        <ShieldCheck className="mr-1 h-3 w-3" />
                                        Reviewed
                                    </Badge>
                                </div>
                                <tip.icon className="h-6 w-6 text-alert" />
                                <h4 className="mt-3 text-lg font-semibold">{tip.title}</h4>
                                <p className="mt-2 text-sm text-muted-foreground">{tip.body}</p>
                                <p className="mt-3 text-xs font-semibold text-foreground/80">{tip.action}</p>
                            </Card>
                        ))}
                    </div>
                </section>

                <section id="flow" className="container mx-auto px-4 py-16 md:px-6">
                    <div className="mb-10 text-center">
                        <Badge className="border-trust/30 bg-trust/10 text-trust">ASHA flow</Badge>
                        <h3 className="mt-4 text-4xl font-bold">How care flows in 3 practical steps</h3>
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">
                        {[
                            {
                                title: "1. Mother reports symptoms",
                                text: "Voice chat captures concern in local language and updates risk status.",
                                icon: Mic,
                            },
                            {
                                title: "2. ASHA gets ranked queue",
                                text: "Dashboard places urgent mothers first with reason and suggested action.",
                                icon: Users,
                            },
                            {
                                title: "3. Escalation when needed",
                                text: "If danger signs appear, SehatSaheli triggers SOS and nearest facility route.",
                                icon: Hospital,
                            },
                        ].map((step) => (
                            <Card key={step.title} className="border-border/70 p-6">
                                <step.icon className="h-8 w-8 text-care" />
                                <h4 className="mt-3 text-xl font-semibold">{step.title}</h4>
                                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
                            </Card>
                        ))}
                    </div>
                </section>

                <section id="product" className="bg-secondary/20 py-16">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="mb-10 text-center">
                            <Badge className="border-warm/30 bg-warm/10 text-warm">Product in action</Badge>
                            <h3 className="mt-4 text-4xl font-bold">See the actual experience</h3>
                            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                                Screens and demos from the working platform across onboarding, navigation, and dashboard usage.
                            </p>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-3">
                            <Card className="overflow-hidden border-border/70">
                                <Image
                                    src="/screenshots/landing-page.png"
                                    alt="SehatSaheli landing experience"
                                    width={1200}
                                    height={700}
                                    className="h-52 w-full object-cover"
                                />
                                <div className="p-4">
                                    <p className="font-medium">Mother-first entry experience</p>
                                    <p className="text-sm text-muted-foreground">Warm onboarding and trust-centered positioning.</p>
                                </div>
                            </Card>

                            <Card className="overflow-hidden border-border/70">
                                <Image
                                    src="/screenshots/dashboard.png"
                                    alt="SehatSaheli dashboard view"
                                    width={1200}
                                    height={700}
                                    className="h-52 w-full object-cover"
                                />
                                <div className="p-4">
                                    <p className="font-medium">Actionable dashboard modules</p>
                                    <p className="text-sm text-muted-foreground">Risk insights, reminders, and quick emergency actions.</p>
                                </div>
                            </Card>

                            <Card className="overflow-hidden border-border/70">
                                <video
                                    className="h-52 w-full object-cover"
                                    src="/videos/chatbot-demo.mp4"
                                    controls
                                    preload="metadata"
                                    aria-label="Saheli chatbot demo"
                                />
                                <div className="p-4">
                                    <p className="font-medium">Voice and chatbot assistance</p>
                                    <p className="text-sm text-muted-foreground">Natural conversation for symptom checks and guidance.</p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-16 md:px-6">
                    <div className="mb-10 text-center">
                        <Badge className="border-care/30 bg-care/10 text-care">Trusted by people in the loop</Badge>
                        <h3 className="mt-4 text-4xl font-bold">Voices from mothers and ASHA workers</h3>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {testimonials.map((item) => (
                            <Card key={item.name} className="border-border/70 p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-warm to-care font-semibold text-white">
                                            {item.initial}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">{item.role}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        Verified user
                                    </Badge>
                                </div>
                                <div className="mt-4 flex gap-1">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <Star key={rating} className="h-4 w-4 fill-warm text-warm" />
                                    ))}
                                </div>
                                <div className="mt-4 rounded-xl bg-secondary/30 p-4">
                                    <Quote className="h-4 w-4 text-care" />
                                    <p className="mt-2 text-sm text-foreground/90">{item.quote}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

                <section id="impact" className="bg-gradient-to-b from-secondary/20 to-background py-16">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="mb-10 text-center">
                            <Badge className="border-trust/30 bg-trust/10 text-trust">Impact signals</Badge>
                            <h3 className="mt-4 text-4xl font-bold">Real progress you can measure</h3>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-4">
                            {impactStats.map((stat) => (
                                <Card key={stat.label} className="border-border/70 p-6 text-center">
                                    <p className={`bg-gradient-to-r ${stat.color} bg-clip-text text-4xl font-bold text-transparent`}>
                                        <CountUp target={stat.value} suffix={stat.suffix} />
                                    </p>
                                    <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                                </Card>
                            ))}
                        </div>

                        <div className="mt-8 grid gap-6 lg:grid-cols-2">
                            <Card className="border-border/70 p-6">
                                <div className="mb-4 flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-care" />
                                    <h4 className="text-xl font-semibold">Language usage distribution</h4>
                                </div>
                                <div className="space-y-3">
                                    {languageDistribution.map((row) => (
                                        <div key={row.language}>
                                            <div className="mb-1 flex items-center justify-between text-sm">
                                                <span>{row.language}</span>
                                                <span className="text-muted-foreground">{row.users}%</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-secondary">
                                                <div
                                                    className="h-2 rounded-full bg-gradient-to-r from-care to-trust"
                                                    style={{ width: `${row.users}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <Card className="border-border/70 p-6">
                                <div className="mb-4 flex items-center gap-2">
                                    <Volume2 className="h-5 w-5 text-care" />
                                    <h4 className="text-xl font-semibold">Voice-first and low-literacy friendly</h4>
                                </div>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Most interactions happen through voice prompts and guided responses, enabling confident use even when
                                    typing skills are limited.
                                </p>
                                <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                                    <div className="rounded-xl border border-care/30 bg-care/10 p-3">
                                        <p className="text-lg font-bold text-care">74%</p>
                                        <p className="text-xs text-muted-foreground">Voice sessions</p>
                                    </div>
                                    <div className="rounded-xl border border-trust/30 bg-trust/10 p-3">
                                        <p className="text-lg font-bold text-trust">91%</p>
                                        <p className="text-xs text-muted-foreground">First-session completion</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-16 md:px-6">
                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <Card className="border-care/30 bg-gradient-to-r from-care/10 via-warm/10 to-trust/10 p-7">
                            <h3 className="text-3xl font-bold">Private, safe, and mission-aligned</h3>
                            <p className="mt-3 max-w-2xl text-muted-foreground">
                                Sensitive health information is handled with secure design principles, transparent access roles, and
                                careful data minimization. Trust is not a feature, it is the foundation.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Badge variant="outline">Role-based access</Badge>
                                <Badge variant="outline">Secure auth and sessions</Badge>
                                <Badge variant="outline">Care-team visibility controls</Badge>
                            </div>
                        </Card>

                        <Card className="border-border/70 p-7">
                            <h4 className="text-2xl font-bold">Start your care journey today</h4>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Mothers get guidance. ASHA workers get clarity. Families get peace of mind.
                            </p>
                            <div className="mt-5 flex flex-col gap-3">
                                <Button onClick={handleDemoLogin} className="bg-gradient-to-r from-warm to-care text-white">
                                    Start journey
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <Button variant="outline" onClick={() => router.push("/asha")}>I am an ASHA worker</Button>
                            </div>
                        </Card>
                    </div>
                </section>
            </main>

            <div className="fixed inset-x-0 bottom-0 z-50 border-t border-alert/40 bg-background/95 p-3 backdrop-blur md:hidden">
                <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 text-alert" />
                        <p className="text-xs leading-relaxed">
                            Severe bleeding, convulsions, or no baby movement: seek urgent care immediately.
                        </p>
                    </div>
                    <Button size="sm" className="bg-alert text-white hover:bg-alert/90" onClick={() => router.push("/mother/sos-emergency")}>
                        SOS
                    </Button>
                </div>
            </div>

            <footer className="border-t border-border/70 bg-secondary/20 pb-20 pt-10 md:pb-10">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid gap-8 md:grid-cols-4">
                        <div>
                            <h4 className="text-lg font-bold">SehatSaheli</h4>
                            <p className="mt-2 text-sm text-muted-foreground">
                                AI-powered maternal healthcare designed for India&apos;s frontline realities.
                            </p>
                        </div>
                        <div>
                            <h5 className="font-semibold">Explore</h5>
                            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                <li>
                                    <a href="#features" className="hover:text-foreground">
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <a href="#flow" className="hover:text-foreground">
                                        ASHA Flow
                                    </a>
                                </li>
                                <li>
                                    <a href="#impact" className="hover:text-foreground">
                                        Impact
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-semibold">Core focus</h5>
                            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                <li>Risk detection and escalation</li>
                                <li>Voice-first multilingual access</li>
                                <li>Pregnancy tracking and reminders</li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-semibold">Need urgent help?</h5>
                            <p className="mt-2 text-sm text-muted-foreground">In emergencies, contact local health services first.</p>
                            <Button size="sm" className="mt-3 bg-alert text-white hover:bg-alert/90" onClick={() => router.push("/mother/sos-emergency")}>
                                <Phone className="mr-2 h-4 w-4" />
                                Emergency options
                            </Button>
                        </div>
                    </div>
                    <p className="mt-8 border-t border-border/60 pt-5 text-sm text-muted-foreground">
                        © 2025 SehatSaheli. Built with care for mothers, ASHA workers, and families across India.
                    </p>
                </div>
            </footer>
        </div>
    )
}
