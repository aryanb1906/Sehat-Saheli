/**
 * Single source of truth for maternal-risk triage scoring.
 *
 * This module replaces two previously separate, contradictory scoring
 * implementations that used to live in app/api/ai-assessment/route.ts and
 * app/api/maternal-risk/route.ts. Both routes now call `assessMaternalRisk`
 * so a patient gets the same tier regardless of which screen produced it.
 *
 * NOTE: this rubric still needs sign-off from a clinician (ASHA supervisor /
 * ANM) before being relied on for real triage decisions — see the
 * remediation brief, Phase 3. Weights below are a best-effort merge of the
 * two prior implementations, not a validated clinical scoring system.
 */

export type RiskTier = "low" | "medium" | "high" | "emergency"
export type BleedingLevel = "none" | "spotting" | "heavy"
export type Language = "en" | "hi"

export interface TrendPoint {
    date: string
    bloodPressureSystolic: number
    bloodPressureDiastolic: number
    weight?: number
    symptomsCount?: number
}

export interface MaternalRiskInput {
    // Demographic / obstetric history factors
    age?: number
    bmi?: number
    priorComplications?: boolean
    hasAnemia?: boolean
    hasGestationalDiabetes?: boolean
    multiplePregnancy?: boolean

    // Acute vitals / danger signs
    gestationalWeeks?: number
    bloodPressureSystolic?: number
    bloodPressureDiastolic?: number
    bleedingLevel?: BleedingLevel
    swelling?: boolean
    fetalMovementDrop?: boolean
    severeHeadache?: boolean
    blurredVision?: boolean

    language?: Language
    history?: TrendPoint[]
}

export interface MaternalRiskResult {
    tier: RiskTier
    score: number
    reasons: string[]
    followUpWindow: string
    actionsNow: string[]
    explainability: {
        weightedFactors: Record<string, unknown>
        trendSummary: string
    }
}

// Clinical BP cutoffs — kept in one place so both routes agree.
export const BP_ELEVATED = { systolic: 140, diastolic: 90 }
export const BP_SEVERE = { systolic: 160, diastolic: 110 }

function computeTrendScore(history: TrendPoint[]) {
    if (history.length < 2) {
        return { deltaScore: 0, summary: "Insufficient trend history", signals: [] as string[] }
    }

    const first = history[0]
    const last = history[history.length - 1]
    const signals: string[] = []
    let deltaScore = 0

    const sysRise = last.bloodPressureSystolic - first.bloodPressureSystolic
    const diaRise = last.bloodPressureDiastolic - first.bloodPressureDiastolic
    if (sysRise >= 15 || diaRise >= 10) {
        deltaScore += 12
        signals.push("Blood pressure trend is rising")
    }

    if (typeof first.weight === "number" && typeof last.weight === "number") {
        const weightDelta = last.weight - first.weight
        if (weightDelta > 4) {
            deltaScore += 6
            signals.push("Rapid weight gain pattern")
        }
    }

    const firstSymptoms = first.symptomsCount || 0
    const lastSymptoms = last.symptomsCount || 0
    if (lastSymptoms - firstSymptoms >= 3) {
        deltaScore += 8
        signals.push("Symptom burden increasing")
    }

    return {
        deltaScore,
        summary: signals.length > 0 ? signals.join("; ") : "No concerning trend detected",
        signals,
    }
}

function buildActions(tier: RiskTier, language: Language) {
    if (language === "hi") {
        if (tier === "emergency") {
            return [
                "तुरंत 108 या 112 पर कॉल करें",
                "ASHA कार्यकर्ता और परिवार को अभी सूचित करें",
                "अगले 15 मिनट में नजदीकी अस्पताल जाएं",
            ]
        }
        if (tier === "high") {
            return [
                "2 घंटे के भीतर डॉक्टर या ASHA से संपर्क करें",
                "बीपी और मूवमेंट दोबारा चेक करें",
                "अगली 24 घंटे में क्लिनिक विजिट तय करें",
            ]
        }
        if (tier === "medium") {
            return [
                "आज ही ASHA को अपडेट भेजें",
                "आराम करें, पानी पिएं, और लक्षण नोट करें",
                "48 घंटे में फॉलो-अप चेकअप करें",
            ]
        }
        return [
            "रूटीन ANC जारी रखें",
            "दैनिक लक्षण और किक काउंट रिकॉर्ड करें",
            "समस्या बढ़ने पर तुरंत रिपोर्ट करें",
        ]
    }

    if (tier === "emergency") {
        return [
            "Call 108 or 112 immediately",
            "Alert ASHA worker and family right now",
            "Reach the nearest hospital within 15 minutes",
        ]
    }
    if (tier === "high") {
        return [
            "Contact doctor or ASHA within 2 hours",
            "Re-check blood pressure and fetal movement",
            "Schedule clinic visit within 24 hours",
        ]
    }
    if (tier === "medium") {
        return [
            "Send same-day update to ASHA worker",
            "Rest, hydrate, and monitor symptoms",
            "Do a follow-up check within 48 hours",
        ]
    }
    return [
        "Continue routine ANC schedule",
        "Track daily symptoms and kick counts",
        "Report any worsening signs immediately",
    ]
}

export function assessMaternalRisk(input: MaternalRiskInput): MaternalRiskResult {
    const language = input.language || "en"
    let score = 0
    const reasons: string[] = []

    // --- Acute vitals / danger signs (weighted highest — these can kill in hours) ---
    if (input.bleedingLevel === "heavy") {
        score += 45
        reasons.push("Heavy bleeding reported")
    } else if (input.bleedingLevel === "spotting") {
        score += 18
        reasons.push("Spotting observed")
    }

    const systolic = input.bloodPressureSystolic
    const diastolic = input.bloodPressureDiastolic
    if (typeof systolic === "number" && typeof diastolic === "number") {
        if (systolic >= BP_SEVERE.systolic || diastolic >= BP_SEVERE.diastolic) {
            score += 35
            reasons.push("Severely elevated blood pressure")
        } else if (systolic >= BP_ELEVATED.systolic || diastolic >= BP_ELEVATED.diastolic) {
            score += 20
            reasons.push("Elevated blood pressure")
        }
    }

    if (input.fetalMovementDrop) {
        score += 30
        reasons.push("Reduced fetal movement")
    }
    if (input.swelling) {
        score += 12
        reasons.push("Swelling present")
    }
    if (input.severeHeadache) {
        score += 14
        reasons.push("Severe headache present")
    }
    if (input.blurredVision) {
        score += 16
        reasons.push("Blurred vision reported")
    }
    if (
        typeof input.gestationalWeeks === "number" &&
        input.gestationalWeeks >= 37 &&
        input.bleedingLevel &&
        input.bleedingLevel !== "none"
    ) {
        score += 10
        reasons.push("Late-term bleeding requires urgent attention")
    }

    // --- Demographic / obstetric history factors (lower weight, chronic risk) ---
    if (input.priorComplications) {
        score += 15
        reasons.push("History of prior complications")
    }
    if (typeof input.age === "number" && (input.age < 18 || input.age > 35)) {
        score += 10
        reasons.push(`Age ${input.age} carries higher maternal risk`)
    }
    if (typeof input.bmi === "number" && (input.bmi < 18.5 || input.bmi > 30)) {
        score += 8
        reasons.push(`BMI ${input.bmi} is outside healthy range`)
    }
    if (input.hasAnemia) {
        score += 10
        reasons.push("Anemia detected — requires close monitoring")
    }
    if (input.hasGestationalDiabetes) {
        score += 15
        reasons.push("Gestational diabetes detected")
    }
    if (input.multiplePregnancy) {
        score += 12
        reasons.push("Multiple pregnancy — higher risk")
    }

    const trend = computeTrendScore(input.history || [])
    score += trend.deltaScore
    reasons.push(...trend.signals)

    // Hard emergency overrides — these bypass the point total entirely.
    // A patient must never be scored "medium" while actively bleeding heavily
    // or in severe hypertensive crisis just because other factors were absent.
    const emergencyTriggers =
        input.bleedingLevel === "heavy" ||
        (typeof systolic === "number" && systolic >= BP_SEVERE.systolic) ||
        (typeof diastolic === "number" && diastolic >= BP_SEVERE.diastolic) ||
        (input.fetalMovementDrop && (input.gestationalWeeks ?? 28) >= 28)

    const tier: RiskTier = emergencyTriggers
        ? "emergency"
        : score >= 55
            ? "high"
            : score >= 30
                ? "medium"
                : "low"

    const followUpWindow =
        tier === "emergency"
            ? "Immediate"
            : tier === "high"
                ? "Within 24 hours"
                : tier === "medium"
                    ? "Within 48 hours"
                    : "Routine schedule"

    return {
        tier,
        score: Math.min(score, 100),
        reasons,
        followUpWindow,
        actionsNow: buildActions(tier, language),
        explainability: {
            weightedFactors: {
                bleedingLevel: input.bleedingLevel ?? "not-reported",
                bloodPressure:
                    typeof systolic === "number" && typeof diastolic === "number"
                        ? `${systolic}/${diastolic}`
                        : "not-reported",
                fetalMovementDrop: Boolean(input.fetalMovementDrop),
                severeHeadache: Boolean(input.severeHeadache),
                blurredVision: Boolean(input.blurredVision),
                priorComplications: Boolean(input.priorComplications),
                age: input.age,
                bmi: input.bmi,
                hasAnemia: Boolean(input.hasAnemia),
                hasGestationalDiabetes: Boolean(input.hasGestationalDiabetes),
                multiplePregnancy: Boolean(input.multiplePregnancy),
                trendDeltaScore: trend.deltaScore,
            },
            trendSummary: trend.summary,
        },
    }
}

function calculateNextCheckup(tier: RiskTier): string {
    const today = new Date()
    const days = tier === "emergency" || tier === "high" ? 7 : tier === "medium" ? 14 : 28
    const nextDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000)
    return nextDate.toISOString().split("T")[0]
}

function monitoringFrequency(tier: RiskTier): string {
    if (tier === "emergency" || tier === "high") return "Weekly monitoring required"
    if (tier === "medium") return "Bi-weekly monitoring required"
    return "Monthly monitoring"
}

/**
 * Adapts the unified engine's output to the legacy "Low/Medium/High" shape
 * consumed by the pregnancy-risk-assessment screen (app/api/ai-assessment).
 * "emergency" collapses into "High" here since that screen has no separate
 * emergency UI state — the raw tier is still available via `rawTier`.
 */
export function toLegacyRiskAssessment(input: MaternalRiskInput) {
    const result = assessMaternalRisk(input)
    const riskLevel = result.tier === "low" ? "Low" : result.tier === "medium" ? "Medium" : "High"

    return {
        riskScore: result.score,
        riskLevel: riskLevel as "Low" | "Medium" | "High",
        rawTier: result.tier,
        factors: result.reasons,
        recommendations: [...result.actionsNow, "Attend all ANC appointments", "Maintain balanced nutrition"],
        nextCheckupDate: calculateNextCheckup(result.tier),
        monitoringFrequency: monitoringFrequency(result.tier),
    }
}
