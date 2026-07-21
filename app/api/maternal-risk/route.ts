import { NextRequest } from "next/server"
import { z } from "zod"
import { failBadRequest, failInternal, failTooManyRequests, failUnauthorized, okWithRequestId } from "@/lib/api-response"
import { getRequestId } from "@/lib/observability"
import { requireSessionUser } from "@/lib/api-auth"
import { clientIp, rateLimit } from "@/lib/rate-limit"
import { assessMaternalRisk } from "@/lib/clinical/maternal-risk-engine"

const requestSchema = z.object({
  gestationalWeeks: z.number().int().min(1).max(42),
  bloodPressureSystolic: z.number().int().min(70).max(240),
  bloodPressureDiastolic: z.number().int().min(40).max(150),
  bleedingLevel: z.enum(["none", "spotting", "heavy"]),
  swelling: z.boolean().default(false),
  fetalMovementDrop: z.boolean().default(false),
  severeHeadache: z.boolean().default(false),
  blurredVision: z.boolean().default(false),
  priorComplications: z.boolean().default(false),
  language: z.enum(["en", "hi"]).default("en"),
  history: z
    .array(
      z.object({
        date: z.string(),
        bloodPressureSystolic: z.number().int().min(70).max(240),
        bloodPressureDiastolic: z.number().int().min(40).max(150),
        weight: z.number().min(25).max(200).optional(),
        symptomsCount: z.number().int().min(0).max(20).optional(),
      }),
    )
    .max(24)
    .optional(),
})

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req)
  try {
    const user = await requireSessionUser()
    if (!user) return failUnauthorized("Authentication required", requestId)

    const rl = await rateLimit(`maternal-risk:${user.id}:${clientIp(req)}`, 60, 60_000)
    if (!rl.allowed) return failTooManyRequests("Too many requests", undefined, requestId)

    const body = await req.json()
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return failBadRequest("Invalid payload", requestId)
    }

    const assessment = assessMaternalRisk(parsed.data)

    return okWithRequestId({ assessment }, requestId)
  } catch {
    return failInternal("Failed to assess maternal risk", requestId)
  }
}
