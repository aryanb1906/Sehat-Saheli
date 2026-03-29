import { type NextRequest } from "next/server"
import { failBadRequest, failInternal, okWithRequestId } from "@/lib/api-response"
import { getRequestId } from "@/lib/observability"

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request)
  try {
    const { text } = await request.json()

    if (!text) {
      return failBadRequest("Text is required", requestId)
    }

    const lowerText = text.toLowerCase()

    // Mock AI risk analysis logic
    let risk: "Low" | "Medium" | "High" = "Low"
    let advice = ""

    // High-risk symptoms
    if (
      lowerText.includes("dizzy") ||
      lowerText.includes("fever") ||
      lowerText.includes("bleeding") ||
      lowerText.includes("severe pain") ||
      lowerText.includes("headache") ||
      lowerText.includes("swelling")
    ) {
      risk = "High"
      advice =
        "⚠️ You have reported a high-risk symptom. Please contact your ASHA worker immediately or visit the nearest health center. Do not delay seeking medical attention."
    }
    // Medium-risk symptoms (mental health)
    else if (
      lowerText.includes("sad") ||
      lowerText.includes("worried") ||
      lowerText.includes("anxious") ||
      lowerText.includes("stress") ||
      lowerText.includes("depressed") ||
      lowerText.includes("tired")
    ) {
      risk = "Medium"
      advice =
        "💛 I hear that you are feeling this way. It is common during pregnancy to experience emotional changes. Please talk to someone you trust, get adequate rest, and consider speaking with your ASHA worker for support. Your mental health is important."
    }
    // Low-risk / general wellness
    else {
      risk = "Low"
      advice =
        "✅ Thank you for sharing. It sounds like you are doing well. Remember to eat healthy, stay hydrated, take your prenatal vitamins, and get regular checkups. Keep me updated on how you feel!"
    }

    return okWithRequestId({ risk, advice }, requestId)
  } catch (error) {
    console.error("[v0] Error in check-symptom API:", error)
    return failInternal("Internal server error", requestId)
  }
}
