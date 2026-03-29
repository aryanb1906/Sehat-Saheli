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

type VoiceAssistantSettings = {
    languageOverride: "default" | "en" | "hi"
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

    useEffect(() => {
        const raw = localStorage.getItem(SETTINGS_KEY)
        if (!raw) return
        try {
            const parsed = JSON.parse(raw) as Partial<VoiceAssistantSettings>
            setSettings({
                languageOverride:
                    parsed.languageOverride === "en" || parsed.languageOverride === "hi" || parsed.languageOverride === "default"
                        ? parsed.languageOverride
                        : "default",
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
            ? language === "hi"
                ? "सुन रहा है"
                : "Listening"
            : status === "processing"
                ? language === "hi"
                    ? "प्रोसेसिंग"
                    : "Processing"
                : status === "responding"
                    ? language === "hi"
                        ? "उत्तर दे रहा है"
                        : "Responding"
                    : status === "error"
                        ? language === "hi"
                            ? "त्रुटि"
                            : "Error"
                        : language === "hi"
                            ? "तैयार"
                            : "Idle"

    if (isMinimized) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <Button
                    variant="default"
                    size="icon"
                    className={`h-14 w-14 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all hover:scale-105 active:scale-95 ${isListening ? "voice-mic-glow bg-alert hover:bg-alert/90 text-white" : "bg-white/70 backdrop-blur-xl backdrop-saturate-[1.8] border border-white/70 text-foreground hover:bg-white/80"} animate-fade-up`}
                    onClick={() => setIsMinimized(false)}
                    aria-label="Expand voice assist"
                >
                    {isListening ? <Mic className="h-6 w-6 animate-pulse" /> : <Mic className="h-6 w-6 text-trust" />}
                </Button>
            </div>
        )
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 w-[min(24rem,calc(100vw-2rem))]">
            <Card className="gap-3 border border-white/70 px-3 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.12)] bg-white/70 backdrop-blur-xl backdrop-saturate-[1.8] animate-fade-up">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Languages className="h-4 w-4 text-trust" />
                        <p className="text-xs font-semibold">Voice Assist ({locale})</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-muted-foreground">{stateLabel}</span>
                        <span className={`h-2.5 w-2.5 rounded-full ${isListening ? "bg-red-500 animate-pulse" : "bg-green-500"}`} />
                        <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" onClick={() => setIsMinimized(true)}>
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg border bg-muted/30 p-2">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{language === "hi" ? "स्थिति" : "Status"}</span>
                        <span>{feedback || (language === "hi" ? "तैयार" : "Ready")}</span>
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
                        {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />} {isListening ? "Stop" : "Listen"}
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        aria-label="Repeat latest assistant feedback"
                        disabled={!feedback}
                        onClick={() => speakText(feedback)}
                    >
                        <Volume2 className="h-3.5 w-3.5" /> Repeat
                    </Button>
                    <Button aria-label="Run sample command" size="sm" variant="ghost" className="h-8 text-xs" onClick={() => runSuggestedCommand(suggestions[0])}>
                        <Sparkles className="h-3.5 w-3.5" /> Demo
                    </Button>
                    <Button
                        aria-label="Toggle voice assistant settings"
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs"
                        onClick={() => setShowSettings((value) => !value)}
                    >
                        {showSettings ? "Hide settings" : "Settings"}
                    </Button>
                </div>

                {liveTranscript && <p className="text-[11px] text-muted-foreground">{language === "hi" ? "सुन रहा हूं" : "Listening..."} {liveTranscript}</p>}

                {heardText && <p className="text-[11px] text-muted-foreground">{language === "hi" ? "आपने कहा" : "You said"}: {heardText}</p>}

                {error && <p className="text-[11px] text-alert">{error}</p>}

                <div className="rounded-lg border bg-background/80 p-2">
                    <p className="text-[11px] font-semibold mb-1">{language === "hi" ? "कमान्ड सुझाव" : "Command suggestions"}</p>
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
                        <p className="text-[11px] font-semibold">Voice Assistant Settings</p>

                        <label className="flex items-center justify-between text-[11px]">
                            <span>Language override</span>
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
                                <option value="default">Follow app language</option>
                                <option value="en">English</option>
                                <option value="hi">Hindi</option>
                            </select>
                        </label>

                        <label className="flex items-center justify-between text-[11px]">
                            <span>Auto-listen mode</span>
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
                                <span>Speaking speed</span>
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
                            <p className="font-semibold mb-1">Intent analytics</p>
                            <p>Total: {analytics?.total ?? 0}</p>
                            <p>Success rate: {analytics?.successRate ?? 0}%</p>
                            <p>Failures: {analytics?.failures ?? 0}</p>
                            <div className="mt-1 space-y-0.5">
                                {(analytics?.topIntents || []).slice(0, 4).map((item) => (
                                    <p key={item.intent}>
                                        {item.intent}: {item.count}
                                    </p>
                                ))}
                                {(analytics?.topIntents || []).length === 0 && <p>No intent trends yet.</p>}
                            </div>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}
