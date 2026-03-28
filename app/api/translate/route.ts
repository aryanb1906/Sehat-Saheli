import { z } from "zod"
import { clientIp, rateLimit } from "@/lib/rate-limit"

export async function POST(req: Request) {
  const rl = await rateLimit(`translate:${clientIp(req)}`, 60, 60_000)
  if (!rl.allowed) {
    return Response.json({ error: "Too many translation requests" }, { status: 429, headers: { "Retry-After": "60" } })
  }

  const parsed = z
    .object({
      text: z.string().min(1),
      targetLanguage: z.string().min(2).max(5),
    })
    .safeParse(await req.json())

  if (!parsed.success) {
    return Response.json({ error: "Invalid translation payload" }, { status: 400 })
  }

  const { text, targetLanguage } = parsed.data

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
