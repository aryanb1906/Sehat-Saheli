"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"

interface Task {
    id: string
    patientId: string
    taskType: string
    description: string
    dueDate: string
    status: "pending" | "in-progress" | "completed"
    priority: "low" | "medium" | "high"
    location?: string
    notes?: string
}

interface AutomationPlanItem {
    id: string
    patientId: string
    patientName: string
    village: string
    taskType: string
    description: string
    dueDate: string
    priority: "low" | "medium" | "high"
    patientRisk: "low" | "medium" | "high"
    score: number
    reasons: string[]
}

interface AutomationPlanResponse {
    success: boolean
    stats: {
        totalPending: number
        highRiskInTodayPlan: number
        remindersGenerated: number
        escalationsGenerated: number
    }
    todayPlan: AutomationPlanItem[]
    reminders: Array<{ message: string }>
    escalations: Array<{ reason: string; action: string }>
}

export default function ASHATaskManagement() {
    const router = useRouter()
    const { content, language } = useLanguage()
    const { toast } = useToast()
    const t = (copy: Record<string, string>) => copy[language] || copy.en
    const [tasks, setTasks] = useState<Task[]>([])
    const [filter, setFilter] = useState("all")
    const [loading, setLoading] = useState(true)
    const [automationLoading, setAutomationLoading] = useState(false)
    const [automationPlan, setAutomationPlan] = useState<AutomationPlanResponse | null>(null)

    useEffect(() => {
        fetchTasks()
    }, [])

    const fetchTasks = async () => {
        try {
            const response = await fetch("/api/asha-tasks")
            const data = await response.json()
            setTasks(data.tasks)
        } catch (error) {
            console.error("Failed to fetch tasks:", error)
        } finally {
            setLoading(false)
        }
    }

    const updateTaskStatus = async (taskId: string, status: string) => {
        try {
            await fetch("/api/asha-tasks", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    taskId,
                    status,
                    completedAt: new Date().toISOString(),
                }),
            })

            toast({
                title: t({ en: "✅ Task Updated", hi: "✅ कार्य अपडेट हुआ", or: "✅ କାର୍ଯ୍ୟ ଅଦ୍ୟତନ", bn: "✅ কাজ আপডেট হয়েছে", te: "✅ పని నవీకరించబడింది", ta: "✅ பணி புதுப்பிக்கப்பட்டது", mr: "✅ कार्य अद्यतन झाले", gu: "✅ કાર્ય અપડેટ થયું" }),
                description: `${t({ en: "Task marked as", hi: "कार्य चिह्नित", or: "କାର୍ଯ୍ୟ ଚିହ୍ନିତ", bn: "কাজ চিহ্নিত", te: "పని గుర్తించబడింది", ta: "பணி குறிக்கப்பட்டது", mr: "कार्य म्हणून चिन्हांकित", gu: "કાર્ય તરીકે ચિહ୍ନିତ" })} ${status === "completed" ? t({ en: "completed", hi: "पूर्ण", or: "ସମ୍ପୂର୍ଣ୍ଣ", bn: "সম্পন্ন", te: "పూర్తి", ta: "முடிந்தது", mr: "पूर्ण", gu: "પૂર્ણ" }) : status === "in-progress" ? t({ en: "in progress", hi: "प्रगति में", or: "ପ୍ରଗତିରେ", bn: "চলমান", te: "ప్రగతిలో", ta: "நடைமுறையில்", mr: "प्रगतीत", gu: "પ્રગતિમાં" }) : t({ en: "pending", hi: "लंबित", or: "ବକେୟା", bn: "অপেক্ষমাণ", te: "పెండింగ్", ta: "நிலுவை", mr: "प्रलंबित", gu: "બાકી" })}`,
            })

            fetchTasks()
        } catch (error) {
            console.error("Failed to update task:", error)
            toast({
                title: t({ en: "Error", hi: "त्रुटि", or: "ତ୍ରୁଟି", bn: "ত্রুটি", te: "లోపం", ta: "பிழை", mr: "त्रुटी", gu: "ભૂલ" }),
                description: t({ en: "Failed to update task. Please try again.", hi: "कार्य अपडेट नहीं हुआ। फिर प्रयास करें।", or: "କାର୍ଯ୍ୟ ଅଦ୍ୟତନ ବିଫଳ। ପୁନଃ ଚେଷ୍ଟା କରନ୍ତୁ।", bn: "কাজ আপডেট ব্যর্থ। আবার চেষ্টা করুন।", te: "పని అప్డేట్ కాలేదు. మళ్లీ ప్రయత్నించండి.", ta: "பணி புதுப்பிக்க தோல்வி. மீண்டும் முயற்சிக்கவும்.", mr: "कार्य अद्यतन अयशस्वी. पुन्हा प्रयत्न करा.", gu: "કાર્ય અપડેટ નિષ્ફળ. ફરી પ્રયત્ન કરો." }),
                variant: "destructive",
            })
        }
    }

    const generateAutomationPlan = async () => {
        setAutomationLoading(true)
        try {
            const response = await fetch("/api/asha-tasks/automation-plan")
            const data = await response.json()
            setAutomationPlan(data)

            toast({
                title: t({ en: "✅ Daily Plan Generated", hi: "✅ दैनिक योजना तैयार", or: "✅ ଦୈନିକ ଯୋଜନା ତିଆରି", bn: "✅ দৈনিক পরিকল্পনা তৈরি", te: "✅ దినసరి ప్రణాళిక రూపొందింది", ta: "✅ தின திட்டம் உருவாக்கப்பட்டது", mr: "✅ दैनिक योजना तयार", gu: "✅ દૈનિક યોજના તૈયાર" }),
                description: `${t({ en: "Prioritized", hi: "प्राथमिकता दी", or: "ପ୍ରାଥମିକତା ଦିଆଗଲା", bn: "অগ্রাধিকার দেয়া হয়েছে", te: "ప్రాధాన్య క్రమంలో", ta: "முன்னுரிமையிட்ட", mr: "प्राधान्य दिले", gu: "પ્રાથમિકતા આપેલ" })} ${data?.todayPlan?.length || 0} ${t({ en: "tasks with", hi: "कार्य और", or: "କାର୍ଯ୍ୟ ସହ", bn: "কাজ এবং", te: "పనులు మరియు", ta: "பணிகள் மற்றும்", mr: "कार्यांसह", gu: "કાર્યો સાથે" })} ${data?.stats?.remindersGenerated || 0} ${t({ en: "reminders", hi: "रिमाइंडर", or: "ସ୍ମୃତିପତ୍ର", bn: "রিমাইন্ডার", te: "రిమైండర్లు", ta: "நினைவூட்டல்கள்", mr: "स्मरणपत्रे", gu: "રિમાઇન્ડર્સ" })}`,
            })
        } catch (error) {
            console.error("Failed to generate automation plan:", error)
            toast({
                title: t({ en: "Error", hi: "त्रुटि", or: "ତ୍ରୁଟି", bn: "ত্রুটি", te: "లోపం", ta: "பிழை", mr: "त्रुटी", gu: "ભૂલ" }),
                description: t({ en: "Unable to generate automation plan right now.", hi: "अभी ऑटोमेशन योजना बनाना संभव नहीं।", or: "ଏବେ ଅଟୋମେସନ୍ ଯୋଜନା ସୃଷ୍ଟି ସମ୍ଭବ ନୁହେଁ।", bn: "এখন অটোমেশন পরিকল্পনা তৈরি করা যাচ্ছে না।", te: "ఇప్పుడే ఆటోమేషన్ ప్లాన్ సృష్టించలేము.", ta: "இப்போது ஆட்டோமேஷன் திட்டம் உருவாக்க முடியவில்லை.", mr: "आत्ता ऑटोमेशन योजना तयार करता येत नाही.", gu: "હાલમાં ઓટોમેશન યોજના બનાવી શકાતી નથી." }),
                variant: "destructive",
            })
        } finally {
            setAutomationLoading(false)
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-alert/20 text-alert border-alert/30"
            case "medium":
                return "bg-warning/20 text-warning border-warning/30"
            default:
                return "bg-gray-100 text-gray-700 border-gray-200"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle2 className="w-5 h-5 text-success" />
            case "in-progress":
                return <Clock className="w-5 h-5 text-warning" />
            default:
                return <AlertCircle className="w-5 h-5 text-foreground/50" />
        }
    }

    const getFilterLabel = (value: string) => {
        switch (value) {
            case "all":
                return t({ en: "All", hi: "सभी", or: "ସବୁ", bn: "সব", te: "అన్నీ", ta: "அனைத்தும்", mr: "सर्व", gu: "બધા" })
            case "pending":
                return t({ en: "Pending", hi: "लंबित", or: "ବକେୟା", bn: "অপেক্ষমাণ", te: "పెండింగ్", ta: "நிலுவை", mr: "प्रलंबित", gu: "બાકી" })
            case "in-progress":
                return t({ en: "In Progress", hi: "प्रगति में", or: "ପ୍ରଗତିରେ", bn: "চলমান", te: "ప్రగతిలో", ta: "நடைமுறையில்", mr: "प्रगतीत", gu: "પ્રગતિમાં" })
            case "completed":
                return t({ en: "Completed", hi: "पूर्ण", or: "ସମ୍ପୂର୍ଣ୍ଣ", bn: "সম্পন্ন", te: "పూర్తి", ta: "முடிந்தது", mr: "पूर्ण", gu: "પૂર્ણ" })
            default:
                return value.replace("-", " ")
        }
    }

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case "high":
                return t({ en: "High", hi: "उच्च", or: "ଉଚ୍ଚ", bn: "উচ্চ", te: "అధిక", ta: "உயர்", mr: "उच्च", gu: "ઉચ્ચ" })
            case "medium":
                return t({ en: "Medium", hi: "मध्यम", or: "ମଧ୍ୟମ", bn: "মাঝারি", te: "మధ్యస్థ", ta: "நடுத்தரம்", mr: "मध्यम", gu: "મધ્યમ" })
            default:
                return t({ en: "Low", hi: "निम्न", or: "ନିମ୍ନ", bn: "নিম্ন", te: "తక్కువ", ta: "குறைவு", mr: "कमी", gu: "નીચું" })
        }
    }

    const filteredTasks = tasks.filter((t) => filter === "all" || t.status === filter)

    const stats = {
        pending: tasks.filter((t) => t.status === "pending").length,
        inProgress: tasks.filter((t) => t.status === "in-progress").length,
        completed: tasks.filter((t) => t.status === "completed").length,
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-trust/10 to-background">
            <div className="bg-gradient-to-r from-trust to-accent p-6 text-white sticky top-0 z-50">
                <div className="flex items-center gap-4 mb-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold">{t({ en: "Task Management", hi: "कार्य प्रबंधन", or: "କାର୍ଯ୍ୟ ପରିଚାଳନା", bn: "কাজ ব্যবস্থাপনা", te: "పని నిర్వహణ", ta: "பணி மேலாண்மை", mr: "कार्य व्यवस्थापन", gu: "કાર્ય વ્યવસ્થાપન" })}</h1>
                </div>
            </div>

            <div className="p-6 max-w-4xl mx-auto">
                {loading ? (
                    <div className="grid md:grid-cols-4 gap-4 mb-6">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i} className="p-4 text-center">
                                <Skeleton className="h-8 w-16 mx-auto mb-3" />
                                <Skeleton className="h-4 w-full" />
                            </Card>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid md:grid-cols-4 gap-4 mb-6">
                            <Card className="p-4 text-center">
                                <p className="text-3xl font-bold text-warning leading-relaxed">{stats.pending}</p>
                                <p className="text-sm text-foreground/60 leading-relaxed">{t({ en: "Pending Tasks", hi: "लंबित कार्य", or: "ବକେୟା କାର୍ଯ୍ୟ", bn: "অপেক্ষমাণ কাজ", te: "పెండింగ్ పనులు", ta: "நிலுவை பணிகள்", mr: "प्रलंबित कार्ये", gu: "બાકી કાર્યો" })}</p>
                            </Card>
                            <Card className="p-4 text-center">
                                <p className="text-3xl font-bold text-blue-600 leading-relaxed">{stats.inProgress}</p>
                                <p className="text-sm text-foreground/60 leading-relaxed">{t({ en: "In Progress", hi: "प्रगति में", or: "ପ୍ରଗତିରେ", bn: "চলমান", te: "ప్రగతిలో", ta: "நடைமுறையில்", mr: "प्रगतीत", gu: "પ્રગતિમાં" })}</p>
                            </Card>
                            <Card className="p-4 text-center">
                                <p className="text-3xl font-bold text-success leading-relaxed">{stats.completed}</p>
                                <p className="text-sm text-foreground/60 leading-relaxed">{t({ en: "Completed", hi: "पूर्ण", or: "ସମ୍ପୂର୍ଣ୍ଣ", bn: "সম্পন্ন", te: "పూర్తి", ta: "முடிந்தது", mr: "पूर्ण", gu: "પૂર્ણ" })}</p>
                            </Card>
                            <Card className="p-4 text-center">
                                <p className="text-3xl font-bold text-accent leading-relaxed">
                                    {tasks.length > 0 ? Math.round((stats.completed / tasks.length) * 100) : 0}%
                                </p>
                                <p className="text-sm text-foreground/60 leading-relaxed">{t({ en: "Completion", hi: "पूर्णता", or: "ସମାପ୍ତି", bn: "সম্পূর্ণতা", te: "పూర్తి", ta: "முடிவு", mr: "पूर्णता", gu: "પૂર્ણતા" })}</p>
                            </Card>
                        </div>
                    </>
                )}

                {/* Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {["all", "pending", "in-progress", "completed"].map((f) => (
                        <Button
                            key={f}
                            variant={filter === f ? "default" : "outline"}
                            onClick={() => setFilter(f)}
                            className="capitalize whitespace-nowrap h-10"
                        >
                            {getFilterLabel(f)}
                        </Button>
                    ))}
                </div>

                {/* Add Task Button */}
                <div className="mb-6 flex flex-wrap items-center gap-3">
                    <Button className="bg-trust text-white h-11">
                        <Plus className="w-4 h-4 mr-2" />
                        {t({ en: "Add New Task", hi: "नया कार्य जोड़ें", or: "ନୂତନ କାର୍ଯ୍ୟ ଯୋଡନ୍ତୁ", bn: "নতুন কাজ যোগ করুন", te: "కొత్త పని జోడించండి", ta: "புதிய பணியைச் சேர்க்கவும்", mr: "नवीन कार्य जोडा", gu: "નવું કાર્ય ઉમેરો" })}
                    </Button>
                    <Button
                        variant="outline"
                        className="h-11"
                        disabled={automationLoading}
                        onClick={generateAutomationPlan}
                    >
                        {automationLoading
                            ? t({ en: "Generating plan...", hi: "योजना बन रही है...", or: "ଯୋଜନା ସୃଷ୍ଟି ହେଉଛି...", bn: "পরিকল্পনা তৈরি হচ্ছে...", te: "ప్రణాళిక రూపొందుతోంది...", ta: "திட்டம் உருவாகிறது...", mr: "योजना तयार होत आहे...", gu: "યોજના બની રહી છે..." })
                            : t({ en: "Generate Today Plan", hi: "आज की योजना बनाएं", or: "ଆଜିର ଯୋଜନା ସୃଷ୍ଟି କରନ୍ତୁ", bn: "আজকের পরিকল্পনা তৈরি করুন", te: "ఈరోజు ప్రణాళిక రూపొందించండి", ta: "இன்றைய திட்டத்தை உருவாக்கவும்", mr: "आजची योजना तयार करा", gu: "આજની યોજના બનાવો" })}
                    </Button>
                </div>

                {automationPlan?.success && (
                    <Card className="p-4 mb-6 border-trust/25 bg-trust/5">
                        <h3 className="font-semibold text-base mb-3">{t({ en: "Automation Engine Output", hi: "ऑटोमेशन इंजन आउटपुट", or: "ଅଟୋମେସନ୍ ଇଞ୍ଜିନ୍ ଆଉଟପୁଟ୍", bn: "অটোমেশন ইঞ্জিন আউটপুট", te: "ఆటోమేషన్ ఇంజిన్ అవుట్‌పుట్", ta: "ஆட்டோமேஷன் இயந்திர வெளியீடு", mr: "ऑटोमेशन इंजिन आउटपुट", gu: "ઓટોમેશન એન્જિન આઉટપુટ" })}</h3>
                        <div className="grid md:grid-cols-4 gap-3 mb-4">
                            <div>
                                <p className="text-2xl font-bold text-trust">{automationPlan.stats.totalPending}</p>
                                <p className="text-xs text-foreground/70">{t({ en: "Pending Tasks", hi: "लंबित कार्य", or: "ବକେୟା କାର୍ଯ୍ୟ", bn: "অপেক্ষমাণ কাজ", te: "పెండింగ్ పనులు", ta: "நிலுவை பணிகள்", mr: "प्रलंबित कार्ये", gu: "બાકી કાર્યો" })}</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-alert">{automationPlan.stats.highRiskInTodayPlan}</p>
                                <p className="text-xs text-foreground/70">{t({ en: "High-Risk in Plan", hi: "योजना में उच्च-जोखिम", or: "ଯୋଜନାରେ ଉଚ୍ଚ ଜୋଖିମ", bn: "পরিকল্পনায় উচ্চ ঝুঁকি", te: "ప్రణాళికలో అధిక ప్రమాదం", ta: "திட்டத்தில் அதிக அபாயம்", mr: "योजनेतील उच्च-जोखीम", gu: "યોજનામાં ઊંચું જોખમ" })}</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-600">{automationPlan.stats.remindersGenerated}</p>
                                <p className="text-xs text-foreground/70">{t({ en: "Smart Reminders", hi: "स्मार्ट रिमाइंडर", or: "ସ୍ମାର୍ଟ ସ୍ମୃତିପତ୍ର", bn: "স্মার্ট রিমাইন্ডার", te: "స్మార్ట్ రిమైండర్లు", ta: "ஸ்மார்ட் நினைவூட்டல்கள்", mr: "स्मार्ट स्मरणपत्रे", gu: "સ્માર્ટ રિમાઇન્ડર્સ" })}</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-warning">{automationPlan.stats.escalationsGenerated}</p>
                                <p className="text-xs text-foreground/70">{t({ en: "Escalations", hi: "एस्केलेशन", or: "ଏସ୍କାଲେସନ୍", bn: "এস্কেলেশন", te: "ఎస్కలేషన్లు", ta: "உயர்த்தல்கள்", mr: "एस्कलेशन्स", gu: "એસ્કલેશન્સ" })}</p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <p className="text-sm font-semibold">{t({ en: "Top Visits for Today", hi: "आज के शीर्ष दौरे", or: "ଆଜିର ଶୀର୍ଷ ଭିଜିଟ୍", bn: "আজকের শীর্ষ ভিজিট", te: "ఈరోజు అగ్ర సందర్శనలు", ta: "இன்றைய முக்கிய வருகைகள்", mr: "आजच्या शीर्ष भेटी", gu: "આજની ટોચની મુલાકાતો" })}</p>
                            {automationPlan.todayPlan.slice(0, 4).map((item) => (
                                <div key={item.id} className="rounded-lg border bg-background px-3 py-2">
                                    <p className="text-sm font-medium">{item.patientName} - {item.description}</p>
                                    <p className="text-xs text-foreground/70">
                                        {item.village} | {t({ en: "Due", hi: "नियत", or: "ନିର୍ଦ୍ଧାରିତ", bn: "নির্ধারিত", te: "గడువు", ta: "காலக்கெடு", mr: "देय", gu: "નિયત" })} {new Date(item.dueDate).toLocaleDateString()} | {t({ en: "Score", hi: "स्कोर", or: "ସ୍କୋର", bn: "স্কোর", te: "స్కోర్", ta: "மதிப்பெண்", mr: "स्कोअर", gu: "સ્કોર" })} {item.score}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {automationPlan.escalations.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-warning">{t({ en: "Escalation Alerts", hi: "एस्केलेशन अलर्ट", or: "ଏସ୍କାଲେସନ୍ ସଚେତନ", bn: "এস্কেলেশন সতর্কতা", te: "ఎస్కలేషన్ అలర్ట్లు", ta: "உயர்த்தல் எச்சரிக்கைகள்", mr: "एस्कलेशन अलर्ट्स", gu: "એસ્કલેશન એલર્ટ્સ" })}</p>
                                {automationPlan.escalations.slice(0, 2).map((item, index) => (
                                    <p key={index} className="text-xs text-foreground/75">
                                        • {item.reason} - {item.action}
                                    </p>
                                ))}
                            </div>
                        )}
                    </Card>
                )}

                {/* Tasks List */}
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i} className="p-4">
                                <Skeleton className="h-6 w-32 mb-3" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-10 w-24" />
                            </Card>
                        ))}
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <AlertCircle className="w-12 h-12 text-primary/30 mb-4" />
                        <p className="text-lg font-semibold leading-relaxed">{t({ en: "No tasks found", hi: "कोई कार्य नहीं मिला", or: "କୌଣସି କାର୍ଯ୍ୟ ମିଳିଲା ନାହିଁ", bn: "কোনো কাজ পাওয়া যায়নি", te: "పనులు కనబడలేదు", ta: "பணிகள் இல்லை", mr: "कार्य सापडले नाही", gu: "કોઈ કાર્ય મળ્યું નથી" })}</p>
                        <p className="text-sm text-foreground/60 mt-2 leading-relaxed">{t({ en: "All tasks completed or filtered out", hi: "सभी कार्य पूर्ण हैं या फ़िल्टर हुए हैं", or: "ସମସ୍ତ କାର୍ଯ୍ୟ ସମ୍ପୂର୍ଣ୍ଣ କିମ୍ବା ଫିଲ୍ଟର ହୋଇଛି", bn: "সব কাজ সম্পন্ন বা ফিল্টার করা হয়েছে", te: "అన్ని పనులు పూర్తయ్యాయి లేదా ఫిల్టర్ అయ్యాయి", ta: "அனைத்து பணிகளும் முடிந்தது அல்லது வடிகட்டப்பட்டது", mr: "सर्व कार्य पूर्ण किंवा फिल्टर झाले", gu: "બધા કાર્યો પૂર્ણ થયા અથવા ફિલ્ટર થયા" })}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredTasks.map((task) => (
                            <Card key={task.id} className="p-4 hover:shadow-lg transition-shadow">
                                <div className="flex items-start gap-4">
                                    {getStatusIcon(task.status)}

                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-semibold leading-relaxed">{task.description}</h3>
                                                <p className="text-sm text-foreground/60 capitalize leading-relaxed">
                                                    {task.taskType.replace("-", " ")}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                                                {getPriorityLabel(task.priority)}
                                            </span>
                                        </div>

                                        {task.location && (
                                            <p className="text-xs text-foreground/60 mb-2 leading-relaxed">📍 {task.location}</p>
                                        )}

                                        <p className="text-xs text-foreground/60 mb-3 leading-relaxed">
                                            {t({ en: "Due", hi: "नियत", or: "ନିର୍ଦ୍ଧାରିତ", bn: "নির্ধারিত", te: "గడువు", ta: "காலக்கெடு", mr: "देय", gu: "નિયત" })}: {new Date(task.dueDate).toLocaleDateString()}
                                        </p>

                                        {task.status === "pending" && (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-10"
                                                    onClick={() => updateTaskStatus(task.id, "in-progress")}
                                                >
                                                    {t({ en: "Start Task", hi: "कार्य शुरू करें", or: "କାର୍ଯ୍ୟ ଆରମ୍ଭ କରନ୍ତୁ", bn: "কাজ শুরু করুন", te: "పని ప్రారంభించండి", ta: "பணியை தொடங்கவும்", mr: "कार्य सुरू करा", gu: "કાર્ય શરૂ કરો" })}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-10"
                                                    onClick={() => updateTaskStatus(task.id, "completed")}
                                                >
                                                    {t({ en: "Mark Complete", hi: "पूर्ण चिह्नित करें", or: "ସମ୍ପୂର୍ଣ୍ଣ ଚିହ୍ନିତ କରନ୍ତୁ", bn: "সম্পন্ন চিহ্নিত করুন", te: "పూర్తిగా గుర్తించండి", ta: "முடிந்ததாக குறிக்கவும்", mr: "पूर्ण म्हणून चिन्हांकित करा", gu: "પૂર્ણ તરીકે ચિહ્નિત કરો" })}
                                                </Button>
                                            </div>
                                        )}

                                        {task.status === "in-progress" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-10"
                                                onClick={() => updateTaskStatus(task.id, "completed")}
                                            >
                                                {t({ en: "Mark Complete", hi: "पूर्ण चिह्नित करें", or: "ସମ୍ପୂର୍ଣ୍ଣ ଚିହ୍ନିତ କରନ୍ତୁ", bn: "সম্পন্ন চিহ্নিত করুন", te: "పూర్తిగా గుర్తించండి", ta: "முடிந்ததாக குறிக்கவும்", mr: "पूर्ण म्हणून चिन्हांकित करा", gu: "પૂર્ણ તરીકે ચિહ્નિત કરો" })}
                                            </Button>
                                        )}
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
