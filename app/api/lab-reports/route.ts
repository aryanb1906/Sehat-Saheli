import { NextRequest, NextResponse } from "next/server";

interface LabReport {
    id: string;
    date: string;
    testType: string;
    results: Record<string, string | number>;
    status: "normal" | "alert" | "critical";
    imageUrl?: string;
    doctorNotes?: string;
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const reportType = searchParams.get("type"); // 'blood', 'ultrasound', 'urine'

        // Mock data - in production, fetch from database
        const reports: LabReport[] = [
            {
                id: "report_001",
                date: "2024-03-15",
                testType: "blood",
                results: {
                    hemoglobin: "11.5 g/dL",
                    wbc: "6.5 K/uL",
                    platelets: "245 K/uL",
                    glucose: "95 mg/dL",
                },
                status: "normal",
                doctorNotes: "All values within normal range. Continue iron supplements.",
            },
            {
                id: "report_002",
                date: "2024-02-20",
                testType: "ultrasound",
                results: {
                    babyHeartRate: "145 bpm",
                    amniotic: "8 cm",
                    placentaPosition: "Anterior",
                    fetalMovement: "Active",
                },
                status: "normal",
                imageUrl: "/ultrasound-sample.jpg",
                doctorNotes: "Healthy pregnancy progression. Baby developing normally.",
            },
        ];

        return NextResponse.json({
            success: true,
            reports,
            totalReports: reports.length,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch lab reports" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { testType, results, date, imageFile } = body;

        const newReport: LabReport = {
            id: `report_${Date.now()}`,
            date: date || new Date().toISOString().split("T")[0],
            testType,
            results,
            status: analyzeResults(results, testType),
        };

        return NextResponse.json({
            success: true,
            message: "Lab report uploaded successfully",
            report: newReport,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to upload lab report" },
            { status: 500 }
        );
    }
}

function analyzeResults(
    results: Record<string, string | number>,
    testType: string
): "normal" | "alert" | "critical" {
    // Simple analysis logic - in production, use ML model
    if (testType === "blood") {
        const hb = parseFloat(String(results.hemoglobin || 0));
        if (hb < 7) return "critical";
        if (hb < 9.5) return "alert";
    }
    return "normal";
}
