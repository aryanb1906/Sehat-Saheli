"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Users, Trash2, ShieldCheck, Send, CalendarCheck2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"

interface FamilyMember {
  id: string
  name: string
  relation: string
  canView: boolean
  phone?: string
}

export default function FamilySharing() {
  const router = useRouter()
  const { content, language } = useLanguage()
  const { toast } = useToast()
  const t = (copy: Record<string, string>) => copy[language] || copy.en
  const [sharingEnabled, setSharingEnabled] = useState(true)
  const [members, setMembers] = useState<FamilyMember[]>([
    { id: "1", name: "Rajesh", relation: t({ en: "Husband", hi: "पति", or: "ସ୍ୱାମୀ", bn: "স্বামী", te: "భర్త", ta: "கணவர்", mr: "पती", gu: "પતિ" }), canView: true, phone: "+91-98XXXXXX11" },
    { id: "2", name: t({ en: "Mother", hi: "मां", or: "ମା'", bn: "মা", te: "తల్లి", ta: "அம்மா", mr: "आई", gu: "માતા" }), relation: t({ en: "Mother", hi: "मां", or: "ମା'", bn: "মা", te: "తల్లి", ta: "அம்மா", mr: "आई", gu: "માતા" }), canView: true, phone: "+91-98XXXXXX22" },
  ])

  const timeline = [
    { id: "t1", label: t({ en: "Birth transport identified", hi: "जन्म के लिए परिवहन तय", or: "ଜନ୍ମ ପାଇଁ ପରିବହନ ଚିହ୍ନଟ", bn: "প্রসবের পরিবহন নির্ধারিত", te: "ప్రసవ రవాణా గుర్తించబడింది", ta: "பிரசவ போக்குவரத்து தீர்மானிக்கப்பட்டது", mr: "प्रसूती वाहतूक निश्चित", gu: "જન્મ માટે પરિવહન નક્કી" }), done: true },
    { id: "t2", label: t({ en: "Hospital bag checklist reviewed", hi: "हॉस्पिटल बैग चेकलिस्ट देखी गई", or: "ହସ୍ପିଟାଲ୍ ବ୍ୟାଗ୍ ଚେକଲିଷ୍ଟ ଯାଞ୍ଚ", bn: "হাসপাতাল ব্যাগ চেকলিস্ট পর্যালোচনা", te: "హాస్పిటల్ బ్యాగ్ చెక్లిస్ట్ పరిశీలించబడింది", ta: "மருத்துவமனை பை பட்டியல் பரிசீலிக்கப்பட்டது", mr: "हॉस्पिटल बॅग चेकलिस्ट तपासली", gu: "હોસ્પિટલ બેગ ચેકલિસ્ટ સમીક્ષાઈ" }), done: true },
    { id: "t3", label: t({ en: "Blood donor backup confirmed", hi: "रक्तदाता बैकअप पुष्टि", or: "ରକ୍ତଦାତା ବ୍ୟାକଅପ୍ ନିଶ୍ଚିତ", bn: "রক্তদাতা ব্যাকআপ নিশ্চিত", te: "బ్లడ్ డోనర్ బ్యాకప్ నిర్ధారితమైంది", ta: "இரத்த தானகர் மாற்று உறுதி", mr: "रक्तदाता बॅकअप निश्चित", gu: "બ્લડ ડોનર બેકઅપ પુષ્ટિ" }), done: false },
    { id: "t4", label: t({ en: "Next ANC checkup date shared", hi: "अगली ANC जांच तारीख साझा", or: "ପରବର୍ତ୍ତୀ ANC ଚେକଅପ୍ ତାରିଖ ସେୟାର୍", bn: "পরবর্তী ANC চেকআপ তারিখ শেয়ার", te: "తదుపరి ANC చెకప్ తేదీ పంచుకున్నారు", ta: "அடுத்த ANC பரிசோதனை தேதி பகிரப்பட்டது", mr: "पुढील ANC तपासणी तारीख शेअर", gu: "આગામી ANC ચેકઅપ તારીખ શેર" }), done: false },
  ]

  const sendNudge = (type: "transport" | "donor" | "checkup") => {
    const templates = {
      transport: t({ en: "Reminder: Please confirm transport arrangement for delivery readiness.", hi: "रिमाइंडर: डिलीवरी तैयारी के लिए परिवहन व्यवस्था की पुष्टि करें।", or: "ସ୍ମୃତିପତ୍ର: ପ୍ରସବ ପ୍ରସ୍ତୁତି ପାଇଁ ପରିବହନ ବ୍ୟବସ୍ଥା ନିଶ୍ଚିତ କରନ୍ତୁ।", bn: "রিমাইন্ডার: প্রসব প্রস্তুতির জন্য পরিবহন ব্যবস্থা নিশ্চিত করুন।", te: "రిమైండర్: ప్రసవ సిద్ధత కోసం రవాణా ఏర్పాటును నిర్ధారించండి.", ta: "நினைவூட்டு: பிரசவ தயாரிப்பிற்கான போக்குவரத்தை உறுதி செய்யுங்கள்.", mr: "स्मरणपत्र: प्रसूती तयारीसाठी वाहतूक व्यवस्था निश्चित करा.", gu: "યાદ અપાવવું: પ્રસૂતિ તૈયારી માટે પરિવહન વ્યવસ્થા પુષ્ટિ કરો." }),
      donor: t({ en: "Reminder: Please confirm blood donor backup details for emergency readiness.", hi: "रिमाइंडर: आपातकालीन तैयारी हेतु रक्तदाता बैकअप विवरण की पुष्टि करें।", or: "ସ୍ମୃତିପତ୍ର: ଜରୁରୀ ପ୍ରସ୍ତୁତି ପାଇଁ ରକ୍ତଦାତା ବ୍ୟାକଅପ୍ ବିବରଣୀ ନିଶ୍ଚିତ କରନ୍ତୁ।", bn: "রিমাইন্ডার: জরুরি প্রস্তুতির জন্য রক্তদাতা ব্যাকআপ নিশ্চিত করুন।", te: "రిమైండర్: అత్యవసర సిద్ధత కోసం బ్లడ్ డోనర్ బ్యాకప్ వివరాలు నిర్ధారించండి.", ta: "நினைவூட்டு: அவசரத் தயாரிப்புக்கான இரத்த தானகர் மாற்று விவரங்களை உறுதி செய்யுங்கள்.", mr: "स्मरणपत्र: आपत्कालीन तयारीसाठी रक्तदाता बॅकअप तपशील निश्चित करा.", gu: "યાદ અપાવવું: આપાતકાલીન તૈયારી માટે બ્લડ ડોનર બેકઅપ વિગતો પુષ્ટિ કરો." }),
      checkup: t({ en: "Reminder: ANC checkup is due soon. Please support clinic visit planning.", hi: "रिमाइंडर: ANC जांच जल्द देय है। कृपया क्लिनिक विज़िट योजना में सहयोग करें।", or: "ସ୍ମୃତିପତ୍ର: ANC ଚେକଅପ୍ ଶୀଘ୍ର ଦେୟ। କ୍ଲିନିକ୍ ଭିଜିଟ୍ ଯୋଜନାରେ ସହଯୋଗ କରନ୍ତୁ।", bn: "রিমাইন্ডার: ANC চেকআপ শীঘ্রই। ক্লিনিক ভিজিট পরিকল্পনায় সহায়তা করুন।", te: "రిమైండర్: ANC చెకప్ త్వరలో ఉంది. క్లినిక్ సందర్శన ప్రణాళికలో సహకరించండి.", ta: "நினைவூட்டு: ANC பரிசோதனை விரைவில் உள்ளது. கிளினிக் வருகை திட்டத்திற்கு உதவுங்கள்.", mr: "स्मरणपत्र: ANC तपासणी लवकरच आहे. क्लिनिक भेट नियोजनात मदत करा.", gu: "યાદ અપાવવું: ANC ચેકઅપ જલ્દી છે. ક્લિનિક મુલાકાત આયોજનમાં સહયોગ આપો." }),
    }

    toast({
      title: t({ en: "Nudge sent", hi: "रिमाइंडर भेजा गया", or: "ନଜ୍ ପଠାଯାଇଛି", bn: "নাজ পাঠানো হয়েছে", te: "నడ్జ్ పంపబడింది", ta: "நினைவூட்டு அனுப்பப்பட்டது", mr: "नज पाठवला", gu: "નજ મોકલાયો" }),
      description: templates[type],
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-princess-1/20 via-white to-princess-1/10 pb-10">
      <div className="mx-auto mt-4 w-full max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-r from-princess-4 to-primary p-6 text-white shadow-lg shadow-princess-4/20 border border-white/20">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white hover:bg-white/20 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{t({ en: "Family Sharing", hi: "परिवार साझा", or: "ପରିବାର ସେୟାରିଂ", bn: "পরিবার শেয়ারিং", te: "కుటుంబ భాగస్వామ్యం", ta: "குடும்ப பகிர்வு", mr: "कुटुंब शेअरिंग", gu: "કુટુંબ શેરિંગ" })}</h1>
            <p className="text-white/80 text-sm">{t({ en: "Share updates with loved ones", hi: "अपने प्रियजनों के साथ अपडेट साझा करें", or: "ପ୍ରିୟଜନଙ୍କ ସହ ଅପଡେଟ୍ ସେୟାର୍ କରନ୍ତୁ", bn: "প্রিয়জনদের সাথে আপডেট ভাগ করুন", te: "సన్నిహితులతో నవీకరణలు పంచుకోండి", ta: "அன்புக்குரியோருடன் புதுப்பிப்புகளை பகிருங்கள்", mr: "आपल्या प्रियजनांशी अपडेट्स शेअर करा", gu: "તમારા પ્રિયજનો સાથે અપડેટ્સ શેર કરો" })}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-5 w-full max-w-5xl px-4 space-y-4">
        <Card className="p-5 border border-success/20 bg-card shadow-sm rounded-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-success/30 bg-success/10">
                <ShieldCheck className="w-4 h-4 text-success" />
              </div>
              <div>
                <h3 className="font-semibold">{t({ en: "Consent-Based Family Sharing", hi: "सहमति-आधारित परिवार साझा", or: "ସମ୍ମତି ଆଧାରିତ ପରିବାର ସେୟାରିଂ", bn: "সম্মতিভিত্তিক পরিবার শেয়ারিং", te: "అంగీకార ఆధారిత కుటుంబ భాగస్వామ్యం", ta: "ஒப்புதலின் அடிப்படையிலான குடும்ப பகிர்வு", mr: "संमती-आधारित कुटुंब शेअरिंग", gu: "સંમતિ આધારિત કુટુંબ શેરિંગ" })}</h3>
                <p className="text-sm text-muted-foreground">{t({ en: "Family receives read-only pregnancy updates only after your consent.", hi: "आपकी सहमति के बाद ही परिवार को केवल-पठन अपडेट मिलते हैं।", or: "ଆପଣଙ୍କ ସମ୍ମତି ପରେମାତ୍ର ପରିବାର କେବଳ ପଠନ ଅପଡେଟ୍ ପାଉଛନ୍ତି।", bn: "আপনার সম্মতির পরই পরিবার কেবল-পঠন আপডেট পায়।", te: "మీ అంగీకారం తర్వాత మాత్రమే కుటుంబం రీడ్-ఓన్లీ అప్డేట్లు పొందుతుంది.", ta: "உங்கள் ஒப்புதலுக்குப் பிறகே குடும்பம் வாசிப்பு-மட்டும் புதுப்பிப்புகளை பெறும்.", mr: "तुमच्या संमतीनंतरच कुटुंबाला फक्त-वाचन अद्यतने मिळतात.", gu: "તમારી સંમતિ પછી જ કુટુંબને વાંચન-માત્ર અપડેટ્સ મળે છે." })}</p>
              </div>
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sharingEnabled}
                onChange={(e) => setSharingEnabled(e.target.checked)}
              />
              {t({ en: "Sharing enabled", hi: "साझा सक्षम", or: "ସେୟାରିଂ ସକ୍ରିୟ", bn: "শেয়ারিং চালু", te: "షేరింగ్ ప్రారంభం", ta: "பகிர்வு செயல்படுத்தப்பட்டது", mr: "शेअरिंग सक्षम", gu: "શેરિંગ સક્રિય" })}
            </label>
          </div>
        </Card>

        <Card className="p-5 border border-trust/20 bg-card shadow-sm rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <CalendarCheck2 className="w-5 h-5 text-trust" />
            <h3 className="font-semibold">{t({ en: "Shared Pregnancy Timeline", hi: "साझा गर्भावस्था टाइमलाइन", or: "ସେୟାର୍ ଗର୍ଭାବସ୍ଥା ଟାଇମଲାଇନ୍", bn: "শেয়ার্ড গর্ভাবস্থা টাইমলাইন", te: "షేర్డ్ గర్భధారణ టైమ్‌లైన్", ta: "பகிரப்பட்ட கர்ப்ப காலவரிசை", mr: "शेअर्ड गर्भधारणा टाइमलाइन", gu: "શેર કરેલી ગર્ભાવસ્થા સમયરેખા" })}</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {timeline.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-border/70 bg-background/70 px-3 py-2.5">
                <p className="text-sm">{item.label}</p>
                <span className={`text-xs font-semibold ${item.done ? "text-success" : "text-warning"}`}>
                  {item.done ? t({ en: "Done", hi: "पूर्ण", or: "ସମ୍ପୂର୍ଣ୍ଣ", bn: "সম্পন্ন", te: "పూర్తి", ta: "முடிந்தது", mr: "पूर्ण", gu: "પૂર્ણ" }) : t({ en: "Pending", hi: "लंबित", or: "ବକେୟା", bn: "অপেক্ষমাণ", te: "పెండింగ్", ta: "நிலுவை", mr: "प्रलंबित", gu: "બાકી" })}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-3 md:grid-cols-2">
          {members.map((member) => (
            <Card key={member.id} className="p-4 border border-success/20 bg-card shadow-sm rounded-2xl">
              <div className="flex items-start gap-3 mb-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-success/30 bg-success/10">
                  <Users className="w-4 h-4 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.relation}</p>
                  {member.phone && <p className="text-xs text-muted-foreground mt-1">{member.phone}</p>}
                </div>
                <Button variant="ghost" size="icon" className="text-alert">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 bg-success/10 text-success rounded">{t({ en: "Read-only access", hi: "केवल-पठन पहुंच", or: "କେବଳ ପଠନ ଅଭିଗମ୍ୟତା", bn: "শুধু-পঠন অ্যাক্সেস", te: "రీడ్-ఓన్లీ యాక్సెస్", ta: "வாசிப்பு மட்டும் அணுகல்", mr: "फक्त-वाचन प्रवेश", gu: "વાંચન-માત્ર ઍક્સેસ" })}</span>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-5 border border-warning/25 bg-warning/5 rounded-2xl shadow-sm">
          <h3 className="font-semibold mb-3">{t({ en: "Send Family Nudges", hi: "परिवार को रिमाइंडर भेजें", or: "ପରିବାରକୁ ନଜ୍ ପଠାନ୍ତୁ", bn: "পরিবারকে নাজ পাঠান", te: "కుటుంబానికి నడ్జ్ పంపండి", ta: "குடும்பத்திற்கு நினைவூட்டல் அனுப்புக", mr: "कुटुंबाला नज पाठवा", gu: "કુટુંબને નજ મોકલો" })}</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={!sharingEnabled} onClick={() => sendNudge("transport")}>
              <Send className="w-4 h-4 mr-2" />
              {t({ en: "Transport Prep", hi: "परिवहन तैयारी", or: "ପରିବହନ ପ୍ରସ୍ତୁତି", bn: "পরিবহন প্রস্তুতি", te: "రవాణా సిద్ధత", ta: "போக்குவரத்து தயாரிப்பு", mr: "वाहतूक तयारी", gu: "પરિવહન તૈયારી" })}
            </Button>
            <Button variant="outline" disabled={!sharingEnabled} onClick={() => sendNudge("donor")}>
              <Send className="w-4 h-4 mr-2" />
              {t({ en: "Blood Donor Prep", hi: "रक्तदाता तैयारी", or: "ରକ୍ତଦାତା ପ୍ରସ୍ତୁତି", bn: "রক্তদাতা প্রস্তুতি", te: "బ్లడ్ డోనర్ సిద్ధత", ta: "இரத்த தானகர் தயார்", mr: "रक्तदाता तयारी", gu: "બ્લડ ડોનર તૈયારી" })}
            </Button>
            <Button variant="outline" disabled={!sharingEnabled} onClick={() => sendNudge("checkup")}>
              <Send className="w-4 h-4 mr-2" />
              {t({ en: "Checkup Reminder", hi: "चेकअप रिमाइंडर", or: "ଚେକଅପ୍ ସ୍ମୃତିପତ୍ର", bn: "চেকআপ রিমাইন্ডার", te: "చెకప్ రిమైండర్", ta: "பரிசோதனை நினைவூட்டு", mr: "तपासणी स्मरणपत्र", gu: "ચેકઅપ રિમાઇન્ડર" })}
            </Button>
          </div>
        </Card>

        <Button className="w-full bg-success text-white mt-4">
          <Plus className="w-4 h-4 mr-2" /> {t({ en: "Add Family Member", hi: "परिवार सदस्य जोड़ें", or: "ପରିବାର ସଦସ୍ୟ ଯୋଡନ୍ତୁ", bn: "পরিবার সদস্য যোগ করুন", te: "కుటుంబ సభ్యుని జోడించండి", ta: "குடும்ப உறுப்பினரைச் சேர்க்கவும்", mr: "कुटुंब सदस्य जोडा", gu: "કુટુંબ સભ્ય ઉમેરો" })}
        </Button>
      </div>
    </div>
  )
}
