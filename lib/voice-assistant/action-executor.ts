import { VoiceActionEventDetail, VOICE_ACTION_EVENT, VoiceCommandParseResult } from "@/lib/voice-assistant/types"

interface ExecuteIntentOptions {
    language: string
    currentPath: string
    navigate: (path: string) => void
}

type LocalizedCopy = Record<string, string>

function say(language: string, copy: LocalizedCopy) {
    return copy[language] || copy.en
}

function getRiskLabel(language: string, risk: string) {
    const normalized = risk.toLowerCase()

    if (normalized === "high") {
        return say(language, {
            en: "High",
            hi: "उच्च",
            or: "ଉଚ୍ଚ",
            bn: "উচ্চ",
            te: "అధిక",
            ta: "அதிகம்",
            mr: "उच्च",
            gu: "ઉચ્ચ",
        })
    }

    if (normalized === "medium") {
        return say(language, {
            en: "Medium",
            hi: "मध्यम",
            or: "ମଧ୍ୟମ",
            bn: "মাঝারি",
            te: "మధ్యస్థ",
            ta: "மிதமான",
            mr: "मध्यम",
            gu: "મધ્યમ",
        })
    }

    return say(language, {
        en: "Low",
        hi: "कम",
        or: "କମ",
        bn: "কম",
        te: "తక్కువ",
        ta: "குறைவு",
        mr: "कमी",
        gu: "ઓછું",
    })
}

export async function executeVoiceIntent(result: VoiceCommandParseResult, options: ExecuteIntentOptions): Promise<string> {
    const { language, currentPath, navigate } = options

    if (result.intent === "UNKNOWN") {
        return say(language, {
            en: "Sorry, I did not understand. Can you repeat?",
            hi: "माफ कीजिए, मैं समझ नहीं पाया। क्या आप दोहरा सकती हैं?",
            or: "ମାଫ କରନ୍ତୁ, ମୁଁ ବୁଝିପାରିଲି ନାହିଁ। ପୁଣି କହିବେ?",
            bn: "দুঃখিত, আমি বুঝতে পারিনি। আবার বলবেন?",
            te: "క్షమించండి, నాకు అర్థం కాలేదు. మళ్లీ చెబుతారా?",
            ta: "மன்னிக்கவும், எனக்கு புரியவில்லை. மீண்டும் சொல்வீர்களா?",
            mr: "माफ करा, मला समजले नाही. पुन्हा सांगाल का?",
            gu: "માફ કરશો, મને સમજાયું નહીં. ફરી કહેશો?",
        })
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

        return say(language, {
            en: "Done. Opening your checklist.",
            hi: "हो गया। आपकी चेकलिस्ट खोल दी है।",
            or: "ହେଲା। ଆପଣଙ୍କ ଚେକଲିଷ୍ଟ ଖୋଲୁଛି।",
            bn: "হয়ে গেছে। আপনার চেকলিস্ট খুলছি।",
            te: "పూర్తయ్యింది. మీ చెక్లిస్ట్ తెరుస్తున్నాను.",
            ta: "சரி. உங்கள் சரிபார்ப்பு பட்டியலைத் திறக்கிறேன்.",
            mr: "झाले. तुमची चेकलिस्ट उघडते.",
            gu: "થઈ ગયું. તમારી ચેકલિસ્ટ ખોલું છું.",
        })
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

        return say(language, {
            en: "Done. Your checklist is updated.",
            hi: "हो गया। आपकी चेकलिस्ट अपडेट कर दी गई है।",
            or: "ହେଲା। ଆପଣଙ୍କ ଚେକଲିଷ୍ଟ ଅଦ୍ୟତନ ହୋଇଗଲା।",
            bn: "হয়ে গেছে। আপনার চেকলিস্ট আপডেট হয়েছে।",
            te: "పూర్తయ్యింది. మీ చెక్లిస్ట్ అప్డేట్ అయింది.",
            ta: "சரி. உங்கள் சரிபார்ப்பு பட்டியல் புதுப்பிக்கப்பட்டது.",
            mr: "झाले. तुमची चेकलिस्ट अद्ययावत झाली आहे.",
            gu: "થઈ ગયું. તમારી ચેકલિસ્ટ અપડેટ થઈ ગઈ છે.",
        })
    }

    if (result.intent === "GET_RISK_STATUS") {
        const risk = localStorage.getItem("motherRiskStatus") || "Low"
        const riskLabel = getRiskLabel(language, risk)
        window.dispatchEvent(
            new CustomEvent<VoiceActionEventDetail>(VOICE_ACTION_EVENT, {
                detail: { intent: "GET_RISK_STATUS" },
            }),
        )

        return say(language, {
            en: `Your current risk status is ${riskLabel}.`,
            hi: `आपका वर्तमान जोखिम स्तर ${riskLabel} है।`,
            or: `ଆପଣଙ୍କ ବର୍ତ୍ତମାନ ଜୋଖିମ ସ୍ତର ${riskLabel} ଅଟେ।`,
            bn: `আপনার বর্তমান ঝুঁকির অবস্থা ${riskLabel}।`,
            te: `మీ ప్రస్తుత ప్రమాద స్థితి ${riskLabel}.`,
            ta: `உங்கள் தற்போதைய அபாய நிலை ${riskLabel}.`,
            mr: `तुमची सध्याची जोखीम स्थिती ${riskLabel} आहे.`,
            gu: `તમારી હાલની જોખમ સ્થિતિ ${riskLabel} છે.`,
        })
    }

    if (result.intent === "OPEN_EMERGENCY_MODE") {
        navigate("/mother/emergency")
        return say(language, {
            en: "Opening emergency mode.",
            hi: "आपातकालीन मोड खोल रही हूं।",
            or: "ଜରୁରୀ ମୋଡ୍ ଖୋଲୁଛି।",
            bn: "জরুরি মোড খুলছি।",
            te: "అత్యవసర మోడ్ తెరుస్తున్నాను.",
            ta: "அவசர முறையைத் திறக்கிறேன்.",
            mr: "आपत्कालीन मोड उघडते.",
            gu: "આપાતકાલીન મોડ ખોલું છું.",
        })
    }

    if (result.intent === "OPEN_APPOINTMENTS") {
        navigate("/mother/appointments")
        return say(language, {
            en: "Opening appointments.",
            hi: "अपॉइंटमेंट्स खोल रही हूं।",
            or: "ନିଯୁକ୍ତି ପୃଷ୍ଠା ଖୋଲୁଛି।",
            bn: "অ্যাপয়েন্টমেন্ট খুলছি।",
            te: "అపాయింట్‌మెంట్లు తెరుస్తున్నాను.",
            ta: "நியமனங்களைத் திறக்கிறேன்.",
            mr: "अपॉइंटमेंट्स उघडते.",
            gu: "અપોઇન્ટમેન્ટ ખોલું છું.",
        })
    }

    if (result.intent === "OPEN_MEDICATIONS") {
        navigate("/mother/medications")
        return say(language, {
            en: "Opening medications.",
            hi: "दवाइयों वाला पेज खोल रही हूं।",
            or: "ଔଷଧ ପୃଷ୍ଠା ଖୋଲୁଛି।",
            bn: "ওষুধের পেজ খুলছি।",
            te: "మందుల పేజీ తెరుస్తున్నాను.",
            ta: "மருந்துகள் பக்கத்தைத் திறக்கிறேன்.",
            mr: "औषधांचे पेज उघडते.",
            gu: "દવાઓનું પેજ ખોલું છું.",
        })
    }

    if (result.intent === "OPEN_LAB_REPORTS") {
        navigate("/mother/lab-reports")
        return say(language, {
            en: "Opening lab reports.",
            hi: "लैब रिपोर्ट्स खोल रही हूं।",
            or: "ଲ୍ୟାବ୍ ରିପୋର୍ଟ ଖୋଲୁଛି।",
            bn: "ল্যাব রিপোর্ট খুলছি।",
            te: "ల్యాబ్ రిపోర్ట్స్ తెరుస్తున్నాను.",
            ta: "லாப் அறிக்கைகளைத் திறக்கிறேன்.",
            mr: "लॅब रिपोर्ट्स उघडते.",
            gu: "લેબ રિપોર્ટ ખોલું છું.",
        })
    }

    if (result.intent === "OPEN_COMMUNITY") {
        if (currentPath.startsWith("/asha")) {
            navigate("/asha")
            return say(language, {
                en: "Opening ASHA community context.",
                hi: "आशा कम्युनिटी सेक्शन खोल रही हूं।",
                or: "ଆଶା ସମୁଦାୟ ବିଭାଗ ଖୋଲୁଛି।",
                bn: "আশা কমিউনিটি সেকশন খুলছি।",
                te: "ఆశా కమ్యూనిటీ విభాగం తెరుస్తున్నాను.",
                ta: "ஆஷா சமூக பகுதியைத் திறக்கிறேன்.",
                mr: "आशा समुदाय विभाग उघडते.",
                gu: "આશા કમ્યુનિટી વિભાગ ખોલું છું.",
            })
        }
        navigate("/mother/community")
        return say(language, {
            en: "Opening community support.",
            hi: "कम्युनिटी सपोर्ट खोल रही हूं।",
            or: "ସମୁଦାୟ ସହଯୋଗ ଖୋଲୁଛି।",
            bn: "কমিউনিটি সাপোর্ট খুলছি।",
            te: "కమ్యూనిటీ సపోర్ట్ తెరుస్తున్నాను.",
            ta: "சமூக ஆதரவைத் திறக்கிறேன்.",
            mr: "समुदाय सहाय्य उघडते.",
            gu: "સમુદાય સહાય ખોલું છું.",
        })
    }

    if (result.intent === "OPEN_ASHA_DASHBOARD") {
        navigate("/asha")
        return say(language, {
            en: "Opening ASHA dashboard.",
            hi: "आशा डैशबोर्ड खोल रही हूं।",
            or: "ଆଶା ଡ୍ୟାଶବୋର୍ଡ ଖୋଲୁଛି।",
            bn: "আশা ড্যাশবোর্ড খুলছি।",
            te: "ఆశా డ్యాష్‌బోర్డ్ తెరుస్తున్నాను.",
            ta: "ஆஷா டாஷ்போர்டைத் திறக்கிறேன்.",
            mr: "आशा डॅशबोर्ड उघडते.",
            gu: "આશા ડેશબોર્ડ ખોલું છું.",
        })
    }

    if (result.intent === "OPEN_ASHA_PATIENTS") {
        navigate("/asha")
        return say(language, {
            en: "Opening ASHA patient directory.",
            hi: "आशा मरीज सूची खोल रही हूं।",
            or: "ଆଶା ରୋଗୀ ତାଲିକା ଖୋଲୁଛି।",
            bn: "আশা রোগীর তালিকা খুলছি।",
            te: "ఆశా రోగుల జాబితా తెరుస్తున్నాను.",
            ta: "ஆஷா நோயாளர் பட்டியலைத் திறக்கிறேன்.",
            mr: "आशा रुग्ण यादी उघडते.",
            gu: "આશા દર્દી યાદી ખોલું છું.",
        })
    }

    if (result.intent === "OPEN_ASHA_TASKS") {
        navigate("/asha/task-management")
        return say(language, {
            en: "Opening ASHA task management.",
            hi: "आशा टास्क मैनेजमेंट खोल रही हूं।",
            or: "ଆଶା କାର୍ଯ୍ୟ ପରିଚାଳନା ଖୋଲୁଛି।",
            bn: "আশা টাস্ক ম্যানেজমেন্ট খুলছি।",
            te: "ఆశా టాస్క్ మేనేజ్‌మెంట్ తెరుస్తున్నాను.",
            ta: "ஆஷா பணி மேலாண்மையைத் திறக்கிறேன்.",
            mr: "आशा टास्क व्यवस्थापन उघडते.",
            gu: "આશા ટાસ્ક મેનેજમેન્ટ ખોલું છું.",
        })
    }

    if (result.intent === "OPEN_ASHA_ANALYTICS") {
        navigate("/asha/analytics")
        return say(language, {
            en: "Opening ASHA analytics.",
            hi: "आशा एनालिटिक्स खोल रही हूं।",
            or: "ଆଶା ବିଶ୍ଳେଷଣ ଖୋଲୁଛି।",
            bn: "আশা অ্যানালিটিক্স খুলছি।",
            te: "ఆశా అనలిటిక్స్ తెరుస్తున్నాను.",
            ta: "ஆஷா பகுப்பாய்வைத் திறக்கிறேன்.",
            mr: "आशा अॅनालिटिक्स उघडते.",
            gu: "આશા એનાલિટિક્સ ખોલું છું.",
        })
    }

    if (result.intent === "OPEN_ROUTE" && result.route) {
        navigate(result.route)
        return say(language, {
            en: "Done. Opening requested screen.",
            hi: "हो गया। मांगी गई स्क्रीन खोल रही हूं।",
            or: "ହେଲା। ଅନୁରୋଧ କରାଯାଇଥିବା ସ୍କ୍ରିନ୍ ଖୋଲୁଛି।",
            bn: "হয়ে গেছে। চাওয়া স্ক্রিন খুলছি।",
            te: "పూర్తయ్యింది. కోరిన స్క్రీన్ తెరుస్తున్నాను.",
            ta: "சரி. கேட்ட திரையைத் திறக்கிறேன்.",
            mr: "झाले. मागितलेली स्क्रीन उघडते.",
            gu: "થઈ ગયું. માંગેલી સ્ક્રીન ખોલું છું.",
        })
    }

    return say(language, {
        en: "Sorry, I did not understand. Can you repeat?",
        hi: "माफ कीजिए, मैं समझ नहीं पाया। क्या आप दोहरा सकती हैं?",
        or: "ମାଫ କରନ୍ତୁ, ମୁଁ ବୁଝିପାରିଲି ନାହିଁ। ପୁଣି କହିବେ?",
        bn: "দুঃখিত, আমি বুঝতে পারিনি। আবার বলবেন?",
        te: "క్షమించండి, నాకు అర్థం కాలేదు. మళ్లీ చెబుతారా?",
        ta: "மன்னிக்கவும், எனக்கு புரியவில்லை. மீண்டும் சொல்வீர்களா?",
        mr: "माफ करा, मला समजले नाही. पुन्हा सांगाल का?",
        gu: "માફ કરશો, મને સમજાયું નહીં. ફરી કહેશો?",
    })
}
