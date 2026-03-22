import { NextRequest, NextResponse } from "next/server";

interface HealthMetrics {
    timestamp: string;
    hemoglobin: number;
    bloodPressure: string;
    weight: number;
    pregnancyWeek: number;
    riskScore: number;
}

interface GovernmentDashboardData {
    state: string;
    mmrTrend: { year: number; mmr: number }[];
    vaccinationCoverage: number;
    ancAttendance: number;
    malnutritionRate: number;
    infantMortalityRate: number;
    institutionalDeliveries: number;
}

interface EngagementMetrics {
    totalUsers: number;
    activeUsers: number;
    featureUsageStats: Record<string, number>;
    retentionRate: number;
    churnRate: number;
    userSatisfactionScore: number;
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type"); // "government", "engagement", "user-health", "asha-performance"
        const period = searchParams.get("period"); // "weekly", "monthly", "yearly"

        if (type === "government") {
            return getGovernmentData();
        } else if (type === "engagement") {
            return getEngagementMetrics();
        } else if (type === "user-health") {
            return getUserHealthMetrics();
        } else if (type === "asha-performance") {
            return getASHAPerformance();
        }

        return NextResponse.json(
            { error: "Invalid dashboard type" },
            { status: 400 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch analytics data" },
            { status: 500 }
        );
    }
}

function getGovernmentData(): Response {
    const governmentData: GovernmentDashboardData = {
        state: "All India",
        mmrTrend: [
            { year: 2020, mmr: 103 },
            { year: 2021, mmr: 98 },
            { year: 2022, mmr: 92 },
            { year: 2023, mmr: 87 },
            { year: 2024, mmr: 81 },
        ],
        vaccinationCoverage: 87,
        ancAttendance: 92,
        malnutritionRate: 18.5,
        infantMortalityRate: 32,
        institutionalDeliveries: 94,
    };

    const districtBreakdown = [
        {
            district: "District A",
            mmr: 65,
            vaccinationCoverage: 89,
            ancAttendance: 94,
        },
        {
            district: "District B",
            mmr: 78,
            vaccinationCoverage: 85,
            ancAttendance: 90,
        },
        {
            district: "District C",
            mmr: 92,
            vaccinationCoverage: 82,
            ancAttendance: 88,
        },
    ];

    return NextResponse.json({
        success: true,
        data: governmentData,
        districtBreakdown,
    });
}

function getEngagementMetrics(): Response {
    const metrics: EngagementMetrics = {
        totalUsers: 15840,
        activeUsers: 8923,
        featureUsageStats: {
            kalChecker: 2340,
            "nutrition-planner": 1895,
            "vital-signs-log": 3456,
            "mental-health": 1267,
            "sos-emergency": 89,
            "video-consultation": 567,
            "ai-assessment": 4234,
            community: 1893,
        },
        retentionRate: 78.5,
        churnRate: 4.2,
        userSatisfactionScore: 4.6,
    };

    const topFeatures = [
        { feature: "Pregnancy Tracker", percentage: 89 },
        { feature: "AI Health Assistant", percentage: 87 },
        { feature: "Vital Signs Log", percentage: 76 },
        { feature: "Nutrition Planner", percentage: 68 },
        { feature: "Mental Health", percentage: 52 },
    ];

    return NextResponse.json({
        success: true,
        metrics,
        topFeatures,
    });
}

function getUserHealthMetrics(): Response {
    const healthTrends: HealthMetrics[] = [
        {
            timestamp: "2024-03-01",
            hemoglobin: 10.5,
            bloodPressure: "110/70",
            weight: 62,
            pregnancyWeek: 24,
            riskScore: 15,
        },
        {
            timestamp: "2024-03-08",
            hemoglobin: 10.8,
            bloodPressure: "112/72",
            weight: 63,
            pregnancyWeek: 25,
            riskScore: 12,
        },
        {
            timestamp: "2024-03-15",
            hemoglobin: 11.1,
            bloodPressure: "113/71",
            weight: 64,
            pregnancyWeek: 26,
            riskScore: 10,
        },
        {
            timestamp: "2024-03-22",
            hemoglobin: 11.3,
            bloodPressure: "114/72",
            weight: 65,
            pregnancyWeek: 27,
            riskScore: 8,
        },
    ];

    return NextResponse.json({
        success: true,
        healthTrends,
        avgHemoglobin: 10.93,
        avgRiskScore: 11.25,
    });
}

function getASHAPerformance(): Response {
    const ashaMetrics = [
        {
            ashaId: "asha_001",
            ashaName: "Smita Devi",
            patientsManaged: 45,
            tasksCompleted: 187,
            taskCompletionRate: 94,
            highRiskIdentifications: 12,
            vaccinations: 156,
            ancVisits: 198,
            averageRating: 4.7,
        },
        {
            ashaId: "asha_002",
            ashaName: "Kavya Sharma",
            patientsManaged: 38,
            tasksCompleted: 162,
            taskCompletionRate: 88,
            highRiskIdentifications: 8,
            vaccinations: 134,
            ancVisits: 167,
            averageRating: 4.5,
        },
        {
            ashaId: "asha_003",
            ashaName: "Priyanka Singh",
            patientsManaged: 42,
            tasksCompleted: 171,
            taskCompletionRate: 91,
            highRiskIdentifications: 10,
            vaccinations: 145,
            ancVisits: 182,
            averageRating: 4.6,
        },
    ];

    return NextResponse.json({
        success: true,
        ashaMetrics,
        averageTaskCompletionRate: 91,
    });
}
