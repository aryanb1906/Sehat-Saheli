export const runtime = "edge"

interface SMSRequest {
  to: string
  message: string
  patientName?: string
}

export async function POST(req: Request) {
  try {
    const { to, message, patientName }: SMSRequest = await req.json()

    const accountSid = process.env.TWILIO_ACCOUNT_SID || "" 
    const authToken = process.env.TWILIO_AUTH_TOKEN || ""
    const fromNumber = process.env.TWILIO_PHONE_NUMBER || "+1234567890"

    // In demo mode, just log and return success
    if (!authToken) {
      console.log("[v0] Demo SMS:", { to, message, patientName })
      return Response.json({
        success: true,
        message: "SMS sent (demo mode)",
        sid: `demo_${Date.now()}`,
      })
    }

    // Real Twilio integration
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    const auth = btoa(`${accountSid}:${authToken}`)

    const body = new URLSearchParams({
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
      body: body.toString(),
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
