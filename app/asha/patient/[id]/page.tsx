"use client"

import { use } from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Phone, Calendar, FileText, AlertTriangle, TrendingUp, Heart, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/language-context"

interface Patient {
  id: string
  name: string
  age: number
  weeks: number
  risk: "Low" | "Medium" | "High"
  lastCheckup: string
  phone: string
  village: string
  bloodPressure: string
  hemoglobin: number
  weight: number
  symptoms: string[]
  mentalHealthScore: number
}

interface HealthLog {
  id: string
  patientId: string
  date: string
  symptoms: string[]
  mood: string
  notes: string
}

interface Appointment {
  id: string
  date: string
  time: string
  type: string
  location: string
  status: "upcoming" | "completed" | "cancelled"
}

export default function PatientDetail({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const { id } = unwrappedParams
  const router = useRouter()
  const { content, language } = useLanguage()
  const t = (copy: Record<string, string>) => copy[language] || copy.en
  const [patient, setPatient] = useState<Patient | null>(null)
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/asha-patients/${id}`)
        const data = await res.json()
        if (data?.success) {
          setPatient(data.patient)
          setHealthLogs(data.healthLogs || [])
          setAppointments(data.appointments || [])
        }
      } catch (error) {
        console.error("Failed to load patient details", error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <p className="text-lg">{t({ en: "Loading patient details...", hi: "रोगी विवरण लोड हो रहा है...", or: "ରୋଗୀ ବିବରଣୀ ଲୋଡ୍ ହେଉଛି...", bn: "রোগীর তথ্য লোড হচ্ছে...", te: "రోగి వివరాలు లోడ్ అవుతున్నాయి...", ta: "நோயாளி விவரங்கள் ஏற்றப்படுகிறது...", mr: "रुग्णाची माहिती लोड होत आहे...", gu: "દર્દીની વિગતો લોડ થઈ રહી છે..." })}</p>
        </Card>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <p className="text-lg">{content.patientNotFound || t({ en: "Patient not found", hi: "रोगी नहीं मिला", or: "ରୋଗୀ ମିଳିଲା ନାହିଁ", bn: "রোগী পাওয়া যায়নি", te: "రోగి కనబడలేదు", ta: "நோயாளி கிடைக்கவில்லை", mr: "रुग्ण आढळला नाही", gu: "દર્દી મળ્યો નથી" })}</p>
          <Button onClick={() => router.back()} className="mt-4">
            {content.goBack || t({ en: "Go Back", hi: "वापस जाएँ", or: "ପଛକୁ ଯାଆନ୍ତୁ", bn: "ফিরে যান", te: "వెనక్కి వెళ్లండి", ta: "திரும்ப செல்லவும்", mr: "मागे जा", gu: "પાછા જાઓ" })}
          </Button>
        </Card>
      </div>
    )
  }

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

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case "High":
        return t({ en: "High", hi: "उच्च", or: "ଉଚ୍ଚ", bn: "উচ্চ", te: "అధిక", ta: "உயர்", mr: "उच्च", gu: "ઉચ્ચ" })
      case "Medium":
        return t({ en: "Medium", hi: "मध्यम", or: "ମଧ୍ୟମ", bn: "মাঝারি", te: "మధ్యస్థ", ta: "நடுத்தரம்", mr: "मध्यम", gu: "મધ્યમ" })
      default:
        return t({ en: "Low", hi: "निम्न", or: "ନିମ୍ନ", bn: "নিম্ন", te: "తక్కువ", ta: "குறைவு", mr: "कमी", gu: "નીચું" })
    }
  }

  const getAppointmentStatusLabel = (status: Appointment["status"]) => {
    switch (status) {
      case "upcoming":
        return t({ en: "Upcoming", hi: "आगामी", or: "ଆସନ୍ତା", bn: "আসন্ন", te: "రాబోయే", ta: "வரவிருக்கும்", mr: "आगामी", gu: "આગામી" })
      case "completed":
        return t({ en: "Completed", hi: "पूर्ण", or: "ସମ୍ପୂର୍ଣ୍ଣ", bn: "সম্পন্ন", te: "పూర్తి", ta: "முடிந்தது", mr: "पूर्ण", gu: "પૂર્ણ" })
      default:
        return t({ en: "Cancelled", hi: "रद्द", or: "ବାତିଲ୍", bn: "বাতিল", te: "రద్దు", ta: "ரத்து", mr: "रद्द", gu: "રદ" })
    }
  }

  const sendEmergencySMS = async () => {
    try {
      await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: patient.phone,
          message: `URGENT: ${patient.name}, please contact your ASHA worker immediately regarding your health checkup.`,
          patientName: patient.name,
        }),
      })
      alert(content.smsSentSuccess || t({ en: "Emergency SMS sent successfully!", hi: "आपातकालीन SMS सफलतापूर्वक भेजा गया!", or: "ଜରୁରୀ SMS ସଫଳତାର ସହ ପଠାଯାଇଛି!", bn: "জরুরি SMS সফলভাবে পাঠানো হয়েছে!", te: "అత్యవసర SMS విజయవంతంగా పంపబడింది!", ta: "அவசர SMS வெற்றிகரமாக அனுப்பப்பட்டது!", mr: "आपत्कालीन SMS यशस्वीपणे पाठवला गेला!", gu: "આપાતકાલીન SMS સફળતાપૂર્વક મોકલાયો!" }))
    } catch (error) {
      console.error("[v0] SMS send error:", error)
      alert(content.smsFailure || t({ en: "Failed to send SMS. Please call the patient directly.", hi: "SMS भेजने में विफल। कृपया मरीज को सीधे कॉल करें।", or: "SMS ପଠାଇବାରେ ବିଫଳ। ଦୟାକରି ରୋଗୀଙ୍କୁ ସିଧାସଳଖ କଲ୍ କରନ୍ତୁ।", bn: "SMS পাঠাতে ব্যর্থ। দয়া করে রোগীকে সরাসরি কল করুন।", te: "SMS పంపడం విఫలమైంది. దయచేసి రోగికి నేరుగా కాల్ చేయండి.", ta: "SMS அனுப்பத் தவறிவிட்டது. நோயாளியை நேரடியாக அழைக்கவும்.", mr: "SMS पाठवण्यात अयशस्वी. कृपया रुग्णाला थेट कॉल करा.", gu: "SMS મોકલવામાં નિષ્ફળ. કૃપા કરીને દર્દીને સીધો કૉલ કરો." }))
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-trust/10 to-background">
      {/* Header */}
      <div className="bg-linear-to-r from-trust to-accent p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{patient.name}</h1>
            <p className="text-white/80 text-sm">
              {patient.age} {content.years || t({ en: "years", hi: "वर्ष", or: "ବର୍ଷ", bn: "বছর", te: "సంవత్సరాలు", ta: "ஆண்டுகள்", mr: "वर्षे", gu: "વર્ષ" })} • {patient.weeks} {content.weeksPregnant || t({ en: "weeks pregnant", hi: "सप्ताह गर्भवती", or: "ସପ୍ତାହ ଗର୍ଭବତୀ", bn: "সপ্তাহের গর্ভবতী", te: "వారాల గర్భిణి", ta: "வார கர்ப்பிணி", mr: "आठवड्यांची गर्भवती", gu: "અઠવાડિયાની ગર્ભવતી" })}
            </p>
            <p className="text-white/70 text-xs mt-1">{patient.village}</p>
          </div>
          <Button
            size="icon"
            className="bg-white text-trust hover:bg-white/90"
            onClick={() => (window.location.href = `tel:${patient.phone}`)}
          >
            <Phone className="w-5 h-5" />
          </Button>
        </div>
        <Badge className={`${getRiskColor(patient.risk)} text-base px-4 py-1`}>
          {getRiskLabel(patient.risk)} {content.riskPatient || t({ en: "Risk Patient", hi: "जोखिम मरीज", or: "ଜୋଖିମ ରୋଗୀ", bn: "ঝুঁকিপূর্ণ রোগী", te: "ప్రమాద రోగి", ta: "அபாய நோயாளர்", mr: "जोखीम रुग्ण", gu: "જોખમી દર્દી" })}
        </Badge>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{content.hemoglobin || t({ en: "Hemoglobin", hi: "हीमोग्लोबिन", or: "ହିମୋଗ୍ଲୋବିନ", bn: "হিমোগ্লোবিন", te: "హీమోగ్లోబిన్", ta: "ஹீமோகுளோபின்", mr: "हिमोग्लोबिन", gu: "હિમોગ્લોબિન" })}</p>
            <p className="text-lg font-bold text-warning">{patient.hemoglobin} g/dL</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{content.lastCheckup || t({ en: "Last Checkup", hi: "अंतिम जांच", or: "ଶେଷ ପରୀକ୍ଷା", bn: "শেষ চেকআপ", te: "చివరి చెక్‌అప్", ta: "கடைசி சோதனை", mr: "शेवटची तपासणी", gu: "છેલ્લો ચેકઅપ" })}</p>
            <p className="text-lg font-bold">{new Date(patient.lastCheckup).toLocaleDateString("en-IN")}</p>
          </Card>
        </div>

        {/* Alert if high risk */}
        {patient.risk === "High" && (
          <Card className="p-4 bg-alert/10 border-alert">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-alert mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-alert mb-1">{content.highRiskAlert || t({ en: "High Risk Alert", hi: "उच्च-जोखिम अलर्ट", or: "ଉଚ୍ଚ ଜୋଖିମ ସଚେତନ", bn: "উচ্চ ঝুঁকি সতর্কতা", te: "అధిక ప్రమాద అలర్ట్", ta: "அதிக அபாய எச்சரிக்கை", mr: "उच्च-जोखीम अलर्ट", gu: "ઉચ્ચ જોખમ એલર્ટ" })}</p>
                <p className="text-sm leading-relaxed mb-3">
                  {content.requiresAttention || t({ en: "This patient requires immediate attention. Contact within 24 hours.", hi: "इस मरीज को तुरंत ध्यान की आवश्यकता है। 24 घंटे के भीतर संपर्क करें।", or: "ଏହି ରୋଗୀଙ୍କୁ ତୁରନ୍ତ ଧ୍ୟାନ ଆବଶ୍ୟକ। 24 ଘଣ୍ଟା ମଧ୍ୟରେ ସମ୍ପର୍କ କରନ୍ତୁ।", bn: "এই রোগীর তাৎক্ষণিক যত্ন প্রয়োজন। ২৪ ঘণ্টার মধ্যে যোগাযোগ করুন।", te: "ఈ రోగికి తక్షణ శ్రద్ధ అవసరం. 24 గంటల్లో సంప్రదించండి.", ta: "இந்த நோயாளிக்கு உடனடி கவனம் தேவை. 24 மணி நேரத்திற்குள் தொடர்பு கொள்ளவும்.", mr: "या रुग्णाला तात्काळ लक्ष आवश्यक आहे. 24 तासांच्या आत संपर्क करा.", gu: "આ દર્દીને તાત્કાલિક ધ્યાન જોઈએ. 24 કલાકમાં સંપર્ક કરો." })}
                </p>
                <Button size="sm" className="bg-alert hover:bg-alert/90" onClick={sendEmergencySMS}>
                  {content.sendEmergencySMS || t({ en: "Send Emergency SMS", hi: "आपातकालीन SMS भेजें", or: "ଜରୁରୀ SMS ପଠାନ୍ତୁ", bn: "জরুরি SMS পাঠান", te: "అత్యవసర SMS పంపండి", ta: "அவசர SMS அனுப்பவும்", mr: "आपत्कालीन SMS पाठवा", gu: "આપાતકાલીન SMS મોકલો" })}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="vitals" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vitals">{content.vitals || t({ en: "Vitals", hi: "वाइटल्स", or: "ଭାଇଟାଲ୍ସ", bn: "ভাইটালস", te: "వైటల్స్", ta: "முக்கிய அளவுகள்", mr: "वाइटल्स", gu: "વાઇટલ્સ" })}</TabsTrigger>
            <TabsTrigger value="history">{content.history || t({ en: "History", hi: "इतिहास", or: "ଇତିହାସ", bn: "ইতিহাস", te: "చరిత్ర", ta: "வரலாறு", mr: "इतिहास", gu: "ઇતિહાસ" })}</TabsTrigger>
            <TabsTrigger value="appointments">{content.appointments || t({ en: "Appointments", hi: "अपॉइंटमेंट", or: "ନିଯୁକ୍ତି", bn: "অ্যাপয়েন্টমেন্ট", te: "అపాయింట్‌మెంట్లు", ta: "நியமனங்கள்", mr: "अपॉइंटमेंट्स", gu: "અપોઇન્ટમેન્ટ્સ" })}</TabsTrigger>
          </TabsList>

          <TabsContent value="vitals" className="space-y-4 mt-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-alert" />
                {content.currentVitals || t({ en: "Current Vitals", hi: "वर्तमान वाइटल्स", or: "ବର୍ତ୍ତମାନ ଭାଇଟାଲ୍ସ", bn: "বর্তমান ভাইটালস", te: "ప్రస్తుత వైటల్స్", ta: "தற்போதைய முக்கிய அளவுகள்", mr: "सध्याचे वाइटल्स", gu: "વર્તમાન વાઇટલ્સ" })}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{content.bloodPressure || t({ en: "Blood Pressure", hi: "रक्तचाप", or: "ରକ୍ତଚାପ", bn: "রক্তচাপ", te: "రక్తపోటు", ta: "இரத்த அழுத்தம்", mr: "रक्तदाब", gu: "બ્લડ પ્રેશર" })}</p>
                  <p
                    className={`text-lg font-bold ${patient.bloodPressure.startsWith("14") || patient.bloodPressure.startsWith("15") ? "text-alert" : "text-success"}`}
                  >
                    {patient.bloodPressure}
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{content.weight || t({ en: "Weight", hi: "वजन", or: "ଓଜନ", bn: "ওজন", te: "బరువు", ta: "எடை", mr: "वजन", gu: "વજન" })}</p>
                  <p className="text-lg font-bold">{patient.weight} kg</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{content.hemoglobin || t({ en: "Hemoglobin", hi: "हीमोग्लोबिन", or: "ହିମୋଗ୍ଲୋବିନ", bn: "হিমোগ্লোবিন", te: "హీమోగ్లోబిన్", ta: "ஹீமோகுளோபின்", mr: "हिमोग्लोबिन", gu: "હિમોગ્લોબિન" })}</p>
                  <p className={`text-lg font-bold ${patient.hemoglobin < 11 ? "text-warning" : "text-success"}`}>
                    {patient.hemoglobin} g/dL
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{content.mentalHealth || t({ en: "Mental Health", hi: "मानसिक स्वास्थ्य", or: "ମାନସିକ ସ୍ୱାସ୍ଥ୍ୟ", bn: "মানসিক স্বাস্থ্য", te: "మానసిక ఆరోగ్యం", ta: "மனநலம்", mr: "मानसिक आरोग्य", gu: "માનસિક આરોગ્ય" })}</p>
                  <p className="text-lg font-bold text-care">{patient.mentalHealthScore}/10</p>
                </div>
              </div>
            </Card>

            {patient.symptoms.length > 0 && (
              <Card className="p-5 bg-warning/10 border-warning">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-warning" />
                  {content.currentSymptoms || t({ en: "Current Symptoms", hi: "वर्तमान लक्षण", or: "ବର୍ତ୍ତମାନ ଲକ୍ଷଣ", bn: "বর্তমান লক্ষণ", te: "ప్రస్తుత లక్షణాలు", ta: "தற்போதைய அறிகுறிகள்", mr: "सध्याची लक्षणे", gu: "વર્તમાન લક્ષણો" })}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {patient.symptoms.map((symptom, index) => (
                    <Badge key={index} variant="outline" className="border-warning text-warning">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            <Button className="w-full h-12 bg-trust hover:bg-trust/90">
              <TrendingUp className="w-5 h-5 mr-2" />
              {content.updateVitals || t({ en: "Update Vitals", hi: "वाइटल्स अपडेट करें", or: "ଭାଇଟାଲ୍ସ ଅଦ୍ୟତନ କରନ୍ତୁ", bn: "ভাইটালস আপডেট করুন", te: "వైటల్స్ అప్డేట్ చేయండి", ta: "முக்கிய அளவுகளை புதுப்பிக்கவும்", mr: "वाइटल्स अपडेट करा", gu: "વાઇટલ્સ અપડેટ કરો" })}
            </Button>
          </TabsContent>

          <TabsContent value="history" className="space-y-3 mt-4">
            {healthLogs.length > 0 ? (
              healthLogs.map((log) => (
                <Card key={log.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">{log.mood}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.date).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{log.notes}</p>
                  {log.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {log.symptoms.map((symptom, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">{content.noHealthLogs || t({ en: "No health logs yet", hi: "अभी तक स्वास्थ्य लॉग नहीं", or: "ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ସ୍ୱାସ୍ଥ୍ୟ ଲଗ୍ ନାହିଁ", bn: "এখনও কোনো স্বাস্থ্য লগ নেই", te: "ఇంకా ఆరోగ్య లాగ్‌లు లేవు", ta: "இன்னும் சுகாதார பதிவுகள் இல்லை", mr: "अजून आरोग्य लॉग नाहीत", gu: "હજુ સુધી આરોગ્ય લોગ્સ નથી" })}</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="appointments" className="space-y-3 mt-4">
            {appointments.length > 0 ? (
              appointments.map((apt) => (
                <Card key={apt.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-trust" />
                      <span className="font-semibold">{apt.type}</span>
                    </div>
                    <Badge className={apt.status === "upcoming" ? "bg-trust" : "bg-success"}>{getAppointmentStatusLabel(apt.status)}</Badge>
                  </div>
                  <p className="text-sm font-medium mb-1">
                    {new Date(apt.date).toLocaleDateString("en-IN")} {t({ en: "at", hi: "पर", or: "ରେ", bn: "এ", te: "కు", ta: "மணிக்கு", mr: "वाजता", gu: "પર" })} {apt.time}
                  </p>
                  <p className="text-xs text-muted-foreground">{apt.location}</p>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">{content.noAppointments || t({ en: "No upcoming appointments", hi: "कोई आगामी अपॉइंटमेंट नहीं", or: "କୌଣସି ଆସନ୍ତା ନିଯୁକ୍ତି ନାହିଁ", bn: "কোনো আসন্ন অ্যাপয়েন্টমেন্ট নেই", te: "రాబోయే అపాయింట్‌మెంట్లు లేవు", ta: "வரவிருக்கும் நியமனங்கள் இல்லை", mr: "आगामी अपॉइंटमेंट नाहीत", gu: "આગામી અપોઇન્ટમેન્ટ્સ નથી" })}</p>
              </Card>
            )}

            <Button variant="outline" className="w-full h-12 bg-transparent">
              <Calendar className="w-5 h-5 mr-2" />
              {content.scheduleAppointment || t({ en: "Schedule Appointment", hi: "अपॉइंटमेंट तय करें", or: "ନିଯୁକ୍ତି ସୂଚିବଦ୍ଧ କରନ୍ତୁ", bn: "অ্যাপয়েন্টমেন্ট নির্ধারণ করুন", te: "అపాయింట్‌మెంట్ షెడ్యూల్ చేయండి", ta: "நியமனத்தை திட்டமிடவும்", mr: "अपॉइंटमेंट ठरवा", gu: "અપોઇન્ટમેન્ટ શેડ્યૂલ કરો" })}
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
