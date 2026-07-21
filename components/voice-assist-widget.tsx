"use client"

import { useEffect, useState } from "react"
import { Activity, Languages, Mic, MicOff, Sparkles, Volume2, ChevronDown } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useVoiceAssistant } from "@/hooks/use-voice-assistant"
import { useLanguage } from "@/lib/language-context"
import { VoiceAssistantAnalyticsSummary } from "@/lib/voice-assistant/types"

const SETTINGS_KEY = "voice-assistant-settings"
const supportedLanguageOptions = ["en", "hi", "or", "bn", "te", "ta", "mr", "gu"] as const

type SupportedLanguage = (typeof supportedLanguageOptions)[number]

type VoiceAssistantSettings = {
    languageOverride: "default" | SupportedLanguage
    autoListen: boolean
    speakingRate: number
}

const defaultSettings: VoiceAssistantSettings = {
    languageOverride: "default",
    autoListen: true,
    speakingRate: 0.95,
}

export function VoiceAssistWidget() {
    const { language } = useLanguage()
    const router = useRouter()
    const pathname = usePathname()
    const [showSettings, setShowSettings] = useState(false)
    const [settings, setSettings] = useState<VoiceAssistantSettings>(defaultSettings)
    const [analytics, setAnalytics] = useState<VoiceAssistantAnalyticsSummary | null>(null)
    const [isMinimized, setIsMinimized] = useState(true)

    const t = (copy: Record<string, string>) => copy[language] || copy.en

    useEffect(() => {
        const raw = localStorage.getItem(SETTINGS_KEY)
        if (!raw) return
        try {
            const parsed = JSON.parse(raw) as Partial<VoiceAssistantSettings>
            const languageOverride: VoiceAssistantSettings["languageOverride"] =
                parsed.languageOverride === "default" ||
                    (typeof parsed.languageOverride === "string" && supportedLanguageOptions.includes(parsed.languageOverride as SupportedLanguage))
                    ? (parsed.languageOverride as VoiceAssistantSettings["languageOverride"])
                    : "default"
            setSettings({
                languageOverride,
                autoListen: parsed.autoListen ?? true,
                speakingRate:
                    typeof parsed.speakingRate === "number"
                        ? Math.max(0.7, Math.min(1.2, parsed.speakingRate))
                        : 0.95,
            })
        } catch {
            setSettings(defaultSettings)
        }
    }, [])

    useEffect(() => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    }, [settings])

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                const response = await fetch("/api/voice-assistant/analytics?limit=80")
                const data = await response.json()
                if (response.ok && data?.summary) {
                    setAnalytics(data.summary)
                }
            } catch {
                // Non-blocking analytics panel fetch.
            }
        }

        void loadAnalytics()
        const timer = setInterval(() => {
            void loadAnalytics()
        }, 12000)

        return () => clearInterval(timer)
    }, [])

    const {
        locale,
        status,
        isListening,
        liveTranscript,
        heardText,
        feedback,
        error,
        suggestions,
        startListening,
        stopListening,
        runSuggestedCommand,
        speakText,
    } = useVoiceAssistant({
        language,
        languageOverride: settings.languageOverride === "default" ? null : settings.languageOverride,
        autoListen: settings.autoListen,
        speakingRate: settings.speakingRate,
        currentPath: pathname,
        navigate: (path) => router.push(path),
    })

    const stateLabel =
        status === "listening"
            ? t({ en: "Listening", hi: "सुन रही है", or: "ଶୁଣୁଛି", bn: "শুনছে", te: "వింటోంది", ta: "கேட்கிறது", mr: "ऐकत आहे", gu: "સાંભળી રહી છે" })
            : status === "processing"
                ? t({ en: "Processing", hi: "प्रोसेसिंग", or: "ପ୍ରୋସେସିଂ", bn: "প্রসেসিং", te: "ప్రాసెస్ అవుతోంది", ta: "செயலாக்கம்", mr: "प्रक्रिया सुरू", gu: "પ્રોસેસિંગ" })
                : status === "responding"
                    ? t({ en: "Responding", hi: "उत्तर दे रही है", or: "ଉତ୍ତର ଦେଉଛି", bn: "উত্তর দিচ্ছে", te: "స్పందిస్తోంది", ta: "பதில் அளிக்கிறது", mr: "उत्तर देत आहे", gu: "જવાબ આપી રહી છે" })
                    : status === "error"
                        ? t({ en: "Error", hi: "त्रुटि", or: "ତ୍ରୁଟି", bn: "ত্রুটি", te: "లోపం", ta: "பிழை", mr: "त्रुटी", gu: "ભૂલ" })
                        : t({ en: "Idle", hi: "तैयार", or: "ପ୍ରସ୍ତୁତ", bn: "প্রস্তুত", te: "సిద్ధంగా ఉంది", ta: "தயார்", mr: "तयार", gu: "તૈયાર" })

    if (isMinimized) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <Button
                    variant="default"
                    size="icon"
                    className={`h-14 w-14 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 ${isListening ? "voice-mic-glow bg-alert hover:bg-alert/90 text-white" : "bg-card/80 backdrop-blur-xl backdrop-saturate-[1.8] border border-border/70 text-foreground hover:bg-card/90"} animate-fade-up`}
                    onClick={() => setIsMinimized(false)}
                    aria-label={t({ en: "Expand voice assist", hi: "वॉइस असिस्ट फैलाएं", or: "ଭଏସ୍ ଅସିଷ୍ଟ ବଡ଼ କରନ୍ତୁ", bn: "ভয়েস অ্যাসিস্ট বড় করুন", te: "వాయిస్ అసిస్టెంట్ విస్తరించండి", ta: "குரல் உதவியை விரிவாக்கவும்", mr: "व्हॉइस असिस्ट विस्तारवा", gu: "વોઇસ સહાય વિસ્તારો" })}
                >
                    {isListening ? <Mic className="h-6 w-6 animate-pulse" /> : <Mic className="h-6 w-6 text-trust" />}
                </Button>
            </div>
        )
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 w-[min(24rem,calc(100vw-2rem))]">
            <Card className="gap-3 border border-border/70 px-3 py-3 shadow-xl bg-card/90 backdrop-blur-xl backdrop-saturate-[1.8] animate-fade-up">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Languages className="h-4 w-4 text-trust" />
                        <p className="text-xs font-semibold">{t({ en: "Voice Assist", hi: "वॉइस असिस्ट", or: "ଭଏସ୍ ଅସିଷ୍ଟ", bn: "ভয়েস অ্যাসিস্ট", te: "వాయిస్ అసిస్ట్", ta: "வாய்ஸ் அசிஸ்ட்", mr: "व्हॉइस असिस्ट", gu: "વોઇસ અસિસ્ટ" })} ({locale})</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-muted-foreground">{stateLabel}</span>
                        <span className={`h-2.5 w-2.5 rounded-full ${isListening ? "bg-alert animate-pulse" : "bg-success"}`} />
                        <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" onClick={() => setIsMinimized(true)}>
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg border bg-muted/30 p-2">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{t({ en: "Status", hi: "स्थिति", or: "ସ୍ଥିତି", bn: "অবস্থা", te: "స్థితి", ta: "நிலை", mr: "स्थिती", gu: "સ્થિતિ" })}</span>
                        <span>{feedback || t({ en: "Ready", hi: "तैयार", or: "ପ୍ରସ୍ତୁତ", bn: "প্রস্তুত", te: "సిద్ధం", ta: "தயார்", mr: "तयार", gu: "તૈયાર" })}</span>
                    </div>

                    {(status === "listening" || status === "processing" || status === "responding") && (
                        <div className="mt-2 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-trust" />
                            <div className="voice-wave-bars" aria-hidden="true">
                                <span />
                                <span />
                                <span />
                                <span />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        aria-label="Toggle voice listening"
                        size="sm"
                        variant="outline"
                        className={`h-8 text-xs ${isListening ? "voice-mic-glow" : ""}`}
                        onClick={isListening ? stopListening : startListening}
                    >
                        {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />} {isListening ? t({ en: "Stop", hi: "रोकें", or: "ବନ୍ଦ", bn: "বন্ধ", te: "ఆపు", ta: "நிறுத்து", mr: "थांबा", gu: "બંધ કરો" }) : t({ en: "Listen", hi: "सुनें", or: "ଶୁଣ", bn: "শুনুন", te: "వినండి", ta: "கேளுங்கள்", mr: "ऐका", gu: "સાંભળો" })}
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        aria-label="Repeat latest assistant feedback"
                        disabled={!feedback}
                        onClick={() => speakText(feedback)}
                    >
                        <Volume2 className="h-3.5 w-3.5" /> {t({ en: "Repeat", hi: "दोहराएं", or: "ପୁଣି କହ", bn: "পুনরাবৃত্তি", te: "మళ్లీ చెప్పు", ta: "மீண்டும்", mr: "पुन्हा", gu: "ફરી કહો" })}
                    </Button>
                    <Button aria-label="Run sample command" size="sm" variant="ghost" className="h-8 text-xs" onClick={() => runSuggestedCommand(suggestions[0])}>
                        <Sparkles className="h-3.5 w-3.5" /> {t({ en: "Demo", hi: "डेमो", or: "ଡେମୋ", bn: "ডেমো", te: "డెమో", ta: "டெமோ", mr: "डेमो", gu: "ડેમો" })}
                    </Button>
                    <Button
                        aria-label="Toggle voice assistant settings"
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs"
                        onClick={() => setShowSettings((value) => !value)}
                    >
                        {showSettings ? t({ en: "Hide settings", hi: "सेटिंग्स छुपाएं", or: "ସେଟିଂସ୍ ଲୁଚାନ୍ତୁ", bn: "সেটিংস লুকান", te: "సెట్టింగ్స్ దాచండి", ta: "அமைப்புகளை மறை", mr: "सेटिंग्ज लपवा", gu: "સેટિંગ્સ છુપાવો" }) : t({ en: "Settings", hi: "सेटिंग्स", or: "ସେଟିଂସ୍", bn: "সেটিংস", te: "సెట్టింగ్స్", ta: "அமைப்புகள்", mr: "सेटिंग्ज", gu: "સેટિંગ્સ" })}
                    </Button>
                </div>

                {liveTranscript && <p className="text-[11px] text-muted-foreground">{t({ en: "Listening...", hi: "सुन रही हूं...", or: "ଶୁଣୁଛି...", bn: "শুনছি...", te: "వింటున్నాను...", ta: "கேட்கிறேன்...", mr: "ऐकत आहे...", gu: "સાંભળી રહી છું..." })} {liveTranscript}</p>}

                {heardText && <p className="text-[11px] text-muted-foreground">{t({ en: "You said", hi: "आपने कहा", or: "ଆପଣ କହିଲେ", bn: "আপনি বললেন", te: "మీరు చెప్పింది", ta: "நீங்கள் சொன்னது", mr: "तुम्ही म्हटलं", gu: "તમે કહ્યું" })}: {heardText}</p>}

                {error && <p className="text-[11px] text-alert">{error}</p>}

                <div className="rounded-lg border bg-background/80 p-2">
                    <p className="text-[11px] font-semibold mb-1">{t({ en: "Command suggestions", hi: "कमान्ड सुझाव", or: "କମାଣ୍ଡ ସୁପାରିଶ", bn: "কমান্ড পরামর্শ", te: "కమాండ్ సూచనలు", ta: "கட்டளை பரிந்துரைகள்", mr: "कमान्ड सूचना", gu: "કમાન્ડ સૂચનો" })}</p>
                    <div className="flex flex-wrap gap-1.5">
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                className="rounded-full border px-2 py-1 text-[11px] hover:bg-muted"
                                onClick={() => runSuggestedCommand(suggestion)}
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>

                {showSettings && (
                    <div className="rounded-lg border bg-background/80 p-2 space-y-2">
                        <p className="text-[11px] font-semibold">{t({ en: "Voice Assistant Settings", hi: "वॉइस असिस्टेंट सेटिंग्स", or: "ଭଏସ୍ ଅସିଷ୍ଟାଣ୍ଟ ସେଟିଂସ୍", bn: "ভয়েস সহায়ক সেটিংস", te: "వాయిస్ అసిస్టెంట్ సెట్టింగ్స్", ta: "குரல் உதவி அமைப்புகள்", mr: "व्हॉइस असिस्टंट सेटिंग्ज", gu: "વોઇસ સહાયક સેટિંગ્સ" })}</p>

                        <label className="flex items-center justify-between text-[11px]">
                            <span>{t({ en: "Language override", hi: "भाषा ओवरराइड", or: "ଭାଷା ଓଭରରାଇଡ୍", bn: "ভাষা ওভাররাইড", te: "భాష మార్పు", ta: "மொழி மாற்றம்", mr: "भाषा ओव्हरराईड", gu: "ભાષા ઓવરરાઇડ" })}</span>
                            <select
                                className="rounded border px-2 py-1 text-[11px]"
                                value={settings.languageOverride}
                                onChange={(event) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        languageOverride: event.target.value as VoiceAssistantSettings["languageOverride"],
                                    }))
                                }
                            >
                                <option value="default">{t({ en: "Follow app language", hi: "ऐप भाषा का पालन करें", or: "ଆପ୍ ଭାଷା ଅନୁସରଣ କରନ୍ତୁ", bn: "অ্যাপের ভাষা অনুসরণ করুন", te: "యాప్ భాషను అనుసరించండి", ta: "ஆப் மொழியைப் பின்பற்றவும்", mr: "अॅप भाषा वापरा", gu: "એપ ભાષા અનુસરો" })}</option>
                                <option value="en">English</option>
                                <option value="hi">Hindi</option>
                                <option value="or">Odia</option>
                                <option value="bn">Bengali</option>
                                <option value="te">Telugu</option>
                                <option value="ta">Tamil</option>
                                <option value="mr">Marathi</option>
                                <option value="gu">Gujarati</option>
                            </select>
                        </label>

                        <label className="flex items-center justify-between text-[11px]">
                            <span>{t({ en: "Auto-listen mode", hi: "ऑटो-लिसन मोड", or: "ଅଟୋ-ଲିସନ୍ ମୋଡ୍", bn: "অটো-লিসেন মোড", te: "ఆటో లిసన్ మోడ్", ta: "தானியங்கி கேட்கும் முறை", mr: "ऑटो-लिसन मोड", gu: "ઓટો-લિસન મોડ" })}</span>
                            <input
                                type="checkbox"
                                checked={settings.autoListen}
                                onChange={(event) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        autoListen: event.target.checked,
                                    }))
                                }
                            />
                        </label>

                        <label className="block text-[11px]">
                            <div className="flex items-center justify-between">
                                <span>{t({ en: "Speaking speed", hi: "बोलने की गति", or: "କହିବା ବେଗ", bn: "বলার গতি", te: "మాట్లాడే వేగం", ta: "பேச்சு வேகம்", mr: "बोलण्याचा वेग", gu: "બોલવાની ઝડપ" })}</span>
                                <span>{settings.speakingRate.toFixed(2)}x</span>
                            </div>
                            <input
                                className="mt-1 w-full"
                                type="range"
                                min={0.7}
                                max={1.2}
                                step={0.05}
                                value={settings.speakingRate}
                                onChange={(event) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        speakingRate: Number(event.target.value),
                                    }))
                                }
                            />
                        </label>

                        <div className="rounded-md border bg-muted/20 p-2 text-[11px]">
                            <p className="font-semibold mb-1">{t({ en: "Intent analytics", hi: "इंटेंट एनालिटिक्स", or: "ଇଣ୍ଟେଣ୍ଟ ବିଶ୍ଳେଷଣ", bn: "ইনটেন্ট অ্যানালিটিক্স", te: "ఇంటెంట్ అనలిటిక్స్", ta: "இன்டென்ட் பகுப்பாய்வு", mr: "इंटेंट अॅनालिटिक्स", gu: "ઇન્ટેન્ટ એનાલિટિક્સ" })}</p>
                            <p>{t({ en: "Total", hi: "कुल", or: "ମୋଟ", bn: "মোট", te: "మొత్తం", ta: "மொத்தம்", mr: "एकूण", gu: "કુલ" })}: {analytics?.total ?? 0}</p>
                            <p>{t({ en: "Success rate", hi: "सफलता दर", or: "ସଫଳତା ହାର", bn: "সাফল্যের হার", te: "విజయ రేటు", ta: "வெற்றி வீதம்", mr: "यश दर", gu: "સફળતા દર" })}: {analytics?.successRate ?? 0}%</p>
                            <p>{t({ en: "Failures", hi: "विफलताएं", or: "ବିଫଳ", bn: "ব্যর্থতা", te: "విఫలాలు", ta: "தோல்விகள்", mr: "अयशस्वी", gu: "નિષ્ફળતાઓ" })}: {analytics?.failures ?? 0}</p>
                            <div className="mt-1 space-y-0.5">
                                {(analytics?.topIntents || []).slice(0, 4).map((item) => (
                                    <p key={item.intent}>
                                        {item.intent}: {item.count}
                                    </p>
                                ))}
                                {(analytics?.topIntents || []).length === 0 && <p>{t({ en: "No intent trends yet.", hi: "अभी कोई इंटेंट ट्रेंड नहीं है।", or: "ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଇଣ୍ଟେଣ୍ଟ ଟ୍ରେଣ୍ଡ ନାହିଁ।", bn: "এখনও কোনও ইনটেন্ট ট্রেন্ড নেই।", te: "ఇంకా ఇంటెంట్ ట్రెండ్స్ లేవు.", ta: "இன்னும் இன்டென்ட் போக்குகள் இல்லை.", mr: "अजून इंटेंट ट्रेंड्स नाहीत.", gu: "હજુ કોઈ ઇન્ટેન્ટ ટ્રેન્ડ્સ નથી." })}</p>}
                            </div>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}
