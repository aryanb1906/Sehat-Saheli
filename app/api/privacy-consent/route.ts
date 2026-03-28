import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getConsent, getConsentHistory, revokeConsent, saveConsent } from "@/lib/persistence-store"
import { requireSessionUser } from "@/lib/api-auth"
import { failBadRequest, failForbidden, failInternal, failTooManyRequests, failUnauthorized } from "@/lib/api-response"
import { clientIp, rateLimit } from "@/lib/rate-limit"
import { getRequestId, logError, sendAlert, withTiming } from "@/lib/observability"

const schema = z.object({
  userId: z.string().min(1),
  consentDataShare: z.boolean(),
  consentAiTraining: z.boolean(),
  retentionDays: z.number().int().min(30).max(3650),
})

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req)
  try {
    const user = await requireSessionUser()
    if (!user) return failUnauthorized()

    const rl = await rateLimit(`privacy-consent-get:${user.id}:${clientIp(req)}`, 80, 60_000)
    if (!rl.allowed) return failTooManyRequests("Too many requests")

    const { searchParams } = new URL(req.url)
    const targetUserId = searchParams.get("userId") || user.id
    const includeHistory = searchParams.get("includeHistory") === "1"
    if (targetUserId !== user.id && user.role !== "DOCTOR") {
      return failForbidden("Cannot access another user's consent")
    }

    const consent = await withTiming("privacy-consent.get", () => getConsent(targetUserId))
    const history = includeHistory ? await getConsentHistory(targetUserId, 30) : []

    return NextResponse.json({ success: true, requestId, consent, history })
  } catch (error) {
    logError("privacy-consent.get.failed", { requestId, error: error instanceof Error ? error.message : "unknown" })
    await sendAlert("privacy-consent.get.failed", "Privacy consent read failed", {
      requestId,
      error: error instanceof Error ? error.message : "unknown",
    })
    return failInternal("Failed to load consent settings")
  }
}

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req)
  try {
    const user = await requireSessionUser()
    if (!user) return failUnauthorized()

    const rl = await rateLimit(`privacy-consent-post:${user.id}:${clientIp(req)}`, 40, 60_000)
    if (!rl.allowed) return failTooManyRequests("Too many updates")

    const body = await req.json()
    if (body?.action === "revoke") {
      const targetUserId = String(body?.userId || user.id)
      if (targetUserId !== user.id && user.role !== "DOCTOR") {
        return failForbidden("Cannot revoke another user's consent")
      }
      const revoked = await revokeConsent(targetUserId, user.id)
      if (!revoked) return failBadRequest("Consent record not found")
      return NextResponse.json({ success: true, requestId, consent: revoked })
    }

    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return failBadRequest("Invalid payload")
    }

    if (parsed.data.userId !== user.id && user.role !== "DOCTOR") {
      return failForbidden("Cannot update another user's consent")
    }

    const consent = await withTiming("privacy-consent.post", () =>
      saveConsent({ ...parsed.data, actorId: user.id }),
    )
    return NextResponse.json({ success: true, requestId, consent })
  } catch (error) {
    logError("privacy-consent.post.failed", { requestId, error: error instanceof Error ? error.message : "unknown" })
    await sendAlert("privacy-consent.post.failed", "Privacy consent update failed", {
      requestId,
      error: error instanceof Error ? error.message : "unknown",
    })
    return failInternal("Failed to save consent settings")
  }
}
