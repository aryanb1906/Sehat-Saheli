export async function POST(req: Request) {
  const { text, targetLanguage } = await req.json()

  // Mock translation - In production, use Bhashini API
  const translations: Record<string, Record<string, string>> = {
    hi: {
      "How are you feeling today?": "आज आप कैसा महसूस कर रही हैं?",
      "Your Health Status": "आपकी स्वास्थ्य स्थिति",
      "Talk to Saheli": "साहेली से बात करें",
      "My Health Log": "मेरी स्वास्थ्य डायरी",
      "Mental Health": "मानसिक स्वास्थ्य",
      "Emergency Call": "आपातकालीन कॉल",
    },
  }

  const translated = translations[targetLanguage]?.[text] || text

  return Response.json({ translatedText: translated })
}
