import { VoiceActionEventDetail, VOICE_ACTION_EVENT, VoiceCommandParseResult } from "@/lib/voice-assistant/types"

interface ExecuteIntentOptions {
    language: string
    currentPath: string
    navigate: (path: string) => void
}

function say(language: string, en: string, hi: string) {
    return language === "hi" ? hi : en
}

export async function executeVoiceIntent(result: VoiceCommandParseResult, options: ExecuteIntentOptions): Promise<string> {
    const { language, currentPath, navigate } = options

    if (result.intent === "UNKNOWN") {
        return say(language, "Sorry, I did not understand. Can you repeat?", "माफ कीजिए, मैं समझ नहीं पाया। क्या आप दोहरा सकती हैं?")
    }

    if (result.intent === "SHOW_CHECKLIST") {
        if (currentPath !== "/mother") {
            navigate("/mother")
        }

        window.dispatchEvent(
            new CustomEvent<VoiceActionEventDetail>(VOICE_ACTION_EVENT, {
                detail: { intent: "SHOW_CHECKLIST", entity: result.entity },
            }),
        )

        return say(language, "Done. Opening your checklist.", "हो गया। आपकी चेकलिस्ट खोल दी है।")
    }

    if (result.intent === "MARK_TASK_COMPLETE") {
        if (currentPath !== "/mother") {
            navigate("/mother")
        }

        window.dispatchEvent(
            new CustomEvent<VoiceActionEventDetail>(VOICE_ACTION_EVENT, {
                detail: { intent: "MARK_TASK_COMPLETE", entity: result.entity },
            }),
        )

        return say(language, "Done. Your checklist is updated.", "हो गया। आपकी चेकलिस्ट अपडेट कर दी गई है।")
    }

    if (result.intent === "GET_RISK_STATUS") {
        const risk = localStorage.getItem("motherRiskStatus") || "Low"
        window.dispatchEvent(
            new CustomEvent<VoiceActionEventDetail>(VOICE_ACTION_EVENT, {
                detail: { intent: "GET_RISK_STATUS" },
            }),
        )

        return say(
            language,
            `Your current risk status is ${risk}.`,
            `आपका वर्तमान जोखिम स्तर ${risk} है।`,
        )
    }

    if (result.intent === "OPEN_EMERGENCY_MODE") {
        navigate("/mother/emergency")
        return say(language, "Opening emergency mode.", "आपातकालीन मोड खोल रहा हूं।")
    }

    if (result.intent === "OPEN_APPOINTMENTS") {
        navigate("/mother/appointments")
        return say(language, "Opening appointments.", "अपॉइंटमेंट्स खोल रहा हूं।")
    }

    if (result.intent === "OPEN_MEDICATIONS") {
        navigate("/mother/medications")
        return say(language, "Opening medications.", "दवाइयों वाला पेज खोल रहा हूं।")
    }

    if (result.intent === "OPEN_LAB_REPORTS") {
        navigate("/mother/lab-reports")
        return say(language, "Opening lab reports.", "लैब रिपोर्ट्स खोल रहा हूं।")
    }

    if (result.intent === "OPEN_COMMUNITY") {
        if (currentPath.startsWith("/asha")) {
            navigate("/asha")
            return say(language, "Opening ASHA community context.", "आशा कम्युनिटी सेक्शन खोल रहा हूं।")
        }
        navigate("/mother/community")
        return say(language, "Opening community support.", "कम्युनिटी सपोर्ट खोल रहा हूं।")
    }

    if (result.intent === "OPEN_ASHA_DASHBOARD") {
        navigate("/asha")
        return say(language, "Opening ASHA dashboard.", "आशा डैशबोर्ड खोल रहा हूं।")
    }

    if (result.intent === "OPEN_ASHA_PATIENTS") {
        navigate("/asha")
        return say(language, "Opening ASHA patient directory.", "आशा मरीज सूची खोल रहा हूं।")
    }

    if (result.intent === "OPEN_ASHA_TASKS") {
        navigate("/asha/task-management")
        return say(language, "Opening ASHA task management.", "आशा टास्क मैनेजमेंट खोल रहा हूं।")
    }

    if (result.intent === "OPEN_ASHA_ANALYTICS") {
        navigate("/asha/analytics")
        return say(language, "Opening ASHA analytics.", "आशा एनालिटिक्स खोल रहा हूं।")
    }

    if (result.intent === "OPEN_ROUTE" && result.route) {
        navigate(result.route)
        return say(language, "Done. Opening requested screen.", "हो गया। मांगी गई स्क्रीन खोल रहा हूं।")
    }

    return say(language, "Sorry, I did not understand. Can you repeat?", "माफ कीजिए, मैं समझ नहीं पाया। क्या आप दोहरा सकती हैं?")
}
