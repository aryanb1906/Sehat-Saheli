import { z } from "zod"
import { requireSessionUser, hasRole } from "@/lib/api-auth"
import { clientIp, rateLimit } from "@/lib/rate-limit"

export const runtime = "nodejs"

const smsSchema = z.object({
  to: z.string().min(8).max(20),
  message: z.string().min(1).max(1000),
  patientName: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    // This is a real SMS relay once TWILIO_AUTH_TOKEN is configured — it must
    // never be reachable without auth, or it becomes a free spam/phishing
    // relay on the project's Twilio bill the moment credentials are live.
    const user = await requireSessionUser()
    if (!user) {
      return Response.json({ success: false, error: "Authentication required" }, { status: 401 })
    }
    if (!hasRole(user.role, ["ASHA", "DOCTOR"])) {
      return Response.json({ success: false, error: "Only ASHA/doctor accounts can send SMS" }, { status: 403 })
    }

    const rl = await rateLimit(`sms:${user.id}:${clientIp(req)}`, 20, 60_000)
    if (!rl.allowed) {
      return Response.json({ success: false, error: "Too many SMS requests" }, { status: 429 })
    }

    const body = await req.json()
    const parsed = smsSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ success: false, error: "Invalid payload" }, { status: 400 })
    }
    const { to, message, patientName } = parsed.data

    const accountSid = process.env.TWILIO_ACCOUNT_SID || ""
    const authToken = process.env.TWILIO_AUTH_TOKEN || ""
    const fromNumber = process.env.TWILIO_PHONE_NUMBER || "+1234567890"

    // In demo mode, just log and return success
    if (!authToken) {
      console.log("[v0] Demo SMS:", { to, message, patientName, sentBy: user.id })
      return Response.json({
        success: true,
        message: "SMS sent (demo mode)",
        sid: `demo_${Date.now()}`,
      })
    }

    // Real Twilio integration
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    const auth = btoa(`${accountSid}:${authToken}`)

    const twilioBody = new URLSearchParams({
      To: to,
      From: fromNumber,
      Body: message,
    })

    const response = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: twilioBody.toString(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Failed to send SMS")
    }

    return Response.json({
      success: true,
      message: "SMS sent successfully",
      sid: data.sid,
    })
  } catch (error) {
    console.error("[v0] SMS API error:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send SMS",
      },
      { status: 500 },
    )
  }
}
