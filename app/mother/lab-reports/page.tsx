"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, Eye, Calendar, AlertCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"

interface LabReport {
    id: string
    date: string
    testType: string
    results: Record<string, string | number>
    status: "normal" | "alert" | "critical"
    doctorNotes?: string
    imageUrl?: string
}

export default function LabReportsPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { content, language } = useLanguage()
    const t = (copy: Record<string, string>) => copy[language] || copy.en
    const [reports, setReports] = useState<LabReport[]>([])
    const [selectedReport, setSelectedReport] = useState<LabReport | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchReports()
    }, [])

    const fetchReports = async () => {
        try {
            const response = await fetch("/api/lab-reports")
            const data = await response.json()
            setReports(data.reports || [])
        } catch (error) {
            console.error("Failed to fetch reports:", error)
            toast({
                title: t({ en: "Error loading lab reports", hi: "लैब रिपोर्ट लोड करने में त्रुटि", or: "ଲ୍ୟାବ୍ ରିପୋର୍ଟ ଲୋଡ୍ କରିବାରେ ତ୍ରୁଟି", bn: "ল্যাব রিপোর্ট লোড করতে ত্রুটি", te: "ల్యాబ్ రిపోర్ట్‌లను లోడ్ చేయడంలో లోపం", ta: "லாப் அறிக்கைகள் ஏற்றுவதில் பிழை", mr: "लॅब अहवाल लोड करताना त्रुटी", gu: "લેબ રિપોર્ટ લોડ કરતી વખતે ભૂલ" }),
                description: t({ en: "Please check your connection and try again.", hi: "कृपया अपना कनेक्शन जांचें और फिर प्रयास करें।", or: "ଦୟାକରି ସଂଯୋଗ ଯାଞ୍ଚ କରି ପୁନି ଚେଷ୍ଟା କରନ୍ତୁ।", bn: "অনুগ্রহ করে সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।", te: "దయచేసి కనెక్షన్ తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.", ta: "தயவுசெய்து இணைப்பை சரிபார்த்து மீண்டும் முயற்சிக்கவும்.", mr: "कृपया कनेक्शन तपासा आणि पुन्हा प्रयत्न करा.", gu: "કૃપા કરીને કનેક્શન તપાસી ફરી પ્રયાસ કરો." }),
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "critical":
                return "bg-alert/20 text-alert border-alert/30"
            case "alert":
                return "bg-warning/20 text-warning border-warning/30"
            default:
                return "bg-success/20 text-success border-success/30"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "critical":
                return <AlertCircle className="w-5 h-5 text-alert" />
            case "alert":
                return <AlertCircle className="w-5 h-5 text-warning" />
            default:
                return <Check className="w-5 h-5 text-success" />
        }
    }

    const getTestTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            blood: t({ en: "🩸 Blood Test", hi: "🩸 रक्त जांच", or: "🩸 ରକ୍ତ ପରୀକ୍ଷା", bn: "🩸 রক্ত পরীক্ষা", te: "🩸 రక్త పరీక్ష", ta: "🩸 இரத்த பரிசோதனை", mr: "🩸 रक्त चाचणी", gu: "🩸 રક્ત પરીક્ષણ" }),
            ultrasound: t({ en: "📊 Ultrasound", hi: "📊 अल्ट्रासाउंड", or: "📊 ଅଲ୍ଟ୍ରାସାଉଣ୍ଡ", bn: "📊 আল্ট্রাসাউন্ড", te: "📊 అల్ట్రాసౌండ్", ta: "📊 அல்ட்ராசவுண்ட்", mr: "📊 अल्ट्रासाऊंड", gu: "📊 અલ્ટ્રાસાઉન્ડ" }),
            urine: t({ en: "💧 Urine Test", hi: "💧 मूत्र जांच", or: "💧 ମୁତ୍ର ପରୀକ୍ଷା", bn: "💧 প্রস্রাব পরীক্ষা", te: "💧 మూత్ర పరీక్ష", ta: "💧 சிறுநீர் பரிசோதனை", mr: "💧 मूत्र चाचणी", gu: "💧 મૂત્ર પરીક્ષણ" }),
        }
        return labels[type] || type
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-princess-1/20 via-white to-princess-1/10 pb-10">
            {/* Header */}
            <div className="mx-3 mt-4 overflow-hidden rounded-3xl bg-gradient-to-r from-princess-4 to-primary p-5 text-white sticky top-4 z-30 shadow-lg shadow-princess-4/20 border border-white/20 md:mx-6 2xl:mx-auto 2xl:max-w-7xl">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold">{t({ en: "Lab Reports & Test Results", hi: "लैब रिपोर्ट और टेस्ट परिणाम", or: "ଲ୍ୟାବ୍ ରିପୋର୍ଟ ଏବଂ ପରୀକ୍ଷା ଫଳ", bn: "ল্যাব রিপোর্ট ও টেস্ট ফলাফল", te: "ల్యాబ్ రిపోర్టులు మరియు పరీక్ష ఫలితాలు", ta: "லாப் அறிக்கைகள் மற்றும் பரிசோதனை முடிவுகள்", mr: "लॅब अहवाल आणि चाचणी निकाल", gu: "લેબ રિપોર્ટ અને ટેસ્ટ પરિણામ" })}</h1>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 max-w-4xl mx-auto">
                {/* Upload New Report */}
                <Card className="mb-6 p-6 border-dashed border-2 border-trust/30 bg-trust/5">
                    <div className="text-center">
                        <p className="text-foreground/70 mb-3 leading-relaxed">
                            {t({ en: "📁 Upload your lab reports and ultrasound images here", hi: "📁 अपनी लैब रिपोर्ट और अल्ट्रासाउंड छवियां यहां अपलोड करें", or: "📁 ଆପଣଙ୍କ ଲ୍ୟାବ୍ ରିପୋର୍ଟ ଏବଂ ଅଲ୍ଟ୍ରାସାଉଣ୍ଡ ଛବି ଏଠାରେ ଅପଲୋଡ୍ କରନ୍ତୁ", bn: "📁 আপনার ল্যাব রিপোর্ট ও আল্ট্রাসাউন্ড ছবি এখানে আপলোড করুন", te: "📁 మీ ల్యాబ్ రిపోర్టులు మరియు అల్ట్రాసౌండ్ చిత్రాలను ఇక్కడ అప్‌లోడ్ చేయండి", ta: "📁 உங்கள் லாப் அறிக்கைகள் மற்றும் அல்ட்ராசவுண்ட் படங்களை இங்கே பதிவேற்றவும்", mr: "📁 तुमचे लॅब अहवाल आणि अल्ट्रासाऊंड प्रतिमा येथे अपलोड करा", gu: "📁 તમારી લેબ રિપોર્ટ અને અલ્ટ્રાસાઉન્ડ છબીઓ અહીં અપલોડ કરો" })}
                        </p>
                        <Button className="bg-trust text-white h-11" onClick={() => toast({
                            title: t({ en: "Upload feature coming soon", hi: "अपलोड सुविधा जल्द आ रही है", or: "ଅପଲୋଡ୍ ସୁବିଧା ଶୀଘ୍ର ଆସୁଛି", bn: "আপলোড ফিচার শীঘ্রই আসছে", te: "అప్‌లోడ్ ఫీచర్ త్వరలో వస్తుంది", ta: "பதிவேற்ற வசதி விரைவில் வருகிறது", mr: "अपलोड सुविधा लवकरच येत आहे", gu: "અપલોડ સુવિધા ટૂંક સમયમાં આવી રહી છે" }),
                            description: t({ en: "You'll be able to upload reports directly.", hi: "आप सीधे रिपोर्ट अपलोड कर पाएंगी।", or: "ଆପଣ ସିଧାସଳଖ ରିପୋର୍ଟ ଅପଲୋଡ୍ କରିପାରିବେ।", bn: "আপনি সরাসরি রিপোর্ট আপলোড করতে পারবেন।", te: "మీరు నేరుగా రిపోర్ట్‌లను అప్‌లోడ్ చేయగలరు.", ta: "நீங்கள் நேரடியாக அறிக்கைகளை பதிவேற்ற முடியும்.", mr: "तुम्ही थेट अहवाल अपलोड करू शकाल.", gu: "તમે સીધી રીતે રિપોર્ટ અપલોડ કરી શકશો." })
                        })}>
                            {t({ en: "Upload Report", hi: "रिपोर्ट अपलोड करें", or: "ରିପୋର୍ଟ ଅପଲୋଡ୍ କରନ୍ତୁ", bn: "রিপোর্ট আপলোড করুন", te: "రిపోర్ట్ అప్‌లోడ్ చేయండి", ta: "அறிக்கையை பதிவேற்றவும்", mr: "अहवाल अपलोड करा", gu: "રિપોર્ટ અપલોડ કરો" })}
                        </Button>
                    </div>
                </Card>

                {/* Reports Timeline - Loading State */}
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i} className="p-6">
                                <div className="space-y-4">
                                    <Skeleton className="h-6 w-1/3" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <div className="grid grid-cols-4 gap-3">
                                        {[...Array(4)].map((_, j) => (
                                            <Skeleton key={j} className="h-12 w-full" />
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : !reports || reports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <AlertCircle className="w-12 h-12 text-trust/30 mb-4" />
                        <p className="text-lg font-semibold text-foreground/80">{t({ en: "No lab reports yet", hi: "अभी कोई लैब रिपोर्ट नहीं", or: "ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଲ୍ୟାବ୍ ରିପୋର୍ଟ ନାହିଁ", bn: "এখনও কোনও ল্যাব রিপোর্ট নেই", te: "ఇంకా ల్యాబ్ రిపోర్టులు లేవు", ta: "இன்னும் லாப் அறிக்கைகள் இல்லை", mr: "अजून लॅब अहवाल नाहीत", gu: "હજુ સુધી લેબ રિપોર્ટ નથી" })}</p>
                        <p className="text-sm text-foreground/60 mt-2 leading-relaxed">{t({ en: "Start uploading your test results to track your health", hi: "अपने स्वास्थ्य को ट्रैक करने के लिए टेस्ट परिणाम अपलोड करें", or: "ସ୍ୱାସ୍ଥ୍ୟ ଟ୍ରାକ୍ ପାଇଁ ପରୀକ୍ଷା ଫଳ ଅପଲୋଡ୍ କରିବା ଆରମ୍ଭ କରନ୍ତୁ", bn: "স্বাস্থ্য ট্র্যাক করতে টেস্ট ফল আপলোড শুরু করুন", te: "ఆరోగ్యాన్ని ట్రాక్ చేయడానికి పరీక్ష ఫలితాలు అప్‌లోడ్ చేయండి", ta: "உங்கள் உடல்நலத்தை கண்காணிக்க பரிசோதனை முடிவுகளை பதிவேற்றத் தொடங்குங்கள்", mr: "आरोग्य ट्रॅक करण्यासाठी चाचणी निकाल अपलोड करा", gu: "તમારું આરોગ્ય ટ્રેક કરવા માટે ટેસ્ટ પરિણામો અપલોડ કરવાનું શરૂ કરો" })}</p>
                        <Button variant="outline" className="mt-4 h-11" onClick={() => toast({
                            title: t({ en: "Upload your first report", hi: "अपनी पहली रिपोर्ट अपलोड करें", or: "ଆପଣଙ୍କ ପ୍ରଥମ ରିପୋର୍ଟ ଅପଲୋଡ୍ କରନ୍ତୁ", bn: "আপনার প্রথম রিপোর্ট আপলোড করুন", te: "మీ మొదటి రిపోర్ట్ అప్‌లోడ్ చేయండి", ta: "உங்கள் முதல் அறிக்கையை பதிவேற்றவும்", mr: "तुमचा पहिला अहवाल अपलोड करा", gu: "તમારો પ્રથમ રિપોર્ટ અપલોડ કરો" }),
                            description: t({ en: "Lab reports help track your pregnancy health.", hi: "लैब रिपोर्ट आपकी गर्भावस्था स्वास्थ्य ट्रैक करने में मदद करती हैं।", or: "ଲ୍ୟାବ୍ ରିପୋର୍ଟ ଆପଣଙ୍କ ଗର୍ଭାବସ୍ଥା ସ୍ୱାସ୍ଥ୍ୟ ଟ୍ରାକ୍ କରିବାରେ ସହାୟକ।", bn: "ল্যাব রিপোর্ট আপনার গর্ভকালীন স্বাস্থ্য ট্র্যাক করতে সহায়ক।", te: "ల్యాబ్ రిపోర్టులు గర్భధారణ ఆరోగ్యాన్ని ట్రాక్ చేయడంలో సహాయపడతాయి.", ta: "லாப் அறிக்கைகள் உங்கள் கர்ப்பகால உடல்நலத்தை கண்காணிக்க உதவும்.", mr: "लॅब अहवाल गर्भधारणेचे आरोग्य ट्रॅक करण्यास मदत करतात.", gu: "લેબ રિપોર્ટ ગર્ભાવસ્થાના આરોગ્યને ટ્રેક કરવામાં મદદ કરે છે." })
                        })}>
                            {t({ en: "Upload First Report", hi: "पहली रिपोर्ट अपलोड करें", or: "ପ୍ରଥମ ରିପୋର୍ଟ ଅପଲୋଡ୍ କରନ୍ତୁ", bn: "প্রথম রিপোর্ট আপলোড করুন", te: "మొదటి రిపోర్ట్ అప్‌లోడ్ చేయండి", ta: "முதல் அறிக்கையை பதிவேற்றவும்", mr: "पहिला अहवाल अपलोड करा", gu: "પ્રથમ રિપોર્ટ અપલોડ કરો" })}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reports?.map((report) => (
                            <Card
                                key={report.id}
                                className={`p-6 cursor-pointer hover:shadow-lg transition-all border ${getStatusColor(
                                    report.status
                                )}`}
                                onClick={() => setSelectedReport(report)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            {getStatusIcon(report.status)}
                                            <span className="font-semibold leading-relaxed">{getTestTypeLabel(report.testType)}</span>
                                        </div>
                                        <p className="text-sm text-foreground/60 flex items-center gap-2 leading-relaxed">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(report.date).toLocaleDateString("en-IN", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                                report.status
                                            )}`}
                                        >
                                            {report.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {/* Quick Results Preview */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {Object.entries(report.results)
                                        .slice(0, 4)
                                        .map(([key, value]: [string, any]) => (
                                            <div key={key} className="bg-white/50 rounded p-2">
                                                <p className="text-xs text-foreground/60 capitalize leading-relaxed">{key}</p>
                                                <p className="text-sm font-semibold leading-relaxed">{String(value)}</p>
                                            </div>
                                        ))}
                                </div>

                                {report.doctorNotes && (
                                    <p className="text-sm mt-3 p-3 bg-blue-50 rounded text-foreground/80 leading-relaxed">
                                        💬 {report.doctorNotes}
                                    </p>
                                )}

                                <div className="flex gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-10"
                                        onClick={() => setSelectedReport(report)}
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        View Details
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-10" onClick={() => toast({
                                        title: t({ en: "✅ Downloaded", hi: "✅ डाउनलोड हुआ", or: "✅ ଡାଉନଲୋଡ୍ ହେଲା", bn: "✅ ডাউনলোড হয়েছে", te: "✅ డౌన్‌లోడ్ అయ్యింది", ta: "✅ பதிவிறக்கம் முடிந்தது", mr: "✅ डाउनलोड झाले", gu: "✅ ડાઉનલોડ થયું" }),
                                        description: `${report.testType} ${t({ en: "report downloaded successfully.", hi: "रिपोर्ट सफलतापूर्वक डाउनलोड हुई।", or: "ରିପୋର୍ଟ ସଫଳତାର ସହ ଡାଉନଲୋଡ୍ ହେଲା।", bn: "রিপোর্ট সফলভাবে ডাউনলোড হয়েছে।", te: "రిపోర్ట్ విజయవంతంగా డౌన్‌లోడ్ అయింది.", ta: "அறிக்கை வெற்றிகரமாக பதிவிறக்கம் செய்யப்பட்டது.", mr: "अहवाल यशस्वीरित्या डाउनलोड झाला.", gu: "રિપોર્ટ સફળતાપૂર્વક ડાઉનલોડ થયો." })}`
                                    })}>
                                        <Download className="w-4 h-4 mr-1" />
                                        {t({ en: "Download", hi: "डाउनलोड", or: "ଡାଉନଲୋଡ୍", bn: "ডাউনলোড", te: "డౌన్‌లోడ్", ta: "பதிவிறக்கம்", mr: "डाउनलोड", gu: "ડાઉનલોડ" })}
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Report Detail Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-2xl w-full max-h-96 overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">
                                    {getTestTypeLabel(selectedReport.testType)}
                                </h2>
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedReport(null)}
                                >
                                    {t({ en: "Close", hi: "बंद करें", or: "ବନ୍ଦ", bn: "বন্ধ", te: "మూసివేయి", ta: "மூடு", mr: "बंद", gu: "બંધ કરો" })}
                                </Button>
                            </div>

                            <div className="mb-6">
                                <p className="text-sm text-foreground/60 mb-2">{t({ en: "Test Date", hi: "जांच तिथि", or: "ପରୀକ୍ଷା ତାରିଖ", bn: "পরীক্ষার তারিখ", te: "పరీక్ష తేదీ", ta: "சோதனை தேதி", mr: "चाचणी तारीख", gu: "પરીક્ષણ તારીખ" })}</p>
                                <p className="text-lg font-semibold">{selectedReport.date}</p>
                            </div>

                            <div className="mb-6">
                                <p className="text-sm text-foreground/60 mb-3">{t({ en: "Results", hi: "परिणाम", or: "ଫଳାଫଳ", bn: "ফলাফল", te: "ఫలితాలు", ta: "முடிவுகள்", mr: "निकाल", gu: "પરિણામો" })}</p>
                                <div className="space-y-2 leading-relaxed">
                                    {Object.entries(selectedReport.results).map(([key, value]) => (
                                        <div
                                            key={key}
                                            className="flex justify-between p-3 bg-gray-50 rounded"
                                        >
                                            <span className="font-medium capitalize">{key}</span>
                                            <span className="text-foreground/70">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedReport.doctorNotes && (
                                <div className="mb-6">
                                    <p className="text-sm text-foreground/60 mb-2">Doctor Notes</p>
                                    <p className="p-4 bg-blue-50 rounded text-foreground">
                                        {selectedReport.doctorNotes}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button className="flex-1 bg-trust text-white h-11" onClick={() => toast({
                                    title: "Shared with Doctor",
                                    description: "Your lab report has been shared."
                                })}>
                                    Share with Doctor
                                </Button>
                                <Button variant="outline" className="flex-1 h-11" onClick={() => toast({
                                    title: "Downloaded PDF",
                                    description: "Lab report downloaded as PDF."
                                })}>
                                    Download PDF
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
