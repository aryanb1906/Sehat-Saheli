"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Phone, User, AlertCircle, Ambulance, Car, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/language-context"
import { subscribeEmergencyOfflineFallback } from "@/lib/offline-sync-client"

export default function Emergency() {
  const router = useRouter()
  const { language } = useLanguage()
  const [sosSent, setSosSent] = useState(false)
  const [offlineFallback, setOfflineFallback] = useState(false)
  const t = (copy: Record<string, string>) => copy[language] || copy.en

  useEffect(() => {
    return subscribeEmergencyOfflineFallback(() => setOfflineFallback(true))
  }, [])

  const getCurrentLocation = () =>
    new Promise<{ lat: number; lng: number }>((resolve) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        resolve({ lat: 20.59, lng: 78.96 })
        return
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => resolve({ lat: 20.59, lng: 78.96 }),
        { timeout: 5000 },
      )
    })

  const emergencyContacts = [
    { name: "ASHA Worker - Meera Devi", number: "+91 98765 43210", type: "ASHA" },
    { name: t({ en: "Local Hospital", hi: "स्थानीय अस्पताल", or: "ସ୍ଥାନୀୟ ହସ୍ପିଟାଲ୍", bn: "স্থানীয় হাসপাতাল", te: "స్థానిక ఆసుపత్రి", ta: "உள்ளூர் மருத்துவமனை", mr: "स्थानिक रुग्णालय", gu: "સ્થાનિક હોસ્પિટલ" }), number: "102", type: t({ en: "Hospital", hi: "अस्पताल", or: "ହସ୍ପିଟାଲ୍", bn: "হাসপাতাল", te: "ఆసుపత్రి", ta: "மருத்துவமனை", mr: "रुग्णालय", gu: "હોસ્પિટલ" }) },
    { name: t({ en: "Ambulance Service", hi: "एम्बुलेंस सेवा", or: "ଆମ୍ବୁଲାନ୍ସ ସେବା", bn: "অ্যাম্বুলেন্স সেবা", te: "అంబులెన్స్ సేవ", ta: "ஆம்புலன்ஸ் சேவை", mr: "रुग्णवाहिका सेवा", gu: "એમ્બ્યુલન્સ સેવા" }), number: "108", type: t({ en: "Ambulance", hi: "एम्बुलेंस", or: "ଆମ୍ବୁଲାନ୍ସ", bn: "অ্যাম্বুলেন্স", te: "అంబులెన్స్", ta: "ஆம்புலன்ஸ்", mr: "रुग्णवाहिका", gu: "એમ્બ્યુલન્સ" }) },
  ]

  const emergencyCard = {
    motherName: "Anita Kumari",
    dueDate: "2026-06-22",
    bloodGroup: "B+",
    allergies: t({ en: "No known drug allergy", hi: "कोई ज्ञात दवा एलर्जी नहीं", or: "ଜଣାଶୁଣା ଔଷଧ ଆଲର୍ଜି ନାହିଁ", bn: "কোনও পরিচিত ওষুধ অ্যালার্জি নেই", te: "తెలిసిన ఔషధ అలర్జీ లేదు", ta: "தெரிந்த மருந்து ஒவ்வாமை இல்லை", mr: "कोणतीही ज्ञात औषध अलर्जी नाही", gu: "કોઈ જાણીતી દવા એલર્જી નથી" }),
    highRiskFlag: t({ en: "Elevated BP history", hi: "उच्च BP का इतिहास", or: "ଉଚ୍ଚ BP ଇତିହାସ", bn: "উচ্চ BP ইতিহাস", te: "అధిక BP చరిత్ర", ta: "அதிக BP வரலாறு", mr: "उच्च BP इतिहास", gu: "ઉચ્ચ BP ઇતિહાસ" }),
  }

  const transportOptions = [
    { name: t({ en: "Govt Ambulance", hi: "सरकारी एम्बुलेंस", or: "ସରକାରୀ ଆମ୍ବୁଲାନ୍ସ", bn: "সরকারি অ্যাম্বুলেন্স", te: "ప్రభుత్వ అంబులెన్స్", ta: "அரசு ஆம்புலன்ஸ்", mr: "सरकारी रुग्णवाहिका", gu: "સરકારી એમ્બ્યુલન્સ" }), eta: "8-12 min", contact: "108", fallback: false },
    { name: t({ en: "Community Driver", hi: "समुदाय चालक", or: "ସମୁଦାୟ ଡ୍ରାଇଭର", bn: "কমিউনিটি ড্রাইভার", te: "కమ్యూనిటీ డ్రైవర్", ta: "சமூக ஓட்டுநர்", mr: "समुदाय चालक", gu: "સમુદાય ડ્રાઈવર" }), eta: "15-20 min", contact: "+91 98765 00011", fallback: true },
    { name: t({ en: "Backup Auto Service", hi: "बैकअप ऑटो सेवा", or: "ବ୍ୟାକଅପ୍ ଅଟୋ ସେବା", bn: "ব্যাকআপ অটো সেবা", te: "బ్యాకప్ ఆటో సేవ", ta: "பின்தள ஆட்டோ சேவை", mr: "बॅकअप ऑटो सेवा", gu: "બેકઅપ ઓટો સેવા" }), eta: "20-25 min", contact: "+91 98765 22233", fallback: true },
  ]

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`
  }

  const triggerSOS = async () => {
    // No hardcoded userId here — /api/emergency derives the acting user from
    // the authenticated session server-side, so this only needs to send the
    // real device location and reason.
    try {
      const location = await getCurrentLocation()
      await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "trigger-sos",
          data: {
            location,
            reason: t({ en: "Emergency from maternal danger signs", hi: "मातृ जोखिम संकेतों से आपातकाल", or: "ମାତୃ ବିପଦ ସଙ୍କେତରୁ ଜରୁରୀ ସ୍ଥିତି", bn: "মাতৃ ঝুঁকির সংকেত থেকে জরুরি অবস্থা", te: "మాతృ ప్రమాద సంకేతాల వల్ల అత్యవసరం", ta: "தாய்மை அபாய அறிகுறிகளால் அவசரம்", mr: "मातृ जोखीम चिन्हांमुळे आपत्काल", gu: "માતૃત્વ જોખમ સંકેતોને કારણે આપાતકાલ" }),
          },
        }),
      })
      setSosSent(true)
    } catch {
      setSosSent(false)
      // Whether this failed outright or was queued offline, the safest
      // default is to also dial 108 directly rather than trust the app.
      window.location.href = "tel:108"
    }
  }

  const dueDateLabel = new Date(emergencyCard.dueDate).toLocaleDateString()

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="mx-auto w-full max-w-6xl px-4 py-5 md:px-6 md:py-8 space-y-5">
        <Card className="overflow-hidden border-border bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="bg-gradient-to-r from-princess-4 to-primary px-5 py-6 text-white md:px-7">
            <div className="flex items-center gap-3">
              <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2 md:text-3xl">
                  <AlertCircle className="h-6 w-6" />
                  {t({ en: "Emergency Help", hi: "आपातकालीन सहायता", or: "ଜରୁରୀ ସହାୟତା", bn: "জরুরি সহায়তা", te: "అత్యవసర సహాయం", ta: "அவசர உதவி", mr: "आपत्कालीन मदत", gu: "આપાતકાલીન મદદ" })}
                </h1>
                <p className="mt-1 text-sm text-white/85">{t({ en: "Quick emergency actions for mother and care team", hi: "मां और देखभाल टीम के लिए त्वरित आपातकालीन कार्य", or: "ମା' ଏବଂ କେୟାର୍ ଟିମ୍ ପାଇଁ ତ୍ୱରିତ ଜରୁରୀ କାର୍ଯ୍ୟ", bn: "মা ও কেয়ার টিমের জন্য দ্রুত জরুরি পদক্ষেপ", te: "తల్లి మరియు సంరక్షణ బృందం కోసం వేగవంతమైన అత్యవసర చర్యలు", ta: "தாய் மற்றும் பராமரிப்பு குழுவிற்கான விரைவு அவசர நடவடிக்கைகள்", mr: "आई आणि काळजी पथकासाठी त्वरित आपत्कालीन कृती", gu: "મા અને કાળજી ટીમ માટે ઝડપી આપાતકાલીન પગલાં" })}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-alert/30 bg-alert/5 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{t({ en: "Emergency Card", hi: "आपातकालीन कार्ड", or: "ଜରୁରୀ କାର୍ଡ", bn: "জরুরি কার্ড", te: "అత్యవసర కార్డ్", ta: "அவசர அட்டை", mr: "आपत्कालीन कार्ड", gu: "આપાતકાલીન કાર્ડ" })}</h2>
              <Badge className="border-alert/30 bg-alert/10 text-alert">{t({ en: "High Priority", hi: "उच्च प्राथमिकता", or: "ଉଚ୍ଚ ପ୍ରାଥମିକତା", bn: "উচ্চ অগ্রাধিকার", te: "అధిక ప్రాధాన్యత", ta: "உயர் முன்னுரிமை", mr: "उच्च प्राधान्य", gu: "ઉચ્ચ પ્રાથમિકતા" })}</Badge>
            </div>

            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <p><span className="text-muted-foreground">{t({ en: "Name", hi: "नाम", or: "ନାମ", bn: "নাম", te: "పేరు", ta: "பெயர்", mr: "नाव", gu: "નામ" })}:</span> <span className="font-medium">{emergencyCard.motherName}</span></p>
              <p><span className="text-muted-foreground">{t({ en: "Due Date", hi: "नियत तिथि", or: "ନିର୍ଦ୍ଧାରିତ ତାରିଖ", bn: "নির্ধারিত তারিখ", te: "గడువు తేదీ", ta: "காலக்கெடு தேதி", mr: "देय तारीख", gu: "નિયત તારીખ" })}:</span> <span className="font-medium">{dueDateLabel}</span></p>
              <p><span className="text-muted-foreground">{t({ en: "Blood Group", hi: "रक्त समूह", or: "ରକ୍ତ ଗୋଷ୍ଠୀ", bn: "রক্তের গ্রুপ", te: "రక్త గ్రూప్", ta: "இரத்த வகை", mr: "रक्तगट", gu: "રક્ત જૂથ" })}:</span> <span className="font-medium">{emergencyCard.bloodGroup}</span></p>
              <p><span className="text-muted-foreground">{t({ en: "Allergy", hi: "एलर्जी", or: "ଆଲର୍ଜି", bn: "অ্যালার্জি", te: "అలెర్జీ", ta: "ஒவ்வாமை", mr: "अॅलर्जी", gu: "એલર્જી" })}:</span> <span className="font-medium">{emergencyCard.allergies}</span></p>
            </div>

            <p className="mt-4 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs font-medium text-foreground">
              {t({ en: "Risk Note", hi: "जोखिम नोट", or: "ଜୋଖିମ ଟିପ୍ପଣୀ", bn: "ঝুঁকি নোট", te: "ప్రమాద గమనిక", ta: "அபாய குறிப்பு", mr: "जोखीम नोंद", gu: "જોખમ નોંધ" })}: {emergencyCard.highRiskFlag}
            </p>
          </Card>

          <Card className="border-alert/40 bg-alert/10 p-5">
            <p className="text-sm font-semibold leading-relaxed">
              {t({ en: "For life-threatening emergencies, call 108 immediately.", hi: "जानलेवा आपातकाल में तुरंत 108 पर कॉल करें।", or: "ଜୀବନଘାତୀ ଜରୁରୀ ସ୍ଥିତିରେ ସତେଜ 108 କୁ କଲ୍ କରନ୍ତୁ।", bn: "প্রাণঘাতী জরুরি অবস্থায় সঙ্গে সঙ্গে ১০৮-এ কল করুন।", te: "ప్రాణాపాయ అత్యవసర పరిస్థితుల్లో వెంటనే 108కు కాల్ చేయండి.", ta: "உயிர் ஆபத்து அவசரநிலையில் உடனே 108-ஐ அழைக்கவும்.", mr: "जीवघेण्या आपत्कालात त्वरित 108 वर कॉल करा.", gu: "જીવલેણ આપાતકાલમાં તરત 108 પર કૉલ કરો." })}
            </p>
            <Button onClick={triggerSOS} className="mt-4 w-full bg-alert text-white hover:bg-alert/90">
              <AlertCircle className="mr-2 h-4 w-4" />
              {t({ en: "Trigger SOS to Family + ASHA", hi: "परिवार + आशा को SOS भेजें", or: "ପରିବାର + ଆଶା କୁ SOS ପଠାନ୍ତୁ", bn: "পরিবার + আশা-কে SOS পাঠান", te: "కుటుంబం + ఆశాకు SOS పంపండి", ta: "குடும்பம் + ஆஷாவுக்கு SOS அனுப்பு", mr: "कुटुंब + आशाला SOS पाठवा", gu: "પરિવાર + આશાને SOS મોકલો" })}
            </Button>
            {sosSent && !offlineFallback && (
              <p className="mt-3 text-xs font-medium text-success">{t({ en: "SOS alert sent to saved contacts.", hi: "सहेजे गए संपर्कों को SOS अलर्ट भेजा गया।", or: "ସେଭ୍ କରାଯାଇଥିବା ସଂପର୍କମାନଙ୍କୁ SOS ପଠାଯାଇଛି।", bn: "সংরক্ষিত যোগাযোগে SOS অ্যালার্ট পাঠানো হয়েছে।", te: "సేవ్ చేసిన కాంటాక్ట్‌లకు SOS అలర్ట్ పంపబడింది.", ta: "சேமிக்கப்பட்ட தொடர்புகளுக்கு SOS எச்சரிக்கை அனுப்பப்பட்டது.", mr: "जतन केलेल्या संपर्कांना SOS अलर्ट पाठवला.", gu: "સેવ કરેલા સંપર્કોને SOS અલર્ટ મોકલાયો." })}</p>
            )}
            {offlineFallback && (
              <p className="mt-3 flex items-center gap-2 rounded-lg border border-alert/40 bg-alert/15 px-3 py-2 text-xs font-semibold text-alert">
                <WifiOff className="h-4 w-4 shrink-0" />
                {t({
                  en: "No signal — this alert has NOT reached anyone yet. Call 108 directly now.",
                  hi: "कोई सिग्नल नहीं — यह अलर्ट अभी तक किसी तक नहीं पहुंचा। तुरंत 108 पर कॉल करें।",
                  or: "କୌଣସି ସିଗନାଲ୍ ନାହିଁ — ଏହି ଆଲର୍ଟ ଏପର୍ଯ୍ୟନ୍ତ କାହାରିକୁ ପହଞ୍ଚିନାହିଁ। ତୁରନ୍ତ 108 କୁ କଲ୍ କରନ୍ତୁ।",
                  bn: "কোনো সিগন্যাল নেই — এই সতর্কতা এখনও কারো কাছে পৌঁছায়নি। এখনই ১০৮-এ কল করুন।",
                  te: "సిగ్నల్ లేదు — ఈ అలర్ట్ ఇంకా ఎవరికీ చేరలేదు. వెంటనే 108కు కాల్ చేయండి.",
                  ta: "சிக்னல் இல்லை — இந்த எச்சரிக்கை இன்னும் யாரையும் சென்றடையவில்லை. உடனே 108-ஐ அழைக்கவும்.",
                  mr: "सिग्नल नाही — हा अलर्ट अजून कोणापर्यंत पोहोचलेला नाही. लगेच 108 वर कॉल करा.",
                  gu: "કોઈ સિગ્નલ નથી — આ અલર્ટ હજુ સુધી કોઈ સુધી પહોંચ્યો નથી. તરત 108 પર કૉલ કરો.",
                })}
              </p>
            )}
          </Card>
        </div>

        <Card className="p-5">
          <h3 className="text-lg font-semibold">{t({ en: "Emergency Contacts", hi: "आपातकालीन संपर्क", or: "ଜରୁରୀ ସଂପର୍କ", bn: "জরুরি যোগাযোগ", te: "అత్యవసర సంప్రదింపులు", ta: "அவசர தொடர்புகள்", mr: "आपत्कालीन संपर्क", gu: "આપાતકાલીન સંપર્કો" })}</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {emergencyContacts.map((contact) => (
              <div key={contact.name} className="rounded-xl border border-border bg-secondary/25 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-alert/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-alert" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-snug">{contact.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{contact.number}</p>
                      <Badge variant="outline" className="mt-2 text-[11px]">{contact.type}</Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleCall(contact.number)}
                    size="icon"
                    className="h-10 w-10 rounded-full bg-alert text-white hover:bg-alert/90"
                    aria-label={`Call ${contact.name}`}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-trust/25 p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Ambulance className="h-5 w-5 text-trust" />
            {t({ en: "Transport Directory (ETA + Backup)", hi: "परिवहन निर्देशिका (ETA + बैकअप)", or: "ପରିବହନ ନିର୍ଦ୍ଦେଶିକା (ETA + ବ୍ୟାକଅପ୍)", bn: "পরিবহন ডিরেক্টরি (ETA + ব্যাকআপ)", te: "రవాణా డైరెక్టరీ (ETA + బ్యాకప్)", ta: "போக்குவரத்து பட்டியல் (ETA + மாற்று)", mr: "वाहतूक निर्देशिका (ETA + बॅकअप)", gu: "પરિવહન ડિરેક્ટરી (ETA + બેકઅપ)" })}
          </h3>
          <div className="space-y-3">
            {transportOptions.map((option) => (
              <div key={option.name} className="rounded-xl border border-border bg-secondary/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{option.name}</p>
                    <p className="text-sm text-muted-foreground">{t({ en: "ETA", hi: "ETA", or: "ETA", bn: "ETA", te: "ETA", ta: "ETA", mr: "ETA", gu: "ETA" })}: {option.eta}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {option.fallback && <Badge className="bg-warning/15 text-foreground border-warning/30">{t({ en: "Fallback", hi: "बैकअप", or: "ବ୍ୟାକଅପ୍", bn: "ব্যাকআপ", te: "బ్యాకప్", ta: "மாற்று", mr: "बॅकअप", gu: "બેકઅપ" })}</Badge>}
                    <Button size="sm" variant="outline" onClick={() => handleCall(option.contact)}>
                      <Car className="w-4 h-4 mr-1" />
                      {t({ en: "Call", hi: "कॉल", or: "କଲ୍", bn: "কল", te: "కాల్", ta: "அழை", mr: "कॉल", gu: "કૉલ" })}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
