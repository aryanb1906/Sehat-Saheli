import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createAuditLog, getConsent, getConsentHistory, revokeConsent, saveConsent } from "@/lib/persistence-store"
import { requireSessionUser } from "@/lib/api-auth"
import { failBadRequest, failForbidden, failInternal, failTooManyRequests, failUnauthorized, okWithRequestId } from "@/lib/api-response"
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
    if (!user) return failUnauthorized("Authentication required", requestId)

    const rl = await rateLimit(`privacy-consent-get:${user.id}:${clientIp(req)}`, 80, 60_000)
    if (!rl.allowed) return failTooManyRequests("Too many requests", undefined, requestId)

    const { searchParams } = new URL(req.url)
    const targetUserId = searchParams.get("userId") || user.id
    const includeHistory = searchParams.get("includeHistory") === "1"
    if (targetUserId !== user.id && user.role !== "DOCTOR") {
      return failForbidden("Cannot access another user's consent", requestId)
    }

    const consent = await withTiming("privacy-consent.get", () => getConsent(targetUserId))
    const history = includeHistory ? await getConsentHistory(targetUserId, 30) : []

    return okWithRequestId({ consent, history }, requestId)
  } catch (error) {
    logError("privacy-consent.get.failed", { requestId, error: error instanceof Error ? error.message : "unknown" })
    await sendAlert("privacy-consent.get.failed", "Privacy consent read failed", {
      requestId,
      error: error instanceof Error ? error.message : "unknown",
    })
    return failInternal("Failed to load consent settings", requestId)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req)
  const endpoint = new URL(req.url).pathname
  try {
    const user = await requireSessionUser()
    if (!user) return failUnauthorized("Authentication required", requestId)

    const rl = await rateLimit(`privacy-consent-post:${user.id}:${clientIp(req)}`, 40, 60_000)
    if (!rl.allowed) return failTooManyRequests("Too many updates", undefined, requestId)

    const body = await req.json()
    if (body?.action === "revoke") {
      const targetUserId = String(body?.userId || user.id)
      if (targetUserId !== user.id && user.role !== "DOCTOR") {
        return failForbidden("Cannot revoke another user's consent", requestId)
      }
      const revoked = await revokeConsent(targetUserId, user.id)
      if (!revoked) return failBadRequest("Consent record not found", requestId)

      await createAuditLog({
        actorRole: user.role,
        actorId: user.id,
        action: "PRIVACY_CONSENT_REVOKED",
        resource: "privacy-consent",
        requestId,
        endpoint,
        metadata: { targetUserId },
      })

      return okWithRequestId({ consent: revoked }, requestId)
    }

    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return failBadRequest("Invalid payload", requestId)
    }

    if (parsed.data.userId !== user.id && user.role !== "DOCTOR") {
      return failForbidden("Cannot update another user's consent", requestId)
    }

    const consent = await withTiming("privacy-consent.post", () =>
      saveConsent({ ...parsed.data, actorId: user.id }),
    )
    await createAuditLog({
      actorRole: user.role,
      actorId: user.id,
      action: "PRIVACY_CONSENT_UPDATED",
      resource: "privacy-consent",
      requestId,
      endpoint,
      metadata: {
        targetUserId: parsed.data.userId,
        retentionDays: parsed.data.retentionDays,
        consentDataShare: parsed.data.consentDataShare,
        consentAiTraining: parsed.data.consentAiTraining,
      },
    })

    return okWithRequestId({ consent }, requestId)
  } catch (error) {
    logError("privacy-consent.post.failed", { requestId, error: error instanceof Error ? error.message : "unknown" })
    await sendAlert("privacy-consent.post.failed", "Privacy consent update failed", {
      requestId,
      error: error instanceof Error ? error.message : "unknown",
    })
    return failInternal("Failed to save consent settings", requestId)
  }
}
