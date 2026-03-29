"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Activity, Heart, Thermometer, Pill, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"

interface HealthEntry {
  date: string
  type: "checkup" | "symptom" | "medication"
  title: string
  description: string
  status: "normal" | "warning" | "alert"
}

export default function HealthLog() {
  const router = useRouter()
  const { content, language } = useLanguage()
  const { toast } = useToast()
  const t = (copy: Record<string, string>) => copy[language] || copy.en
  const [entries, setEntries] = useState<HealthEntry[]>([
    {
      date: "2025-01-10",
      type: "checkup",
      title: t({ en: "Regular Checkup", hi: "नियमित जांच", or: "ନିୟମିତ ଚେକଅପ", bn: "নিয়মিত চেকআপ", te: "నియమిత పరీక్ష", ta: "வழக்கமான பரிசோதனை", mr: "नियमित तपासणी", gu: "નિયમિત ચેકઅપ" }),
      description: t({ en: "Blood pressure: 120/80, Weight: 65kg", hi: "ब्लड प्रेशर: 120/80, वजन: 65kg", or: "ରକ୍ତଚାପ: 120/80, ଓଜନ: 65kg", bn: "রক্তচাপ: 120/80, ওজন: 65kg", te: "రక్తపోటు: 120/80, బరువు: 65kg", ta: "இரத்த அழுத்தம்: 120/80, எடை: 65kg", mr: "रक्तदाब: 120/80, वजन: 65kg", gu: "બ્લડ પ્રેશર: 120/80, વજન: 65kg" }),
      status: "normal",
    },
    {
      date: "2025-01-08",
      type: "symptom",
      title: t({ en: "Mild Headache", hi: "हल्का सिरदर्द", or: "ହାଲୁକା ମୁଣ୍ଡବେଥା", bn: "মৃদু মাথাব্যথা", te: "స్వల్ప తలనొప్పి", ta: "லேசான தலைவலி", mr: "हलका डोकेदुखी", gu: "હળવો માથાનો દુખાવો" }),
      description: t({ en: "Headache in the morning, resolved after rest", hi: "सुबह सिरदर्द था, आराम के बाद ठीक", or: "ସକାଳେ ମୁଣ୍ଡବେଥା, ବିଶ୍ରାମ ପରେ ଠିକ୍", bn: "সকালে মাথাব্যথা ছিল, বিশ্রামের পর ঠিক", te: "ఉదయం తలనొప్పి, విశ్రాంతి తర్వాత తగ్గింది", ta: "காலை தலைவலி, ஓய்வுக்குப் பின் சரியானது", mr: "सकाळी डोकेदुखी, विश्रांतीनंतर बरे", gu: "સવારે માથાનો દુખાવો, આરામ પછી સારું" }),
      status: "warning",
    },
    {
      date: "2025-01-05",
      type: "medication",
      title: t({ en: "Prenatal Vitamins", hi: "प्रेनेटल विटामिन", or: "ଗର୍ଭପୂର୍ବ ଭିଟାମିନ୍", bn: "প্রিনেটাল ভিটামিন", te: "ప్రెనేటల్ విటమిన్లు", ta: "கர்ப்ப கால விட்டமின்கள்", mr: "प्रेनेटल व्हिटॅमिन्स", gu: "પ્રેનેટલ વિટામિન" }),
      description: t({ en: "Taking daily folic acid supplement", hi: "दैनिक फोलिक एसिड सप्लीमेंट ले रही हैं", or: "ପ୍ରତିଦିନ ଫୋଲିକ୍ ଏସିଡ୍ ସପ୍ଲିମେଣ୍ଟ ନେଉଛନ୍ତି", bn: "প্রতিদিন ফলিক অ্যাসিড সাপ্লিমেন্ট নিচ্ছেন", te: "రోజూ ఫోలిక్ యాసిడ్ సప్లిమెంట్ తీసుకుంటున్నారు", ta: "தினமும் ஃபோலிக் அமிலச் சேர்க்கை எடுத்துக்கொள்கிறீர்கள்", mr: "दररोज फॉलिक अॅसिड सप्लिमेंट घेत आहात", gu: "દરરોજ ફોલિક એસિડ સપ્લિમેન્ટ લઈ રહ્યા છો" }),
      status: "normal",
    },
  ])

  const typeLabel: Record<HealthEntry["type"], string> = {
    checkup: t({ en: "Checkup", hi: "जांच", or: "ଚେକଅପ", bn: "চেকআপ", te: "పరీక్ష", ta: "பரிசோதனை", mr: "तपासणी", gu: "ચેકઅપ" }),
    symptom: t({ en: "Symptom", hi: "लक्षण", or: "ଲକ୍ଷଣ", bn: "উপসর্গ", te: "లక్షణం", ta: "அறிகுறி", mr: "लक्षण", gu: "લક્ષણ" }),
    medication: t({ en: "Medication", hi: "दवा", or: "ଔଷଧ", bn: "ওষুধ", te: "ఔషధం", ta: "மருந்து", mr: "औषध", gu: "દવા" }),
  }

  const handleDelete = (index: number) => {
    if (confirm(`${content.deleteEntry}?`)) {
      setEntries(entries.filter((_, i) => i !== index))
      toast({
        title: content.deletedSuccessfully,
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "alert":
        return "border-alert bg-alert/10"
      case "warning":
        return "border-warning bg-warning/10"
      default:
        return "border-success bg-success/10"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "checkup":
        return <Activity className="w-5 h-5" />
      case "symptom":
        return <Thermometer className="w-5 h-5" />
      case "medication":
        return <Pill className="w-5 h-5" />
      default:
        return <Heart className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-princess-1/20 via-white to-princess-1/10 pb-10">
      {/* Header */}
      <div className="mx-auto mt-4 w-full max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-r from-princess-4 to-primary p-6 text-white shadow-lg shadow-princess-4/20 border border-white/20">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white hover:bg-white/20 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{content.healthLogTitle}</h1>
            <p className="text-white/80 text-sm">{content.myHealthLogSubtitle || t({ en: "Track your health journey", hi: "अपने स्वास्थ्य सफर को ट्रैक करें", or: "ଆପଣଙ୍କ ସ୍ୱାସ୍ଥ୍ୟ ଯାତ୍ରାକୁ ଟ୍ରାକ୍ କରନ୍ତୁ", bn: "আপনার স্বাস্থ্য যাত্রা ট্র্যাক করুন", te: "మీ ఆరోగ్య ప్రయాణాన్ని ట్రాక్ చేయండి", ta: "உங்கள் உடல்நல பயணத்தை கண்காணிக்கவும்", mr: "तुमचा आरोग्य प्रवास ट्रॅक करा", gu: "તમારી આરોગ્ય યાત્રાને ટ્રેક કરો" })}</p>
          </div>
          <Button
            onClick={() => router.push("/mother/health-log/add")}
            size="icon"
            className="bg-white text-success hover:bg-white/90"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Entries */}
      <div className="mx-auto mt-5 w-full max-w-5xl px-4 space-y-4">
        {entries.length === 0 ? (
          <Card className="p-8 text-center border-border bg-card shadow-sm">
            <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">{content.noEntries}</p>
            <Button onClick={() => router.push("/mother/health-log/add")} className="bg-success">
              <Plus className="w-4 h-4 mr-2" />
              {content.addEntry}
            </Button>
          </Card>
        ) : (
          entries.map((entry, index) => (
            <Card key={index} className={`rounded-2xl border p-5 shadow-sm ${getStatusColor(entry.status)}`}>
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background/70 border border-border/60">{getTypeIcon(entry.type)}</div>
                <div className="flex-1">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-lg leading-tight">{entry.title}</h3>
                      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{typeLabel[entry.type]}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                        {new Date(entry.date).toLocaleDateString("en-IN")}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-alert"
                        onClick={() => handleDelete(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 text-sm text-muted-foreground leading-relaxed">
                    {entry.description}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
