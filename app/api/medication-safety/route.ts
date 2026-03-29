import { NextRequest } from "next/server"
import { z } from "zod"
import { failBadRequest, failInternal, okWithRequestId } from "@/lib/api-response"
import { getRequestId } from "@/lib/observability"

const requestSchema = z.object({
  medicationName: z.string().min(2),
  trimester: z.enum(["first", "second", "third"]).optional(),
})

const safetyDatabase: Record<string, { safety: "safe" | "caution" | "avoid"; note: string }> = {
  "folic acid": { safety: "safe", note: "Recommended in pregnancy, especially first trimester." },
  "iron supplement": { safety: "safe", note: "Commonly recommended for anemia prevention/treatment." },
  calcium: { safety: "safe", note: "Safe and beneficial for maternal bone health." },
  ibuprofen: { safety: "avoid", note: "Avoid especially in third trimester unless prescribed." },
  aspirin: { safety: "caution", note: "Use only under doctor advice and dose guidance." },
  metformin: { safety: "caution", note: "Can be used in specific cases under clinician supervision." },
}

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req)
  try {
    const body = await req.json()
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return failBadRequest("Invalid payload", requestId)
    }

    const normalized = parsed.data.medicationName.trim().toLowerCase()
    const result = safetyDatabase[normalized] || {
      safety: "caution" as const,
      note: "Medication not found in local guide. Consult doctor/ASHA before use.",
    }

    return okWithRequestId({
      medicationName: parsed.data.medicationName,
      trimester: parsed.data.trimester || "not-specified",
      ...result,
    }, requestId)
  } catch {
    return failInternal("Failed to check medication safety", requestId)
  }
}
