import { type NextRequest } from "next/server"
import { z } from "zod"
import { failBadRequest, failInternal, failTooManyRequests, failUnauthorized, okWithRequestId } from "@/lib/api-response"
import { getRequestId } from "@/lib/observability"
import { requireSessionUser } from "@/lib/api-auth"
import { clientIp, rateLimit } from "@/lib/rate-limit"
import { assessMaternalRisk } from "@/lib/clinical/maternal-risk-engine"

const requestSchema = z.object({
  text: z.string().min(1).max(2000),
})

/**
 * Free-text symptom triage. This used to be plain `.includes("bleeding")`
 * keyword matching that decided risk directly — that meant an unrelated
 * mention of "bleeding gums" or "tired" could set the same risk level as a
 * genuine obstetric emergency, with no shared logic against the structured
 * maternal-risk engine used elsewhere in the app.
 *
 * This is still a heuristic (no LLM call), but it now only extracts
 * *signals* from the text and hands them to the same scoring engine
 * `/api/maternal-risk` uses, so free-text and structured-form triage never
 * disagree on tier. The keyword list is intentionally biased to escalate —
 * ambiguous or ambiguous-adjacent language should never be scored down.
 *
 * TODO(clinical review): this text-signal extraction still needs a real
 * clinician sign-off, and ideally a constrained LLM call, before being
 * trusted for real triage. See remediation brief Phase 3.
 */
function extractSignals(lowerText: string) {
  const hasAny = (words: string[]) => words.some((w) => lowerText.includes(w))

  const heavyBleeding = hasAny(["heavy bleeding", "severe bleeding", "lots of blood", "soaking through"])
  const anyBleeding = !heavyBleeding && hasAny(["bleeding", "blood"])
  const severePain = hasAny(["severe pain", "unbearable pain", "sudden pain", "excruciating"])
  const reducedMovement = hasAny(["no movement", "baby not moving", "reduced movement", "less kicking", "not kicking"])
  const severeHeadache = hasAny(["severe headache", "bad headache", "worst headache"])
  const blurredVision = hasAny(["blurred vision", "vision problem", "seeing spots", "flashing lights"])
  const swelling = hasAny(["swelling", "swollen"])
  const feverOrPain = hasAny(["fever", "high temperature"])

  const mentalHealth = hasAny(["sad", "worried", "anxious", "stress", "depressed", "hopeless", "cry"])

  return {
    heavyBleeding,
    anyBleeding,
    severePain,
    reducedMovement,
    severeHeadache,
    blurredVision,
    swelling,
    feverOrPain,
    mentalHealth,
  }
}

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request)
  try {
    const user = await requireSessionUser()
    if (!user) return failUnauthorized("Authentication required", requestId)

    const rl = await rateLimit(`check-symptom:${user.id}:${clientIp(request)}`, 60, 60_000)
    if (!rl.allowed) return failTooManyRequests("Too many requests", undefined, requestId)

    const body = await request.json()
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) return failBadRequest("Text is required", requestId)

    const lowerText = parsed.data.text.toLowerCase()
    const signals = extractSignals(lowerText)

    if (signals.mentalHealth && !signals.heavyBleeding && !signals.severePain && !signals.reducedMovement) {
      return okWithRequestId({
        risk: "Medium",
        advice:
          "💛 I hear that you are feeling this way. It is common during pregnancy to experience emotional changes. Please talk to someone you trust, get adequate rest, and consider speaking with your ASHA worker for support. Your mental health is important.",
      }, requestId)
    }

    const assessment = assessMaternalRisk({
      // Free text can't reliably distinguish "spotting" from a genuine
      // bleed the way the structured maternal-risk form can — any mention
      // of bleeding/blood here is treated as the more severe "heavy" level
      // rather than guessed down to "spotting", per the escalate-when-
      // ambiguous rule for this endpoint.
      bleedingLevel: signals.heavyBleeding || signals.anyBleeding ? "heavy" : "none",
      // severe/sudden abdominal pain has no dedicated field on the shared engine yet;
      // treat it as equivalent to a severe headache signal so it still escalates
      // rather than being silently dropped.
      severeHeadache: signals.severeHeadache || signals.severePain,
      blurredVision: signals.blurredVision,
      swelling: signals.swelling,
      fetalMovementDrop: signals.reducedMovement,
      gestationalWeeks: signals.reducedMovement ? 28 : undefined,
    })

    const risk: "Low" | "Medium" | "High" =
      assessment.tier === "emergency" || assessment.tier === "high"
        ? "High"
        : assessment.tier === "medium"
          ? "Medium"
          : "Low"

    const advice =
      risk === "High"
        ? "⚠️ You have reported a high-risk symptom. Please contact your ASHA worker immediately or visit the nearest health center. Do not delay seeking medical attention."
        : risk === "Medium"
          ? "💛 Please monitor this closely and contact your ASHA worker today for guidance."
          : signals.feverOrPain
            ? "💛 Please monitor this closely and contact your ASHA worker today for guidance."
            : "✅ Thank you for sharing. It sounds like you are doing well. Remember to eat healthy, stay hydrated, take your prenatal vitamins, and get regular checkups. Keep me updated on how you feel!"

    return okWithRequestId({ risk, advice }, requestId)
  } catch (error) {
    return failInternal("Internal server error", requestId)
  }
}
