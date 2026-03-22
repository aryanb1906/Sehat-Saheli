import { NextRequest, NextResponse } from "next/server";

interface RiskAssessment {
    riskScore: number; // 0-100
    riskLevel: "Low" | "Medium" | "High";
    factors: string[];
    recommendations: string[];
    nextCheckupDate: string;
    monitoringFrequency: string;
}

interface SymptomCheckResult {
    symptom: string;
    severityLevel: "Mild" | "Moderate" | "Severe";
    possibleConditions: string[];
    recommendedAction: "Home Care" | "Contact ASHA" | "Visit Hospital" | "Call 108";
    homeCareTips?: string[];
    whenToSeekHelp: string[];
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { type, data } = body;

        if (type === "risk-assessment") {
            return assessRisk(data);
        } else if (type === "symptom-check") {
            return checkSymptom(data);
        }

        return NextResponse.json(
            { error: "Invalid assessment type" },
            { status: 400 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to process assessment" },
            { status: 500 }
        );
    }
}

function assessRisk(data: any): Response {
    const {
        age,
        bmi,
        prevComplications,
        hasAnemia,
        hasGestationalDiabetes,
        multiplePregnancy,
    } = data;

    let riskScore = 0;
    const factors: string[] = [];
    const recommendations: string[] = [];

    // Age risk
    if (age < 18 || age > 35) {
        riskScore += 15;
        factors.push(`Age ${age} carries higher maternal risk`);
    }

    // BMI risk
    if (bmi < 18.5 || bmi > 30) {
        riskScore += 10;
        factors.push(`BMI ${bmi} is outside healthy range`);
    }

    // Previous complications
    if (prevComplications) {
        riskScore += 20;
        factors.push("Previous pregnancy complications detected");
    }

    // Anemia
    if (hasAnemia) {
        riskScore += 15;
        factors.push("Anemia detected - requires close monitoring");
        recommendations.push("Take iron supplements daily");
    }

    // Gestational diabetes
    if (hasGestationalDiabetes) {
        riskScore += 25;
        factors.push("Gestational diabetes detected");
        recommendations.push("Follow strict diet and glucose monitoring");
    }

    // Multiple pregnancy
    if (multiplePregnancy) {
        riskScore += 20;
        factors.push("Multiple pregnancy - higher risk");
    }

    const riskLevel =
        riskScore >= 50 ? "High" : riskScore >= 25 ? "Medium" : "Low";

    recommendations.push("Attend all ANC appointments");
    recommendations.push("Maintain balanced nutrition");
    recommendations.push("Report any warning signs immediately");

    const assessment: RiskAssessment = {
        riskScore: Math.min(riskScore, 100),
        riskLevel,
        factors,
        recommendations,
        nextCheckupDate: calculateNextCheckup(riskLevel),
        monitoringFrequency: getMonitoringFrequency(riskLevel),
    };

    return NextResponse.json({
        success: true,
        assessment,
    });
}

function checkSymptom(data: any): Response {
    const { symptom, severity, frequency } = data;

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

    const result =
        symptomDatabase[symptom.toLowerCase().replace(/\s+/g, "_")] ||
        symptomDatabase["fever"];

    return NextResponse.json({
        success: true,
        result,
    });
}

function calculateNextCheckup(riskLevel: string): string {
    const today = new Date();
    const days = riskLevel === "High" ? 7 : riskLevel === "Medium" ? 14 : 28;
    const nextDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    return nextDate.toISOString().split("T")[0];
}

function getMonitoringFrequency(riskLevel: string): string {
    switch (riskLevel) {
        case "High":
            return "Weekly monitoring required";
        case "Medium":
            return "Bi-weekly monitoring required";
        default:
            return "Monthly monitoring";
    }
}
