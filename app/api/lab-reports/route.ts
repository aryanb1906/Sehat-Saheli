import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";

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
        const rl = rateLimit(`lab-reports-get:${clientIp(req)}`, 100, 60_000)
        if (!rl.allowed) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 })
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId") || searchParams.get("patientId");
        const reportType = searchParams.get("type"); // 'blood', 'ultrasound', 'urine'

        const where = {
            ...(userId ? { patientId: userId } : {}),
            ...(reportType ? { testType: reportType } : {}),
        }

        const dbReports = await prisma.labReport.findMany({ where, orderBy: { date: "desc" } })

        const reports: LabReport[] = dbReports.map((report) => ({
            id: report.id,
            date: report.date,
            testType: report.testType,
            results: (report.results as Record<string, string | number>) || {},
            status:
                report.status === "CRITICAL"
                    ? "critical"
                    : report.status === "ALERT"
                        ? "alert"
                        : "normal",
            imageUrl: report.imageUrl || undefined,
            doctorNotes: report.doctorNotes || undefined,
        }));

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
        const rl = rateLimit(`lab-reports-post:${clientIp(req)}`, 40, 60_000)
        if (!rl.allowed) {
            return NextResponse.json({ error: "Too many uploads" }, { status: 429 })
        }

        const body = await req.json();
        const parsed = z
            .object({
                patientId: z.string().min(1),
                testType: z.string().min(2),
                results: z.record(z.union([z.string(), z.number()])),
                date: z.string().optional(),
                imageUrl: z.string().optional(),
                doctorNotes: z.string().optional(),
            })
            .safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
        }

        const { patientId, testType, results, date, imageUrl, doctorNotes } = parsed.data;

        const status = analyzeResults(results, testType)

        const created = await prisma.labReport.create({
            data: {
                patientId,
                testType,
                date: date || new Date().toISOString().split("T")[0],
                results,
                status: status === "critical" ? "CRITICAL" : status === "alert" ? "ALERT" : "NORMAL",
                imageUrl,
                doctorNotes,
            },
        })

        const newReport: LabReport = {
            id: created.id,
            date: created.date,
            testType: created.testType,
            results: created.results as Record<string, string | number>,
            status,
            imageUrl: created.imageUrl || undefined,
            doctorNotes: created.doctorNotes || undefined,
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
