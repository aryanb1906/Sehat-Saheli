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

function langText(language: string, en: string, hi: string) {
    return language === "hi" ? hi : en
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
                return effectiveLanguage === "hi"
                    ? [
                        "आशा डैशबोर्ड खोलो",
                        "आशा टास्क मैनेजमेंट खोलो",
                        "आशा एनालिटिक्स खोलो",
                        "आशा मरीज सूची दिखाओ",
                    ]
                    : [
                        "Open ASHA dashboard",
                        "Open ASHA task management",
                        "Open ASHA analytics",
                        "Show ASHA patient directory",
                    ]
            }

            return effectiveLanguage === "hi"
                ? [
                    "मेरी चेकलिस्ट दिखाओ",
                    "कार्य पूरा के रूप में मार्क करो",
                    "मेरा जोखिम स्तर क्या है",
                    "आपातकालीन मोड खोलो",
                    "अपॉइंटमेंट्स खोलो",
                    "दवाइयां खोलो",
                    "लैब रिपोर्ट्स खोलो",
                    "कम्युनिटी सपोर्ट खोलो",
                ]
                : [
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
        setFeedback(`${langText(effectiveLanguage, "You said", "आपने कहा")}: ${trimmed}`)
        setStatus("processing")

        const parsed = await parseIntent(trimmed)
        if (!parsed) {
            const msg = langText(effectiveLanguage, "Sorry, I did not understand. Can you repeat?", "माफ कीजिए, मैं समझ नहीं पाया। क्या आप दोहरा सकती हैं?")
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

        setFeedback(langText(effectiveLanguage, "Okay, I am doing this now...", "ठीक है, मैं अभी कर रहा हूं..."))
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
            const msg = langText(effectiveLanguage, "Voice input is not supported on this device.", "इस डिवाइस पर वॉइस इनपुट समर्थित नहीं है।")
            setError(msg)
            setStatus("error")
            return
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            stream.getTracks().forEach((track) => track.stop())
        } catch {
            const msg = langText(
                effectiveLanguage,
                "Microphone permission denied. Please enable microphone access.",
                "माइक्रोफोन अनुमति नहीं मिली। कृपया माइक्रोफोन एक्सेस दें।",
            )
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
            setFeedback(langText(effectiveLanguage, "Listening...", "सुन रहा हूं..."))
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
                    ? langText(
                        effectiveLanguage,
                        "Microphone permission denied. Please enable microphone access.",
                        "माइक्रोफोन अनुमति नहीं मिली। कृपया माइक्रोफोन एक्सेस दें।",
                    )
                    : langText(effectiveLanguage, "Sorry, I did not understand. Can you repeat?", "माफ कीजिए, मैं समझ नहीं पाया। क्या आप दोहरा सकती हैं?")

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
        return () => {
            shouldContinueRef.current = false
            recognitionRef.current?.stop()
            window.speechSynthesis?.cancel()
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
