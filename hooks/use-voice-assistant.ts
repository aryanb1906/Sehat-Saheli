"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { executeVoiceIntent } from "@/lib/voice-assistant/action-executor"
import {
    AssistantStatus,
    VoiceCommandParseResult,
    VoiceIntent,
} from "@/lib/voice-assistant/types"

type SpeechRecognitionAlternative = { transcript: string }
type SpeechRecognitionResult = { isFinal: boolean; 0: SpeechRecognitionAlternative }
type SpeechRecognitionEventLike = {
    resultIndex: number
    results: SpeechRecognitionResult[]
}

type SpeechRecognitionLike = {
    lang: string
    continuous: boolean
    interimResults: boolean
    maxAlternatives: number
    onstart: (() => void) | null
    onend: (() => void) | null
    onresult: ((event: SpeechRecognitionEventLike) => void) | null
    onerror: ((event: { error?: string }) => void) | null
    start: () => void
    stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

declare global {
    interface Window {
        SpeechRecognition?: SpeechRecognitionConstructor
        webkitSpeechRecognition?: SpeechRecognitionConstructor
    }
}

const localeMap: Record<string, string> = {
    en: "en-IN",
    hi: "hi-IN",
    bn: "bn-IN",
    ta: "ta-IN",
    te: "te-IN",
    mr: "mr-IN",
    gu: "gu-IN",
    or: "or-IN",
}

type LocalizedCopy = Record<string, string>

const femaleVoiceHints = [
    "female",
    "woman",
    "zira",
    "hazel",
    "susan",
    "siri",
    "priya",
    "kavya",
    "heera",
    "kalpana",
    "shruti",
    "veena",
    "swara",
    "jenny",
    "aria",
]

function t(language: string, copy: LocalizedCopy) {
    return copy[language] || copy.en
}

function pickPreferredVoice(locale: string): SpeechSynthesisVoice | null {
    if (typeof window === "undefined" || !window.speechSynthesis) return null
    const voices = window.speechSynthesis.getVoices()
    if (!voices.length) return null

    const localeLower = locale.toLowerCase()
    const languageCode = localeLower.split("-")[0]

    const languageMatches = voices.filter((voice) =>
        voice.lang?.toLowerCase().startsWith(languageCode),
    )
    const candidates = languageMatches.length ? languageMatches : voices

    const scored = candidates
        .map((voice) => {
            const name = voice.name.toLowerCase()
            const lang = voice.lang?.toLowerCase() || ""
            const exactLocale = lang === localeLower ? 40 : 0
            const langMatch = lang.startsWith(languageCode) ? 20 : 0
            const femaleBoost = femaleVoiceHints.some((hint) => name.includes(hint)) ? 30 : 0
            const naturalBoost = !name.includes("compact") && !name.includes("espeak") ? 8 : 0
            const localBoost = voice.localService ? 5 : 0
            return {
                voice,
                score: exactLocale + langMatch + femaleBoost + naturalBoost + localBoost,
            }
        })
        .sort((a, b) => b.score - a.score)

    return scored[0]?.voice || null
}

interface UseVoiceAssistantOptions {
    language: string
    languageOverride?: string | null
    autoListen?: boolean
    speakingRate?: number
    currentPath: string
    navigate: (path: string) => void
}

export function useVoiceAssistant(options: UseVoiceAssistantOptions) {
    const {
        language,
        languageOverride,
        autoListen = true,
        speakingRate = 0.95,
        currentPath,
        navigate,
    } = options

    const effectiveLanguage = languageOverride && languageOverride.trim() !== "" ? languageOverride : language

    const [status, setStatus] = useState<AssistantStatus>("idle")
    const [isListening, setIsListening] = useState(false)
    const [liveTranscript, setLiveTranscript] = useState("")
    const [heardText, setHeardText] = useState("")
    const [feedback, setFeedback] = useState("")
    const [error, setError] = useState("")

    const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
    const shouldContinueRef = useRef(false)

    const locale = useMemo(() => localeMap[effectiveLanguage] || "en-IN", [effectiveLanguage])

    const isAshaContext = currentPath.startsWith("/asha")

    const suggestions = useMemo(
        () => {
            if (isAshaContext) {
                return {
                    en: [
                        "Open ASHA dashboard",
                        "Open ASHA task management",
                        "Open ASHA analytics",
                        "Show ASHA patient directory",
                    ],
                    hi: [
                        "आशा डैशबोर्ड खोलो",
                        "आशा टास्क मैनेजमेंट खोलो",
                        "आशा एनालिटिक्स खोलो",
                        "आशा मरीज सूची दिखाओ",
                    ],
                    or: [
                        "ଆଶା ଡ୍ୟାଶବୋର୍ଡ ଖୋଲ",
                        "ଆଶା କାର୍ଯ୍ୟ ପରିଚାଳନା ଖୋଲ",
                        "ଆଶା ବିଶ୍ଳେଷଣ ଖୋଲ",
                        "ଆଶା ରୋଗୀ ତାଲିକା ଦେଖା",
                    ],
                    bn: [
                        "আশা ড্যাশবোর্ড খুলুন",
                        "আশা টাস্ক ম্যানেজমেন্ট খুলুন",
                        "আশা অ্যানালিটিক্স খুলুন",
                        "আশা রোগীর তালিকা দেখান",
                    ],
                    te: [
                        "ఆశా డ్యాష్‌బోర్డ్ తెరవండి",
                        "ఆశా టాస్క్ మేనేజ్‌మెంట్ తెరవండి",
                        "ఆశా అనలిటిక్స్ తెరవండి",
                        "ఆశా రోగుల జాబితా చూపించండి",
                    ],
                    ta: [
                        "ஆஷா டாஷ்போர்டைத் திறக்கவும்",
                        "ஆஷா பணி மேலாண்மை திறக்கவும்",
                        "ஆஷா பகுப்பாய்வு திறக்கவும்",
                        "ஆஷா நோயாளர் பட்டியல் காண்பிக்கவும்",
                    ],
                    mr: [
                        "आशा डॅशबोर्ड उघडा",
                        "आशा टास्क व्यवस्थापन उघडा",
                        "आशा अॅनालिटिक्स उघडा",
                        "आशा रुग्ण यादी दाखवा",
                    ],
                    gu: [
                        "આશા ડેશબોર્ડ ખોલો",
                        "આશા ટાસ્ક મેનેજમેન્ટ ખોલો",
                        "આશા એનાલિટિક્સ ખોલો",
                        "આશા દર્દી યાદી બતાવો",
                    ],
                }[effectiveLanguage] || [
                        "Open ASHA dashboard",
                        "Open ASHA task management",
                        "Open ASHA analytics",
                        "Show ASHA patient directory",
                    ]
            }

            return {
                en: [
                    "Show my checklist",
                    "Mark task as complete",
                    "What is my risk status?",
                    "Open emergency mode",
                    "Open appointments",
                    "Open medications",
                    "Open lab reports",
                    "Open community support",
                ],
                hi: [
                    "मेरी चेकलिस्ट दिखाओ",
                    "कार्य पूरा के रूप में मार्क करो",
                    "मेरा जोखिम स्तर क्या है",
                    "आपातकालीन मोड खोलो",
                    "अपॉइंटमेंट्स खोलो",
                    "दवाइयां खोलो",
                    "लैब रिपोर्ट्स खोलो",
                    "कम्युनिटी सपोर्ट खोलो",
                ],
                or: [
                    "ମୋର ଚେକଲିଷ୍ଟ ଦେଖା",
                    "କାର୍ଯ୍ୟ ସମ୍ପୂର୍ଣ୍ଣ ଚିହ୍ନ କର",
                    "ମୋର ଜୋଖିମ ସ୍ତର କେତେ",
                    "ଜରୁରୀ ମୋଡ୍ ଖୋଲ",
                    "ନିଯୁକ୍ତି ଖୋଲ",
                    "ଔଷଧ ପୃଷ୍ଠା ଖୋଲ",
                    "ଲ୍ୟାବ୍ ରିପୋର୍ଟ ଖୋଲ",
                    "କମ୍ୟୁନିଟି ସହଯୋଗ ଖୋଲ",
                ],
                bn: [
                    "আমার চেকলিস্ট দেখান",
                    "কাজ সম্পন্ন হিসেবে চিহ্নিত করুন",
                    "আমার ঝুঁকির অবস্থা কী",
                    "জরুরি মোড খুলুন",
                    "অ্যাপয়েন্টমেন্ট খুলুন",
                    "ওষুধ খুলুন",
                    "ল্যাব রিপোর্ট খুলুন",
                    "কমিউনিটি সাপোর্ট খুলুন",
                ],
                te: [
                    "నా చెక్లిస్ట్ చూపించండి",
                    "పనిని పూర్తిగా గుర్తించండి",
                    "నా ప్రమాద స్థితి ఏమిటి",
                    "అత్యవసర మోడ్ తెరవండి",
                    "అపాయింట్‌మెంట్లు తెరవండి",
                    "మందులు తెరవండి",
                    "ల్యాబ్ రిపోర్ట్స్ తెరవండి",
                    "కమ్యూనిటీ సపోర్ట్ తెరవండి",
                ],
                ta: [
                    "என் சரிபார்ப்பு பட்டியலைக் காட்டு",
                    "பணியை முடிந்ததாக குறிக்கவும்",
                    "என் அபாய நிலை என்ன",
                    "அவசர முறையைத் திறக்கவும்",
                    "நியமனங்களைத் திறக்கவும்",
                    "மருந்துகளைத் திறக்கவும்",
                    "லாப் அறிக்கைகளைத் திறக்கவும்",
                    "சமூக ஆதரவைத் திறக்கவும்",
                ],
                mr: [
                    "माझी चेकलिस्ट दाखवा",
                    "कार्य पूर्ण म्हणून चिन्हांकित करा",
                    "माझी जोखीम स्थिती काय आहे",
                    "आपत्कालीन मोड उघडा",
                    "अपॉइंटमेंट उघडा",
                    "औषधे उघडा",
                    "लॅब अहवाल उघडा",
                    "समुदाय सहाय्य उघडा",
                ],
                gu: [
                    "મારી ચેકલિસ્ટ બતાવો",
                    "કાર્ય પૂર્ણ તરીકે ચિહ્નિત કરો",
                    "મારી જોખમ સ્થિતિ શું છે",
                    "આપાતકાલીન મોડ ખોલો",
                    "અપોઇન્ટમેન્ટ ખોલો",
                    "દવાઓ ખોલો",
                    "લેબ રિપોર્ટ ખોલો",
                    "સમુદાય સહાય ખોલો",
                ],
            }[effectiveLanguage] || [
                    "Show my checklist",
                    "Mark task as complete",
                    "What is my risk status?",
                    "Open emergency mode",
                    "Open appointments",
                    "Open medications",
                    "Open lab reports",
                    "Open community support",
                ]
        },
        [effectiveLanguage, isAshaContext],
    )

    const speak = (text: string) => {
        if (typeof window === "undefined" || !window.speechSynthesis) return
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = locale
        utterance.rate = speakingRate
        utterance.pitch = 1.06

        const voice = pickPreferredVoice(locale)
        if (voice) {
            utterance.voice = voice
            utterance.lang = voice.lang || locale
        }

        utterance.onstart = () => setStatus("responding")
        utterance.onend = () => {
            setStatus(shouldContinueRef.current ? "listening" : "idle")
        }
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(utterance)
    }

    const parseIntent = async (transcript: string): Promise<VoiceCommandParseResult | null> => {
        try {
            const response = await fetch("/api/voice-assistant/parse", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transcript, language: effectiveLanguage, path: currentPath }),
            })
            const data = await response.json()
            if (!response.ok || !data?.result) return null
            return data.result as VoiceCommandParseResult
        } catch {
            return null
        }
    }

    const logAnalytics = async (payload: {
        transcript: string
        intent: VoiceIntent
        confidence: number
        success: boolean
        source: "speech" | "suggestion"
        error?: string
    }) => {
        try {
            await fetch("/api/voice-assistant/analytics", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    transcript: payload.transcript,
                    language: effectiveLanguage,
                    intent: payload.intent,
                    confidence: payload.confidence,
                    success: payload.success,
                    source: payload.source,
                    path: currentPath,
                    error: payload.error,
                }),
            })
        } catch {
            // Keep analytics fire-and-forget.
        }
    }

    const processCommand = async (transcript: string, source: "speech" | "suggestion") => {
        const trimmed = transcript.trim()
        if (!trimmed) return

        setHeardText(trimmed)
        setFeedback(`${t(effectiveLanguage, { en: "You said", hi: "आपने कहा", or: "ଆପଣ କହିଲେ", bn: "আপনি বললেন", te: "మీరు చెప్పింది", ta: "நீங்கள் சொன்னது", mr: "तुम्ही म्हटले", gu: "તમે કહ્યું" })}: ${trimmed}`)
        setStatus("processing")

        const parsed = await parseIntent(trimmed)
        if (!parsed) {
            const msg = t(effectiveLanguage, {
                en: "Sorry, I did not understand. Can you repeat?",
                hi: "माफ कीजिए, मैं समझ नहीं पाया। क्या आप दोहरा सकती हैं?",
                or: "ମାଫ କରନ୍ତୁ, ମୁଁ ବୁଝିପାରିଲି ନାହିଁ। ଦୟାକରି ପୁନି କହିବେ?",
                bn: "দুঃখিত, আমি বুঝতে পারিনি। আবার বলবেন?",
                te: "క్షమించండి, నాకు అర్థం కాలేదు. మళ్లీ చెబుతారా?",
                ta: "மன்னிக்கவும், எனக்கு புரியவில்லை. மறுபடியும் சொல்வீர்களா?",
                mr: "माफ करा, मला समजले नाही. पुन्हा सांगाल का?",
                gu: "માફ કરશો, મને સમજાયું નહીં. ફરી કહેશો?",
            })
            setError(msg)
            setStatus("error")
            speak(msg)
            void logAnalytics({
                transcript: trimmed,
                intent: "UNKNOWN",
                confidence: 0,
                success: false,
                source,
                error: msg,
            })
            return
        }

        setFeedback(t(effectiveLanguage, {
            en: "Okay, I am doing this now...",
            hi: "ठीक है, मैं अभी कर रही हूं...",
            or: "ଠିକ ଅଛି, ମୁଁ ଏବେ କରୁଛି...",
            bn: "ঠিক আছে, আমি এখনই করছি...",
            te: "సరే, నేను ఇప్పుడే చేస్తున్నాను...",
            ta: "சரி, இப்போது செய்கிறேன்...",
            mr: "ठीक आहे, मी आत्ता करते...",
            gu: "બરાબર, હું હવે કરી રહી છું...",
        }))
        const finalConfirmation = await executeVoiceIntent(parsed, {
            language: effectiveLanguage,
            currentPath,
            navigate,
        })

        setFeedback(finalConfirmation)
        speak(finalConfirmation)

        void logAnalytics({
            transcript: trimmed,
            intent: parsed.intent,
            confidence: parsed.confidence,
            success: parsed.intent !== "UNKNOWN",
            source,
        })

        if (!autoListen) {
            shouldContinueRef.current = false
            recognitionRef.current?.stop()
            setIsListening(false)
        }
    }

    const stopListening = () => {
        shouldContinueRef.current = false
        recognitionRef.current?.stop()
        setIsListening(false)
        setLiveTranscript("")
        if (status !== "responding") setStatus("idle")
    }

    const startListening = async () => {
        if (typeof window === "undefined") return
        setError("")

        const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!Recognition) {
            const msg = t(effectiveLanguage, {
                en: "Voice input is not supported on this device.",
                hi: "इस डिवाइस पर वॉइस इनपुट समर्थित नहीं है।",
                or: "ଏହି ଡିଭାଇସରେ ଭଏସ୍ ଇନପୁଟ୍ ସମର୍ଥିତ ନୁହେଁ।",
                bn: "এই ডিভাইসে ভয়েস ইনপুট সমর্থিত নয়।",
                te: "ఈ పరికరంలో వాయిస్ ఇన్‌పుట్‌కు మద్దతు లేదు.",
                ta: "இந்த சாதனத்தில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை.",
                mr: "या डिव्हाइसवर व्हॉइस इनपुट समर्थित नाही.",
                gu: "આ ડિવાઇસમાં વોઇસ ઇનપુટ સપોર્ટ નથી.",
            })
            setError(msg)
            setStatus("error")
            return
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            stream.getTracks().forEach((track) => track.stop())
        } catch {
            const msg = t(effectiveLanguage, {
                en: "Microphone permission denied. Please enable microphone access.",
                hi: "माइक्रोफोन अनुमति नहीं मिली। कृपया माइक्रोफोन एक्सेस दें।",
                or: "ମାଇକ୍ରୋଫୋନ୍ ଅନୁମତି ମିଳିଲା ନାହିଁ। ଦୟାକରି ଅନୁମତି ଦିଅନ୍ତୁ।",
                bn: "মাইক্রোফোন অনুমতি মেলেনি। অনুগ্রহ করে অনুমতি দিন।",
                te: "మైక్రోఫోన్ అనుమతి లేదు. దయచేసి మైక్రోఫోన్ యాక్సెస్ ఇవ్వండి.",
                ta: "மைக்ரோஃபோன் அனுமதி இல்லை. தயவுசெய்து அணுகலை வழங்கவும்.",
                mr: "मायक्रोफोन परवानगी मिळाली नाही. कृपया परवानगी द्या.",
                gu: "માઇક્રોફોન પરવાનગી મળી નથી. કૃપા કરીને પરવાનગી આપો.",
            })
            setError(msg)
            setStatus("error")
            return
        }

        const recognition = new Recognition()
        recognition.lang = locale
        recognition.continuous = true
        recognition.interimResults = true
        recognition.maxAlternatives = 1

        recognition.onstart = () => {
            shouldContinueRef.current = true
            setIsListening(true)
            setStatus("listening")
            setFeedback(t(effectiveLanguage, {
                en: "Listening...",
                hi: "सुन रही हूं...",
                or: "ଶୁଣୁଛି...",
                bn: "শুনছি...",
                te: "వింటున్నాను...",
                ta: "கேட்கிறேன்...",
                mr: "ऐकत आहे...",
                gu: "સાંભળી રહી છું...",
            }))
        }

        recognition.onend = () => {
            if (shouldContinueRef.current) {
                recognition.start()
                return
            }
            setIsListening(false)
            if (status !== "responding") setStatus("idle")
        }

        recognition.onerror = (event) => {
            const err = event?.error || "unknown"
            const msg =
                err === "not-allowed" || err === "service-not-allowed"
                    ? t(effectiveLanguage, {
                        en: "Microphone permission denied. Please enable microphone access.",
                        hi: "माइक्रोफोन अनुमति नहीं मिली। कृपया माइक्रोफोन एक्सेस दें।",
                        or: "ମାଇକ୍ରୋଫୋନ୍ ଅନୁମତି ମିଳିଲା ନାହିଁ। ଦୟାକରି ଅନୁମତି ଦିଅନ୍ତୁ।",
                        bn: "মাইক্রোফোন অনুমতি মেলেনি। অনুগ্রহ করে অনুমতি দিন।",
                        te: "మైక్రోఫోన్ అనుమతి లేదు. దయచేసి యాక్సెస్ ఇవ్వండి.",
                        ta: "மைக்ரோஃபோன் அனுமதி இல்லை. தயவுசெய்து அணுகலை வழங்கவும்.",
                        mr: "मायक्रोफोन परवानगी मिळाली नाही. कृपया परवानगी द्या.",
                        gu: "માઇક્રોફોન પરવાનગી મળી નથી. કૃપા કરીને પરવાનગી આપો.",
                    })
                    : t(effectiveLanguage, {
                        en: "Sorry, I did not understand. Can you repeat?",
                        hi: "माफ कीजिए, मैं समझ नहीं पाया। क्या आप दोहरा सकती हैं?",
                        or: "ମାଫ କରନ୍ତୁ, ମୁଁ ବୁଝିପାରିଲି ନାହିଁ। ପୁଣି କହନ୍ତୁ।",
                        bn: "দুঃখিত, আমি বুঝতে পারিনি। আবার বলুন।",
                        te: "క్షమించండి, నాకు అర్థం కాలేదు. మళ్లీ చెప్పండి.",
                        ta: "மன்னிக்கவும், எனக்கு புரியவில்லை. மீண்டும் சொல்லுங்கள்.",
                        mr: "माफ करा, मला समजले नाही. पुन्हा सांगा.",
                        gu: "માફ કરશો, મને સમજાયું નહીં. ફરી કહો.",
                    })

            setError(msg)
            setStatus("error")
            shouldContinueRef.current = false
            setIsListening(false)
            void logAnalytics({
                transcript: liveTranscript,
                intent: "UNKNOWN",
                confidence: 0,
                success: false,
                source: "speech",
                error: msg,
            })
        }

        recognition.onresult = (event) => {
            let interim = ""
            for (let i = event.resultIndex; i < event.results.length; i += 1) {
                const result = event.results[i]
                const text = result[0]?.transcript || ""
                if (result.isFinal) {
                    setLiveTranscript("")
                    void processCommand(text, "speech")
                } else {
                    interim += text
                }
            }
            if (interim.trim()) setLiveTranscript(interim.trim())
        }

        recognitionRef.current = recognition
        recognition.start()
    }

    const runSuggestedCommand = async (text: string) => {
        setStatus("processing")
        await processCommand(text, "suggestion")
    }

    const speakText = (text: string) => {
        if (!text.trim()) return
        speak(text)
    }

    useEffect(() => {
        if (typeof window === "undefined" || !window.speechSynthesis) return

        const loadVoices = () => {
            window.speechSynthesis.getVoices()
        }

        loadVoices()
        window.speechSynthesis.onvoiceschanged = loadVoices

        return () => {
            shouldContinueRef.current = false
            recognitionRef.current?.stop()
            window.speechSynthesis?.cancel()
            if (window.speechSynthesis) {
                window.speechSynthesis.onvoiceschanged = null
            }
        }
    }, [])

    return {
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
    }
}
