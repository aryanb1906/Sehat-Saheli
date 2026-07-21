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
    const { content, language } = useLanguage()
    const t = (copy: Record<string, string>) => copy[language] || copy.en
    const [searchQuery, setSearchQuery] = useState("")
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(true)
    const [syncState, setSyncState] = useState<SyncState>("synced")

    useEffect(() => {
        const loadPatients = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/asha-patients?q=${encodeURIComponent(searchQuery)}`)
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
            title: t({ en: "Priority home visits", hi: "प्राथमिक गृह दौरे", or: "ପ୍ରାଥମିକ ଘର ଭିଜିଟ୍", bn: "অগ্রাধিকার হোম ভিজিট", te: "ప్రాధాన్య గృహ సందర్శనలు", ta: "முன்னுரிமை வீட்டு வருகைகள்", mr: "प्राथमिक घरभेटी", gu: "પ્રાથમિક ઘર મુલાકાતો" }),
            value: Math.max(3, stats.high),
            note: t({ en: "Start with red-risk mothers before noon", hi: "दोपहर से पहले उच्च-जोखिम माताओं से शुरू करें", or: "ମଧ୍ୟାହ୍ନ ପୂର୍ବରୁ ଉଚ୍ଚ-ଜୋଖିମ ମା'ମାନଙ୍କୁ ଆରମ୍ଭ କରନ୍ତୁ", bn: "দুপুরের আগে উচ্চ-ঝুঁকির মায়েদের দিয়ে শুরু করুন", te: "మధ్యాహ్నానికి ముందు అధిక ప్రమాద తల్లులతో ప్రారంభించండి", ta: "மதியத்திற்கு முன் அதிக அபாயத் தாய்மார்களுடன் தொடங்குங்கள்", mr: "दुपारपूर्वी उच्च-जोखीम मातांपासून सुरू करा", gu: "બપોર પહેલા ઉચ્ચ જોખમ માતાઓથી શરૂ કરો" }),
            tone: "border-alert/30 bg-alert/10",
        },
        {
            title: t({ en: "Overdue follow-ups", hi: "लंबित फॉलो-अप", or: "ବକେୟା ଫଲୋ-ଅପ୍", bn: "বকেয়া ফলো-আপ", te: "లంబిత ఫాలో-అప్స్", ta: "நிலுவை பின்தொடர்வுகள்", mr: "प्रलंबित फॉलो-अप", gu: "બાકી ફોલો-અપ" }),
            value: Math.max(4, followUps),
            note: t({ en: "Call and reschedule missed ANC checkups", hi: "छूटी ANC जांच के लिए कॉल कर पुनर्निर्धारित करें", or: "ଛାଡ଼ାହୋଇଥିବା ANC ଚେକଅପ୍ ପାଇଁ କଲ୍ କରି ପୁନଃନିର୍ଧାରଣ କରନ୍ତୁ", bn: "মিস হওয়া ANC চেকআপে কল করে নতুন সময় নির্ধারণ করুন", te: "మిస్ అయిన ANC చెకప్‌లకు కాల్ చేసి తిరిగి షెడ్యూల్ చేయండి", ta: "தவறிய ANC பரிசோதனைகளுக்கு அழைத்து மீண்டும் நேரமிடுங்கள்", mr: "चुकलेल्या ANC तपासण्यांसाठी कॉल करून पुन्हा वेळ ठरवा", gu: "ચૂકાયેલા ANC ચેકઅપ માટે કૉલ કરીને ફરી સમય નક્કી કરો" }),
            tone: "border-warning/30 bg-warning/10",
        },
        {
            title: t({ en: "Escalations pending", hi: "लंबित एस्केलेशन", or: "ବକେୟା ଏସ୍କାଲେସନ୍", bn: "মুলতুবি এস্কেলেশন", te: "లంబిత ఎస్కలేషన్స్", ta: "நிலுவை உயர்த்தல்கள்", mr: "प्रलंबित एस्कलेशन्स", gu: "બાકી એસ્કલેશન" }),
            value: Math.max(1, Math.floor(stats.high / 2)),
            note: t({ en: "Escalate severe symptoms to PHC/doctor", hi: "गंभीर लक्षणों को PHC/डॉक्टर तक बढ़ाएँ", or: "ଗୁରୁତର ଲକ୍ଷଣକୁ PHC/ଡାକ୍ତରଙ୍କୁ ଏସ୍କାଲେଟ୍ କରନ୍ତୁ", bn: "তীব্র উপসর্গ PHC/ডাক্তারের কাছে এস্কেলেট করুন", te: "తీవ్ర లక్షణాలను PHC/డాక్టర్‌కు ఎస్కలేట్ చేయండి", ta: "கடுமையான அறிகுறிகளை PHC/மருத்துவருக்கு உயர்த்துங்கள்", mr: "गंभीर लक्षण PHC/डॉक्टरकडे एस्कलेट करा", gu: "ગંભીર લક્ષણોને PHC/ડૉક્ટર સુધી એસ્કલેટ કરો" }),
            tone: "border-trust/30 bg-trust/10",
        },
    ]

    const syncLabel =
        syncState === "synced"
            ? t({ en: "Synced", hi: "सिंक हुआ", or: "ସିଙ୍କ ହୋଇଛି", bn: "সিঙ্কড", te: "సింక్ అయింది", ta: "ஒத்திசைவு முடிந்தது", mr: "सिंक झाले", gu: "સિંક થયું" })
            : syncState === "syncing"
                ? t({ en: "Syncing field data", hi: "फील्ड डेटा सिंक हो रहा है", or: "ଫିଲ୍ଡ ଡାଟା ସିଙ୍କ ହେଉଛି", bn: "ফিল্ড ডেটা সিঙ্ক হচ্ছে", te: "ఫీల్డ్ డేటా సింక్ అవుతోంది", ta: "புலத் தரவு ஒத்திசைக்கப்படுகிறது", mr: "फील्ड डेटा सिंक होत आहे", gu: "ફિલ્ડ ડેટા સિંક થઈ રહ્યું છે" })
                : t({ en: "Queued (offline)", hi: "क्यू में (ऑफलाइन)", or: "କ୍ୟୁରେ (ଅଫଲାଇନ୍)", bn: "কিউতে (অফলাইন)", te: "క్యూడ్ (ఆఫ్‌లైన్)", ta: "வரிசையில் (ஆஃப்லைன்)", mr: "रांगेत (ऑफलाइन)", gu: "કતારમાં (ઓફલાઇન)" })

    const riskLabel: Record<Patient["risk"], string> = {
        Low: t({ en: "Low", hi: "कम", or: "କମ", bn: "কম", te: "తక్కువ", ta: "குறைவு", mr: "कमी", gu: "ઓછું" }),
        Medium: t({ en: "Medium", hi: "मध्यम", or: "ମଧ୍ୟମ", bn: "মাঝারি", te: "మధ్యస్థ", ta: "மிதமான", mr: "मध्यम", gu: "મધ્યમ" }),
        High: t({ en: "High", hi: "उच्च", or: "ଉଚ୍ଚ", bn: "উচ্চ", te: "అధిక", ta: "அதிக", mr: "उच्च", gu: "ઉચ્ચ" }),
    }

    return (
        <div className="min-h-screen bg-background">
            <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role="asha" />

            <div className="mx-auto w-full max-w-6xl px-4 py-5 md:px-6 md:py-8">
                <Card className="animate-fade-up overflow-hidden border-border bg-card shadow-sm">
                    <div className="bg-primary text-primary-foreground px-5 py-6 md:px-7">
                        <div className="mb-5 flex items-center justify-between">
                            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-black/10" onClick={() => setSidebarOpen(true)}>
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
                                <h1 className="text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">{content.ashaDashboard || "ASHA Dashboard"}</h1>
                                <p className="mt-2 text-base font-medium text-primary-foreground/90">{content.welcomeBack || t({ en: "Welcome back", hi: "वापसी पर स्वागत", or: "ପୁନଃ ସ୍ୱାଗତ", bn: "ফিরে আসার জন্য স্বাগতম", te: "తిరిగి స్వాగతం", ta: "மீண்டும் வரவேற்கிறோம்", mr: "परत स्वागत", gu: "ફરી સ્વાગત" })}, Meera Devi</p>
                            </div>
                            <div className="rounded-xl border border-white/20 bg-black/10 px-4 py-3 backdrop-blur-sm shadow-inner">
                                <p className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/80">{t({ en: "Today", hi: "आज", or: "ଆଜି", bn: "আজ", te: "ఈరోజు", ta: "இன்று", mr: "आज", gu: "આજે" })}</p>
                                <p className="mt-1 text-lg font-semibold text-primary-foreground">{stats.total} {t({ en: "patients assigned", hi: "मरीज असाइन", or: "ମରୀଜ ନିଯୁକ୍ତ", bn: "রোগী নির্ধারিত", te: "రోగులు కేటాయించబడ్డారు", ta: "நோயாளிகள் ஒதுக்கப்பட்டனர்", mr: "रुग्ण नियुक्त", gu: "દર્દીઓ નિમણૂક" })}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 border-t border-border bg-card p-5 md:grid-cols-4 md:p-6">
                        <Card className="border-border bg-card p-4 shadow-none">
                            <div className="flex items-center gap-3">
                                <Users className="h-7 w-7 text-trust" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                                    <p className="text-xs font-medium text-muted-foreground">{content.totalPatients || "Total Patients"}</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="border-alert/30 bg-alert/10 p-4 shadow-none">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-7 w-7 text-alert" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.high}</p>
                                    <p className="text-xs font-medium text-muted-foreground">{content.highRisk || "High Risk"}</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="border-warning/30 bg-warning/10 p-4 shadow-none">
                            <div className="flex items-center gap-3">
                                <Clock3 className="h-7 w-7 text-warning" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.medium}</p>
                                    <p className="text-xs font-medium text-muted-foreground">{content.mediumRisk || "Medium Risk"}</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="border-success/30 bg-success/10 p-4 shadow-none">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-7 w-7 text-success" />
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.low}</p>
                                    <p className="text-xs font-medium text-muted-foreground">{content.lowRisk || "Low Risk"}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </Card>

                <DashboardSection title={content.ashaProductivityPanel || t({ en: "ASHA Productivity Panel", hi: "आशा उत्पादकता पैनल", or: "ଆଶା ଉତ୍ପାଦକତା ପ୍ୟାନେଲ୍", bn: "আশা উৎপাদনশীলতা প্যানেল", te: "ఆశా ఉత్పాదకత ప్యానెల్", ta: "ஆஷா உற்பத்தித்திறன் பலகம்", mr: "आशा उत्पादकता पॅनेल", gu: "આશા ઉત્પાદનક્ષમતા પેનલ" })} subtitle={t({ en: "Field priorities first", hi: "फील्ड प्राथमिकताएँ पहले", or: "ପ୍ରଥମେ ଫିଲ୍ଡ ପ୍ରାଥମିକତା", bn: "প্রথমে মাঠের অগ্রাধিকার", te: "ముందుగా ఫీల్డ్ ప్రాధాన్యతలు", ta: "முதலில் தள முன்னுரிமைகள்", mr: "प्रथम फील्ड प्राधान्ये", gu: "પ્રથમ મેદાની પ્રાથમિકતાઓ" })} className="mt-7 animate-fade-up animate-fade-up-delay-1">
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

                <DashboardSection title={content.quickActionsTitle || t({ en: "Quick Actions", hi: "त्वरित कार्य", or: "ତ୍ୱରିତ କାର୍ଯ୍ୟ", bn: "দ্রুত কাজ", te: "త్వరిత చర్యలు", ta: "விரைவு செயல்கள்", mr: "त्वरित कृती", gu: "ઝડપી કાર્ય" })} subtitle={t({ en: "Daily workflow", hi: "दैनिक कार्यप्रवाह", or: "ଦୈନିକ କାର୍ଯ୍ୟପ୍ରବାହ", bn: "দৈনিক কার্যপ্রবাহ", te: "దైనందిన కార్యప్రవాహం", ta: "தினசரி பணிச்சுற்று", mr: "दैनंदिन कार्यप्रवाह", gu: "દૈનિક કાર્યપ્રવાહ" })} className="mt-7 animate-fade-up animate-fade-up-delay-2">
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
                                <p className="text-base font-semibold">{content.ashaTrainingModules || t({ en: "Continue Training", hi: "प्रशिक्षण जारी रखें", or: "ପ୍ରଶିକ୍ଷଣ ଜାରି ରଖନ୍ତୁ", bn: "প্রশিক্ষণ চালিয়ে যান", te: "శిక్షణ కొనసాగించండి", ta: "பயிற்சியை தொடரவும்", mr: "प्रशिक्षण सुरू ठेवा", gu: "ટ્રેનિંગ ચાલુ રાખો" })}</p>
                                <p className="mt-1 text-sm text-white/90">{t({ en: "3 modules in progress", hi: "3 मॉड्यूल जारी हैं", or: "3 ମଡ୍ୟୁଲ୍ ପ୍ରଗତିରେ", bn: "৩টি মডিউল চলছে", te: "3 మాడ్యూల్స్ ప్రగతిలో ఉన్నాయి", ta: "3 தொகுதிகள் நடைபெறுகிறது", mr: "3 मॉड्यूल प्रगतीत", gu: "3 મોડીયુલ પ્રગતિમાં" })}</p>
                            </div>
                        </button>

                        <button
                            className="group flex min-h-[126px] flex-col justify-between rounded-xl border border-border bg-card p-5 text-left text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                            onClick={() => router.push("/asha/appointment-reminders")}
                        >
                            <div className="flex items-start justify-between">
                                <Clock3 className="h-7 w-7 text-trust" />
                                <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-0.5" />
                            </div>
                            <div>
                                <p className="text-base font-semibold">{content.appointmentReminders || t({ en: "Appointment Reminders", hi: "अपॉइंटमेंट रिमाइंडर", or: "ଅପଏଣ୍ଟମେଣ୍ଟ ସ୍ମୃତିପତ୍ର", bn: "অ্যাপয়েন্টমেন্ট রিমাইন্ডার", te: "అపాయింట్‌మెంట్ రిమైండర్లు", ta: "சந்திப்பு நினைவூட்டல்கள்", mr: "अपॉइंटमेंट स्मरणपत्रे", gu: "અપોઇન્ટમેન્ટ રિમાઇન્ડર્સ" })}</p>
                                <p className="mt-1 text-sm text-muted-foreground">{t({ en: "Manage visit schedules quickly", hi: "विजिट शेड्यूल जल्दी प्रबंधित करें", or: "ଭିଜିଟ୍ ସ୍କେଜୁଲ୍ ଶୀଘ୍ର ପରିଚାଳନା କରନ୍ତୁ", bn: "ভিজিট সূচি দ্রুত পরিচালনা করুন", te: "సందర్శన షెడ్యూల్‌లను త్వరగా నిర్వహించండి", ta: "வருகை அட்டவணைகளை விரைவாக நிர்வகிக்கவும்", mr: "भेटीचे वेळापत्रक पटकन व्यवस्थापित करा", gu: "મુલાકાત શેડ્યૂલ ઝડપથી મેનેજ કરો" })}</p>
                            </div>
                        </button>

                        <button
                            className="group flex min-h-[126px] flex-col justify-between rounded-xl border border-border bg-card p-5 text-left text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                            onClick={() => router.push("/asha/home-visits")}
                        >
                            <div className="flex items-start justify-between">
                                <ClipboardList className="h-7 w-7 text-trust" />
                                <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-0.5" />
                            </div>
                            <div>
                                <p className="text-base font-semibold">{content.homeVisits || t({ en: "Home Visits", hi: "होम विजिट", or: "ଘର ଭିଜିଟ୍", bn: "হোম ভিজিট", te: "హోమ్ విజిట్స్", ta: "வீட்டு வருகைகள்", mr: "घरभेटी", gu: "ઘર મુલાકાતો" })}</p>
                                <p className="mt-1 text-sm text-muted-foreground">{t({ en: "Track and update field visits", hi: "फील्ड विजिट ट्रैक और अपडेट करें", or: "ଫିଲ୍ଡ ଭିଜିଟ୍ ଟ୍ରାକ୍ ଏବଂ ଅଦ୍ୟତନ କରନ୍ତୁ", bn: "মাঠ পরিদর্শন ট্র্যাক ও আপডেট করুন", te: "ఫీల్డ్ విజిట్స్ ట్రాక్ చేసి నవీకరించండి", ta: "தள வருகைகளை கண்காணித்து புதுப்பிக்கவும்", mr: "फील्ड भेटी ट्रॅक व अपडेट करा", gu: "મેદાની મુલાકાતોને ટ્રેક અને અપડેટ કરો" })}</p>
                            </div>
                        </button>
                    </div>
                </DashboardSection>

                <DashboardSection title={content.patientDirectoryTitle || t({ en: "Patient Directory", hi: "मरीज निर्देशिका", or: "ରୋଗୀ ନିର୍ଦ୍ଦେଶିକା", bn: "রোগী নির্দেশিকা", te: "రోగి డైరెక్టరీ", ta: "நோயாளி அடைவு", mr: "रुग्ण निर्देशिका", gu: "દર્દી ડિરેક્ટરી" })} subtitle={t({ en: "Search and open profile", hi: "खोजें और प्रोफाइल खोलें", or: "ଖୋଜନ୍ତୁ ଏବଂ ପ୍ରୋଫାଇଲ୍ ଖୋଲନ୍ତୁ", bn: "খুঁজে প্রোফাইল খুলুন", te: "శోధించి ప్రొఫైల్ తెరవండి", ta: "தேடி சுயவிவரத்தைத் திறக்கவும்", mr: "शोधा आणि प्रोफाइल उघडा", gu: "શોધો અને પ્રોફાઇલ ખોલો" })} className="mt-7 animate-fade-up animate-fade-up-delay-3 pb-24 md:pb-8">
                    <Card className="border-border bg-card p-3 shadow-sm md:p-4">
                        <div className="flex items-center gap-3">
                            <Search className="h-5 w-5 text-muted-foreground" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={content.searchPatients || t({ en: "Search patients...", hi: "मरीज खोजें...", or: "ରୋଗୀ ଖୋଜନ୍ତୁ...", bn: "রোগী খুঁজুন...", te: "రోగులను వెతకండి...", ta: "நோயாளிகளைத் தேடுங்கள்...", mr: "रुग्ण शोधा...", gu: "દર્દીઓ શોધો..." })}
                                className="h-11 border-0 bg-muted/50"
                            />
                        </div>
                    </Card>

                    {loading ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Card key={index} className="border-border bg-card p-4 shadow-sm">
                                    <div className="space-y-3">
                                        <Skeleton className="h-5 w-40 " />
                                        <Skeleton className="h-4 w-56 " />
                                        <Skeleton className="h-3 w-44 " />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        filteredPatients.map((patient) => (
                            <Card
                                key={patient.id}
                                className="cursor-pointer border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:bg-secondary/40"
                                onClick={() => router.push(`/asha/patient/${patient.id}`)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="mb-1 text-lg font-semibold text-foreground">{patient.name}</h3>
                                        <p className="mb-2 text-sm text-muted-foreground">
                                            {content.age || t({ en: "Age", hi: "उम्र", or: "ବୟସ", bn: "বয়স", te: "వయస్సు", ta: "வயது", mr: "वय", gu: "ઉંમર" })}: {patient.age} • {patient.weeks} {content.weeksPregnant || t({ en: "weeks pregnant", hi: "सप्ताह गर्भवती", or: "ସପ୍ତାହ ଗର୍ଭବତୀ", bn: "সপ্তাহ গর্ভবতী", te: "గర్భధారణ వారాలు", ta: "கர்ப்ப வாரங்கள்", mr: "आठवडे गर्भवती", gu: "ગર્ભાવસ્થા અઠવાડિયા" })}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {content.lastCheckup || t({ en: "Last checkup", hi: "अंतिम जांच", or: "ଶେଷ ଚେକଅପ୍", bn: "শেষ চেকআপ", te: "చివరి చెకప్", ta: "கடைசி பரிசோதனை", mr: "शेवटची तपासणी", gu: "છેલ્લો ચેકઅપ" })}: {new Date(patient.lastCheckup).toLocaleDateString("en-IN")}
                                        </p>
                                    </div>
                                    <div className={`rounded-full px-4 py-2 text-sm font-semibold ${getRiskColor(patient.risk)}`}>
                                        {riskLabel[patient.risk]} {content.risk || t({ en: "Risk", hi: "जोखिम", or: "ଜୋଖିମ", bn: "ঝুঁকি", te: "ప్రమాదం", ta: "அபாயம்", mr: "जोखीम", gu: "જોખમ" })}
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}

                    {!loading && filteredPatients.length === 0 && (
                        <Card className="border-border bg-card p-6 text-center shadow-sm">
                            <p className="text-sm text-muted-foreground">{t({ en: "No patients found for this search.", hi: "इस खोज के लिए कोई मरीज नहीं मिला।", or: "ଏହି ଖୋଜ ପାଇଁ କୌଣସି ରୋଗୀ ମିଳିଲା ନାହିଁ।", bn: "এই খোঁজের জন্য কোনো রোগী পাওয়া যায়নি।", te: "ఈ శోధనకు ఎలాంటి రోగులు కనిపించలేదు.", ta: "இந்த தேடலுக்கான நோயாளிகள் இல்லை.", mr: "या शोधासाठी कोणतेही रुग्ण सापडले नाहीत.", gu: "આ શોધ માટે કોઈ દર્દી મળ્યો નથી." })}</p>
                        </Card>
                    )}
                </DashboardSection>
            </div>

            <button
                onClick={() => router.push("/asha")}
                className="fixed bottom-6 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-trust px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.03] hover:shadow-xl active:scale-[0.98]"
            >
                <Volume2 className="h-4 w-4" />
                {t({ en: "Voice Assist", hi: "वॉइस सहायता", or: "ଭଏସ୍ ସହାୟତା", bn: "ভয়েস সহায়তা", te: "వాయిస్ సహాయం", ta: "குரல் உதவி", mr: "व्हॉइस सहाय्य", gu: "વોઇસ સહાય" })}
            </button>

            <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-2xl border border-border/70 bg-card/95 p-2 shadow-lg backdrop-blur md:hidden">
                <div className="grid grid-cols-4 gap-1">
                    <button onClick={() => router.push("/asha")} className="flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium text-trust">
                        <Home className="h-4 w-4" />
                        {content.home}
                    </button>
                    <button onClick={() => router.push("/asha/home-visits")} className="flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium text-muted-foreground hover:bg-muted">
                        <ClipboardList className="h-4 w-4" />
                        {content.homeVisits || t({ en: "Visits", hi: "दौरे", or: "ଭିଜିଟ୍", bn: "ভিজিট", te: "సందర్శనలు", ta: "வருகைகள்", mr: "भेटी", gu: "મુલાકાતો" })}
                    </button>
                    <button onClick={() => router.push("/asha")} className="flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium text-muted-foreground hover:bg-muted">
                        <UserRound className="h-4 w-4" />
                        {content.myPatients || t({ en: "Patients", hi: "मरीज", or: "ରୋଗୀ", bn: "রোগী", te: "రోగులు", ta: "நோயாளிகள்", mr: "रुग्ण", gu: "દર્દીઓ" })}
                    </button>
                    <button onClick={() => router.push("/asha/analytics")} className="flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium text-muted-foreground hover:bg-muted">
                        <BarChart3 className="h-4 w-4" />
                        {content.analyticsDashboard || t({ en: "Analytics", hi: "विश्लेषण", or: "ବିଶ୍ଳେଷଣ", bn: "বিশ্লেষণ", te: "విశ్లేషణ", ta: "பகுப்பாய்வு", mr: "विश्लेषण", gu: "વિશ્લેષણ" })}
                    </button>
                </div>
            </div>
        </div>
    )
}
