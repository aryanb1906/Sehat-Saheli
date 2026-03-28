import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

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

type Tier = "low" | "medium" | "high" | "emergency"

function computeTrendScore(history: Array<{
  bloodPressureSystolic: number
  bloodPressureDiastolic: number
  weight?: number
  symptomsCount?: number
}>) {
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

function buildActions(tier: Tier, language: "en" | "hi") {
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 })
    }

    const {
      gestationalWeeks,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      bleedingLevel,
      swelling,
      fetalMovementDrop,
      severeHeadache,
      blurredVision,
      priorComplications,
      language,
      history,
    } = parsed.data

    let score = 0
    const reasons: string[] = []

    if (bleedingLevel === "heavy") {
      score += 45
      reasons.push("Heavy bleeding reported")
    } else if (bleedingLevel === "spotting") {
      score += 18
      reasons.push("Spotting observed")
    }

    if (bloodPressureSystolic >= 160 || bloodPressureDiastolic >= 110) {
      score += 35
      reasons.push("Severely elevated blood pressure")
    } else if (bloodPressureSystolic >= 140 || bloodPressureDiastolic >= 90) {
      score += 20
      reasons.push("Elevated blood pressure")
    }

    if (fetalMovementDrop) {
      score += 30
      reasons.push("Reduced fetal movement")
    }
    if (swelling) {
      score += 12
      reasons.push("Swelling present")
    }
    if (severeHeadache) {
      score += 14
      reasons.push("Severe headache present")
    }
    if (blurredVision) {
      score += 16
      reasons.push("Blurred vision reported")
    }
    if (priorComplications) {
      score += 15
      reasons.push("History of prior complications")
    }
    if (gestationalWeeks >= 37 && bleedingLevel !== "none") {
      score += 10
      reasons.push("Late-term bleeding requires urgent attention")
    }

    const trend = computeTrendScore(history || [])
    score += trend.deltaScore
    reasons.push(...trend.signals)

    const emergencyTriggers =
      bleedingLevel === "heavy" ||
      bloodPressureSystolic >= 160 ||
      bloodPressureDiastolic >= 110 ||
      (fetalMovementDrop && gestationalWeeks >= 28)

    const tier: Tier = emergencyTriggers ? "emergency" : score >= 55 ? "high" : score >= 30 ? "medium" : "low"

    const followUpWindow =
      tier === "emergency"
        ? "Immediate"
        : tier === "high"
          ? "Within 24 hours"
          : tier === "medium"
            ? "Within 48 hours"
            : "Routine schedule"

    return NextResponse.json({
      success: true,
      assessment: {
        tier,
        score: Math.min(score, 100),
        reasons,
        explainability: {
          weightedFactors: {
            bleedingLevel,
            bloodPressure: `${bloodPressureSystolic}/${bloodPressureDiastolic}`,
            fetalMovementDrop,
            severeHeadache,
            blurredVision,
            priorComplications,
            trendDeltaScore: trend.deltaScore,
          },
          trendSummary: trend.summary,
        },
        actionsNow: buildActions(tier, language),
        followUpWindow,
      },
    })
  } catch {
    return NextResponse.json({ error: "Failed to assess maternal risk" }, { status: 500 })
  }
}
