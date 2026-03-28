import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createReferral, listReferrals, updateReferralStatus } from "@/lib/persistence-store"
import { hasRole, requireSessionUser } from "@/lib/api-auth"
import { failBadRequest, failForbidden, failInternal, failNotFound, failTooManyRequests, failUnauthorized } from "@/lib/api-response"
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
    if (!user) return failUnauthorized()

    const rl = await rateLimit(`referrals-get:${user.id}:${clientIp(req)}`, 80, 60_000)
    if (!rl.allowed) return failTooManyRequests("Too many requests")

    const { searchParams } = new URL(req.url)
    const requestedPatientId = searchParams.get("patientId")
    const patientId = user.role === "MOTHER" ? user.id : requestedPatientId
    if (!patientId) return failBadRequest("patientId is required")
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

    return NextResponse.json({ success: true, requestId, referrals, total: referrals.length, breachAlerts })
  } catch (error) {
    logError("referrals.get.failed", { requestId, error: error instanceof Error ? error.message : "unknown" })
    await sendAlert("referrals.get.failed", "Referral listing failed", {
      requestId,
      error: error instanceof Error ? error.message : "unknown",
    })
    return failInternal("Failed to list referrals")
  }
}

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req)
  try {
    const user = await requireSessionUser()
    if (!user) return failUnauthorized()
    if (!hasRole(user.role, ["MOTHER", "ASHA", "DOCTOR"])) return failForbidden()

    const rl = await rateLimit(`referrals-post:${user.id}:${clientIp(req)}`, 30, 60_000)
    if (!rl.allowed) return failTooManyRequests("Too many create requests")

    const idempotencyKey = req.headers.get("idempotency-key")
    if (idempotencyKey) {
      const cached = readIdempotent(`referrals:create:${user.id}:${idempotencyKey}`)
      if (cached) return NextResponse.json(cached.body, { status: cached.status })
    }

    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return failBadRequest("Invalid payload")
    }

    if (user.role === "MOTHER" && parsed.data.patientId !== user.id) {
      return failForbidden("Cannot create referral for another patient")
    }

    const referral = await withTiming("referrals.post", () => createReferral(parsed.data))

    const payload = { success: true, referral }
    if (idempotencyKey) writeIdempotent(`referrals:create:${user.id}:${idempotencyKey}`, 200, payload)
    return NextResponse.json(payload)
  } catch (error) {
    logError("referrals.post.failed", { requestId, error: error instanceof Error ? error.message : "unknown" })
    await sendAlert("referrals.post.failed", "Referral creation failed", {
      requestId,
      error: error instanceof Error ? error.message : "unknown",
    })
    return failInternal("Failed to create referral")
  }
}

export async function PUT(req: NextRequest) {
  const requestId = getRequestId(req)
  try {
    const user = await requireSessionUser()
    if (!user) return failUnauthorized()
    if (!hasRole(user.role, ["ASHA", "DOCTOR"])) return failForbidden("Only care providers can update referral status")

    const rl = await rateLimit(`referrals-put:${user.id}:${clientIp(req)}`, 50, 60_000)
    if (!rl.allowed) return failTooManyRequests("Too many update requests")

    const idempotencyKey = req.headers.get("idempotency-key")
    if (idempotencyKey) {
      const cached = readIdempotent(`referrals:update:${user.id}:${idempotencyKey}`)
      if (cached) return NextResponse.json(cached.body, { status: cached.status })
    }

    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return failBadRequest("Invalid payload")
    }

    const referral = await withTiming("referrals.put", () => updateReferralStatus(parsed.data.id, parsed.data.status))

    if (!referral) {
      return failNotFound("Referral not found")
    }

    const payload = { success: true, referral }
    if (idempotencyKey) writeIdempotent(`referrals:update:${user.id}:${idempotencyKey}`, 200, payload)
    return NextResponse.json(payload)
  } catch (error) {
    logError("referrals.put.failed", { requestId, error: error instanceof Error ? error.message : "unknown" })
    await sendAlert("referrals.put.failed", "Referral status update failed", {
      requestId,
      error: error instanceof Error ? error.message : "unknown",
    })
    return failInternal("Failed to update referral")
  }
}
