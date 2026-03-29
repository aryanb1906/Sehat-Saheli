import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { hasRole, requireSessionUser } from "@/lib/api-auth";
import { failBadRequest, failForbidden, failInternal, failTooManyRequests, failUnauthorized, okWithRequestId } from "@/lib/api-response";
import { getRequestId } from "@/lib/observability";

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
    const requestId = getRequestId(req)
    try {
        const user = await requireSessionUser()
        if (!user) return failUnauthorized("Authentication required", requestId)

        const rl = await rateLimit(`lab-reports-get:${user.id}:${clientIp(req)}`, 100, 60_000)
        if (!rl.allowed) {
            return failTooManyRequests("Too many requests", undefined, requestId)
        }

        const { searchParams } = new URL(req.url);
        const requestedPatientId = searchParams.get("userId") || searchParams.get("patientId");
        const reportType = searchParams.get("type"); // 'blood', 'ultrasound', 'urine'

        if (user.role === "MOTHER" && requestedPatientId && requestedPatientId !== user.id) {
            return failForbidden("Cannot access another patient's reports", requestId)
        }

        const patientId = user.role === "MOTHER" ? user.id : requestedPatientId
        if (!patientId && !hasRole(user.role, ["ASHA", "DOCTOR"])) {
            return failForbidden("Not allowed to access this resource", requestId)
        }

        const where = {
            ...(patientId ? { patientId } : {}),
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

        return okWithRequestId({
            reports,
            totalReports: reports.length,
        }, requestId);
    } catch (error) {
        return failInternal("Failed to fetch lab reports", requestId)
    }
}

export async function POST(req: NextRequest) {
    const requestId = getRequestId(req)
    try {
        const user = await requireSessionUser()
        if (!user) return failUnauthorized("Authentication required", requestId)
        if (!hasRole(user.role, ["MOTHER", "ASHA", "DOCTOR"])) return failForbidden("Not allowed to access this resource", requestId)

        const rl = await rateLimit(`lab-reports-post:${user.id}:${clientIp(req)}`, 40, 60_000)
        if (!rl.allowed) {
            return failTooManyRequests("Too many uploads", undefined, requestId)
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
            return failBadRequest("Invalid payload", requestId)
        }

        const { patientId, testType, results, date, imageUrl, doctorNotes } = parsed.data;

        if (user.role === "MOTHER" && patientId !== user.id) {
            return failForbidden("Cannot upload report for another patient", requestId)
        }

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

        return okWithRequestId({
            message: "Lab report uploaded successfully",
            report: newReport,
        }, requestId);
    } catch (error) {
        return failInternal("Failed to upload lab report", requestId)
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
