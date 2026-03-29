"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, TrendingUp, Users, Activity, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

interface Patient {
  id: string
  name: string
  risk: "Low" | "Medium" | "High"
  hemoglobin: number
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { content, language } = useLanguage()
  const t = (copy: Record<string, string>) => copy[language] || copy.en
  const [patients, setPatients] = useState<Patient[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/asha-patients")
        const data = await res.json()
        setPatients(data.patients || [])
      } catch (error) {
        console.error("Failed to load analytics data", error)
      }
    }

    load()
  }, [])

  const riskData = useMemo(() => [
    {
      name: content.lowRisk || "Low Risk",
      value: patients.filter((p) => p.risk === "Low").length,
      color: "#10b981",
    },
    {
      name: content.mediumRisk || "Medium Risk",
      value: patients.filter((p) => p.risk === "Medium").length,
      color: "#f59e0b",
    },
    {
      name: content.highRisk || "High Risk",
      value: patients.filter((p) => p.risk === "High").length,
      color: "#ef4444",
    },
  ], [content.highRisk, content.lowRisk, content.mediumRisk, patients])

  const weeklyData = [
    { week: t({ en: "Week 1", hi: "सप्ताह 1", or: "ସପ୍ତାହ 1", bn: "সপ্তাহ ১", te: "వారం 1", ta: "வாரம் 1", mr: "आठवडा 1", gu: "અઠવાડિયું 1" }), checkups: 8 },
    { week: t({ en: "Week 2", hi: "सप्ताह 2", or: "ସପ୍ତାହ 2", bn: "সপ্তাহ ২", te: "వారం 2", ta: "வாரம் 2", mr: "आठवडा 2", gu: "અઠવાડિયું 2" }), checkups: 12 },
    { week: t({ en: "Week 3", hi: "सप्ताह 3", or: "ସପ୍ତାହ 3", bn: "সপ্তাহ ৩", te: "వారం 3", ta: "வாரம் 3", mr: "आठवडा 3", gu: "અઠવાડિયું 3" }), checkups: 10 },
    { week: t({ en: "Week 4", hi: "सप्ताह 4", or: "ସପ୍ତାହ 4", bn: "সপ্তাহ ৪", te: "వారం 4", ta: "வாரம் 4", mr: "आठवडा 4", gu: "અઠવાડિયું 4" }), checkups: 15 },
  ]

  const hemoglobinData = patients.map((p) => ({
    name: p.name.split(" ")[0],
    hemoglobin: p.hemoglobin,
  }))

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-trust to-accent p-6 text-white">
        <Button variant="ghost" size="icon" className="text-white mb-4" onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-3xl font-bold">{content.analyticsDashboard || t({ en: "Analytics Dashboard", hi: "विश्लेषण डैशबोर्ड", or: "ବିଶ୍ଳେଷଣ ଡ୍ୟାଶବୋର୍ଡ", bn: "অ্যানালিটিক্স ড্যাশবোর্ড", te: "విశ్లేషణ డ్యాష్‌బోర్డ్", ta: "பகுப்பாய்வு டாஷ்போர்டு", mr: "विश्लेषण डॅशबोर्ड", gu: "એનલિટિક્સ ડેશબોર્ડ" })}</h1>
        <p className="text-white/90">{content.healthInsights || t({ en: "Health insights and trends", hi: "स्वास्थ्य अंतर्दृष्टि और रुझान", or: "ସ୍ୱାସ୍ଥ୍ୟ ଅନ୍ତର୍ଦୃଷ୍ଟି ଏବଂ ପ୍ରବଣତା", bn: "স্বাস্থ্য অন্তর্দৃষ্টি ও প্রবণতা", te: "ఆరోగ్య అవగాహనలు మరియు ధోరణులు", ta: "ஆரோக்கிய பார்வைகள் மற்றும் போக்குகள்", mr: "आरोग्य अंतर्दृष्टी आणि ट्रेंड्स", gu: "આરોગ્ય જાણકારી અને વલણો" })}</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-trust" />
              <div>
                <p className="text-2xl font-bold">{patients.length}</p>
                <p className="text-xs text-muted-foreground">{content.totalPatients || t({ en: "Total Patients", hi: "कुल मरीज", or: "ମୋଟ ରୋଗୀ", bn: "মোট রোগী", te: "మొత్తం రోగులు", ta: "மொத்த நோயாளிகள்", mr: "एकूण रुग्ण", gu: "કુલ દર્દીઓ" })}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{patients.length * 3}</p>
                <p className="text-xs text-muted-foreground">{content.checkupsMonth || t({ en: "Checkups/Month", hi: "जांच/माह", or: "ପରୀକ୍ଷା/ମାସ", bn: "চেকআপ/মাস", te: "చెక్‌అప్స్/నెల", ta: "சோதனைகள்/மாதம்", mr: "तपासणी/महिना", gu: "ચેકઅપ્સ/મહિનો" })}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{patients.length ? Math.round((patients.filter((p) => p.risk !== "High").length / patients.length) * 100) : 0}%</p>
                <p className="text-xs text-muted-foreground">{content.followUpRate || t({ en: "Follow-up Rate", hi: "फॉलो-अप दर", or: "ଅନୁସରଣ ହାର", bn: "ফলো-আপ হার", te: "ఫాలో-అప్ రేటు", ta: "பின்தொடர்பு விகிதம்", mr: "फॉलो-अप दर", gu: "ફોલો-અપ દર" })}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-care" />
              <div>
                <p className="text-2xl font-bold">{Math.max(1, Math.round(patients.length / 2))}</p>
                <p className="text-xs text-muted-foreground">{content.thisWeek || t({ en: "This Week", hi: "इस सप्ताह", or: "ଏହି ସପ୍ତାହ", bn: "এই সপ্তাহ", te: "ఈ వారం", ta: "இந்த வாரம்", mr: "या आठवड्यात", gu: "આ અઠવાડિયે" })}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">{content.riskDistribution || t({ en: "Risk Distribution", hi: "जोखिम वितरण", or: "ଜୋଖିମ ବଣ୍ଟନ", bn: "ঝুঁকি বণ্টন", te: "ప్రమాద పంపిణి", ta: "அபாய விநியோகம்", mr: "जोखीम वितरण", gu: "જોખમ વિતરણ" })}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={riskData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">{content.weeklyCheckups || t({ en: "Weekly Checkups", hi: "साप्ताहिक जांच", or: "ସାପ୍ତାହିକ ପରୀକ୍ଷା", bn: "সাপ্তাহিক চেকআপ", te: "వారాంత చెక్‌అప్స్", ta: "வாராந்திர சோதனைகள்", mr: "साप्ताहिक तपासण्या", gu: "સાપ્તાહિક ચેકઅપ્સ" })}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="checkups" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">{content.hemoglobinLevels || t({ en: "Hemoglobin Levels", hi: "हीमोग्लोबिन स्तर", or: "ହିମୋଗ୍ଲୋବିନ ସ୍ତର", bn: "হিমোগ্লোবিন মাত্রা", te: "హీమోగ్లోబిన్ స్థాయిలు", ta: "ஹீமோகுளோபின் நிலைகள்", mr: "हिमोग्लोबिन पातळी", gu: "હિમોગ્લોબિન સ્તર" })}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hemoglobinData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 15]} />
              <Tooltip />
              <Bar dataKey="hemoglobin" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-muted-foreground mt-2">
            {content.normalRange || t({ en: "Normal range", hi: "सामान्य सीमा", or: "ସାଧାରଣ ସୀମା", bn: "স্বাভাবিক সীমা", te: "సాధారణ పరిధి", ta: "சாதாரண வரம்பு", mr: "सामान्य श्रेणी", gu: "સામાન્ય શ્રેણી" })}: 11-14 g/dL {content.duringPregnancy || t({ en: "during pregnancy", hi: "गर्भावस्था के दौरान", or: "ଗର୍ଭାବସ୍ଥାରେ", bn: "গর্ভাবস্থায়", te: "గర్భధారణ సమయంలో", ta: "கர்ப்பகாலத்தில்", mr: "गर्भावस्थेदरम्यान", gu: "ગર્ભાવસ્થા દરમિયાન" })}
          </p>
        </Card>
      </div>
    </div>
  )
}
