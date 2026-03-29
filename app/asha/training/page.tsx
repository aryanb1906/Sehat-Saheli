"use client"

import { useMemo } from "react"
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, Video, CheckCircle2, Lock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/lib/language-context"

export default function ASHATraining() {
  const router = useRouter()
  const { content, language } = useLanguage()
  const t = (copy: Record<string, string>) => copy[language] || copy.en
  const modules = useMemo(() => [
    {
      id: 1,
      title: t({ en: "Antenatal Care Basics", hi: "एंटीनैटल केयर मूल बातें", or: "ଏଣ୍ଟିନେଟାଲ୍ କେୟାର୍ ମୂଳଭିତ୍ତି", bn: "অ্যান্টিনাটাল কেয়ার বেসিকস", te: "అంటీనేటల్ కేర్ మూలాలు", ta: "கர்ப்பகால பராமரிப்பு அடிப்படைகள்", mr: "अँटिनेटल केअर मूलतत्त्वे", gu: "એન્ટીનેટલ કેર મૂળભૂત બાબતો" }),
      description: t({ en: "Learn about prenatal checkups and screenings", hi: "प्रसवपूर्व जांच और स्क्रीनिंग के बारे में सीखें", or: "ପ୍ରସବ ପୂର୍ବ ଚେକଅପ୍ ଏବଂ ସ୍କ୍ରିନିଂ ବିଷୟରେ ଜାଣନ୍ତୁ", bn: "প্রসবপূর্ব চেকআপ ও স্ক্রিনিং সম্পর্কে জানুন", te: "ప్రసవపూర్వ చెకప్‌లు మరియు స్క్రీనింగ్ గురించి తెలుసుకోండి", ta: "கர்ப்பத்திற்கு முன் பரிசோதனைகள் மற்றும் திரையிடலை அறிக", mr: "प्रसूतीपूर्व तपासण्या आणि स्क्रीनिंगबद्दल जाणून घ्या", gu: "પ્રસૂતિપૂર્વ ચેકઅપ અને સ્ક્રીનિંગ વિશે જાણો" }),
      duration: t({ en: "30 min", hi: "30 मिनट", or: "30 ମିନିଟ୍", bn: "30 মিনিট", te: "30 నిమిషాలు", ta: "30 நிமிடம்", mr: "30 मिनिटे", gu: "30 મિનિટ" }),
      progress: 100,
      completed: true,
      type: "video",
    },
    {
      id: 2,
      title: t({ en: "High-Risk Pregnancy Recognition", hi: "उच्च-जोखिम गर्भावस्था पहचान", or: "ଉଚ୍ଚ-ଜୋଖିମ ଗର୍ଭାବସ୍ଥା ପରିଚୟ", bn: "উচ্চ-ঝুঁকির গর্ভাবস্থা শনাক্তকরণ", te: "అధిక ప్రమాద గర్భధారణ గుర్తింపు", ta: "அதிக அபாய கர்ப்பம் அடையாளம்", mr: "उच्च-जोखीम गर्भधारणा ओळख", gu: "ઉચ્ચ જોખમ ગર્ભાવસ્થા ઓળખ" }),
      description: t({ en: "Identify warning signs and risk factors", hi: "चेतावनी संकेत और जोखिम कारकों की पहचान करें", or: "ସତର୍କ ସଙ୍କେତ ଏବଂ ଜୋଖିମ ଘଟକକୁ ଚିହ୍ନଟ କରନ୍ତୁ", bn: "সতর্ক সংকেত ও ঝুঁকির কারণ শনাক্ত করুন", te: "హెచ్చరిక లక్షణాలు మరియు ప్రమాద కారకాలను గుర్తించండి", ta: "எச்சரிக்கை அறிகுறிகள் மற்றும் அபாய காரணிகளை கண்டறியவும்", mr: "चेतावणी चिन्हे आणि जोखीम घटक ओळखा", gu: "ચેતવણી ચિહ્નો અને જોખમ કારકો ઓળખો" }),
      duration: t({ en: "45 min", hi: "45 मिनट", or: "45 ମିନିଟ୍", bn: "45 মিনিট", te: "45 నిమిషాలు", ta: "45 நிமிடம்", mr: "45 मिनिटे", gu: "45 મિનિટ" }),
      progress: 100,
      completed: true,
      type: "video",
    },
    {
      id: 3,
      title: t({ en: "Emergency Response Protocol", hi: "आपातकालीन प्रतिक्रिया प्रोटोकॉल", or: "ଜରୁରୀ ପ୍ରତିକ୍ରିୟା ପ୍ରୋଟୋକଲ୍", bn: "জরুরি প্রতিক্রিয়া প্রোটোকল", te: "అత్యవసర ప్రతిస్పందన ప్రోటోకాల్", ta: "அவசர பதில் நடைமுறை", mr: "आपत्कालीन प्रतिसाद प्रोटोकॉल", gu: "આપાતકાલીન પ્રતિસાદ પ્રોટોકોલ" }),
      description: t({ en: "Handle pregnancy emergencies effectively", hi: "गर्भावस्था आपातकाल को प्रभावी ढंग से संभालें", or: "ଗର୍ଭାବସ୍ଥା ଜରୁରୀ ସ୍ଥିତିକୁ କାର୍ଯ୍ୟକ୍ଷମ ଭାବେ ହାତଲ କରନ୍ତୁ", bn: "গর্ভাবস্থার জরুরি অবস্থা কার্যকরভাবে সামলান", te: "గర్భధారణ అత్యవసర పరిస్థితులను సమర్థంగా నిర్వహించండి", ta: "கர்ப்ப அவசர நிலைகளை திறம்பட கையாளுங்கள்", mr: "गर्भधारणा आपत्कालीन स्थिती प्रभावीपणे हाताळा", gu: "ગર્ભાવસ્થા આપાતકાલને અસરકારક રીતે હેન્ડલ કરો" }),
      duration: t({ en: "25 min", hi: "25 मिनट", or: "25 ମିନିଟ୍", bn: "25 মিনিট", te: "25 నిమిషాలు", ta: "25 நிமிடம்", mr: "25 मिनिटे", gu: "25 મિનિટ" }),
      progress: 60,
      completed: false,
      type: "interactive",
    },
    {
      id: 4,
      title: t({ en: "Nutrition Counseling", hi: "पोषण परामर्श", or: "ପୋଷଣ ପରାମର୍ଶ", bn: "পুষ্টি পরামর্শ", te: "పోషణ కౌన్సిలింగ్", ta: "ஊட்டச்சத்து ஆலோசனை", mr: "पोषण समुपदेशन", gu: "પોષણ માર્ગદર્શન" }),
      description: t({ en: "Guide mothers on proper pregnancy nutrition", hi: "माताओं को सही गर्भावस्था पोषण पर मार्गदर्शन दें", or: "ଠିକ୍ ଗର୍ଭାବସ୍ଥା ପୋଷଣ ବିଷୟରେ ମା'ମାନଙ୍କୁ ମାର୍ଗଦର୍ଶନ ଦିଅନ୍ତୁ", bn: "সঠিক গর্ভকালীন পুষ্টিতে মায়েদের গাইড করুন", te: "సరైన గర్భధారణ పోషణపై తల్లులకు మార్గనిర్దేశం చేయండి", ta: "சரியான கர்ப்ப ஊட்டச்சத்துக்கு தாய்மார்களுக்கு வழிகாட்டுங்கள்", mr: "योग्य गर्भधारणा पोषणाबाबत मातांना मार्गदर्शन करा", gu: "યોગ્ય ગર્ભાવસ્થા પોષણ માટે માતાઓને માર્ગદર્શન આપો" }),
      duration: t({ en: "20 min", hi: "20 मिनट", or: "20 ମିନିଟ୍", bn: "20 মিনিট", te: "20 నిమిషాలు", ta: "20 நிமிடம்", mr: "20 मिनिटे", gu: "20 મિનિટ" }),
      progress: 0,
      completed: false,
      type: "reading",
    },
    {
      id: 5,
      title: t({ en: "Mental Health Support", hi: "मानसिक स्वास्थ्य सहायता", or: "ମାନସିକ ସ୍ୱାସ୍ଥ୍ୟ ସହାୟତା", bn: "মানসিক স্বাস্থ্য সহায়তা", te: "మానసిక ఆరోగ్య సహాయం", ta: "மனநல ஆதரவு", mr: "मानसिक आरोग्य सहाय्य", gu: "માનસિક આરોગ્ય સહાય" }),
      description: t({ en: "Provide emotional and psychological support", hi: "भावनात्मक और मनोवैज्ञानिक सहायता प्रदान करें", or: "ଭାବନାତ୍ମକ ଏବଂ ମନୋବୈଜ୍ଞାନିକ ସହାୟତା ଦିଅନ୍ତୁ", bn: "মানসিক ও আবেগগত সহায়তা প্রদান করুন", te: "భావోద్వేగ మరియు మానసిక సహాయం అందించండి", ta: "உணர்ச்சி மற்றும் உளவியல் ஆதரவை வழங்குங்கள்", mr: "भावनिक आणि मानसिक सहाय्य द्या", gu: "ભાવનાત્મક અને માનસિક સહાય પૂરી પાડો" }),
      duration: t({ en: "35 min", hi: "35 मिनट", or: "35 ମିନିଟ୍", bn: "35 মিনিট", te: "35 నిమిషాలు", ta: "35 நிமிடம்", mr: "35 मिनिटे", gu: "35 મિનિટ" }),
      progress: 0,
      completed: false,
      type: "video",
      locked: true,
    },
  ], [language])

  const completedCount = modules.filter((m) => m.completed).length
  const totalProgress = Math.round(modules.reduce((sum, m) => sum + m.progress, 0) / modules.length)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-trust/5 to-background">
      <div className="bg-gradient-to-r from-trust to-accent p-6 text-white">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">ASHA Training Modules</h1>
            <p className="text-white/80 text-sm">{t({ en: 'Continuous learning for better care', hi: 'बेहतर देखभाल के लिए निरंतर सीखना', or: 'ଭଲ ଯତ୍ନ ପାଇଁ ଅବିରତ ଶିକ୍ଷା', bn: 'উন্নত যত্নের জন্য ধারাবাহিক শিক্ষা', te: 'మెరుగైన సంరక్షణ కోసం నిరంతర అధ్యయనం', ta: 'சிறந்த பராமரிப்பிற்கான தொடர்ச்சியான கற்றல்', mr: 'उत्तम काळजीसाठी सतत शिक्षण', gu: 'સારી સંભાળ માટે સતત અભ્યાસ' })}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <Card className="p-6 bg-gradient-to-br from-trust/10 to-accent/10 border-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">{t({ en: 'Your Progress', hi: 'आपकी प्रगति', or: 'ଆପଣଙ୍କ ପ୍ରଗତି', bn: 'আপনার অগ্রগতি', te: 'మీ పురోగతి', ta: 'உங்கள் முன்னேற்றம்', mr: 'तुमची प्रगती', gu: 'તમારી પ્રગતિ' })}</h2>
              <p className="text-sm text-muted-foreground">
                {completedCount}/{modules.length} {t({ en: 'modules completed', hi: 'मॉड्यूल पूरे', or: 'ମଡ୍ୟୁଲ୍ ସମ୍ପୂର୍ଣ୍ଣ', bn: 'মডিউল সম্পন্ন', te: 'మాడ్యూల్స్ పూర్తి', ta: 'தொகுதிகள் முடிந்தது', mr: 'मॉड्यूल पूर्ण', gu: 'મોડ્યુલ પૂર્ણ' })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-trust">{totalProgress}%</div>
            </div>
          </div>
          <Progress value={totalProgress} className="h-3" />
        </Card>

        <div>
          <h2 className="text-lg font-semibold mb-4">{t({ en: 'Training Modules', hi: 'प्रशिक्षण मॉड्यूल', or: 'ପ୍ରଶିକ୍ଷଣ ମଡ୍ୟୁଲ୍', bn: 'প্রশিক্ষণ মডিউল', te: 'శిక్షణ మాడ్యూల్స్', ta: 'பயிற்சி தொகுதிகள்', mr: 'प्रशिक्षण मॉड्यूल', gu: 'ટ્રેનિંગ મોડ્યુલ્સ' })}</h2>
          <div className="space-y-4">
            {modules.map((module) => (
              <Card
                key={module.id}
                className={`p-4 hover:shadow-lg transition-all ${module.completed ? "bg-success/5" : ""} ${module.locked ? "opacity-60" : ""
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${module.completed
                        ? "bg-success/20"
                        : module.locked
                          ? "bg-muted"
                          : "bg-trust/20"
                      }`}
                  >
                    {module.locked ? (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    ) : module.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    ) : module.type === "video" ? (
                      <Video className="w-6 h-6 text-trust" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-trust" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{module.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {module.duration}
                      </Badge>
                      <Badge
                        className={`text-xs ${module.type === "video"
                            ? "bg-trust/10 text-trust"
                            : module.type === "interactive"
                              ? "bg-accent/10 text-accent"
                              : "bg-success/10 text-success"
                          }`}
                      >
                        {module.type === 'video'
                          ? t({ en: 'Video', hi: 'वीडियो', or: 'ଭିଡିଓ', bn: 'ভিডিও', te: 'వీడియో', ta: 'வீடியோ', mr: 'व्हिडिओ', gu: 'વિડિયો' })
                          : module.type === 'interactive'
                            ? t({ en: 'Interactive', hi: 'इंटरैक्टिव', or: 'ଇଣ୍ଟରାକ୍ଟିଭ୍', bn: 'ইন্টারেক্টিভ', te: 'ఇంటరాక్టివ్', ta: 'இணைய செயல்', mr: 'इंटरॅक्टिव', gu: 'ઇન્ટરેક્ટિવ' })
                            : t({ en: 'Reading', hi: 'पठन', or: 'ପଠନ', bn: 'পঠন', te: 'వాచనం', ta: 'வாசிப்பு', mr: 'वाचन', gu: 'વાંચન' })}
                      </Badge>
                    </div>

                    {!module.completed && !module.locked && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{t({ en: 'Progress', hi: 'प्रगति', or: 'ପ୍ରଗତି', bn: 'অগ্রগতি', te: 'పురోగతి', ta: 'முன்னேற்றம்', mr: 'प्रगती', gu: 'પ્રગતિ' })}</span>
                          <span className="font-medium">{module.progress}%</span>
                        </div>
                        <Progress value={module.progress} className="h-2" />
                      </div>
                    )}

                    <Button
                      className={`w-full ${module.completed
                          ? "bg-success/10 text-success hover:bg-success/20"
                          : module.locked
                            ? "bg-muted"
                            : "bg-trust hover:bg-trust/90"
                        }`}
                      disabled={module.locked}
                    >
                      {module.locked ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          {t({ en: 'Complete previous modules', hi: 'पिछले मॉड्यूल पूरे करें', or: 'ପୂର୍ବବର୍ତ୍ତୀ ମଡ୍ୟୁଲ୍ ସମାପ୍ତ କରନ୍ତୁ', bn: 'আগের মডিউল সম্পন্ন করুন', te: 'మునుపటి మాడ్యూల్స్ పూర్తి చేయండి', ta: 'முன்னைய தொகுதிகளை முடிக்கவும்', mr: 'मागील मॉड्यूल पूर्ण करा', gu: 'પાછલા મોડ્યુલ પૂર્ણ કરો' })}
                        </>
                      ) : module.completed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          {t({ en: 'Completed', hi: 'पूर्ण', or: 'ସମ୍ପୂର୍ଣ୍ଣ', bn: 'সম্পন্ন', te: 'పూర్తి', ta: 'முடிந்தது', mr: 'पूर्ण', gu: 'પૂર્ણ' })}
                        </>
                      ) : module.progress > 0 ? (
                        t({ en: 'Continue Learning', hi: 'सीखना जारी रखें', or: 'ଶିକ୍ଷା ଜାରି ରଖନ୍ତୁ', bn: 'শেখা চালিয়ে যান', te: 'చదువు కొనసాగించండి', ta: 'கற்றலைத் தொடரவும்', mr: 'शिकणे सुरू ठेवा', gu: 'અભ્યાસ ચાલુ રાખો' })
                      ) : (
                        t({ en: 'Start Module', hi: 'मॉड्यूल शुरू करें', or: 'ମଡ୍ୟୁଲ୍ ଆରମ୍ଭ କରନ୍ତୁ', bn: 'মডিউল শুরু করুন', te: 'మాడ్యూల్ ప్రారంభించండి', ta: 'தொகுதியைத் தொடங்கவும்', mr: 'मॉड्यूल सुरू करा', gu: 'મોડ્યુલ શરૂ કરો' })
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
