import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createReferral, listReferrals, updateReferralStatus } from "@/lib/persistence-store"
import { hasRole, requireSessionUser } from "@/lib/api-auth"
import { failBadRequest, failForbidden, failInternal, failNotFound, failTooManyRequests, failUnauthorized, okWithRequestId } from "@/lib/api-response"
import { clientIp, rateLimit } from "@/lib/rate-limit"
import { readIdempotent, writeIdempotent } from "@/lib/idempotency"
import { getRequestId, logError, sendAlert, withTiming } from "@/lib/observability"

const createSchema = z.object({
  patientId: z.string().min(1),
  consultationId: z.string().min(1),
  note: z.string().min(5),
  status: z.enum(["generated", "shared", "in-treatment", "completed"]).default("generated"),
})

const updateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["generated", "shared", "in-treatment", "completed"]),
})

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req)
  try {
    const user = await requireSessionUser()
    if (!user) return failUnauthorized("Authentication required", requestId)

    const rl = await rateLimit(`referrals-get:${user.id}:${clientIp(req)}`, 80, 60_000)
    if (!rl.allowed) return failTooManyRequests("Too many requests", undefined, requestId)

    const { searchParams } = new URL(req.url)
    const requestedPatientId = searchParams.get("patientId")
    const patientId = user.role === "MOTHER" ? user.id : requestedPatientId
    if (!patientId) return failBadRequest("patientId is required", requestId)
    const referrals = await withTiming("referrals.get", () => listReferrals(patientId))
    const breachAlerts = referrals
      .filter((item: { status: string }) => item.status === "breached")
      .map((item: { id: string }) => ({ id: item.id, message: `SLA breached for referral ${item.id.slice(-6)}` }))

    if (breachAlerts.length > 0) {
      await sendAlert(
        "referral.sla.breach",
        "Referral SLA breach detected",
        { requestId, patientId, count: breachAlerts.length, breachAlerts },
        "critical",
      )
    }

    return okWithRequestId({ referrals, total: referrals.length, breachAlerts }, requestId)
  } catch (error) {
    logError("referrals.get.failed", { requestId, error: error instanceof Error ? error.message : "unknown" })
    await sendAlert("referrals.get.failed", "Referral listing failed", {
      requestId,
      error: error instanceof Error ? error.message : "unknown",
    })
    return failInternal("Failed to list referrals", requestId)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req)
  try {
    const user = await requireSessionUser()
    if (!user) return failUnauthorized("Authentication required", requestId)
    if (!hasRole(user.role, ["MOTHER", "ASHA", "DOCTOR"])) return failForbidden("Not allowed to access this resource", requestId)

    const rl = await rateLimit(`referrals-post:${user.id}:${clientIp(req)}`, 30, 60_000)
    if (!rl.allowed) return failTooManyRequests("Too many create requests", undefined, requestId)

    const idempotencyKey = req.headers.get("idempotency-key")
    if (idempotencyKey) {
      const cached = await readIdempotent(`referrals:create:${user.id}:${idempotencyKey}`)
      if (cached) return NextResponse.json(cached.body, { status: cached.status })
    }

    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return failBadRequest("Invalid payload", requestId)
    }

    if (user.role === "MOTHER" && parsed.data.patientId !== user.id) {
      return failForbidden("Cannot create referral for another patient", requestId)
    }

    const referral = await withTiming("referrals.post", () => createReferral(parsed.data))

    const payload = { success: true, requestId, referral }
    if (idempotencyKey) await writeIdempotent(`referrals:create:${user.id}:${idempotencyKey}`, 200, payload)
    return okWithRequestId({ referral }, requestId)
  } catch (error) {
    logError("referrals.post.failed", { requestId, error: error instanceof Error ? error.message : "unknown" })
    await sendAlert("referrals.post.failed", "Referral creation failed", {
      requestId,
      error: error instanceof Error ? error.message : "unknown",
    })
    return failInternal("Failed to create referral", requestId)
  }
}

export async function PUT(req: NextRequest) {
  const requestId = getRequestId(req)
  try {
    const user = await requireSessionUser()
    if (!user) return failUnauthorized("Authentication required", requestId)
    if (!hasRole(user.role, ["ASHA", "DOCTOR"])) return failForbidden("Only care providers can update referral status", requestId)

    const rl = await rateLimit(`referrals-put:${user.id}:${clientIp(req)}`, 50, 60_000)
    if (!rl.allowed) return failTooManyRequests("Too many update requests", undefined, requestId)

    const idempotencyKey = req.headers.get("idempotency-key")
    if (idempotencyKey) {
      const cached = await readIdempotent(`referrals:update:${user.id}:${idempotencyKey}`)
      if (cached) return NextResponse.json(cached.body, { status: cached.status })
    }

    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return failBadRequest("Invalid payload", requestId)
    }

    const referral = await withTiming("referrals.put", () => updateReferralStatus(parsed.data.id, parsed.data.status))

    if (!referral) {
      return failNotFound("Referral not found", requestId)
    }

    const payload = { success: true, requestId, referral }
    if (idempotencyKey) await writeIdempotent(`referrals:update:${user.id}:${idempotencyKey}`, 200, payload)
    return okWithRequestId({ referral }, requestId)
  } catch (error) {
    logError("referrals.put.failed", { requestId, error: error instanceof Error ? error.message : "unknown" })
    await sendAlert("referrals.put.failed", "Referral status update failed", {
      requestId,
      error: error instanceof Error ? error.message : "unknown",
    })
    return failInternal("Failed to update referral", requestId)
  }
}
