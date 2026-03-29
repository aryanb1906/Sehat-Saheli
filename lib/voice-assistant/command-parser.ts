import { GoogleGenerativeAI } from "@google/generative-ai"
import { VoiceCommandParseResult, VoiceIntent } from "@/lib/voice-assistant/types"

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

type LocalizedCopy = Record<string, string>

const fallbackReplies: Record<VoiceIntent, LocalizedCopy> = {
    SHOW_CHECKLIST: {
        en: "Opening your checklist.",
        hi: "आपकी चेकलिस्ट खोल रहा हूं।",
        or: "ଆପଣଙ୍କ ଚେକଲିଷ୍ଟ ଖୋଲୁଛି।",
        bn: "আপনার চেকলিস্ট খুলছি।",
        te: "మీ చెక్లిస్ట్ తెరుస్తున్నాను.",
        ta: "உங்கள் சரிபார்ப்பு பட்டியலைத் திறக்கிறேன்.",
        mr: "तुमची चेकलिस्ट उघडते.",
        gu: "તમારી ચેકલિસ્ટ ખોલું છું.",
    },
    MARK_TASK_COMPLETE: {
        en: "Okay, I am marking a task as complete.",
        hi: "ठीक है, मैं एक कार्य को पूरा के रूप में चिह्नित कर रहा हूं।",
        or: "ଠିକ ଅଛି, ମୁଁ କାର୍ଯ୍ୟଟିକୁ ସମ୍ପୂର୍ଣ୍ଣ ଭାବେ ଚିହ୍ନ କରୁଛି।",
        bn: "ঠিক আছে, আমি কাজটি সম্পন্ন হিসেবে চিহ্নিত করছি।",
        te: "సరే, పనిని పూర్తిగా గుర్తిస్తున్నాను.",
        ta: "சரி, பணியை முடிந்ததாக குறிக்கிறேன்.",
        mr: "ठीक आहे, मी कार्य पूर्ण म्हणून चिन्हांकित करते.",
        gu: "બરાબર, હું કાર્ય પૂર્ણ તરીકે ચિહ્નિત કરી રહી છું.",
    },
    GET_RISK_STATUS: {
        en: "I am checking your risk status.",
        hi: "मैं आपका जोखिम स्तर जांच रहा हूं।",
        or: "ମୁଁ ଆପଣଙ୍କ ଜୋଖିମ ସ୍ତର ଯାଞ୍ଚ କରୁଛି।",
        bn: "আমি আপনার ঝুঁকির অবস্থা যাচাই করছি।",
        te: "మీ ప్రమాద స్థితిని చూసుతున్నాను.",
        ta: "உங்கள் அபாய நிலையைச் சரிபார்க்கிறேன்.",
        mr: "मी तुमची जोखीम स्थिती तपासत आहे.",
        gu: "હું તમારી જોખમ સ્થિતિ ચકાસી રહી છું.",
    },
    OPEN_EMERGENCY_MODE: {
        en: "Opening emergency mode now.",
        hi: "अभी आपातकालीन मोड खोल रहा हूं।",
        or: "ଏବେ ଜରୁରୀ ମୋଡ୍ ଖୋଲୁଛି।",
        bn: "এখন জরুরি মোড খুলছি।",
        te: "ఇప్పుడే అత్యవసర మోడ్ తెరుస్తున్నాను.",
        ta: "இப்போது அவசர முறையைத் திறக்கிறேன்.",
        mr: "आता आपत्कालीन मोड उघडते.",
        gu: "હવે આપાતકાલીન મોડ ખોલું છું.",
    },
    OPEN_APPOINTMENTS: {
        en: "Opening appointments.",
        hi: "अपॉइंटमेंट्स खोल रहा हूं।",
        or: "ନିଯୁକ୍ତି ପୃଷ୍ଠା ଖୋଲୁଛି।",
        bn: "অ্যাপয়েন্টমেন্ট খুলছি।",
        te: "అపాయింట్‌మెంట్లు తెరుస్తున్నాను.",
        ta: "நியமனங்களைத் திறக்கிறேன்.",
        mr: "अपॉइंटमेंट्स उघडते.",
        gu: "અપોઇન્ટમેન્ટ ખોલું છું.",
    },
    OPEN_MEDICATIONS: {
        en: "Opening medications.",
        hi: "दवाइयों वाला पेज खोल रहा हूं।",
        or: "ଔଷଧ ପୃଷ୍ଠା ଖୋଲୁଛି।",
        bn: "ওষুধের পেজ খুলছি।",
        te: "మందుల పేజీ తెరుస్తున్నాను.",
        ta: "மருந்துகள் பக்கத்தைத் திறக்கிறேன்.",
        mr: "औषधांचे पेज उघडते.",
        gu: "દવાઓનું પેજ ખોલું છું.",
    },
    OPEN_LAB_REPORTS: {
        en: "Opening lab reports.",
        hi: "लैब रिपोर्ट्स खोल रहा हूं।",
        or: "ଲ୍ୟାବ୍ ରିପୋର୍ଟ ଖୋଲୁଛି।",
        bn: "ল্যাব রিপোর্ট খুলছি।",
        te: "ల్యాబ్ రిపోర్ట్స్ తెరుస్తున్నాను.",
        ta: "லாப் அறிக்கைகளைத் திறக்கிறேன்.",
        mr: "लॅब रिपोर्ट्स उघडते.",
        gu: "લેબ રિપોર્ટ ખોલું છું.",
    },
    OPEN_COMMUNITY: {
        en: "Opening community support.",
        hi: "कम्युनिटी सपोर्ट खोल रहा हूं।",
        or: "ସମୁଦାୟ ସହଯୋଗ ଖୋଲୁଛି।",
        bn: "কমিউনিটি সাপোর্ট খুলছি।",
        te: "కమ్యూనిటీ సపోర్ట్ తెరుస్తున్నాను.",
        ta: "சமூக ஆதரவைத் திறக்கிறேன்.",
        mr: "समुदाय सहाय्य उघडते.",
        gu: "સમુદાય સહાય ખોલું છું.",
    },
    OPEN_ASHA_DASHBOARD: {
        en: "Opening ASHA dashboard.",
        hi: "आशा डैशबोर्ड खोल रहा हूं।",
        or: "ଆଶା ଡ୍ୟାଶବୋର୍ଡ ଖୋଲୁଛି।",
        bn: "আশা ড্যাশবোর্ড খুলছি।",
        te: "ఆశా డ్యాష్‌బోర్డ్ తెరుస్తున్నాను.",
        ta: "ஆஷா டாஷ்போர்டைத் திறக்கிறேன்.",
        mr: "आशा डॅशबोर्ड उघडते.",
        gu: "આશા ડેશબોર્ડ ખોલું છું.",
    },
    OPEN_ASHA_PATIENTS: {
        en: "Opening ASHA patient directory.",
        hi: "आशा मरीज सूची खोल रहा हूं।",
        or: "ଆଶା ରୋଗୀ ତାଲିକା ଖୋଲୁଛି।",
        bn: "আশা রোগীর তালিকা খুলছি।",
        te: "ఆశా రోగుల జాబితా తెరుస్తున్నాను.",
        ta: "ஆஷா நோயாளர் பட்டியலைத் திறக்கிறேன்.",
        mr: "आशा रुग्ण यादी उघडते.",
        gu: "આશા દર્દી યાદી ખોલું છું.",
    },
    OPEN_ASHA_TASKS: {
        en: "Opening ASHA task management.",
        hi: "आशा टास्क मैनेजमेंट खोल रहा हूं।",
        or: "ଆଶା କାର୍ଯ୍ୟ ପରିଚାଳନା ଖୋଲୁଛି।",
        bn: "আশা টাস্ক ম্যানেজমেন্ট খুলছি।",
        te: "ఆశా టాస్క్ మేనేజ్‌మెంట్ తెరుస్తున్నాను.",
        ta: "ஆஷா பணி மேலாண்மையைத் திறக்கிறேன்.",
        mr: "आशा टास्क व्यवस्थापन उघडते.",
        gu: "આશા ટાસ્ક મેનેજમેન્ટ ખોલું છું.",
    },
    OPEN_ASHA_ANALYTICS: {
        en: "Opening ASHA analytics.",
        hi: "आशा एनालिटिक्स खोल रहा हूं।",
        or: "ଆଶା ବିଶ୍ଳେଷଣ ଖୋଲୁଛି।",
        bn: "আশা অ্যানালিটিক্স খুলছি।",
        te: "ఆశా అనలిటిక్స్ తెరుస్తున్నాను.",
        ta: "ஆஷா பகுப்பாய்வைத் திறக்கிறேன்.",
        mr: "आशा अॅनालिटिक्स उघडते.",
        gu: "આશા એનાલિટિક્સ ખોલું છું.",
    },
    OPEN_ROUTE: {
        en: "Opening that screen now.",
        hi: "वह स्क्रीन अभी खोल रहा हूं।",
        or: "ସେହି ସ୍କ୍ରିନ୍ ଏବେ ଖୋଲୁଛି।",
        bn: "এখন সেই স্ক্রিন খুলছি।",
        te: "ఆ స్క్రీన్ ఇప్పుడు తెరుస్తున్నాను.",
        ta: "அந்த திரையை இப்போது திறக்கிறேன்.",
        mr: "ती स्क्रीन आता उघडते.",
        gu: "હવે તે સ્ક્રીન ખોલું છું.",
    },
    UNKNOWN: {
        en: "Sorry, I did not understand. Can you repeat?",
        hi: "माफ कीजिए, मैं समझ नहीं पाया। क्या आप दोहरा सकती हैं?",
        or: "ମାଫ କରନ୍ତୁ, ମୁଁ ବୁଝିପାରିଲି ନାହିଁ। ପୁଣି କହିବେ?",
        bn: "দুঃখিত, আমি বুঝতে পারিনি। আবার বলবেন?",
        te: "క్షమించండి, నాకు అర్థం కాలేదు. మళ్లీ చెబుతారా?",
        ta: "மன்னிக்கவும், எனக்கு புரியவில்லை. மீண்டும் சொல்வீர்களா?",
        mr: "माफ करा, मला समजले नाही. पुन्हा सांगाल का?",
        gu: "માફ કરશો, મને સમજાયું નહીં. ફરી કહેશો?",
    },
}

function byLanguage(language: string, value: LocalizedCopy) {
    return value[language] || value.en
}

function containsAny(text: string, terms: string[]) {
    return terms.some((term) => text.includes(term))
}

const commandTerms = {
    checklist: [
        "checklist", "to do", "todo", "tasks list",
        "चेकलिस्ट", "सूची",
        "ଚେକଲିଷ୍ଟ", "ତାଲିକା",
        "চেকলিস্ট", "তালিকা",
        "చెక్లిస్ట్", "జాబితా",
        "சரிபார்ப்பு", "பட்டியல்",
        "चेकलिस्ट", "यादी",
        "ચેકલિસ્ટ", "યાદી",
    ],
    markComplete: [
        "mark", "complete", "done", "finish", "task complete",
        "पूरा", "मार्क", "पूर्ण",
        "ସମ୍ପୂର୍ଣ୍ଣ", "ଚିହ୍ନ", "ସରିଲା",
        "সম্পন্ন", "শেষ", "চিহ্নিত",
        "పూర్తి", "గుర్తించు", "ముగించు",
        "முடி", "முடிந்தது", "குறி",
        "पूर्ण", "चिन्हांकित", "झाले",
        "પૂર્ણ", "ચિહ્નિત", "સમાપ્ત",
    ],
    risk: [
        "risk", "status", "danger", "high risk",
        "जोखिम", "रिस्क",
        "ଜୋଖିମ", "ଝୁକି",
        "ঝুঁকি", "রিস্ক",
        "ప్రమాద", "రిస్క్",
        "அபாய", "ரிஸ்க்",
        "जोखीम", "धोका",
        "જોખમ", "રિસ્ક",
    ],
    emergency: [
        "emergency", "sos", "urgent", "help now", "ambulance",
        "आपात", "आपातकाल", "तुरंत",
        "ଜରୁରୀ", "ସହାୟତା", "ଆମ୍ବୁଲାନ୍ସ",
        "জরুরি", "অ্যাম্বুলেন্স", "বাঁচান",
        "అత్యవసర", "సహాయం", "అంబులెన్స్",
        "அவசரம்", "உதவி", "ஆம்புலன்ஸ்",
        "आपत्काल", "मदत", "रुग्णवाहिका",
        "આપાતકાલ", "મદદ", "એમ્બ્યુલન્સ",
    ],
    appointments: [
        "appointment", "appointments", "schedule", "visit", "clinic",
        "अपॉइंटमेंट", "नियुक्ति", "मुलाकात",
        "ନିଯୁକ୍ତି", "ଭିଜିଟ୍", "ଚେକଅପ",
        "অ্যাপয়েন্টমেন্ট", "ভিজিট", "চেকআপ",
        "అపాయింట్", "సందర్శన", "చెకప్",
        "நியமனம்", "சந்திப்பு", "பரிசோதனை",
        "अपॉइंटमेंट", "भेट", "तपासणी",
        "અપોઇન્ટમેન્ટ", "મુલાકાત", "ચેકઅપ",
    ],
    medications: [
        "medication", "medicine", "medicines", "drugs", "tablet", "pill",
        "दवा", "दवाई", "गोली",
        "ଔଷଧ", "ଟାବଲେଟ୍", "ଗୋଳି",
        "ওষুধ", "ট্যাবলেট", "ঔষধ",
        "మందు", "మందులు", "టాబ్లెట్",
        "மருந்து", "மருந்துகள்", "மாத்திரை",
        "औषध", "गोळी", "मेडिसिन",
        "દવા", "દવાઓ", "ગોળી",
    ],
    labReports: [
        "lab", "report", "reports", "test result", "blood test", "scan",
        "रिपोर्ट", "लैब", "जांच",
        "ରିପୋର୍ଟ", "ଲ୍ୟାବ୍", "ପରୀକ୍ଷା",
        "রিপোর্ট", "ল্যাব", "পরীক্ষা",
        "రిపోర్ట్", "ల్యాబ్", "పరీక్ష",
        "அறிக்கை", "லாப்", "சோதனை",
        "अहवाल", "लॅब", "चाचणी",
        "રિપોર્ટ", "લેબ", "પરીક્ષણ",
    ],
    community: [
        "community", "support", "group", "groups", "forum",
        "समुदाय", "सपोर्ट", "समूह",
        "ସମୁଦାୟ", "ସହଯୋଗ", "ଗୋଷ୍ଠୀ",
        "কমিউনিটি", "সহায়তা", "গ্রুপ",
        "కమ్యూనిటీ", "సపోర్ట్", "గ్రూప్",
        "சமூக", "ஆதரவு", "குழு",
        "समुदाय", "सहाय्य", "गट",
        "સમુદાય", "સહાય", "ગ્રુપ",
    ],
    ashaDashboard: [
        "asha dashboard", "asha home", "asha main",
        "आशा डैशबोर्ड", "आशा होम",
        "ଆଶା ଡ୍ୟାଶବୋର୍ଡ",
        "আশা ড্যাশবোর্ড",
        "ఆశా డ్యాష్‌బోర్డ్",
        "ஆஷா டாஷ்போர்டு",
        "आशा डॅशबोर्ड",
        "આશા ડેશબોર્ડ",
    ],
    ashaPatients: [
        "asha patient", "asha patients", "patient directory", "mother list",
        "आशा मरीज", "मरीज सूची",
        "ଆଶା ରୋଗୀ", "ରୋଗୀ ତାଲିକା",
        "আশা রোগী", "রোগীর তালিকা",
        "ఆశా రోగి", "రోగుల జాబితా",
        "ஆஷா நோயாளர்", "நோயாளர் பட்டியல்",
        "आशा रुग्ण", "रुग्ण यादी",
        "આશા દર્દી", "દર્દી યાદી",
    ],
    ashaTasks: [
        "asha task", "asha tasks", "task management", "work plan",
        "आशा टास्क", "कार्य प्रबंधन",
        "ଆଶା କାର୍ଯ୍ୟ", "କାର୍ଯ୍ୟ ପରିଚାଳନା",
        "আশা টাস্ক", "কাজ ব্যবস্থাপনা",
        "ఆశా టాస్క్", "పని నిర్వహణ",
        "ஆஷா பணி", "பணி மேலாண்மை",
        "आशा टास्क", "कार्य व्यवस्थापन",
        "આશા ટાસ્ક", "કાર્ય વ્યવસ્થાપન",
    ],
    ashaAnalytics: [
        "asha analytic", "asha analytics", "asha report", "asha data",
        "आशा एनालिटिक्स", "आशा रिपोर्ट",
        "ଆଶା ବିଶ୍ଳେଷଣ", "ଆଶା ରିପୋର୍ଟ",
        "আশা অ্যানালিটিক্স", "আশা রিপোর্ট",
        "ఆశా అనలిటిక్స్", "ఆశా నివేదిక",
        "ஆஷா பகுப்பாய்வு", "ஆஷா அறிக்கை",
        "आशा अॅनालिटिक्स", "आशा अहवाल",
        "આશા એનાલિટિક્સ", "આશા રિપોર્ટ",
    ],
}

function heuristicParse(transcript: string, language: string): VoiceCommandParseResult {
    const lower = transcript.toLowerCase()

    if (containsAny(lower, commandTerms.checklist)) {
        return {
            intent: "SHOW_CHECKLIST",
            confidence: 0.68,
            route: "/mother",
            assistantReply: byLanguage(language, fallbackReplies.SHOW_CHECKLIST),
        }
    }

    if (containsAny(lower, commandTerms.markComplete)) {
        return {
            intent: "MARK_TASK_COMPLETE",
            confidence: 0.67,
            route: "/mother",
            assistantReply: byLanguage(language, fallbackReplies.MARK_TASK_COMPLETE),
        }
    }

    if (containsAny(lower, commandTerms.risk)) {
        return {
            intent: "GET_RISK_STATUS",
            confidence: 0.71,
            route: "/mother",
            assistantReply: byLanguage(language, fallbackReplies.GET_RISK_STATUS),
        }
    }

    if (containsAny(lower, commandTerms.emergency)) {
        return {
            intent: "OPEN_EMERGENCY_MODE",
            confidence: 0.78,
            route: "/mother/emergency",
            assistantReply: byLanguage(language, fallbackReplies.OPEN_EMERGENCY_MODE),
        }
    }

    if (containsAny(lower, commandTerms.appointments)) {
        return {
            intent: "OPEN_APPOINTMENTS",
            confidence: 0.76,
            route: "/mother/appointments",
            assistantReply: byLanguage(language, fallbackReplies.OPEN_APPOINTMENTS),
        }
    }

    if (containsAny(lower, commandTerms.medications)) {
        return {
            intent: "OPEN_MEDICATIONS",
            confidence: 0.76,
            route: "/mother/medications",
            assistantReply: byLanguage(language, fallbackReplies.OPEN_MEDICATIONS),
        }
    }

    if (containsAny(lower, commandTerms.labReports)) {
        return {
            intent: "OPEN_LAB_REPORTS",
            confidence: 0.75,
            route: "/mother/lab-reports",
            assistantReply: byLanguage(language, fallbackReplies.OPEN_LAB_REPORTS),
        }
    }

    if (containsAny(lower, commandTerms.community)) {
        return {
            intent: "OPEN_COMMUNITY",
            confidence: 0.72,
            route: lower.includes("asha") ? "/asha" : "/mother/community",
            assistantReply: byLanguage(language, fallbackReplies.OPEN_COMMUNITY),
        }
    }

    if (containsAny(lower, commandTerms.ashaDashboard)) {
        return {
            intent: "OPEN_ASHA_DASHBOARD",
            confidence: 0.8,
            route: "/asha",
            assistantReply: byLanguage(language, fallbackReplies.OPEN_ASHA_DASHBOARD),
        }
    }

    if (containsAny(lower, commandTerms.ashaPatients)) {
        return {
            intent: "OPEN_ASHA_PATIENTS",
            confidence: 0.78,
            route: "/asha",
            assistantReply: byLanguage(language, fallbackReplies.OPEN_ASHA_PATIENTS),
        }
    }

    if (containsAny(lower, commandTerms.ashaTasks)) {
        return {
            intent: "OPEN_ASHA_TASKS",
            confidence: 0.79,
            route: "/asha/task-management",
            assistantReply: byLanguage(language, fallbackReplies.OPEN_ASHA_TASKS),
        }
    }

    if (containsAny(lower, commandTerms.ashaAnalytics)) {
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
