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
    const { content, language } = useLanguage()
    const t = (copy: Record<string, string>) => copy[language] || copy.en
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
        { village: "Rampur", highRisk: 11, trend: t({ en: "+2 this week", hi: "इस सप्ताह +2", or: "ଏହି ସପ୍ତାହ +2", bn: "এই সপ্তাহে +২", te: "ఈ వారం +2", ta: "இந்த வாரம் +2", mr: "या आठवड्यात +2", gu: "આ અઠવાડિયે +2" }) },
        { village: "Sundarpur", highRisk: 8, trend: t({ en: "stable", hi: "स्थिर", or: "ସ୍ଥିର", bn: "স্থিতিশীল", te: "స్థిరంగా", ta: "நிலையாக", mr: "स्थिर", gu: "સ્થિર" }) },
        { village: "Nandgaon", highRisk: 6, trend: t({ en: "-1 this week", hi: "इस सप्ताह -1", or: "ଏହି ସପ୍ତାହ -1", bn: "এই সপ্তাহে -১", te: "ఈ వారం -1", ta: "இந்த வாரம் -1", mr: "या आठवड्यात -1", gu: "આ અઠવાડિયે -1" }) },
        { village: "Bhagatpur", highRisk: 5, trend: t({ en: "+1 this week", hi: "इस सप्ताह +1", or: "ଏହି ସପ୍ତାହ +1", bn: "এই সপ্তাহে +১", te: "ఈ వారం +1", ta: "இந்த வாரம் +1", mr: "या आठवड्यात +1", gu: "આ અઠવાડિયે +1" }) },
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
                    <h1 className="text-2xl font-bold">{t({ en: "Analytics Dashboard", hi: "विश्लेषण डैशबोर्ड", or: "ବିଶ୍ଳେଷଣ ଡ୍ୟାଶବୋର୍ଡ", bn: "অ্যানালিটিক্স ড্যাশবোর্ড", te: "విశ్లేషణ డ్యాష్‌బోర్డ్", ta: "பகுப்பாய்வு டாஷ்போர்டு", mr: "विश्लेषण डॅशबोर्ड", gu: "એનલિટિક્સ ડેશબોર્ડ" })}</h1>
                </div>
                <p className="text-white/90 leading-relaxed">{t({ en: "Track performance & impact metrics", hi: "प्रदर्शन और प्रभाव मीट्रिक ट्रैक करें", or: "କାର୍ଯ୍ୟଦକ୍ଷତା ଏବଂ ପ୍ରଭାବ ମାପକ ଟ୍ରାକ୍ କରନ୍ତୁ", bn: "পারফরম্যান্স ও প্রভাব সূচক ট্র্যাক করুন", te: "పనితీరు మరియు ప్రభావ సూచికలను ట్రాక్ చేయండి", ta: "செயல்திறன் மற்றும் தாக்க அளவுகோல்களை கண்காணிக்கவும்", mr: "कामगिरी आणि परिणाम मेट्रिक्स ट्रॅक करा", gu: "કાર્યક્ષમતા અને અસરના માપદંડ ટ્રૅક કરો" })}</p>
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
                                        <p className="text-foreground/70 text-sm leading-relaxed">{t({ en: "Total Patients", hi: "कुल मरीज", or: "ମୋଟ ରୋଗୀ", bn: "মোট রোগী", te: "మొత్తం రోగులు", ta: "மொத்த நோயாளிகள்", mr: "एकूण रुग्ण", gu: "કુલ દર્દીઓ" })}</p>
                                        <p className="text-3xl font-bold leading-relaxed">245</p>
                                    </div>
                                    <Users className="w-8 h-8 text-care" />
                                </div>
                            </Card>

                            <Card className="p-6 bg-gradient-to-br from-success/20 to-care/20 border-success/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-foreground/70 text-sm leading-relaxed">{t({ en: "High-Risk Cases", hi: "उच्च-जोखिम मामले", or: "ଉଚ୍ଚ ଜୋଖିମ କେସ୍", bn: "উচ্চ ঝুঁকির কেস", te: "అధిక ప్రమాద కేసులు", ta: "அதிக அபாய வழக்குகள்", mr: "उच्च-जोखीम प्रकरणे", gu: "ઉચ્ચ જોખમ કેસો" })}</p>
                                        <p className="text-3xl font-bold leading-relaxed">34</p>
                                    </div>
                                    <Activity className="w-8 h-8 text-success" />
                                </div>
                            </Card>

                            <Card className="p-6 bg-gradient-to-br from-trust/20 to-accent/20 border-trust/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-foreground/70 text-sm leading-relaxed">{t({ en: "Avg Completion Rate", hi: "औसत पूर्णता दर", or: "ସରାସରି ସମାପ୍ତି ହାର", bn: "গড় সম্পূর্ণতা হার", te: "సగటు పూర్తి రేటు", ta: "சராசரி நிறைவு விகிதம்", mr: "सरासरी पूर्णता दर", gu: "સરેરાશ પૂર્ણતા દર" })}</p>
                                        <p className="text-3xl font-bold leading-relaxed">91%</p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-trust" />
                                </div>
                            </Card>

                            <Card className="p-6 bg-gradient-to-br from-warning/20 to-accent/20 border-warning/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-foreground/70 text-sm leading-relaxed">{t({ en: "Team Rating", hi: "टीम रेटिंग", or: "ଟିମ୍ ମୂଲ୍ୟାୟନ", bn: "টিম রেটিং", te: "జట్టు రేటింగ్", ta: "அணி மதிப்பீடு", mr: "टीम रेटिंग", gu: "ટીમ રેટિંગ" })}</p>
                                        <p className="text-3xl font-bold leading-relaxed">4.6/5</p>
                                    </div>
                                    <Award className="w-8 h-8 text-warning" />
                                </div>
                            </Card>
                        </div>

                        {/* ASHA Performance */}
                        <h2 className="text-xl font-bold mb-4 leading-relaxed">{t({ en: "ASHA Worker Performance", hi: "आशा कार्यकर्ता प्रदर्शन", or: "ଆଶା କର୍ମୀ କାର୍ଯ୍ୟଦକ୍ଷତା", bn: "আশা কর্মীর পারফরম্যান্স", te: "ఆశా కార్యకర్త పనితీరు", ta: "ஆஷா பணியாளர் செயல்திறன்", mr: "आशा कार्यकर्ता कामगिरी", gu: "આશા કાર્યકર્તા પ્રદર્શન" })}</h2>
                        {metrics.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <TrendingUp className="w-12 h-12 text-primary/30 mb-4" />
                                <p className="text-lg font-semibold leading-relaxed">{t({ en: "No analytics data available", hi: "कोई विश्लेषण डेटा उपलब्ध नहीं", or: "କୌଣସି ବିଶ୍ଳେଷଣ ତଥ୍ୟ ଉପଲବ୍ଧ ନାହିଁ", bn: "কোনো অ্যানালিটিক্স ডেটা নেই", te: "విశ్లేషణ డేటా అందుబాటులో లేదు", ta: "பகுப்பாய்வு தரவு இல்லை", mr: "विश्लेषण डेटा उपलब्ध नाही", gu: "કોઈ એનાલિટિક્સ ડેટા ઉપલબ્ધ નથી" })}</p>
                                <p className="text-sm text-foreground/60 mt-2 leading-relaxed">{t({ en: "Metrics will appear as ASHA workers complete tasks", hi: "आशा कार्यकर्ता कार्य पूरा करेंगे तो मीट्रिक दिखेंगे", or: "ଆଶା କର୍ମୀ କାର୍ଯ୍ୟ ସମାପ୍ତ କଲେ ମାପକ ଦେଖିବେ", bn: "আশা কর্মীরা কাজ শেষ করলে মেট্রিক দেখা যাবে", te: "ఆశా కార్యకర్తలు పనులు పూర్తిచేస్తే సూచికలు కనిపిస్తాయి", ta: "ஆஷா பணியாளர்கள் பணிகளை முடிக்கும்போது அளவுகள் காணப்படும்", mr: "आशा कार्यकर्ते काम पूर्ण केल्यावर मेट्रिक्स दिसतील", gu: "આશા કાર્યકર્તાઓ કાર્યો પૂર્ણ કરે ત્યારે મેટ્રિક્સ દેખાશે" })}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {metrics.map((asha) => (
                                    <Card key={asha.ashaId} className="p-6 hover:shadow-lg transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold leading-relaxed">{asha.ashaName}</h3>
                                                <p className="text-sm text-foreground/60 leading-relaxed">{t({ en: "ASHA ID", hi: "आशा आईडी", or: "ଆଶା ଆଇଡି", bn: "আশা আইডি", te: "ఆశా ఐడి", ta: "ஆஷா ஐடி", mr: "आशा आयडी", gu: "આશા આઈડી" })}: {asha.ashaId}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-accent leading-relaxed">⭐ {asha.averageRating}</div>
                                                <p className="text-xs text-foreground/60 leading-relaxed">{t({ en: "Rating", hi: "रेटिंग", or: "ମୂଲ୍ୟାୟନ", bn: "রেটিং", te: "రేటింగ్", ta: "மதிப்பீடு", mr: "रेटिंग", gu: "રેટિંગ" })}</p>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-4 gap-4 mb-4">
                                            <div>
                                                <p className="text-xs text-foreground/60 leading-relaxed">{t({ en: "Patients", hi: "मरीज", or: "ରୋଗୀ", bn: "রোগী", te: "రోగులు", ta: "நோயாளிகள்", mr: "रुग्ण", gu: "દર્દીઓ" })}</p>
                                                <p className="text-2xl font-bold leading-relaxed">{asha.patientsManaged}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-foreground/60 leading-relaxed">{t({ en: "Tasks Done", hi: "पूर्ण कार्य", or: "ସମାପ୍ତ କାର୍ଯ୍ୟ", bn: "সম্পন্ন কাজ", te: "పూర్తి చేసిన పనులు", ta: "முடித்த பணிகள்", mr: "पूर्ण कार्ये", gu: "પૂર્ણ કરેલા કાર્યો" })}</p>
                                                <p className="text-2xl font-bold leading-relaxed">{asha.tasksCompleted}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-foreground/60 leading-relaxed">{t({ en: "Completion Rate", hi: "पूर्णता दर", or: "ସମାପ୍ତି ହାର", bn: "সম্পূর্ণতা হার", te: "పూర్తి రేటు", ta: "நிறைவு விகிதம்", mr: "पूर्णता दर", gu: "પૂર્ણતા દર" })}</p>
                                                <p className="text-2xl font-bold text-success leading-relaxed">
                                                    {asha.taskCompletionRate}%
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-foreground/60 leading-relaxed">{t({ en: "High-Risk IDs", hi: "उच्च-जोखिम पहचान", or: "ଉଚ୍ଚ ଜୋଖିମ ପରିଚୟ", bn: "উচ্চ ঝুঁকি শনাক্ত", te: "అధిక ప్రమాద గుర్తింపులు", ta: "அதிக அபாய அடையாளங்கள்", mr: "उच्च-जोखीम ओळख", gu: "ઉચ્ચ જોખમ ઓળખ" })}</p>
                                                <p className="text-2xl font-bold text-warning leading-relaxed">
                                                    {asha.highRiskIdentifications}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mb-3">
                                            <div className="flex justify-between text-xs mb-1 leading-relaxed">
                                                <span>{t({ en: "Completion Progress", hi: "पूर्णता प्रगति", or: "ସମାପ୍ତି ପ୍ରଗତି", bn: "সম্পূর্ণতা অগ্রগতি", te: "పూర్తి ప్రగతి", ta: "நிறைவு முன்னேற்றம்", mr: "पूर्णता प्रगती", gu: "પૂર્ણતા પ્રગતિ" })}</span>
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
                                                title: t({ en: "📊 Detailed Report", hi: "📊 विस्तृत रिपोर्ट", or: "📊 ବିସ୍ତୃତ ରିପୋର୍ଟ", bn: "📊 বিস্তারিত রিপোর্ট", te: "📊 వివరణాత్మక నివేదిక", ta: "📊 விரிவான அறிக்கை", mr: "📊 सविस्तर अहवाल", gu: "📊 વિગતવાર અહેવાલ" }),
                                                description: `${asha.ashaName} ${t({ en: "full performance report loading...", hi: "का पूर्ण प्रदर्शन रिपोर्ट लोड हो रहा है...", or: "ଙ୍କ ପୂର୍ଣ୍ଣ କାର୍ଯ୍ୟଦକ୍ଷତା ରିପୋର୍ଟ ଲୋଡ୍ ହେଉଛି...", bn: "এর পূর্ণ পারফরম্যান্স রিপোর্ট লোড হচ্ছে...", te: "పూర్తి పనితీరు నివేదిక లోడ్ అవుతోంది...", ta: "முழு செயல்திறன் அறிக்கை ஏற்றப்படுகிறது...", mr: "चा संपूर्ण कामगिरी अहवाल लोड होत आहे...", gu: "નો સંપૂર્ણ પ્રદર્શન અહેવાલ લોડ થઈ રહ્યો છે..." })}`,
                                            })}
                                        >
                                            {t({ en: "View Detailed Report", hi: "विस्तृत रिपोर्ट देखें", or: "ବିସ୍ତୃତ ରିପୋର୍ଟ ଦେଖନ୍ତୁ", bn: "বিস্তারিত রিপোর্ট দেখুন", te: "వివరమైన నివేదిక చూడండి", ta: "விரிவான அறிக்கையை பார்க்கவும்", mr: "सविस्तर अहवाल पहा", gu: "વિગતવાર અહેવાલ જુઓ" })}
                                        </Button>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Cohort Funnel */}
                        <Card className="p-6 mt-8 border-trust/25 bg-trust/5">
                            <h2 className="text-lg font-bold mb-4">{t({ en: "Maternal Care Funnel", hi: "मातृ देखभाल फ़नल", or: "ମାତୃ ସେବା ଫାନେଲ୍", bn: "মাতৃসেবা ফানেল", te: "మాతృ సంరక్షణ ఫన్నెల్", ta: "தாய் பராமரிப்பு சுரங்கம்", mr: "मातृ काळजी फनेल", gu: "માતૃત્વ કાળજી ફનલ" })}</h2>
                            <div className="grid md:grid-cols-4 gap-3">
                                <div className="rounded-lg bg-background p-3 border">
                                    <p className="text-xs text-muted-foreground">{t({ en: "Registered", hi: "पंजीकृत", or: "ନିବନ୍ଧିତ", bn: "নিবন্ধিত", te: "నమోదైన", ta: "பதிவுசெய்யப்பட்டது", mr: "नोंदणीकृत", gu: "નોંધાયેલા" })}</p>
                                    <p className="text-2xl font-bold">{funnel.registered}</p>
                                </div>
                                <div className="rounded-lg bg-background p-3 border">
                                    <p className="text-xs text-muted-foreground">{t({ en: "ANC Completed", hi: "एएनसी पूर्ण", or: "ANC ସମ୍ପୂର୍ଣ୍ଣ", bn: "ANC সম্পন্ন", te: "ANC పూర్తి", ta: "ANC முடிந்தது", mr: "ANC पूर्ण", gu: "ANC પૂર્ણ" })}</p>
                                    <p className="text-2xl font-bold">{funnel.ancCompleted}</p>
                                </div>
                                <div className="rounded-lg bg-background p-3 border">
                                    <p className="text-xs text-muted-foreground">{t({ en: "Institutional Delivery", hi: "संस्थागत प्रसव", or: "ସଂସ୍ଥାଗତ ପ୍ରସବ", bn: "প্রাতিষ্ঠানিক প্রসব", te: "సంస్థాగత ప్రసవం", ta: "நிறுவனப் பிரசவம்", mr: "संस्थात्मक प्रसूती", gu: "સંસ્થાગત પ્રસવ" })}</p>
                                    <p className="text-2xl font-bold">{funnel.institutionalDelivery}</p>
                                </div>
                                <div className="rounded-lg bg-background p-3 border">
                                    <p className="text-xs text-muted-foreground">{t({ en: "PNC Completed", hi: "पीएनसी पूर्ण", or: "PNC ସମ୍ପୂର୍ଣ୍ଣ", bn: "PNC সম্পন্ন", te: "PNC పూర్తి", ta: "PNC முடிந்தது", mr: "PNC पूर्ण", gu: "PNC પૂર્ણ" })}</p>
                                    <p className="text-2xl font-bold">{funnel.pncCompleted}</p>
                                </div>
                            </div>
                        </Card>

                        {/* High-Risk Village Heatmap */}
                        <Card className="p-6 mt-6 border-warning/25 bg-warning/5">
                            <h2 className="text-lg font-bold mb-4">{t({ en: "High-Risk Village Heatmap", hi: "उच्च-जोखिम गांव हीटमैप", or: "ଉଚ୍ଚ ଜୋଖିମ ଗ୍ରାମ ହିଟ୍ମ୍ୟାପ୍", bn: "উচ্চ ঝুঁকির গ্রাম হিটম্যাপ", te: "అధిక ప్రమాద గ్రామ హీట్‌మ్యాప్", ta: "அதிக அபாய கிராம ஹீட்மேப்", mr: "उच्च-जोखीम गाव हिटमॅप", gu: "ઉચ્ચ જોખમ ગામ હીટમેપ" })}</h2>
                            <div className="space-y-2">
                                {villageHeatmap.map((row) => (
                                    <div key={row.village} className="flex items-center justify-between rounded-lg border bg-background p-3">
                                        <div>
                                            <p className="font-medium text-sm">{row.village}</p>
                                            <p className="text-xs text-muted-foreground">{row.trend}</p>
                                        </div>
                                        <span className="rounded-full bg-alert/10 px-3 py-1 text-xs font-semibold text-alert">
                                            {row.highRisk} {t({ en: "high-risk", hi: "उच्च-जोखिम", or: "ଉଚ୍ଚ ଜୋଖିମ", bn: "উচ্চ ঝুঁকি", te: "అధిక ప్రమాద", ta: "அதிக அபாய", mr: "उच्च-जोखीम", gu: "ઉચ્ચ જોખમ" })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Intervention Effectiveness */}
                        <Card className="p-6 mt-6 border-success/25 bg-success/5">
                            <h2 className="text-lg font-bold mb-4">{t({ en: "Intervention Effectiveness", hi: "हस्तक्षेप प्रभावशीलता", or: "ହସ୍ତକ୍ଷେପ କାର୍ଯ୍ୟକାରିତା", bn: "হস্তক্ষেপ কার্যকারিতা", te: "హస్తక్షేప ప్రభావం", ta: "இடையீட்டு செயல்திறன்", mr: "हस्तक्षेप परिणामकारकता", gu: "હસ્તક્ષેપ અસરકારકતા" })}</h2>
                            <div className="grid md:grid-cols-3 gap-3">
                                <div className="rounded-lg border bg-background p-3">
                                    <p className="text-xs text-muted-foreground">{t({ en: "Follow-up Closure Rate", hi: "फॉलो-अप क्लोजर दर", or: "ଅନୁସରଣ ସମାପ୍ତି ହାର", bn: "ফলো-আপ ক্লোজার হার", te: "ఫాలో-అప్ క్లోజర్ రేటు", ta: "பின்தொடர்பு நிறைவு விகிதம்", mr: "फॉलो-अप क्लोजर दर", gu: "ફોલો-અપ ક્લોઝર દર" })}</p>
                                    <p className="text-2xl font-bold text-success">88%</p>
                                </div>
                                <div className="rounded-lg border bg-background p-3">
                                    <p className="text-xs text-muted-foreground">{t({ en: "Danger Sign Escalation in < 2h", hi: "2 घंटे से कम में खतरे के संकेत एस्केलेशन", or: "2 ଘଣ୍ଟାରୁ କମ ସମୟରେ ବିପଦ ସଙ୍କେତ ଏସ୍କାଲେସନ୍", bn: "২ ঘণ্টার কমে বিপদ সংকেত এস্কেলেশন", te: "2 గంటలలోపు డేంజర్ సైన్ ఎస్కలేషన్", ta: "2 மணிநேரத்திற்குள் ஆபத்து அறிகுறி உயர்த்தல்", mr: "2 तासांपेक्षा कमी वेळेत धोक्याच्या चिन्हांचे एस्कलेशन", gu: "2 કલાકથી ઓછામાં જોખમી સંકેત એસ્કલેશન" })}</p>
                                    <p className="text-2xl font-bold text-trust">79%</p>
                                </div>
                                <div className="rounded-lg border bg-background p-3">
                                    <p className="text-xs text-muted-foreground">{t({ en: "Missed ANC Recovery", hi: "छूटा ANC रिकवरी", or: "ଛାଡ଼ାଯାଇଥିବା ANC ପୁନରୁଦ୍ଧାର", bn: "মিসড ANC পুনরুদ্ধার", te: "మిస్ అయిన ANC రికవరీ", ta: "தவறிய ANC மீட்பு", mr: "मिस झालेल्या ANC पुनर्प्राप्ती", gu: "છૂટેલ ANC પુનઃપ્રાપ્તિ" })}</p>
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
