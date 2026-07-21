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
    done: boolean
}

type LocalizedText = {
    en: string
    hi: string
    or: string
    bn: string
    te: string
    ta: string
    mr: string
    gu: string
}

export default function MotherDashboard() {
    const router = useRouter()
    const { content, language } = useLanguage()
    const t = (copy: LocalizedText) => copy[language as keyof LocalizedText] ?? copy.en

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
        { id: "ifa", done: false },
        { id: "water", done: true },
        { id: "walk", done: false },
        { id: "kick", done: false },
    ])

    const checklistLabels: Record<string, string> = {
        ifa: t({ en: "Take iron + folic acid tablet", hi: "आयरन + फोलिक एसिड टैबलेट लें", or: "ଲୋହ + ଫୋଲିକ ଏସିଡ୍ ଟାବଲେଟ୍ ନିଅନ୍ତୁ", bn: "আয়রন + ফলিক অ্যাসিড ট্যাবলেট নিন", te: "ఐరన్ + ఫోలిక్ ఆమ్ల మాత్ర తీసుకోండి", ta: "இரும்பு + ஃபோலிக் அமில மாத்திரை எடுத்துக்கொள்ளுங்கள்", mr: "लोह + फॉलिक अॅसिड गोळी घ्या", gu: "આયર્ન + ફોલિક એસિડ ગોળી લો" }),
        water: t({ en: "Drink 8 glasses of water", hi: "8 गिलास पानी पिएँ", or: "8 ଗିଲାସ୍ ପାଣି ପିଉନ୍ତୁ", bn: "৮ গ্লাস পানি পান করুন", te: "8 గ్లాసుల నీరు తాగండి", ta: "8 கண்ணாடி தண்ணீர் குடிக்கவும்", mr: "8 ग्लास पाणी प्या", gu: "8 ગ્લાસ પાણી પીવો" }),
        walk: t({ en: "15-minute gentle walk", hi: "15 मिनट हल्की सैर", or: "15 ମିନିଟ୍ ହାଲୁକା ହାଟା", bn: "১৫ মিনিট হালকা হাঁটা", te: "15 నిమిషాల మృదువైన నడక", ta: "15 நிமிட மெதுவான நடை", mr: "15 मिनिटे हलकी चाल", gu: "15 મિનિટ હળવું વોક" }),
        kick: t({ en: "Record baby movement count", hi: "शिशु की मूवमेंट काउंट दर्ज करें", or: "ଶିଶୁ ଗତି ଗଣନା ରେକର୍ଡ କରନ୍ତୁ", bn: "শিশুর নড়াচড়ার সংখ্যা লিখুন", te: "బిడ్డ కదలికల సంఖ్య నమోదు చేయండి", ta: "குழந்தை அசைவுகளின் எண்ணிக்கையை பதிவு செய்யுங்கள்", mr: "बाळाच्या हालचालींची संख्या नोंदवा", gu: "બાળકની હલચાલની ગણતરી નોંધો" }),
    }

    const riskMetaByStatus: Record<RiskStatus, { value: number; chip: string; reason: string }> = {
        Low: {
            value: 24,
            chip: "bg-success/15 text-success",
            reason: t({ en: "Vitals stable. No major risk symptoms detected.", hi: "वाइटल्स स्थिर हैं। कोई बड़ा जोखिम लक्षण नहीं मिला।", or: "ଭାଇଟାଲ୍ ସ୍ଥିର ଅଛି। କୌଣସି ବଡ଼ ବିପଦ ଲକ୍ଷଣ ମିଳିନି।", bn: "ভাইটাল স্থিতিশীল। বড় কোনো ঝুঁকির লক্ষণ নেই।", te: "వైటల్స్ స్థిరంగా ఉన్నాయి. ప్రధాన ప్రమాద లక్షణాలు లేవు.", ta: "அளவீடுகள் நிலையாக உள்ளன. பெரிய அபாய அறிகுறிகள் இல்லை.", mr: "व्हायटल्स स्थिर आहेत. मोठी जोखीम लक्षणे नाहीत.", gu: "વાઇટલ્સ સ્થિર છે. મોટા જોખમના લક્ષણો નથી." }),
        },
        Medium: {
            value: 58,
            chip: "bg-warning/20 text-foreground",
            reason: t({ en: "Monitor hydration and fatigue for the next 24 hours.", hi: "अगले 24 घंटे हाइड्रेशन और थकान पर नज़र रखें।", or: "ଆଗାମୀ 24 ଘଣ୍ଟା ହାଇଡ୍ରେସନ୍ ଏବଂ କ୍ଲାନ୍ତି ଉପରେ ନଜର ରଖନ୍ତୁ।", bn: "পরবর্তী ২৪ ঘন্টা পানিশূন্যতা ও ক্লান্তি পর্যবেক্ষণ করুন।", te: "తదుపరి 24 గంటలు ద్రవపానీయాలు మరియు అలసటను పర్యవేక్షించండి.", ta: "அடுத்த 24 மணி நேரம் நீர்ப்பாசனம் மற்றும் சோர்வை கவனிக்கவும்.", mr: "पुढील 24 तास हायड्रेशन आणि थकवा लक्षात ठेवा.", gu: "આગામી 24 કલાક હાઈડ્રેશન અને થાક પર નજર રાખો." }),
        },
        High: {
            value: 88,
            chip: "bg-alert/20 text-alert",
            reason: t({ en: "High-risk symptoms detected. Contact your doctor today.", hi: "उच्च-जोखिम लक्षण मिले हैं। आज ही डॉक्टर से संपर्क करें।", or: "ଉଚ୍ଚ ବିପଦ ଲକ୍ଷଣ ମିଳିଛି। ଆଜିହିଁ ଡାକ୍ତରଙ୍କୁ ସମ୍ପର୍କ କରନ୍ତୁ।", bn: "উচ্চ ঝুঁকির লক্ষণ ধরা পড়েছে। আজই ডাক্তারের সাথে যোগাযোগ করুন।", te: "అధిక ప్రమాద లక్షణాలు గుర్తించబడ్డాయి. ఈరోజే డాక్టర్ని సంప్రదించండి.", ta: "அதிக அபாய அறிகுறிகள் கண்டறியப்பட்டன. இன்று மருத்துவரை தொடர்புகொள்ளவும்.", mr: "उच्च-जोखीम लक्षणे आढळली. आजच डॉक्टरांशी संपर्क करा.", gu: "ઉચ્ચ જોખમના લક્ષણો મળ્યા. આજે જ ડૉક્ટરને સંપર્ક કરો." }),
        },
    }

    const syncUi: Record<SyncState, { label: string; icon: LucideIcon; className: string }> = {
        synced: {
            label: t({ en: "Synced", hi: "सिंक हुआ", or: "ସିଙ୍କ ହୋଇଛି", bn: "সিঙ্কড", te: "సింక్ అయింది", ta: "ஒத்திசைவு முடிந்தது", mr: "सिंक झाले", gu: "સિંક થયું" }),
            icon: Wifi,
            className: "bg-success/15 text-success border-success/30",
        },
        syncing: {
            label: t({ en: "Syncing", hi: "सिंक हो रहा है", or: "ସିଙ୍କ ହେଉଛି", bn: "সিঙ্ক হচ্ছে", te: "సింక్ అవుతోంది", ta: "ஒத்திசைக்கப்படுகிறது", mr: "सिंक होत आहे", gu: "સિંક થઈ રહ્યું છે" }),
            icon: Wifi,
            className: "bg-trust/15 text-trust border-trust/30",
        },
        queued: {
            label: t({ en: "Queued (offline)", hi: "क्यू में (ऑफ़लाइन)", or: "କ୍ୟୁରେ (ଅଫ୍‌ଲାଇନ୍)", bn: "কিউতে (অফলাইন)", te: "క్యూడ్ (ఆఫ్‌లైన్)", ta: "வரிசையில் (ஆஃப்லைன்)", mr: "रांगेत (ऑफलाइन)", gu: "કતારમાં (ઓફલાઇન)" }),
            icon: WifiOff,
            className: "bg-warning/15 text-foreground border-warning/30",
        },
    }

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
                subtitle: t({ en: "Chat with AI care guide", hi: "AI देखभाल मार्गदर्शक से बात करें", or: "AI ଯତ୍ନ ଗାଇଡ୍ ସହ କଥା ହୁଅନ୍ତୁ", bn: "AI যত্ন সহায়কের সাথে কথা বলুন", te: "AI సంరక్షణ మార్గదర్శితో మాట్లాడండి", ta: "AI பராமரிப்பு வழிகாட்டியுடன் பேசுங்கள்", mr: "AI काळजी मार्गदर्शकाशी बोला", gu: "AI કાળજી માર્ગદર્શક સાથે વાત કરો" }),
                route: "/mother/talk",
                icon: Mic,
                tone: "primary",
            },
            {
                title: t({ en: "Emergency Drill Mode", hi: "आपातकालीन ड्रिल मोड", or: "ଜରୁରୀ ଡ୍ରିଲ୍ ମୋଡ୍", bn: "জরুরি ড্রিল মোড", te: "అత్యవసర డ్రిల్ మోడ్", ta: "அவசர பயிற்சி முறை", mr: "आपत्कालीन ड्रिल मोड", gu: "આપાતકાલીન ડ્રિલ મોડ" }),
                subtitle: t({ en: "Practice critical first-10-minute actions", hi: "पहले 10 मिनट के जरूरी कदम अभ्यास करें", or: "ପ୍ରଥମ 10 ମିନିଟର ଜରୁରୀ କାର୍ଯ୍ୟ ଅଭ୍ୟାସ କରନ୍ତୁ", bn: "প্রথম ১০ মিনিটের গুরুত্বপূর্ণ পদক্ষেপ অনুশীলন করুন", te: "మొదటి 10 నిమిషాల కీలక చర్యలను సాధన చేయండి", ta: "முதல் 10 நிமிட முக்கிய நடவடிக்கைகளை பயிற்சி செய்யுங்கள்", mr: "पहिल्या 10 मिनिटांचे महत्त्वाचे पावले सराव करा", gu: "પ્રથમ 10 મિનિટની મહત્વપૂર્ણ કાર્યવાહીનો અભ્યાસ કરો" }),
                route: "/mother/emergency",
                icon: ShieldAlert,
                tone: "danger",
            },
            {
                title: t({ en: "Family View Dashboard", hi: "परिवार डैशबोर्ड", or: "ପରିବାର ଡ୍ୟାଶବୋର୍ଡ", bn: "পরিবার ড্যাশবোর্ড", te: "కుటుంబ డ్యాష్‌బోర్డ్", ta: "குடும்ப டாஷ்போர்டு", mr: "कुटुंब डॅशबोर्ड", gu: "કુટુંબ ડેશબોર્ડ" }),
                subtitle: t({ en: "Share progress with family caregivers", hi: "परिवार के साथ प्रगति साझा करें", or: "ପରିବାର ଦେଖଭାଳକାରୀଙ୍କ ସହ ପ୍ରଗତି ସେୟାର କରନ୍ତୁ", bn: "পরিবারের পরিচর্যাকারীদের সাথে অগ্রগতি ভাগ করুন", te: "కుటుంబ సంరక్షకులతో పురోగతిని పంచుకోండి", ta: "குடும்ப பராமரிப்பாளர்களுடன் முன்னேற்றத்தை பகிருங்கள்", mr: "कुटुंबीय काळजीवाहूंशी प्रगती शेअर करा", gu: "કુટુંબ સંભાળકર્તાઓ સાથે પ્રગતિ શેર કરો" }),
                route: "/mother/family-sharing",
                icon: Users,
                tone: "soft",
            },
            {
                title: content.myHealthLog || "My Health Log",
                subtitle: t({ en: "Track daily symptoms and vitals", hi: "दैनिक लक्षण और वाइटल्स ट्रैक करें", or: "ଦୈନିକ ଲକ୍ଷଣ ଏବଂ ଭାଇଟାଲ୍ ଟ୍ରାକ୍ କରନ୍ତୁ", bn: "দৈনিক উপসর্গ ও ভাইটাল ট্র্যাক করুন", te: "రోజువారీ లక్షణాలు మరియు వైటల్స్ ట్రాక్ చేయండి", ta: "தினசரி அறிகுறிகள் மற்றும் அளவீடுகளை கண்காணிக்கவும்", mr: "दैनिक लक्षणे आणि व्हायटल्स ट्रॅक करा", gu: "દૈનિક લક્ષણો અને વાઇટલ્સ ટ્રેક કરો" }),
                route: "/mother/health-log",
                icon: BookOpen,
                tone: "soft",
            },
        ],
        [content, language],
    )

    const toolsByCategory: Record<ToolCategory, ToolItem[]> = {
        tracking: [
            { label: content.motherPregnancyTracker || t({ en: "Pregnancy Tracker", hi: "गर्भावस्था ट्रैकर", or: "ଗର୍ଭାବସ୍ଥା ଟ୍ରାକର୍", bn: "গর্ভাবস্থা ট্র্যাকার", te: "గర్భధారణ ట్రాకర్", ta: "கர்ப்ப கண்காணிப்பான்", mr: "गर्भधारणा ट्रॅकर", gu: "ગર્ભાવસ્થા ટ્રેકર" }), route: "/mother/pregnancy-tracker", icon: Baby },
            { label: content.motherVitalSigns || t({ en: "Vital Signs", hi: "वाइटल संकेत", or: "ଭାଇଟାଲ୍ ସାଇନ୍", bn: "ভাইটাল সাইন", te: "వైటల్ సంకేతాలు", ta: "வைத்தல் அளவுகள்", mr: "व्हायटल संकेत", gu: "વાઇટલ સાઇન્સ" }), route: "/mother/vital-signs", icon: TrendingUp },
            { label: content.motherKickCounter || t({ en: "Kick Counter", hi: "किक काउंटर", or: "କିକ୍ କାଉଣ୍ଟର୍", bn: "কিক কাউন্টার", te: "కిక్ కౌంటర్", ta: "அசைவு எண்ணி", mr: "किक काउंटर", gu: "કિક કાઉન્ટર" }), route: "/mother/kick-counter", icon: Activity },
            { label: content.motherNutritionTracker || t({ en: "Nutrition Tracker", hi: "पोषण ट्रैकर", or: "ପୋଷଣ ଟ୍ରାକର୍", bn: "পুষ্টি ট্র্যাকার", te: "పోషణ ట్రాకర్", ta: "ஊட்டச்சத்து கண்காணிப்பான்", mr: "पोषण ट्रॅकर", gu: "પોષણ ટ્રેકર" }), route: "/mother/nutrition", icon: Utensils },
            { label: content.motherPregnancyExercises || t({ en: "Pregnancy Exercises", hi: "गर्भावस्था व्यायाम", or: "ଗର୍ଭାବସ୍ଥା ବ୍ୟାୟାମ", bn: "গর্ভাবস্থার ব্যায়াম", te: "గర్భధారణ వ్యాయామాలు", ta: "கர்ப்ப கால உடற்பயிற்சி", mr: "गर्भधारणा व्यायाम", gu: "ગર્ભાવસ્થા કસરતો" }), route: "/mother/exercises", icon: Dumbbell },
            { label: content.motherLaborSigns || t({ en: "Labor Signs", hi: "प्रसव संकेत", or: "ପ୍ରସବ ସଙ୍କେତ", bn: "প্রসবের লক্ষণ", te: "ప్రసవ సూచనలు", ta: "பிரசவ அறிகுறிகள்", mr: "प्रसूती संकेत", gu: "પ્રસવ સંકેતો" }), route: "/mother/labor-signs", icon: Zap },
        ],
        medical: [
            { label: content.myAppointments || t({ en: "My Appointments", hi: "मेरी अपॉइंटमेंट", or: "ମୋର ଅପଏଣ୍ଟମେଣ୍ଟ", bn: "আমার অ্যাপয়েন্টমেন্ট", te: "నా అపాయింట్‌మెంట్లు", ta: "என் சந்திப்புகள்", mr: "माझ्या अपॉइंटमेंट्स", gu: "મારી અપૉઇન્ટમેન્ટ્સ" }), route: "/mother/appointments", icon: Calendar },
            { label: content.motherDoctorConsultation || t({ en: "Doctor Consultation", hi: "डॉक्टर परामर्श", or: "ଡାକ୍ତର ପରାମର୍ଶ", bn: "ডাক্তারের পরামর্শ", te: "డాక్టర్ సంప్రదింపు", ta: "மருத்துவர் ஆலோசனை", mr: "डॉक्टर सल्ला", gu: "ડૉક્ટર પરામર્શ" }), route: "/mother/doctor-consultation", icon: Video },
            { label: content.motherMedications || t({ en: "Medications", hi: "दवाएं", or: "ଔଷଧ", bn: "ওষুধ", te: "మందులు", ta: "மருந்துகள்", mr: "औषधे", gu: "દવાઓ" }), route: "/mother/medications", icon: Pill },
            { label: content.motherMedicalRecords || t({ en: "Medical Records", hi: "मेडिकल रिकॉर्ड", or: "ମେଡିକାଲ୍ ରେକର୍ଡ", bn: "মেডিক্যাল রেকর্ড", te: "మెడికల్ రికార్డ్స్", ta: "மருத்துவ பதிவுகள்", mr: "वैद्यकीय नोंदी", gu: "મેડિકલ રેકોર્ડ" }), route: "/mother/medical-records", icon: FileText },
            { label: content.motherBirthPlan || t({ en: "Birth Plan", hi: "जन्म योजना", or: "ଜନ୍ମ ଯୋଜନା", bn: "প্রসব পরিকল্পনা", te: "ప్రసవ ప్రణాళిక", ta: "பிறப்பு திட்டம்", mr: "प्रसूती योजना", gu: "પ્રસવ યોજના" }), route: "/mother/birth-plan", icon: Heart },
            { label: content.motherHospitalFinder || t({ en: "Hospital Finder", hi: "हॉस्पिटल खोज", or: "ହସ୍ପିଟାଲ୍ ଖୋଜ", bn: "হাসপাতাল খুঁজুন", te: "ఆసుపత్రి శోధన", ta: "மருத்துவமனை தேடல்", mr: "हॉस्पिटल शोध", gu: "હોસ્પિટલ શોધ" }), route: "/mother/hospital-finder", icon: MapPin },
        ],
        support: [
            { label: content.healthTips || t({ en: "Health Tips", hi: "स्वास्थ्य टिप्स", or: "ସ୍ୱାସ୍ଥ୍ୟ ପରାମର୍ଶ", bn: "স্বাস্থ্য টিপস", te: "ఆరోగ్య సూచనలు", ta: "உடல்நல குறிப்புகள்", mr: "आरोग्य टिप्स", gu: "આરોગ્ય ટીપ્સ" }), route: "/mother/tips", icon: MessageCircle },
            { label: content.communitySupport, route: "/mother/community", icon: Users },
            { label: content.motherFamilySharing || t({ en: "Family Sharing", hi: "परिवार साझा", or: "ପରିବାର ସେୟାରିଂ", bn: "পরিবার শেয়ারিং", te: "కుటుంబ భాగస్వామ్యం", ta: "குடும்ப பகிர்வு", mr: "कुटुंब शेअरिंग", gu: "કુટુંબ શેરિંગ" }), route: "/mother/family-sharing", icon: Share2 },
            { label: content.motherPregnancyJournal || t({ en: "Pregnancy Journal", hi: "गर्भावस्था जर्नल", or: "ଗର୍ଭାବସ୍ଥା ଜର୍ଣାଲ୍", bn: "গর্ভাবস্থা জার্নাল", te: "గర్భధారణ జర్నల్", ta: "கர்ப்ப கால குறிப்பேடு", mr: "गर्भधारणा जर्नल", gu: "ગર્ભાવસ્થા જર્નલ" }), route: "/mother/pregnancy-journal", icon: BookOpen },
            { label: content.motherSOSEmergency || t({ en: "SOS Emergency", hi: "SOS आपातकाल", or: "SOS ଜରୁରୀ", bn: "SOS জরুরি", te: "SOS అత్యవసరం", ta: "SOS அவசரம்", mr: "SOS आपत्काल", gu: "SOS આપાતકાલ" }), route: "/mother/sos-emergency", icon: AlertTriangle },
        ],
    }

    const riskMeta = riskMetaByStatus[riskStatus]
    const syncMeta = syncUi[syncState]

    const riskStatusLabel: Record<RiskStatus, string> = {
        Low: t({ en: "Low", hi: "कम", or: "କମ", bn: "কম", te: "తక్కువ", ta: "குறைவு", mr: "कमी", gu: "ઓછું" }),
        Medium: t({ en: "Medium", hi: "मध्यम", or: "ମଧ୍ୟମ", bn: "মাঝারি", te: "మధ్యస్థ", ta: "மிதமான", mr: "मध्यम", gu: "મધ્યમ" }),
        High: t({ en: "High", hi: "उच्च", or: "ଉଚ୍ଚ", bn: "উচ্চ", te: "అధిక", ta: "அதிக", mr: "उच्च", gu: "ઉચ્ચ" }),
    }

    const checklistDone = checklist.filter((item) => item.done).length
    const checklistProgress = Math.round((checklistDone / checklist.length) * 100)

    const riskTimeline = [
        { day: t({ en: "Today", hi: "आज", or: "ଆଜି", bn: "আজ", te: "ఈరోజు", ta: "இன்று", mr: "आज", gu: "આજે" }), status: riskStatus, note: t({ en: "Fatigue and hydration monitored", hi: "थकान और हाइड्रेशन मॉनिटर किया गया", or: "କ୍ଲାନ୍ତି ଏବଂ ଜଳୟୋଗ ନଜରରେ ରଖାଯାଇଛି", bn: "ক্লান্তি ও হাইড্রেশন পর্যবেক্ষণ করা হয়েছে", te: "అలసట మరియు హైడ్రేషన్ పర్యవేక్షించబడింది", ta: "சோர்வு மற்றும் நீர்ப்பாசனம் கண்காணிக்கப்பட்டது", mr: "थकवा आणि हायड्रेशन तपासले", gu: "થાક અને હાઈડ્રેશન પર નજર રાખવામાં આવી" }) },
        { day: t({ en: "Yesterday", hi: "कल", or: "ଗତକାଲି", bn: "গতকাল", te: "నిన్న", ta: "நேற்று", mr: "काल", gu: "ગઈકાલે" }), status: "Medium", note: t({ en: "Mild headache reported", hi: "हल्का सिरदर्द रिपोर्ट हुआ", or: "ହାଲୁକା ମୁଣ୍ଡବିଥା ରିପୋର୍ଟ ହୋଇଛି", bn: "হালকা মাথাব্যথা রিপোর্ট হয়েছে", te: "స్వల్ప తలనొప్పి నివేదించబడింది", ta: "லேசான தலைவலி பதிவு செய்யப்பட்டது", mr: "हलका डोकेदुखी नोंदली गेली", gu: "હળવો માથાનો દુખાવો નોંધાયો" }) },
        { day: t({ en: "2 days ago", hi: "2 दिन पहले", or: "2 ଦିନ ପୂର୍ବରୁ", bn: "২ দিন আগে", te: "2 రోజుల క్రితం", ta: "2 நாட்கள் முன்பு", mr: "2 दिवसांपूर्वी", gu: "2 દિવસ પહેલા" }), status: "Low", note: t({ en: "Vitals stable, no alert", hi: "वाइटल्स स्थिर, कोई अलर्ट नहीं", or: "ଭାଇଟାଲ୍ ସ୍ଥିର, କୌଣସି ଆଲର୍ଟ ନାହିଁ", bn: "ভাইটাল স্থিতিশীল, কোনো সতর্কতা নেই", te: "వైటల్స్ స్థిరంగా ఉన్నాయి, అలర్ట్ లేదు", ta: "அளவீடுகள் நிலையானவை, எச்சரிக்கை இல்லை", mr: "व्हायटल्स स्थिर, कोणताही अलर्ट नाही", gu: "વાઇટલ્સ સ્થિર, કોઈ એલર્ટ નથી" }) },
    ]

    const sharedNotes = [
        { role: "ASHA", text: t({ en: "Home visit scheduled for tomorrow 9:30 AM", hi: "कल सुबह 9:30 बजे घर विज़िट तय है", or: "ଆସନ୍ତାକାଲି ସକାଳ 9:30 ରେ ଘର ଭେଟି ନିର୍ଧାରିତ", bn: "আগামীকাল সকাল ৯:৩০ টায় বাড়ি ভিজিট নির্ধারিত", te: "రేపు ఉదయం 9:30కు ఇంటి సందర్శనం షెడ్యూల్ చేయబడింది", ta: "நாளை காலை 9:30க்கு வீட்டு வருகை திட்டமிடப்பட்டுள்ளது", mr: "उद्या सकाळी 9:30 ला घरभेट नियोजित", gu: "આવતીકાલે સવારે 9:30એ ઘર મુલાકાત નક્કી" }), time: "10:15 AM" },
        { role: t({ en: "Doctor", hi: "डॉक्टर", or: "ଡାକ୍ତର", bn: "ডাক্তার", te: "డాక్టర్", ta: "மருத்துவர்", mr: "डॉक्टर", gu: "ડૉક્ટર" }), text: t({ en: "Continue iron tablet after lunch for 14 days", hi: "14 दिनों तक दोपहर के भोजन के बाद आयरन टैबलेट जारी रखें", or: "14 ଦିନ ଦୁପରିଆ ଭୋଜନ ପରେ ଲୋହ ଟାବଲେଟ୍ ଚାଲୁ ରଖନ୍ତୁ", bn: "১৪ দিন দুপুরের খাবারের পর আয়রন ট্যাবলেট চালিয়ে যান", te: "14 రోజుల పాటు భోజనం తరువాత ఐరన్ మాత్ర కొనసాగించండి", ta: "14 நாட்கள் மதிய உணவுக்குப் பிறகு இரும்பு மாத்திரை தொடரவும்", mr: "14 दिवस दुपारच्या जेवणानंतर लोह गोळी सुरू ठेवा", gu: "14 દિવસ સુધી બપોરના ભોજન પછી આયર્ન ગોળી ચાલુ રાખો" }), time: t({ en: "Yesterday", hi: "कल", or: "ଗତକାଲି", bn: "গতকাল", te: "నిన్న", ta: "நேற்று", mr: "काल", gu: "ગઈકાલે" }) },
        { role: t({ en: "Family", hi: "परिवार", or: "ପରିବାର", bn: "পরিবার", te: "కుటుంబం", ta: "குடும்பம்", mr: "कुटुंब", gu: "કુટુંબ" }), text: t({ en: "Husband confirmed transport support for next checkup", hi: "अगली जांच के लिए पति ने परिवहन सहायता की पुष्टि की", or: "ପରବର୍ତ୍ତୀ ଚେକଅପ ପାଇଁ ସ୍ୱାମୀ ପରିବହନ ସହାୟତା ନିଶ୍ଚିତ କଲେ", bn: "পরবর্তী চেকআপের জন্য স্বামী পরিবহন সহায়তা নিশ্চিত করেছেন", te: "తదుపరి చెకప్ కోసం భర్త రవాణా సహాయం నిర్ధారించారు", ta: "அடுத்த பரிசோதனைக்கு கணவர் போக்குவரத்து உதவியை உறுதிப்படுத்தினார்", mr: "पुढील तपासणीसाठी पतीने वाहतूक मदतीची खात्री दिली", gu: "આગામી ચેકઅપ માટે પતિએ પરિવહન સહાયની પુષ્ટિ કરી" }), time: t({ en: "Yesterday", hi: "कल", or: "ଗତକାଲି", bn: "গতকাল", te: "నిన్న", ta: "நேற்று", mr: "काल", gu: "ગઈકાલે" }) },
    ]

    const localResources = [
        { title: "PHC Kalinga Nagar", distance: "3.2 km", type: t({ en: "PHC", hi: "पीएचसी", or: "ପିଏଚସି", bn: "পিএইচসি", te: "పిహెచ్‌సి", ta: "பிஎச்ச்சி", mr: "पीएचसी", gu: "પીએચસી" }), route: "/mother/hospital-finder" },
        { title: "108 Ambulance Point", distance: "5.1 km", type: t({ en: "Emergency", hi: "आपातकाल", or: "ଜରୁରୀ", bn: "জরুরি", te: "అత్యవసరం", ta: "அவசரம்", mr: "आपत्काल", gu: "આપાતકાલ" }), route: "/mother/sos-emergency" },
        { title: "Maa Lab & Blood Bank", distance: "6.4 km", type: t({ en: "Blood Support", hi: "रक्त सहायता", or: "ରକ୍ତ ସହାୟତା", bn: "রক্ত সহায়তা", te: "రక్త సహాయం", ta: "இரத்த ஆதரவு", mr: "रक्त सहाय्य", gu: "રક્ત સહાય" }), route: "/mother/hospital-finder" },
    ]

    const budgetMeals: Record<BudgetMode, string[]> = {
        low: [
            t({ en: "Poha + boiled chana", hi: "पोहा + उबला चना", or: "ପୋହା + ସେଧା ଚଣା", bn: "পোহা + সেদ্ধ ছোলা", te: "పోహా + ఉడికించిన శనగ", ta: "போஹா + வேகவைத்த கொண்டைக்கடலை", mr: "पोहे + उकडलेले हरभरे", gu: "પોહા + ઉકાળેલા ચણા" }),
            t({ en: "Rice + dal + seasonal sabzi", hi: "चावल + दाल + मौसमी सब्जी", or: "ଭାତ + ଡାଲ୍ + ଋତୁକାଳୀନ ତରକାରୀ", bn: "ভাত + ডাল + মৌসুমি সবজি", te: "అన్నం + పప్పు + కాలానుగుణ కూర", ta: "அரிசி + பருப்பு + காலநிலை காய்", mr: "भात + डाळ + हंगामी भाजी", gu: "ભાત + દાળ + મોસમી શાક" }),
            t({ en: "Banana + peanut chikki", hi: "केला + मूंगफली चिक्की", or: "କଦଳି + ବଦାମ ଚିକ୍କି", bn: "কলা + চিনাবাদাম চিক্কি", te: "అరటి + పల్లీ చిక్కీ", ta: "வாழைப்பழம் + வேர்க்கடலை சிக்கி", mr: "केळी + शेंगदाणा चिक्की", gu: "કેળું + મગફળી ચીક્કી" }),
        ],
        medium: [
            t({ en: "Ragi dosa + curd", hi: "रागी डोसा + दही", or: "ରାଗି ଡୋସା + ଦହି", bn: "রাগি দোসা + দই", te: "రాగి దోసె + పెరుగు", ta: "ராகி தோசை + தயிர்", mr: "रागी डोसा + दही", gu: "રાગી ડોસા + દહીં" }),
            t({ en: "Chapati + rajma + salad", hi: "चपाती + राजमा + सलाद", or: "ଚପାଟି + ରାଜମା + ସାଲାଦ", bn: "রুটি + রাজমা + সালাদ", te: "చపాతీ + రాజ్మా + సలాడ్", ta: "சப்பாத்தி + ராஜ்மா + சாலட்", mr: "चपाती + राजमा + सॅलड", gu: "ચપાતી + રાજમા + સલાડ" }),
            t({ en: "Egg bhurji + millet roti", hi: "एग भुर्जी + मिलेट रोटी", or: "ଏଗ୍ ଭୁର୍ଜି + ମିଲେଟ୍ ରୁଟି", bn: "ডিম ভুর্জি + মিলেট রুটি", te: "ఎగ్ భుర్జీ + మిల్లెట్ రొట్టి", ta: "முட்டை புர்ஜி + மில்லெட் ரொட்டி", mr: "अंडा भुर्जी + मिलेट रोटी", gu: "એગ ભુર્જી + મિલેટ રોટલી" }),
        ],
        high: [
            t({ en: "Paneer millet bowl", hi: "पनीर मिलेट बाउल", or: "ପନୀର ମିଲେଟ୍ ବାଉଲ୍", bn: "পনির মিলেট বোল", te: "పనీర్ మిల్లెట్ బౌల్", ta: "பனீர் மில்லெட் பௌல்", mr: "पनीर मिलेट बाउल", gu: "પનીર મિલેટ બાઉલ" }),
            t({ en: "Fish curry + red rice", hi: "फिश करी + लाल चावल", or: "ମାଛ ତରକାରୀ + ଲାଲ ଭାତ", bn: "ফিশ কারি + লাল চাল", te: "ఫిష్ కర్రీ + ఎర్ర బియ్యం", ta: "மீன் குழம்பு + சிவப்பு அரிசி", mr: "फिश करी + लाल तांदूळ", gu: "ફિશ કરી + લાલ ચોખા" }),
            t({ en: "Dry fruit smoothie + sprouts", hi: "ड्राई फ्रूट स्मूदी + स्प्राउट्स", or: "ଡ୍ରାଇ ଫ୍ରୁଟ୍ ସ୍ମୁଥି + ସ୍ପ୍ରାଉଟ୍", bn: "ড্রাই ফ্রুট স্মুদি + স্প্রাউটস", te: "డ్రై ఫ్రూట్ స్మూతీ + స్ప్రౌట్స్", ta: "ட்ரை ஃப்ரூட் ஸ்மூத்தி + முளைகட்டிய தானியம்", mr: "ड्राय फ्रूट स्मूदी + स्प्राउट्स", gu: "ડ્રાય ફ્રૂટ સ્મૂધી + સ્પ્રાઉટ્સ" }),
        ],
    }

    const milestones = [
        { title: t({ en: "Week 12 complete", hi: "हफ्ता 12 पूरा", or: "ସପ୍ତାହ 12 ସମ୍ପୂର୍ଣ୍ଣ", bn: "১২ সপ্তাহ সম্পূর্ণ", te: "12వ వారం పూర్తయింది", ta: "12வது வாரம் நிறைவு", mr: "आठवडा 12 पूर्ण", gu: "અઠવાડિયું 12 પૂર્ણ" }), done: pregnancyWeek >= 12 },
        { title: t({ en: "Week 20 anatomy scan", hi: "हफ्ता 20 एनाटॉमी स्कैन", or: "ସପ୍ତାହ 20 ଏନାଟମି ସ୍କାନ୍", bn: "২০ সপ্তাহ অ্যানাটমি স্ক্যান", te: "20వ వారం అనాటమీ స్కాన్", ta: "20வது வார அனாடமி ஸ்கேன்", mr: "आठवडा 20 अॅनाटॉमी स्कॅन", gu: "અઠવાડિયું 20 એનાટોમી સ્કેન" }), done: pregnancyWeek >= 20 },
        { title: t({ en: "Week 28 kick monitoring", hi: "हफ्ता 28 किक मॉनिटरिंग", or: "ସପ୍ତାହ 28 କିକ୍ ମନିଟରିଂ", bn: "২৮ সপ্তাহ কিক মনিটরিং", te: "28వ వారం కిక్ మానిటరింగ్", ta: "28வது வார அசைவு கண்காணிப்பு", mr: "आठवडा 28 किक मॉनिटरिंग", gu: "અઠવાડિયું 28 કિક મોનીટરીંગ" }), done: pregnancyWeek >= 28 },
        { title: t({ en: "Week 36 birth readiness", hi: "हफ्ता 36 जन्म तैयारी", or: "ସପ୍ତାହ 36 ଜନ୍ମ ପ୍ରସ୍ତୁତି", bn: "৩৬ সপ্তাহ প্রসব প্রস্তুতি", te: "36వ వారం ప్రసవ సిద్ధత", ta: "36வது வாரப் பிரசவ தயார்பு", mr: "आठवडा 36 प्रसूती तयारी", gu: "અઠવાડિયું 36 જન્મ તૈયારી" }), done: pregnancyWeek >= 36 },
    ]

    return (
        <div className="min-h-screen bg-background">
            <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role="mother" />

            <div className="mx-auto w-full max-w-6xl px-4 py-5 md:px-6 md:py-8">
                <Card className="animate-fade-up overflow-hidden border-border bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="bg-primary text-primary-foreground px-5 py-6 md:px-7">
                        <div className="mb-5 flex items-center justify-between">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-primary-foreground hover:bg-black/10"
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
                                        <h1 className="text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
                                            {content.greeting || "Namaste"}, {userName}
                                        </h1>
                                        <p className="mt-2 text-sm font-medium text-primary-foreground/90 md:text-base">
                                            {t({ en: "You are doing great today. Let us keep mother and baby safe.", hi: "आज आप बहुत अच्छा कर रही हैं। माँ और शिशु को सुरक्षित रखें।", or: "ଆଜି ଆପଣ ଭଲ କରୁଛନ୍ତି। ମା' ଏବଂ ଶିଶୁକୁ ସୁରକ୍ଷିତ ରଖିବା।", bn: "আজ আপনি খুব ভালো করছেন। মা ও শিশুকে নিরাপদ রাখি।", te: "ఈరోజు మీరు చాలా బాగా చేస్తున్నారు. తల్లి మరియు శిశువు సురక్షితంగా ఉండాలి.", ta: "இன்று நீங்கள் சிறப்பாக செய்கிறீர்கள். தாய் மற்றும் குழந்தையை பாதுகாப்பாக வைத்திருப்போம்.", mr: "आज तुम्ही खूप छान करत आहात. आई आणि बाळ सुरक्षित ठेवूया.", gu: "આજે તમે ખૂબ સારું કરી રહ્યા છો. મા અને બાળકને સુરક્ષિત રાખીએ." })}
                                        </p>
                                    </>
                                ) : (
                                    <div className="space-y-2">
                                        <Skeleton className="h-8 w-64 bg-white/60 dark:bg-white/20" />
                                        <Skeleton className="h-4 w-52 bg-white/50 dark:bg-white/20" />
                                    </div>
                                )}
                            </div>

                            <div className="rounded-xl border border-white/20 bg-black/10 px-4 py-3 backdrop-blur-sm shadow-inner">
                                <p className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/80">{content.pregnancyWeek || "Pregnancy Week"}</p>
                                {hydrated ? (
                                    <p className="mt-1 text-xl font-bold text-primary-foreground">{t({ en: "Week", hi: "हफ्ता", or: "ସପ୍ତାହ", bn: "সপ্তাহ", te: "వారం", ta: "வாரம்", mr: "आठवडा", gu: "અઠવાડિયું" })} {pregnancyWeek}</p>
                                ) : (
                                    <Skeleton className="mt-2 h-6 w-24 bg-white/20" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 border-t border-border bg-card p-5 md:grid-cols-[1.4fr_1fr] md:p-6">
                        <Card className="border border-border bg-secondary/30 p-5 shadow-none">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t({ en: "Risk Indicator", hi: "जोखिम संकेतक", or: "ଜୋଖିମ ସୂଚକ", bn: "ঝুঁকি সূচক", te: "ప్రమాద సూచిక", ta: "அபாய குறியீடு", mr: "जोखीम निर्देशक", gu: "જોખમ સૂચક" })}</p>
                                    <h2 className="mt-2 flex items-center gap-2 text-xl font-bold text-foreground">
                                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${riskMeta.chip}`}>{riskStatusLabel[riskStatus]} {t({ en: "Risk", hi: "जोखिम", or: "ଜୋଖିମ", bn: "ঝুঁকি", te: "ప్రమాదం", ta: "அபாயம்", mr: "जोखीम", gu: "જોખમ" })}</span>
                                    </h2>
                                </div>
                                <Activity className="h-9 w-9 text-success" />
                            </div>

                            <div className="mt-4 h-2.5 rounded-full bg-border">
                                <div
                                    className="h-2.5 rounded-full bg-gradient-to-r from-success/50 to-success transition-all"
                                    style={{ width: `${riskMeta.value}%` }}
                                />
                            </div>

                            <p className="mt-3 text-sm text-foreground/80">{riskMeta.reason}</p>
                        </Card>

                        <Card className="border border-border bg-secondary/30 p-5 shadow-none">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{content.dailyChecklist || t({ en: "Smart Daily Checklist", hi: "स्मार्ट दैनिक चेकलिस्ट", or: "ସ୍ମାର୍ଟ ଦୈନିକ ଚେକଲିଷ୍ଟ", bn: "স্মার্ট দৈনিক চেকলিস্ট", te: "స్మార్ట్ రోజువారీ చెక్లిస్ట్", ta: "ஸ்மார்ட் தினசரி சரிபார்ப்பு பட்டியல்", mr: "स्मार्ट दैनंदिन चेकलिस्ट", gu: "સ્માર્ટ દૈનિક ચેકલિસ્ટ" })}</p>
                            <h3 className="mt-2 text-lg font-semibold text-foreground">{checklistDone}/{checklist.length} {t({ en: "tasks complete", hi: "कार्य पूरे", or: "କାମ ସମାପ୍ତ", bn: "কাজ সম্পূর্ণ", te: "పనులు పూర్తి", ta: "பணிகள் முடிந்தது", mr: "कामे पूर्ण", gu: "કાર્યો પૂર્ણ" })}</h3>
                            <div className="mt-3 h-2.5 rounded-full bg-trust/10">
                                <div className="h-2.5 rounded-full bg-gradient-to-r from-trust to-care transition-all" style={{ width: `${checklistProgress}%` }} />
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">{t({ en: "Completion", hi: "पूर्णता", or: "ସମାପ୍ତି", bn: "সম্পূর্ণতা", te: "పూర్తి", ta: "முடிவு", mr: "पूर्णता", gu: "પૂર્ણતા" })}: {checklistProgress}%</p>
                        </Card>
                    </div>
                </Card>

                <DashboardSection title={content.primaryActionsTitle || t({ en: "Primary Actions", hi: "मुख्य कार्य", or: "ମୁଖ୍ୟ କାର୍ଯ୍ୟ", bn: "প্রধান কাজ", te: "ప్రధాన చర్యలు", ta: "முதன்மை செயல்கள்", mr: "मुख्य कृती", gu: "મુખ્ય કાર્ય" })} subtitle={t({ en: "Most-used features", hi: "सबसे अधिक उपयोग की जाने वाली सुविधाएँ", or: "ସର୍ବାଧିକ ବ୍ୟବହୃତ ବିଶେଷତା", bn: "সবচেয়ে ব্যবহৃত ফিচার", te: "ఎక్కువగా ఉపయోగించే ఫీచర్లు", ta: "அதிகம் பயன்படுத்தப்படும் அம்சங்கள்", mr: "सर्वाधिक वापरली जाणारी वैशिष्ट्ये", gu: "સૌથી વધુ વપરાતી સુવિધાઓ" })} className="mt-6 animate-fade-up animate-fade-up-delay-1">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {primaryActions.map((action) => {
                            const Icon = action.icon
                            const isTabStyleCard = action.route === "/mother/family-sharing" || action.route === "/mother/health-log"
                            const tabConfig =
                                action.route === "/mother/family-sharing"
                                    ? {
                                        tabLabel: t({ en: "Family Tab", hi: "परिवार टैब", or: "ପରିବାର ଟ୍ୟାବ୍", bn: "ফ্যামিলি ট্যাব", te: "ఫ్యామిలీ ట్యాబ్", ta: "குடும்ப டேப்", mr: "कुटुंब टॅब", gu: "ફેમિલી ટૅબ" }),
                                        status: t({ en: "1 pending acknowledgment", hi: "1 पुष्टि लंबित", or: "1 ସ୍ୱୀକୃତି ବକେୟା", bn: "1টি স্বীকৃতি অপেক্ষমাণ", te: "1 పెండింగ్ ఆమోదం", ta: "1 நிலுவை உறுதிப்படுத்தல்", mr: "1 प्रलंबित पुष्टी", gu: "1 બાકી સ્વીકૃતિ" }),
                                        stats: [
                                            t({ en: "Caregivers: 3 active", hi: "देखभालकर्ता: 3 सक्रिय", or: "ଯତ୍ନଦାତା: 3 ସକ୍ରିୟ", bn: "পরিচর্যাকারী: ৩ সক্রিয়", te: "కేర్‌గివర్లు: 3 సక్రియ", ta: "பராமரிப்பாளர்கள்: 3 செயலில்", mr: "काळजीवाहक: 3 सक्रिय", gu: "કેરગિવર: 3 સક્રિય" }),
                                            t({ en: "Last shared: 15 min ago", hi: "अंतिम साझा: 15 मिनट पहले", or: "ଶେଷ ସେୟାର: 15 ମିନିଟ୍ ପୂର୍ବରୁ", bn: "শেষ শেয়ার: ১৫ মিনিট আগে", te: "చివరి షేర్: 15 నిమిషాల క్రితం", ta: "கடைசியாக பகிர்ந்தது: 15 நிமிடங்கள் முன்பு", mr: "शेवटचे शेअर: 15 मिनिटांपूर्वी", gu: "છેલ્લું શેર: 15 મિનિટ પહેલા" }),
                                        ],
                                        footer: t({ en: "Weekly progress summary is auto-shared", hi: "साप्ताहिक प्रगति सारांश स्वतः साझा होता है", or: "ସାପ୍ତାହିକ ପ୍ରଗତି ସାରାଂଶ ସ୍ୱୟଂଚାଳିତ ଭାବେ ସେୟାର ହୁଏ", bn: "সাপ্তাহিক অগ্রগতির সারাংশ স্বয়ংক্রিয়ভাবে শেয়ার হয়", te: "వారపు పురోగతి సారాంశం ఆటో-షేర్ అవుతుంది", ta: "வாராந்திர முன்னேற்ற சுருக்கம் தானாக பகிரப்படும்", mr: "साप्ताहिक प्रगती सारांश आपोआप शेअर होतो", gu: "સાપ્તાહિક પ્રગતિ સારાંશ આપમેળે શેર થાય છે" }),
                                    }
                                    : action.route === "/mother/health-log"
                                        ? {
                                            tabLabel: t({ en: "Health Tab", hi: "हेल्थ टैब", or: "ସ୍ୱାସ୍ଥ୍ୟ ଟ୍ୟାବ୍", bn: "হেলথ ট্যাব", te: "హెల్త్ ట్యాబ్", ta: "ஹெல்த் டேப்", mr: "हेल्थ टॅब", gu: "હેલ્થ ટૅબ" }),
                                            status: `${syncMeta.label}`,
                                            stats: [
                                                t({ en: "Today logs: 4/6 completed", hi: "आज की लॉग: 4/6 पूर्ण", or: "ଆଜିର ଲଗ୍: 4/6 ସମ୍ପୂର୍ଣ୍ଣ", bn: "আজকের লগ: ৪/৬ সম্পূর্ণ", te: "ఈరోజు లాగ్స్: 4/6 పూర్తి", ta: "இன்றைய பதிவு: 4/6 முடிந்தது", mr: "आजचे लॉग: 4/6 पूर्ण", gu: "આજના લોગ: 4/6 પૂર્ણ" }),
                                                t({ en: "Next BP check in 2 hours", hi: "अगली BP जांच 2 घंटे में", or: "ପରବର୍ତ୍ତୀ BP ଚେକ୍ 2 ଘଣ୍ଟାରେ", bn: "পরবর্তী BP চেক ২ ঘন্টায়", te: "తదుపరి BP చెక్ 2 గంటల్లో", ta: "அடுத்த BP சோதனை 2 மணிநேரத்தில்", mr: "पुढील BP तपासणी 2 तासांत", gu: "આગામી BP ચેક 2 કલાકમાં" }),
                                            ],
                                            footer: t({ en: "High-impact changes are highlighted for doctor review", hi: "उच्च प्रभाव वाले बदलाव डॉक्टर समीक्षा हेतु चिन्हित हैं", or: "ଉଚ୍ଚ ପ୍ରଭାବଶାଳୀ ପରିବର୍ତ୍ତନ ଡାକ୍ତର ରିଭ୍ୟୁ ପାଇଁ ଚିହ୍ନଟ", bn: "উচ্চ প্রভাবের পরিবর্তন ডাক্তার রিভিউর জন্য হাইলাইট করা হয়েছে", te: "అధిక ప్రభావ మార్పులు డాక్టర్ సమీక్షకు హైలైట్ చేయబడ్డాయి", ta: "உயர் தாக்க மாற்றங்கள் மருத்துவர் மதிப்பீட்டிற்காக குறிக்கப்பட்டுள்ளன", mr: "उच्च-परिणाम बदल डॉक्टर पुनरावलोकनासाठी दर्शवले आहेत", gu: "ઉચ્ચ અસરવાળા ફેરફારો ડૉક્ટર સમીક્ષા માટે દર્શાવવામાં આવ્યા છે" }),
                                        }
                                        : null

                            const toneClass =
                                action.tone === "danger"
                                    ? "border-alert/30 bg-alert text-white"
                                    : action.tone === "primary"
                                        ? "border-primary/25 bg-primary/10 text-foreground"
                                        : "border-care/30 bg-care/10 text-foreground"

                            return (
                                <button
                                    key={action.route}
                                    onClick={() => router.push(action.route)}
                                    className={`group relative flex min-h-[132px] flex-col justify-between rounded-2xl border p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] ${isTabStyleCard ? "overflow-hidden border-trust/20 bg-card pt-8" : toneClass}`}
                                >
                                    {isTabStyleCard && tabConfig && (
                                        <>
                                            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-trust to-care" />
                                            <div className="absolute left-4 top-0 rounded-b-md border border-t-0 border-border bg-background px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                                {tabConfig.tabLabel}
                                            </div>
                                        </>
                                    )}

                                    {isTabStyleCard && tabConfig ? (
                                        <div className="space-y-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-2 rounded-full border border-border/70 bg-secondary/30 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                                                    <Icon className="h-3.5 w-3.5" />
                                                    {tabConfig.status}
                                                </div>
                                                <ChevronRight className="h-5 w-5 opacity-70 transition group-hover:translate-x-0.5" />
                                            </div>

                                            <div>
                                                <p className="text-[1.04rem] font-semibold leading-tight">{action.title}</p>
                                                <p className="mt-1 text-sm text-muted-foreground">{action.subtitle}</p>
                                            </div>

                                            <div className="grid gap-2 text-xs text-foreground/80">
                                                {tabConfig.stats.map((stat) => (
                                                    <p key={stat} className="rounded-md border border-border/70 bg-secondary/25 px-2.5 py-1.5">
                                                        {stat}
                                                    </p>
                                                ))}
                                            </div>

                                            <p className="text-[11px] font-medium text-muted-foreground">{tabConfig.footer}</p>
                                        </div>
                                    ) : (
                                        <>
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
                                        </>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </DashboardSection>

                <DashboardSection title={t({ en: "Daily Care + Mood", hi: "दैनिक देखभाल + मूड", or: "ଦୈନିକ ଯତ୍ନ + ମନୋଭାବ", bn: "দৈনিক যত্ন + মুড", te: "రోజువారీ సంరక్షణ + మూడ్", ta: "தினசரி பராமரிப்பு + மனநிலை", mr: "दैनंदिन काळजी + मूड", gu: "દૈનિક સંભાળ + મૂડ" })} className="mt-6 animate-fade-up animate-fade-up-delay-2">
                    <div id="mother-checklist-section" className="grid gap-4 lg:grid-cols-2">
                        <Card className="border-border bg-card p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <div className="space-y-3">
                                {checklist.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setChecklist((prev) => prev.map((p) => (p.id === item.id ? { ...p, done: !p.done } : p)))}
                                        className="flex w-full items-center gap-3 rounded-lg border border-border/70 p-3 text-left transition hover:bg-muted/50"
                                    >
                                        <CheckCircle2 className={`h-5 w-5 ${item.done ? "text-success" : "text-muted-foreground"}`} />
                                        <p className={`text-sm ${item.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{checklistLabels[item.id]}</p>
                                    </button>
                                ))}
                            </div>
                        </Card>

                        <Card className="border-border bg-card p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t({ en: "Mood strip", hi: "मूड स्ट्रिप", or: "ମୁଡ୍ ଷ୍ଟ୍ରିପ୍", bn: "মুড স্ট্রিপ", te: "మూడ్ స్ట్రిప్", ta: "மூட் ஸ்ட்ரிப்", mr: "मूड स्ट्रिप", gu: "મૂડ સ્ટ્રિપ" })}</p>
                            <h3 className="mt-2 text-lg font-semibold">{t({ en: "How are you feeling now?", hi: "आप अभी कैसा महसूस कर रही हैं?", or: "ଏବେ ଆପଣ କେମିତି ଅନୁଭବ କରୁଛନ୍ତି?", bn: "এখন আপনি কেমন অনুভব করছেন?", te: "ఇప్పుడు మీకు ఎలా అనిపిస్తోంది?", ta: "இப்போது நீங்கள் எப்படி உணர்கிறீர்கள்?", mr: "आता तुम्हाला कसे वाटते?", gu: "હવે તમને કેવી લાગણી થાય છે?" })}</h3>
                            <div className="mt-4 grid grid-cols-3 gap-2">
                                {[
                                    { id: "calm", label: t({ en: "Calm", hi: "शांत", or: "ଶାନ୍ତ", bn: "শান্ত", te: "శాంతంగా", ta: "அமைதி", mr: "शांत", gu: "શાંત" }) },
                                    { id: "stressed", label: t({ en: "Stressed", hi: "तनावग्रस्त", or: "ତଣାପୋଡ଼", bn: "চাপগ্রস্ত", te: "ఒత్తిడిలో", ta: "மனஅழுத்தம்", mr: "तणावग्रस्त", gu: "તણાવગ્રસ્ત" }) },
                                    { id: "anxious", label: t({ en: "Anxious", hi: "चिंतित", or: "ଚିନ୍ତିତ", bn: "উদ্বিগ্ন", te: "ఆందోళన", ta: "கவலை", mr: "चिंताग्रस्त", gu: "ચિંતિત" }) },
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
                                {mood === "calm" && t({ en: "Great. Keep this routine and continue hydration + light walk.", hi: "बहुत अच्छा। यह रूटीन जारी रखें और पानी व हल्की सैर बनाए रखें।", or: "ଅତ୍ୟନ୍ତ ଭଲ। ଏହି ଅଭ୍ୟାସ ଜାରି ରଖନ୍ତୁ ଏବଂ ପାଣି + ହାଲୁକା ହାଟା କରନ୍ତୁ।", bn: "দারুণ। এই রুটিন বজায় রাখুন এবং পানি + হালকা হাঁটা চালিয়ে যান।", te: "చాలా మంచిది. ఈ రొటీన్ కొనసాగించండి మరియు నీరు + తేలికపాటి నడక చేయండి.", ta: "சிறப்பு. இந்த வழக்கத்தை தொடருங்கள், தண்ணீர் மற்றும் மெதுவான நடை தொடரவும்.", mr: "छान. ही दिनचर्या ठेवा आणि पाणी + हलकी चाल सुरू ठेवा.", gu: "ખૂબ સારું. આ રૂટિન રાખો અને પાણી + હળવું વોક ચાલુ રાખો." })}
                                {mood === "stressed" && t({ en: "Try 4-7-8 breathing for 3 minutes and talk to Saheli if stress persists.", hi: "3 मिनट 4-7-8 श्वास तकनीक करें और तनाव रहे तो सहेली से बात करें।", or: "3 ମିନିଟ୍ 4-7-8 ଶ୍ୱାସ ଅଭ୍ୟାସ କରନ୍ତୁ, ତଣାପୋଡ଼ ରହିଲେ ସହେଲୀ ସହ କଥାହୁଅନ୍ତୁ।", bn: "৩ মিনিট 4-7-8 শ্বাস নিন, চাপ থাকলে সহেলির সাথে কথা বলুন।", te: "3 నిమిషాలు 4-7-8 శ్వాసాభ్యాసం చేయండి, ఒత్తిడి కొనసాగితే సహేలితో మాట్లాడండి.", ta: "3 நிமிடம் 4-7-8 சுவாசம் முயற்சிக்கவும்; அழுத்தம் நீடித்தால் சஹேலியுடன் பேசுங்கள்.", mr: "3 मिनिटे 4-7-8 श्वसन करा; तणाव राहिला तर सहेलीशी बोला.", gu: "3 મિનિટ 4-7-8 શ્વાસ લો; તણાવ રહે તો સહેલી સાથે વાત કરો." })}
                                {mood === "anxious" && t({ en: "You are not alone. Open mental-health support and notify your ASHA worker.", hi: "आप अकेली नहीं हैं। मानसिक स्वास्थ्य सहायता खोलें और अपनी आशा कार्यकर्ता को सूचित करें।", or: "ଆପଣ ଏକା ନୁହେଁ। ମାନସିକ ସ୍ୱାସ୍ଥ୍ୟ ସହାୟତା ଖୋଲନ୍ତୁ ଏବଂ ଆପଣଙ୍କ ଆଶା କର୍ମୀଙ୍କୁ ଜଣାନ୍ତୁ।", bn: "আপনি একা নন। মানসিক স্বাস্থ্য সহায়তা খুলুন এবং আপনার আশা কর্মীকে জানান।", te: "మీరు ఒంటరిగా లేరు. మానసిక ఆరోగ్య సహాయం తెరచి మీ ఆశా కార్యకర్తకు తెలియజేయండి.", ta: "நீங்கள் தனியாக இல்லை. மனநலம் ஆதரவை திறந்து உங்கள் ஆஷா பணியாளருக்கு தெரிவிக்கவும்.", mr: "तुम्ही एकटे नाही. मानसिक आरोग्य सहाय्य उघडा आणि आशा कार्यकर्त्याला कळवा.", gu: "તમે એકલા નથી. માનસિક આરોગ્ય સહાયતા ખોલો અને તમારી આશા કાર્યકરને જાણ કરો." })}
                            </div>
                            <Button className="mt-4 w-full" variant="outline" onClick={() => router.push("/mother/mental-health")}>
                                {t({ en: "Open Mental Wellness", hi: "मानसिक स्वास्थ्य खोलें", or: "ମାନସିକ ସୁସ୍ଥତା ଖୋଲନ୍ତୁ", bn: "মানসিক সুস্থতা খুলুন", te: "మెంటల్ వెల్నెస్ తెరవండి", ta: "மனநல பகுதியைத் திறக்கவும்", mr: "मानसिक आरोग्य उघडा", gu: "માનસિક સુખાકારી ખોલો" })}
                            </Button>
                        </Card>
                    </div>
                </DashboardSection>

                <DashboardSection title={t({ en: "Risk Timeline + Shared Notes", hi: "जोखिम टाइमलाइन + साझा नोट्स", or: "ଜୋଖିମ ଟାଇମଲାଇନ୍ + ସେୟାର୍ ନୋଟ୍", bn: "ঝুঁকি টাইমলাইন + শেয়ার্ড নোট", te: "రిస్క్ టైమ్‌లైన్ + షేర్డ్ నోట్స్", ta: "அபாய காலவரிசை + பகிர்ந்த குறிப்புகள்", mr: "जोखीम टाइमलाइन + शेअर नोट्स", gu: "જોખમ સમયરેખા + શેર કરેલી નોંધો" })} subtitle={t({ en: "One source of truth", hi: "एक विश्वसनीय स्रोत", or: "ଏକ ବିଶ୍ୱସ୍ତ ସ୍ରୋତ", bn: "একটি নির্ভরযোগ্য উৎস", te: "ఒకే విశ్వసనీయ మూలం", ta: "ஒரே நம்பகமான ஆதாரம்", mr: "एक विश्वासार्ह स्रोत", gu: "એક વિશ્વસનીય સ્રોત" })} className="mt-6 animate-fade-up animate-fade-up-delay-3">
                    <div className="grid gap-4 lg:grid-cols-2">
                        <Card className="border-border bg-card p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t({ en: "Real-time Risk Timeline", hi: "रियल-टाइम जोखिम टाइमलाइन", or: "ରିଅଲ୍-ଟାଇମ୍ ଜୋଖିମ ଟାଇମଲାଇନ୍", bn: "রিয়েল-টাইম ঝুঁকি টাইমলাইন", te: "రియల్-టైమ్ రిస్క్ టైమ్‌లైన్", ta: "நேரடி அபாய காலவரிசை", mr: "रिअल-टाइम जोखीम टाइमलाइन", gu: "રીઅલ-ટાઈમ જોખમ સમયરેખા" })}</p>
                            <div className="mt-4 space-y-3">
                                {riskTimeline.map((row) => (
                                    <div key={row.day} className="flex items-start justify-between rounded-lg border border-border/70 p-3">
                                        <div>
                                            <p className="text-sm font-semibold">{row.day}</p>
                                            <p className="text-xs text-muted-foreground">{row.note}</p>
                                        </div>
                                        <Badge variant="outline">{riskStatusLabel[row.status as RiskStatus]}</Badge>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="border-border bg-card p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t({ en: "Shared Notes", hi: "साझा नोट्स", or: "ସେୟାର୍ ନୋଟ୍", bn: "শেয়ার্ড নোট", te: "షేర్డ్ నోట్స్", ta: "பகிர்ந்த குறிப்புகள்", mr: "शेअर नोट्स", gu: "શેર કરેલી નોંધો" })}</p>
                                <Badge className="border-success/30 bg-success/10 text-success">{t({ en: "Care Team Synced", hi: "केयर टीम सिंक", or: "କେୟାର୍ ଟିମ୍ ସିଙ୍କ", bn: "কেয়ার টিম সিঙ্কড", te: "కేర్ టీమ్ సింక్", ta: "பராமரிப்பு குழு ஒத்திசைவு", mr: "केअर टीम सिंक", gu: "કેર ટીમ સિંક" })}</Badge>
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

                <DashboardSection title={t({ en: "Trust-Verified Guidance", hi: "विश्वसनीय सत्यापित मार्गदर्शन", or: "ବିଶ୍ୱସ୍ତ ସତ୍ୟାପିତ ମାର୍ଗଦର୍ଶନ", bn: "বিশ্বস্ত যাচাইকৃত নির্দেশনা", te: "నమ్మకమైన ధృవీకృత మార్గదర్శకం", ta: "நம்பகமான சரிபார்க்கப்பட்ட வழிகாட்டல்", mr: "विश्वासार्ह सत्यापित मार्गदर्शन", gu: "વિશ્વસનીય પ્રમાણિત માર્ગદર્શન" })} subtitle={t({ en: "Reviewed by maternal experts", hi: "मातृ विशेषज्ञों द्वारा समीक्षा", or: "ମାତୃ ବିଶେଷଜ୍ଞଙ୍କ ଦ୍ୱାରା ସମୀକ୍ଷିତ", bn: "মাতৃ বিশেষজ্ঞদের দ্বারা পর্যালোচিত", te: "మాతృ నిపుణుల సమీక్షతో", ta: "மாத்ரு நிபுணர்களால் மதிப்பாய்வு செய்யப்பட்டது", mr: "मातृ तज्ञांनी पुनरावलोकन केलेले", gu: "માતૃત્વ નિષ્ણાતો દ્વારા સમીક્ષા કરાયેલ" })} className="mt-6 animate-fade-up">
                    <div className="grid gap-4 lg:grid-cols-2">
                        <Card className="border-border bg-card p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h4 className="text-lg font-semibold">{t({ en: "Critical warning signs", hi: "गंभीर चेतावनी संकेत", or: "ଗୁରୁତର ସତର୍କ ସଙ୍କେତ", bn: "গুরুতর সতর্ক সংকেত", te: "కీలక హెచ్చరిక లక్షణాలు", ta: "முக்கிய எச்சரிக்கை அறிகுறிகள்", mr: "गंभीर चेतावणी चिन्हे", gu: "ગંભીર ચેતવણી ચિહ્નો" })}</h4>
                                    <p className="mt-1 text-sm text-muted-foreground">{t({ en: "Bleeding, severe headache, blurred vision, reduced movement", hi: "रक्तस्राव, तेज सिरदर्द, धुंधला दिखना, कम मूवमेंट", or: "ରକ୍ତସ୍ରାବ, ଭୟଙ୍କର ମୁଣ୍ଡବେଥା, ଧୁସର ଦୃଷ୍ଟି, କମ ଚଳନ", bn: "রক্তপাত, তীব্র মাথাব্যথা, ঝাপসা দেখা, নড়াচড়া কম", te: "రక్తస్రావం, తీవ్రమైన తలనొప్పి, చూపు మసకబారటం, కదలిక తగ్గడం", ta: "இரத்தப்போக்கு, கடும் தலைவலி, மங்கிய பார்வை, அசைவுகள் குறைவு", mr: "रक्तस्राव, तीव्र डोकेदुखी, धूसर दृष्टी, हालचाली कमी", gu: "રક્તસ્ત્રાવ, ભારે માથાનો દુખાવો, ઝાંખી નજર, હલચાલમાં ઘટાડો" })}</p>
                                </div>
                                <Badge className="border-success/30 bg-success/10 text-success">
                                    <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                                    {t({ en: "Nurse reviewed", hi: "नर्स द्वारा समीक्षा", or: "ନର୍ସ ଦ୍ୱାରା ସମୀକ୍ଷା", bn: "নার্স পর্যালোচিত", te: "నర్స్ సమీక్షించింది", ta: "நர்ஸ் மதிப்பாய்வு", mr: "नर्सने पुनरावलोकन केले", gu: "નર્સ દ્વારા સમીક્ષા" })}
                                </Badge>
                            </div>
                            <Button variant="outline" className="mt-4 w-full" onClick={() => router.push("/mother/danger-signs")}>{t({ en: "Open Danger Signs", hi: "डेंजर साइन खोलें", or: "ଡେଞ୍ଜର ସାଇନ୍ ଖୋଲନ୍ତୁ", bn: "বিপদ সংকেত খুলুন", te: "డేంజర్ సైన్స్ తెరవండి", ta: "அபாய அறிகுறிகளைத் திறக்கவும்", mr: "धोका चिन्हे उघडा", gu: "જોખમ ચિહ્નો ખોલો" })}</Button>
                        </Card>

                        <Card className="border-border bg-card p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <h4 className="text-lg font-semibold">{t({ en: "Nutrition Planner with Budget Mode", hi: "बजट मोड के साथ न्यूट्रिशन प्लानर", or: "ବଜେଟ୍ ମୋଡ୍ ସହ ପୋଷଣ ଯୋଜନାକାରୀ", bn: "বাজেট মোডসহ পুষ্টি পরিকল্পক", te: "బడ్జెట్ మోడ్‌తో పోషణ ప్లానర్", ta: "பட்ஜெட் முறையுடன் ஊட்டச்சத்து திட்டம்", mr: "बजेट मोडसह पोषण नियोजक", gu: "બજેટ મોડ સાથે પોષણ પ્લાનર" })}</h4>
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
                            <Button className="mt-4 w-full" onClick={() => router.push("/mother/nutrition-planner")}>{t({ en: "Open Full Planner", hi: "पूरा प्लानर खोलें", or: "ପୂର୍ଣ୍ଣ ପ୍ଲାନର୍ ଖୋଲନ୍ତୁ", bn: "পূর্ণ প্ল্যানার খুলুন", te: "పూర్తి ప్లానర్ తెరవండి", ta: "முழு திட்டத்தைத் திறக்கவும்", mr: "पूर्ण नियोजक उघडा", gu: "પૂર્ણ પ્લાનર ખોલો" })}</Button>
                        </Card>
                    </div>
                </DashboardSection>

                <DashboardSection title={t({ en: "Milestones + Resources", hi: "माइलस्टोन + संसाधन", or: "ମାଇଲସ୍ଟୋନ୍ + ସମ୍ପଦ", bn: "মাইলস্টোন + রিসোর্স", te: "మైల్స్టోన్స్ + వనరులు", ta: "மைல்கற்கள் + வளங்கள்", mr: "माइलस्टोन्स + साधने", gu: "માઇલસ્ટોન્સ + સંસાધનો" })} className="mt-6 animate-fade-up pb-24 md:pb-10">
                    <div className="grid gap-4 lg:grid-cols-2">
                        <Card className="border-border bg-card p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t({ en: "Pregnancy Progress Milestones", hi: "गर्भावस्था प्रगति माइलस्टोन", or: "ଗର୍ଭାବସ୍ଥା ପ୍ରଗତି ମାଇଲସ୍ଟୋନ୍", bn: "গর্ভাবস্থার অগ্রগতির মাইলস্টোন", te: "గర్భధారణ పురోగతి మైల్స్టోన్స్", ta: "கர்ப்ப முன்னேற்ற மைல்கற்கள்", mr: "गर्भधारणा प्रगती माइलस्टोन्स", gu: "ગર્ભાવસ્થા પ્રગતિ માઇલસ્ટોન્સ" })}</p>
                            <div className="mt-4 space-y-3">
                                {milestones.map((m) => (
                                    <div key={m.title} className="flex items-center gap-3 rounded-lg border border-border/70 p-3">
                                        <CheckCircle2 className={`h-5 w-5 ${m.done ? "text-success" : "text-muted-foreground"}`} />
                                        <p className="text-sm">{m.title}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="border-border bg-card p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t({ en: "Local Resource Map Cards", hi: "स्थानीय संसाधन मैप कार्ड", or: "ସ୍ଥାନୀୟ ସମ୍ପଦ ମାପ୍ କାର୍ଡ", bn: "স্থানীয় রিসোর্স ম্যাপ কার্ড", te: "స్థానిక వనరుల మ్యాప్ కార్డులు", ta: "உள்ளூர் வள வரைபட அட்டைகள்", mr: "स्थानिक साधन नकाशा कार्ड", gu: "સ્થાનિક સંસાધન મેપ કાર્ડ" })}</p>
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
                                                    <Route className="mr-1 h-3.5 w-3.5" />{t({ en: "Route", hi: "मार्ग", or: "ରୁଟ୍", bn: "রুট", te: "మార్గం", ta: "வழி", mr: "मार्ग", gu: "માર્ગ" })}
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => router.push("/mother/sos-emergency")}>{t({ en: "Call", hi: "कॉल", or: "କଲ୍", bn: "কল", te: "కాల్", ta: "அழை", mr: "कॉल", gu: "કોલ" })}</Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </DashboardSection>

                <DashboardSection title={t({ en: "Tools", hi: "उपकरण", or: "ସାଧନ", bn: "টুলস", te: "సాధనాలు", ta: "கருவிகள்", mr: "साधने", gu: "સાધનો" })} subtitle={t({ en: "Organized by category", hi: "श्रेणी अनुसार व्यवस्थित", or: "ଶ୍ରେଣୀ ଅନୁସାରେ ସଂଗଠିତ", bn: "বিভাগ অনুযায়ী সাজানো", te: "వర్గాలవారీగా నిర్వహణ", ta: "வகைபடி ஒழுங்குபடுத்தப்பட்டது", mr: "वर्गानुसार आयोजित", gu: "શ્રેણી મુજબ ગોઠવાયેલ" })} className="mt-6 animate-fade-up">
                    <div className="flex w-full items-center justify-between rounded-full border border-princess-1 bg-card p-1.5 shadow-[0_2px_12px_rgba(217,79,43,0.18)]">
                        <button
                            onClick={() => setActiveCategory("tracking")}
                            className={`flex-1 rounded-full px-4 py-3 text-[15px] font-bold transition-all duration-300 ${activeCategory === "tracking" ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]" : "text-primary/70 hover:bg-secondary/50"}`}
                        >
                            {t({ en: "Tracking", hi: "ट्रैकिंग", or: "ଟ୍ରାକିଙ୍ଗ", bn: "ট্র্যাকিং", te: "ట్రాకింగ్", ta: "கண்காணிப்பு", mr: "ट्रॅकिंग", gu: "ટ્રેકિંગ" })}
                        </button>
                        <button
                            onClick={() => setActiveCategory("medical")}
                            className={`flex-1 rounded-full px-4 py-3 text-[15px] font-bold transition-all duration-300 ${activeCategory === "medical" ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]" : "text-primary/70 hover:bg-secondary/50"}`}
                        >
                            {t({ en: "Medical", hi: "मेडिकल", or: "ମେଡିକାଲ୍", bn: "মেডিক্যাল", te: "వైద్య", ta: "மருத்துவ", mr: "वैद्यकीय", gu: "મેડિકલ" })}
                        </button>
                        <button
                            onClick={() => setActiveCategory("support")}
                            className={`flex-1 rounded-full px-4 py-3 text-[15px] font-bold transition-all duration-300 ${activeCategory === "support" ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]" : "text-primary/70 hover:bg-secondary/50"}`}
                        >
                            {t({ en: "Support", hi: "सहायता", or: "ସହଯୋଗ", bn: "সহায়তা", te: "మద్దతు", ta: "ஆதரவு", mr: "सहाय्य", gu: "સહાય" })}
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
                                        className="group flex min-h-[96px] items-center justify-between rounded-[24px] border border-princess-1 bg-card px-5 py-4 text-left shadow-[0_4px_16px_rgba(217,79,43,0.1)] transition-all duration-300 hover:-translate-y-1 hover:border-princess-4 hover:shadow-[0_8px_24px_rgba(217,79,43,0.2)] active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-princess-1/40 text-primary transition-colors duration-300 group-hover:bg-princess-2 group-hover:text-[color:var(--princess-5)]">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <p className="text-[15px] font-bold text-foreground">{item.label}</p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-princess-4" />
                                    </button>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <Card key={index} className="border-border bg-card p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded-lg " />
                                        <Skeleton className="h-4 w-36 " />
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
                {t({ en: "Voice", hi: "आवाज़", or: "ସ୍ୱର", bn: "ভয়েস", te: "వాయిస్", ta: "குரல்", mr: "आवाज", gu: "અવાજ" })}
            </button>
        </div>
    )
}
