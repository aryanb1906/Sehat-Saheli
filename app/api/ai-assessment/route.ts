import { NextRequest } from "next/server";
import { z } from "zod";
import { requireSessionUser } from "@/lib/api-auth";
import { failBadRequest, failInternal, failTooManyRequests, failUnauthorized, okWithRequestId } from "@/lib/api-response";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getRequestId } from "@/lib/observability";
import { toLegacyRiskAssessment } from "@/lib/clinical/maternal-risk-engine";

interface SymptomCheckResult {
    symptom: string;
    severityLevel: "Mild" | "Moderate" | "Severe";
    possibleConditions: string[];
    recommendedAction: "Home Care" | "Contact ASHA" | "Visit Hospital" | "Call 108";
    homeCareTips?: string[];
    whenToSeekHelp: string[];
}

const riskAssessmentSchema = z.object({
    age: z.number().min(10).max(60).optional(),
    bmi: z.number().min(10).max(60).optional(),
    prevComplications: z.boolean().optional(),
    hasAnemia: z.boolean().optional(),
    hasGestationalDiabetes: z.boolean().optional(),
    multiplePregnancy: z.boolean().optional(),
})

const symptomCheckSchema = z.object({
    symptom: z.string().min(1),
    severity: z.string().optional(),
    frequency: z.string().optional(),
})

const requestSchema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("risk-assessment"), data: riskAssessmentSchema }),
    z.object({ type: z.literal("symptom-check"), data: symptomCheckSchema }),
])

export async function POST(req: NextRequest) {
    const requestId = getRequestId(req)
    try {
        const user = await requireSessionUser()
        if (!user) return failUnauthorized("Authentication required", requestId)

        const rl = await rateLimit(`ai-assessment:${user.id}:${clientIp(req)}`, 60, 60_000)
        if (!rl.allowed) return failTooManyRequests("Too many requests", undefined, requestId)

        const body = await req.json();
        const parsed = requestSchema.safeParse(body)
        if (!parsed.success) return failBadRequest("Invalid assessment payload", requestId)

        if (parsed.data.type === "risk-assessment") {
            return assessRisk(parsed.data.data, requestId)
        }

        return checkSymptom(parsed.data.data, requestId)
    } catch {
        return failInternal("Failed to process assessment", requestId)
    }
}

function assessRisk(data: z.infer<typeof riskAssessmentSchema>, requestId: string) {
    // Delegates to the shared maternal-risk engine (lib/clinical/maternal-risk-engine.ts)
    // so this screen and /api/maternal-risk never disagree on the same patient.
    const assessment = toLegacyRiskAssessment({
        age: data.age,
        bmi: data.bmi,
        priorComplications: data.prevComplications,
        hasAnemia: data.hasAnemia,
        hasGestationalDiabetes: data.hasGestationalDiabetes,
        multiplePregnancy: data.multiplePregnancy,
    })

    return okWithRequestId({ assessment }, requestId);
}

function checkSymptom(data: z.infer<typeof symptomCheckSchema>, requestId: string) {
    const { symptom } = data;

    const symptomDatabase: Record<string, SymptomCheckResult> = {
        severe_bleeding: {
            symptom: "Severe Vaginal Bleeding",
            severityLevel: "Severe",
            possibleConditions: ["Placental abruption", "Miscarriage", "Placenta previa"],
            recommendedAction: "Call 108",
            whenToSeekHelp: [
                "Immediately - This is a medical emergency",
                "Do not wait - Get emergency help now",
            ],
        },
        severe_pain: {
            symptom: "Severe Abdominal Pain",
            severityLevel: "Severe",
            possibleConditions: ["Ectopic pregnancy", "Labor complications", "Appendicitis"],
            recommendedAction: "Call 108",
            whenToSeekHelp: ["Immediately if pain is unbearable or sudden"],
        },
        fever: {
            symptom: "Fever",
            severityLevel: "Moderate",
            possibleConditions: ["Urinary tract infection", "Common cold", "Flu"],
            recommendedAction: "Contact ASHA",
            homeCareTips: ["Drink plenty of water", "Rest", "Take paracetamol if needed"],
            whenToSeekHelp: ["If fever persists beyond 3 days", "If accompanied by severe pain"],
        },
        swelling: {
            symptom: "Unusual Swelling",
            severityLevel: "Moderate",
            possibleConditions: ["Preeclampsia", "Normal pregnancy swelling", "Infection"],
            recommendedAction: "Contact ASHA",
            homeCareTips: ["Rest with feet elevated", "Reduce salt intake", "Drink water"],
            whenToSeekHelp: ["If swelling is sudden", "If accompanied by headache or blurred vision"],
        },
        dizziness: {
            symptom: "Dizziness or Fainting",
            severityLevel: "Moderate",
            possibleConditions: ["Low blood pressure", "Anemia", "Dehydration"],
            recommendedAction: "Contact ASHA",
            homeCareTips: ["Sit or lie down immediately", "Hydrate", "Avoid sudden movements"],
            whenToSeekHelp: ["If dizziness persists", "If accompanied by chest pain or shortness of breath"],
        },
    };

    const key = symptom.toLowerCase().replace(/\s+/g, "_")
    // Unknown symptoms must not silently default to a low-severity entry ("fever") —
    // that previously meant an unrecognized report like "severe bleeding at night"
    // (typo'd key) could be quietly downgraded. Unknowns are routed to a
    // human instead of guessed at.
    const result = symptomDatabase[key] || {
        symptom,
        severityLevel: "Moderate",
        possibleConditions: ["Not in local reference list — needs clinical review"],
        recommendedAction: "Contact ASHA",
        whenToSeekHelp: ["Describe the symptom to your ASHA worker or doctor as soon as possible"],
    };

    return okWithRequestId({ result }, requestId);
}
