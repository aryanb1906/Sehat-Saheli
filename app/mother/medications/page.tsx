"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Pill, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"

interface Medication {
  id: string
  name: string
  dosage: string
  time: string
  taken: boolean
  safety?: "safe" | "caution" | "avoid"
  safetyNote?: string
}

export default function Medications() {
  const router = useRouter()
  const { toast } = useToast()
  const { language } = useLanguage()
  const t = (copy: Record<string, string>) => copy[language] || copy.en
  const [medications, setMedications] = useState<Medication[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newMed, setNewMed] = useState({ name: "", dosage: "", time: "" })

  useEffect(() => {
    const saved = localStorage.getItem("medications")
    if (saved) {
      setMedications(JSON.parse(saved))
    } else {
      const demo: Medication[] = [
        { id: "1", name: "Iron Supplement", dosage: "100mg", time: "09:00", taken: false },
        { id: "2", name: "Folic Acid", dosage: "5mg", time: "09:00", taken: false },
        { id: "3", name: "Calcium", dosage: "500mg", time: "21:00", taken: false },
      ]
      setMedications(demo)
      localStorage.setItem("medications", JSON.stringify(demo))
    }
  }, [])

  const saveMedications = (meds: Medication[]) => {
    setMedications(meds)
    localStorage.setItem("medications", JSON.stringify(meds))
  }

  const addMedication = () => {
    if (!newMed.name || !newMed.dosage || !newMed.time) {
      toast({
        title: t({ en: "Error", hi: "त्रुटि", or: "ତ୍ରୁଟି", bn: "ত্রুটি", te: "లోపం", ta: "பிழை", mr: "त्रुटी", gu: "ભૂલ" }),
        description: t({ en: "Please fill all fields", hi: "कृपया सभी फ़ील्ड भरें", or: "ଦୟାକରି ସମସ୍ତ ଘରଣୀ ପୁରଣ କରନ୍ତୁ", bn: "অনুগ্রহ করে সব ঘর পূরণ করুন", te: "దయచేసి అన్ని ఫీల్డ్‌లు నింపండి", ta: "அனைத்து புலங்களையும் நிரப்பவும்", mr: "कृपया सर्व फील्ड भरा", gu: "કૃપા કરીને બધા ફીલ્ડ ભરો" }),
        variant: "destructive",
      })
      return
    }

    const createMedication = async () => {
      let safety: Medication["safety"] = "caution"
      let safetyNote = t({ en: "Not found in local guide. Please confirm with doctor/ASHA.", hi: "स्थानीय गाइड में नहीं मिला। कृपया डॉक्टर/आशा से पुष्टि करें।", or: "ସ୍ଥାନୀୟ ଗାଇଡ୍‌ରେ ମିଳିଲା ନାହିଁ। ଡାକ୍ତର/ଆଶା ସହ ନିଶ୍ଚିତ କରନ୍ତୁ।", bn: "স্থানীয় গাইডে পাওয়া যায়নি। ডাক্তার/আশার সাথে নিশ্চিত করুন।", te: "స్థానిక గైడ్‌లో కనిపించలేదు. దయచేసి డాక్టర్/ఆశాతో నిర్ధారించండి.", ta: "உள்ளூர் வழிகாட்டியில் இல்லை. மருத்துவர்/ஆஷாவுடன் உறுதிப்படுத்தவும்.", mr: "स्थानिक मार्गदर्शकात आढळले नाही. डॉक्टर/आशाशी खात्री करा.", gu: "સ્થાનિક માર્ગદર્શિકામાં મળ્યું નથી. કૃપા કરીને ડૉક્ટર/આશા સાથે ખાતરી કરો." })

      try {
        const response = await fetch("/api/medication-safety", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ medicationName: newMed.name }),
        })
        const data = await response.json()
        if (data?.success) {
          safety = data.safety
          safetyNote = data.note
        }
      } catch {
        // Keep default caution if safety service fails.
      }

      const medication: Medication = {
        id: Date.now().toString(),
        ...newMed,
        taken: false,
        safety,
        safetyNote,
      }
      saveMedications([...medications, medication])
      setNewMed({ name: "", dosage: "", time: "" })
      setShowAdd(false)
      const safetyLabel = (safety || "caution").toUpperCase()
      toast({
        title: t({ en: "Added!", hi: "जोड़ा गया!", or: "ଯୋଡାଗଲା!", bn: "যোগ করা হয়েছে!", te: "జోడించబడింది!", ta: "சேர்க்கப்பட்டது!", mr: "जोडले!", gu: "ઉમેરાયું!" }),
        description: `${t({ en: "Medication reminder added", hi: "दवा रिमाइंडर जोड़ा गया", or: "ଔଷଧ ସ୍ମୃତିପତ୍ର ଯୋଡାଗଲା", bn: "ওষুধ রিমাইন্ডার যোগ করা হয়েছে", te: "మందుల రిమైండర్ జోడించబడింది", ta: "மருந்து நினைவூட்டல் சேர்க்கப்பட்டது", mr: "औषध स्मरणपत्र जोडले", gu: "દવા રિમાઇન્ડર ઉમેરાયું" })} (${safetyLabel})`,
      })
    }

    void createMedication()
  }

  const getSafetyStyles = (safety?: Medication["safety"]) => {
    if (safety === "safe") return "bg-success/10 text-success"
    if (safety === "avoid") return "bg-alert/10 text-alert"
    return "bg-warning/10 text-warning"
  }

  const toggleTaken = (id: string) => {
    const updated = medications.map((m) => (m.id === id ? { ...m, taken: !m.taken } : m))
    saveMedications(updated)
    toast({
      title: t({ en: "Updated!", hi: "अपडेट हुआ!", or: "ଅଦ୍ୟତନ ହେଲା!", bn: "আপডেট হয়েছে!", te: "అప్డేట్ అయింది!", ta: "புதுப்பிக்கப்பட்டது!", mr: "अद्ययावत!", gu: "અપડેટ થયું!" }),
      description: t({ en: "Medication status updated", hi: "दवा स्थिति अपडेट हुई", or: "ଔଷଧ ସ୍ଥିତି ଅଦ୍ୟତନ ହେଲା", bn: "ওষুধের অবস্থা আপডেট হয়েছে", te: "మందుల స్థితి అప్డేట్ అయింది", ta: "மருந்து நிலை புதுப்பிக்கப்பட்டது", mr: "औषध स्थिती अद्ययावत झाली", gu: "દવા સ્થિતિ અપડેટ થઈ" }),
    })
  }

  const deleteMedication = (id: string) => {
    saveMedications(medications.filter((m) => m.id !== id))
    toast({
      title: t({ en: "Deleted!", hi: "हटाया गया!", or: "ହଟାଯାଇଛି!", bn: "মুছে ফেলা হয়েছে!", te: "తొలగించబడింది!", ta: "நீக்கப்பட்டது!", mr: "हटवले!", gu: "કાઢી નાખ્યું!" }),
      description: t({ en: "Medication removed", hi: "दवा हटाई गई", or: "ଔଷଧ ହଟାଗଲା", bn: "ওষুধ সরানো হয়েছে", te: "మందు తొలగించబడింది", ta: "மருந்து நீக்கப்பட்டது", mr: "औषध काढले", gu: "દવા દૂર કરવામાં આવી" }),
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-princess-1/20 via-white to-princess-1/10 pb-10">
      <div className="mx-3 mt-4 overflow-hidden rounded-3xl bg-gradient-to-r from-princess-4 to-primary p-6 text-white shadow-lg shadow-princess-4/20 border border-white/20 md:mx-6 2xl:mx-auto 2xl:max-w-7xl">
        <Button variant="ghost" size="icon" className="text-white mb-4 hover:bg-white/20 -ml-2" onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-3xl font-bold mb-2">{t({ en: "Medications", hi: "दवाएं", or: "ଔଷଧ", bn: "ওষুধ", te: "మందులు", ta: "மருந்துகள்", mr: "औषधे", gu: "દવાઓ" })}</h1>
        <p className="text-white/90">{t({ en: "Track your daily medications", hi: "अपनी दैनिक दवाओं को ट्रैक करें", or: "ଦୈନିକ ଔଷଧ ଟ୍ରାକ୍ କରନ୍ତୁ", bn: "আপনার দৈনিক ওষুধ ট্র্যাক করুন", te: "మీ రోజువారీ మందులను ట్రాక్ చేయండి", ta: "தினசரி மருந்துகளை கண்காணிக்கவும்", mr: "दैनिक औषधे ट्रॅक करा", gu: "તમારી દૈનિક દવાઓ ટ્રેક કરો" })}</p>
      </div>

      <div className="p-6 space-y-6">
        <Button onClick={() => setShowAdd(!showAdd)} className="w-full h-12 gap-2">
          <Plus className="w-5 h-5" />
          {t({ en: "Add Medication", hi: "दवा जोड़ें", or: "ଔଷଧ ଯୋଡନ୍ତୁ", bn: "ওষুধ যোগ করুন", te: "మందు జోడించండి", ta: "மருந்து சேர்க்கவும்", mr: "औषध जोडा", gu: "દવા ઉમેરો" })}
        </Button>

        {showAdd && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4">{t({ en: "New Medication", hi: "नई दवा", or: "ନୂତନ ଔଷଧ", bn: "নতুন ওষুধ", te: "కొత్త మందు", ta: "புதிய மருந்து", mr: "नवीन औषध", gu: "નવી દવા" })}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t({ en: "Medication Name", hi: "दवा का नाम", or: "ଔଷଧର ନାମ", bn: "ওষুধের নাম", te: "మందు పేరు", ta: "மருந்து பெயர்", mr: "औषधाचे नाव", gu: "દવાનું નામ" })}</label>
                <Input
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  placeholder={t({ en: "e.g., Iron Supplement", hi: "जैसे, आयरन सप्लीमेंट", or: "ଉଦାହରଣ, ଆୟରନ୍ ସପ୍ଲିମେଣ୍ଟ", bn: "যেমন, আয়রন সাপ্লিমেন্ট", te: "ఉదా., ఐరన్ సప్లిమెంట్", ta: "எ.கா., இரும்பு சப்பிள்மென்ட்", mr: "उदा., आयर्न सप्लिमेंट", gu: "દા.ત., આયર્ન સપ્લિમેન્ટ" })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t({ en: "Dosage", hi: "खुराक", or: "ମାତ୍ରା", bn: "ডোজ", te: "మోతాదు", ta: "அளவு", mr: "डोस", gu: "માત્રા" })}</label>
                <Input
                  value={newMed.dosage}
                  onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                  placeholder={t({ en: "e.g., 100mg", hi: "जैसे, 100mg", or: "ଉଦାହରଣ, 100mg", bn: "যেমন, 100mg", te: "ఉదా., 100mg", ta: "எ.கா., 100mg", mr: "उदा., 100mg", gu: "દા.ત., 100mg" })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t({ en: "Time", hi: "समय", or: "ସମୟ", bn: "সময়", te: "సమయం", ta: "நேரம்", mr: "वेळ", gu: "સમય" })}</label>
                <Input
                  type="time"
                  value={newMed.time}
                  onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addMedication} className="flex-1">
                  {t({ en: "Add", hi: "जोड़ें", or: "ଯୋଡନ୍ତୁ", bn: "যোগ করুন", te: "జోడించండి", ta: "சேர்", mr: "जोडा", gu: "ઉમેરો" })}
                </Button>
                <Button variant="outline" onClick={() => setShowAdd(false)} className="flex-1">
                  {t({ en: "Cancel", hi: "रद्द करें", or: "ବାତିଲ୍", bn: "বাতিল", te: "రద్దు", ta: "ரத்து", mr: "रद्द", gu: "રદ કરો" })}
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-3">
          <h2 className="text-xl font-bold">{t({ en: "Today's Medications", hi: "आज की दवाएं", or: "ଆଜିର ଔଷଧ", bn: "আজকের ওষুধ", te: "ఈరోజు మందులు", ta: "இன்றைய மருந்துகள்", mr: "आजची औषधे", gu: "આજની દવાઓ" })}</h2>
          {medications.length === 0 ? (
            <Card className="p-8 text-center">
              <Pill className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">{t({ en: "No medications added yet", hi: "अभी कोई दवा जोड़ी नहीं गई", or: "ଏପର୍ଯ୍ୟନ୍ତ ଔଷଧ ଯୋଡାଯାଇନି", bn: "এখনও কোনও ওষুধ যোগ করা হয়নি", te: "ఇంకా మందులు జోడించలేదు", ta: "இன்னும் மருந்துகள் சேர்க்கப்படவில்லை", mr: "अजून औषधे जोडलेली नाहीत", gu: "હજુ દવાઓ ઉમેરાઈ નથી" })}</p>
            </Card>
          ) : (
            medications.map((med) => (
              <Card key={med.id} className={`p-4 ${med.taken ? "bg-success/10 border-success" : ""}`}>
                <div className="flex items-center gap-4">
                  <Button
                    variant={med.taken ? "default" : "outline"}
                    size="icon"
                    className={med.taken ? "bg-success hover:bg-success/90" : ""}
                    onClick={() => toggleTaken(med.id)}
                  >
                    <Check className="w-5 h-5" />
                  </Button>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${med.taken ? "line-through text-muted-foreground" : ""}`}>
                      {med.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {med.dosage} • {med.time}
                    </p>
                    <div className="mt-2">
                      <span className={`rounded px-2 py-1 text-xs font-semibold ${getSafetyStyles(med.safety)}`}>
                        {(med.safety || "caution").toUpperCase()}
                      </span>
                      {med.safetyNote && <p className="text-xs text-muted-foreground mt-1">{med.safetyNote}</p>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteMedication(med.id)}>
                    <Trash2 className="w-5 h-5 text-alert" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
