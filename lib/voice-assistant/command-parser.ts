import { GoogleGenerativeAI } from "@google/generative-ai"
import { VoiceCommandParseResult, VoiceIntent } from "@/lib/voice-assistant/types"

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

const fallbackReplies: Record<VoiceIntent, { en: string; hi: string }> = {
    SHOW_CHECKLIST: {
        en: "Opening your checklist.",
        hi: "आपकी चेकलिस्ट खोल रहा हूं।",
    },
    MARK_TASK_COMPLETE: {
        en: "Okay, I am marking a task as complete.",
        hi: "ठीक है, मैं एक कार्य को पूरा के रूप में चिह्नित कर रहा हूं।",
    },
    GET_RISK_STATUS: {
        en: "I am checking your risk status.",
        hi: "मैं आपका जोखिम स्तर जांच रहा हूं।",
    },
    OPEN_EMERGENCY_MODE: {
        en: "Opening emergency mode now.",
        hi: "अभी आपातकालीन मोड खोल रहा हूं।",
    },
    OPEN_APPOINTMENTS: {
        en: "Opening appointments.",
        hi: "अपॉइंटमेंट्स खोल रहा हूं।",
    },
    OPEN_MEDICATIONS: {
        en: "Opening medications.",
        hi: "दवाइयों वाला पेज खोल रहा हूं।",
    },
    OPEN_LAB_REPORTS: {
        en: "Opening lab reports.",
        hi: "लैब रिपोर्ट्स खोल रहा हूं।",
    },
    OPEN_COMMUNITY: {
        en: "Opening community support.",
        hi: "कम्युनिटी सपोर्ट खोल रहा हूं।",
    },
    OPEN_ASHA_DASHBOARD: {
        en: "Opening ASHA dashboard.",
        hi: "आशा डैशबोर्ड खोल रहा हूं।",
    },
    OPEN_ASHA_PATIENTS: {
        en: "Opening ASHA patient directory.",
        hi: "आशा मरीज सूची खोल रहा हूं।",
    },
    OPEN_ASHA_TASKS: {
        en: "Opening ASHA task management.",
        hi: "आशा टास्क मैनेजमेंट खोल रहा हूं।",
    },
    OPEN_ASHA_ANALYTICS: {
        en: "Opening ASHA analytics.",
        hi: "आशा एनालिटिक्स खोल रहा हूं।",
    },
    OPEN_ROUTE: {
        en: "Opening that screen now.",
        hi: "वह स्क्रीन अभी खोल रहा हूं।",
    },
    UNKNOWN: {
        en: "Sorry, I did not understand. Can you repeat?",
        hi: "माफ कीजिए, मैं समझ नहीं पाया। क्या आप दोहरा सकती हैं?",
    },
}

function byLanguage(language: string, value: { en: string; hi: string }) {
    return language === "hi" ? value.hi : value.en
}

function heuristicParse(transcript: string, language: string): VoiceCommandParseResult {
    const lower = transcript.toLowerCase()

    if (lower.includes("checklist") || lower.includes("चेकलिस्ट")) {
        return {
            intent: "SHOW_CHECKLIST",
            confidence: 0.68,
            route: "/mother",
            assistantReply: byLanguage(language, fallbackReplies.SHOW_CHECKLIST),
        }
    }

    if (
        lower.includes("mark") ||
        lower.includes("complete") ||
        lower.includes("task") ||
        lower.includes("पूरा") ||
        lower.includes("मार्क")
    ) {
        return {
            intent: "MARK_TASK_COMPLETE",
            confidence: 0.67,
            route: "/mother",
            assistantReply: byLanguage(language, fallbackReplies.MARK_TASK_COMPLETE),
        }
    }

    if (lower.includes("risk") || lower.includes("जोखिम")) {
        return {
            intent: "GET_RISK_STATUS",
            confidence: 0.71,
            route: "/mother",
            assistantReply: byLanguage(language, fallbackReplies.GET_RISK_STATUS),
        }
    }

    if (lower.includes("emergency") || lower.includes("sos") || lower.includes("आपात")) {
        return {
            intent: "OPEN_EMERGENCY_MODE",
            confidence: 0.78,
            route: "/mother/emergency",
            assistantReply: byLanguage(language, fallbackReplies.OPEN_EMERGENCY_MODE),
        }
    }

    if (lower.includes("appointment") || lower.includes("अपॉइंटमेंट") || lower.includes("नियुक्ति")) {
        return {
            intent: "OPEN_APPOINTMENTS",
            confidence: 0.76,
            route: "/mother/appointments",
            assistantReply: byLanguage(language, fallbackReplies.OPEN_APPOINTMENTS),
        }
    }

    if (lower.includes("medication") || lower.includes("medicine") || lower.includes("दवा")) {
        return {
            intent: "OPEN_MEDICATIONS",
            confidence: 0.76,
            route: "/mother/medications",
            assistantReply: byLanguage(language, fallbackReplies.OPEN_MEDICATIONS),
        }
    }

    if (lower.includes("lab") || lower.includes("report") || lower.includes("रिपोर्ट")) {
        return {
            intent: "OPEN_LAB_REPORTS",
            confidence: 0.75,
            route: "/mother/lab-reports",
            assistantReply: byLanguage(language, fallbackReplies.OPEN_LAB_REPORTS),
        }
    }

    if (lower.includes("community") || lower.includes("support") || lower.includes("समुदाय")) {
        return {
            intent: "OPEN_COMMUNITY",
            confidence: 0.72,
            route: lower.includes("asha") ? "/asha" : "/mother/community",
            assistantReply: byLanguage(language, fallbackReplies.OPEN_COMMUNITY),
        }
    }

    if (lower.includes("asha dashboard") || lower.includes("आशा डैशबोर्ड")) {
        return {
            intent: "OPEN_ASHA_DASHBOARD",
            confidence: 0.8,
            route: "/asha",
            assistantReply: byLanguage(language, fallbackReplies.OPEN_ASHA_DASHBOARD),
        }
    }

    if ((lower.includes("asha") && lower.includes("patient")) || lower.includes("आशा मरीज")) {
        return {
            intent: "OPEN_ASHA_PATIENTS",
            confidence: 0.78,
            route: "/asha",
            assistantReply: byLanguage(language, fallbackReplies.OPEN_ASHA_PATIENTS),
        }
    }

    if ((lower.includes("asha") && lower.includes("task")) || lower.includes("आशा टास्क")) {
        return {
            intent: "OPEN_ASHA_TASKS",
            confidence: 0.79,
            route: "/asha/task-management",
            assistantReply: byLanguage(language, fallbackReplies.OPEN_ASHA_TASKS),
        }
    }

    if ((lower.includes("asha") && lower.includes("analytic")) || lower.includes("आशा एनालिटिक्स")) {
        return {
            intent: "OPEN_ASHA_ANALYTICS",
            confidence: 0.79,
            route: "/asha/analytics",
            assistantReply: byLanguage(language, fallbackReplies.OPEN_ASHA_ANALYTICS),
        }
    }

    return {
        intent: "UNKNOWN",
        confidence: 0.15,
        assistantReply: byLanguage(language, fallbackReplies.UNKNOWN),
    }
}

function safeParseJson(text: string): Partial<VoiceCommandParseResult> | null {
    try {
        return JSON.parse(text)
    } catch {
        const start = text.indexOf("{")
        const end = text.lastIndexOf("}")
        if (start >= 0 && end > start) {
            try {
                return JSON.parse(text.slice(start, end + 1))
            } catch {
                return null
            }
        }
        return null
    }
}

export async function parseVoiceCommand(transcript: string, language: string, path = "/"): Promise<VoiceCommandParseResult> {
    if (!process.env.GEMINI_API_KEY) {
        return heuristicParse(transcript, language)
    }

    try {
        const model = gemini.getGenerativeModel({ model: "gemini-2.5-flash" })
        const prompt = [
            "You are a command parser for a maternal health web app.",
            `Current language: ${language}`,
            `Current path: ${path}`,
            `Transcript: ${transcript}`,
            "Return only strict JSON with keys:",
            "intent: one of SHOW_CHECKLIST, MARK_TASK_COMPLETE, GET_RISK_STATUS, OPEN_EMERGENCY_MODE, OPEN_APPOINTMENTS, OPEN_MEDICATIONS, OPEN_LAB_REPORTS, OPEN_COMMUNITY, OPEN_ASHA_DASHBOARD, OPEN_ASHA_PATIENTS, OPEN_ASHA_TASKS, OPEN_ASHA_ANALYTICS, OPEN_ROUTE, UNKNOWN",
            "confidence: number 0 to 1",
            "route: optional route string like /mother or /mother/emergency",
            "entity: optional short target text",
            "assistantReply: short user-facing response in same language as transcript",
        ].join("\n")

        const response = await model.generateContent(prompt)
        const text = response.response.text()
        const parsed = safeParseJson(text)

        if (!parsed || typeof parsed.intent !== "string" || typeof parsed.confidence !== "number") {
            return heuristicParse(transcript, language)
        }

        const intent = parsed.intent as VoiceIntent
        const validIntent: VoiceIntent[] = [
            "SHOW_CHECKLIST",
            "MARK_TASK_COMPLETE",
            "GET_RISK_STATUS",
            "OPEN_EMERGENCY_MODE",
            "OPEN_APPOINTMENTS",
            "OPEN_MEDICATIONS",
            "OPEN_LAB_REPORTS",
            "OPEN_COMMUNITY",
            "OPEN_ASHA_DASHBOARD",
            "OPEN_ASHA_PATIENTS",
            "OPEN_ASHA_TASKS",
            "OPEN_ASHA_ANALYTICS",
            "OPEN_ROUTE",
            "UNKNOWN",
        ]

        if (!validIntent.includes(intent)) {
            return heuristicParse(transcript, language)
        }

        return {
            intent,
            confidence: Math.max(0, Math.min(1, parsed.confidence)),
            route: typeof parsed.route === "string" ? parsed.route : undefined,
            entity: typeof parsed.entity === "string" ? parsed.entity : undefined,
            assistantReply:
                typeof parsed.assistantReply === "string" && parsed.assistantReply.trim() !== ""
                    ? parsed.assistantReply
                    : byLanguage(language, fallbackReplies[intent]),
        }
    } catch {
        return heuristicParse(transcript, language)
    }
}
