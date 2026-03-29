import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import type { VideoConsultation as PrismaVideoConsultation } from "@prisma/client";
import { failBadRequest, failInternal, failTooManyRequests, okWithRequestId } from "@/lib/api-response";
import { getRequestId } from "@/lib/observability";

interface VideoConsultation {
    id: string;
    doctorName: string;
    specialization: string;
    date: string;
    time: string;
    duration: number;
    status: "scheduled" | "completed" | "cancelled";
    roomId?: string;
    notes?: string;
    rating?: number;
}

export async function GET(req: NextRequest) {
    const requestId = getRequestId(req)
    try {
        const ip = clientIp(req)
        const rl = await rateLimit(`video-consultation-get:${ip}`, 90, 60_000)
        if (!rl.allowed) {
            return failTooManyRequests("Too many requests", undefined, requestId)
        }

        const consultations: VideoConsultation[] = [
            {
                id: "vc_001",
                doctorName: "Dr. Rajesh Kumar",
                specialization: "Obstetrics & Gynecology",
                date: "2024-03-25",
                time: "10:00 AM",
                duration: 30,
                status: "scheduled",
                roomId: "sehat-saheli-vc-001",
            },
            {
                id: "vc_002",
                doctorName: "Dr. Priya Singh",
                specialization: "Maternal Health",
                date: "2024-03-10",
                time: "2:00 PM",
                duration: 25,
                status: "completed",
                notes: "Everything progressing well. See in 2 weeks.",
                rating: 5,
            },
        ];

        const { searchParams } = new URL(req.url);
        const patientId = z.string().min(1).safeParse(searchParams.get("patientId") || "demo-mother").data || "demo-mother";

        const dbConsultations = await prisma.videoConsultation.findMany({
            where: { patientId },
            orderBy: { createdAt: "desc" },
        });

        if (dbConsultations.length === 0) {
            return okWithRequestId({
                consultations,
                totalConsultations: consultations.length,
            }, requestId);
        }

        const mapped: VideoConsultation[] = dbConsultations.map((row: PrismaVideoConsultation) => ({
            id: row.id,
            doctorName: row.doctorName,
            specialization: row.specialization,
            date: row.date,
            time: row.time,
            duration: row.duration,
            status: row.status.toLowerCase() as VideoConsultation["status"],
            roomId: row.roomId ?? undefined,
            notes: row.notes ?? undefined,
            rating: row.rating ?? undefined,
        }));

        return okWithRequestId({
            consultations: mapped,
            totalConsultations: mapped.length,
        }, requestId);
    } catch (error) {
        return failInternal("Failed to fetch consultations", requestId);
    }
}

export async function POST(req: NextRequest) {
    const requestId = getRequestId(req)
    try {
        const ip = clientIp(req)
        const rl = await rateLimit(`video-consultation-post:${ip}`, 30, 60_000)
        if (!rl.allowed) {
            return failTooManyRequests("Too many booking attempts", undefined, requestId)
        }

        const body = await req.json();
        const parsed = z
            .object({
                patientId: z.string().optional(),
                doctorId: z.string().optional(),
                doctorName: z.string().optional(),
                specialty: z.string().optional(),
                date: z.string().optional(),
                time: z.string().optional(),
                reason: z.string().optional(),
                data: z
                    .object({
                        specialty: z.string(),
                        date: z.string(),
                        time: z.string(),
                        reason: z.string().optional(),
                    })
                    .optional(),
            })
            .refine((val) => {
                const hasNested = !!val.data
                const hasFlat = !!val.date && !!val.time
                return hasNested || hasFlat
            }, "date/time or data payload required")
            .safeParse(body);

        if (!parsed.success) {
            return failBadRequest("Invalid payload", requestId);
        }

        const payload = parsed.data.data
            ? {
                specialty: parsed.data.data.specialty,
                date: parsed.data.data.date,
                time: parsed.data.data.time,
                reason: parsed.data.data.reason,
            }
            : {
                specialty: parsed.data.specialty || "General Checkup",
                date: parsed.data.date,
                time: parsed.data.time,
                reason: parsed.data.reason,
            };

        if (!payload.date || !payload.time) {
            return failBadRequest("date/time required", requestId)
        }

        const patientId = parsed.data.patientId || "demo-mother";
        const doctorId = parsed.data.doctorId;
        const doctorName = parsed.data.doctorName || "Dr. Available";

        const created = await prisma.videoConsultation.create({
            data: {
                patientId,
                doctorId,
                doctorName,
                specialization: payload.specialty,
                date: payload.date,
                time: payload.time,
                reason: payload.reason,
                roomId: `sehat-saheli-vc-${Date.now()}`,
            },
        });

        const newConsultation: VideoConsultation = {
            id: created.id,
            doctorName: created.doctorName,
            specialization: created.specialization,
            date: created.date,
            time: created.time,
            duration: 30,
            status: "scheduled",
            roomId: created.roomId || undefined,
        };

        return okWithRequestId({
            message: "Consultation scheduled successfully",
            consultation: newConsultation,
        }, requestId);
    } catch (error) {
        return failInternal("Failed to schedule consultation", requestId);
    }
}

export async function PUT(req: NextRequest) {
    const requestId = getRequestId(req)
    try {
        const ip = clientIp(req)
        const rl = await rateLimit(`video-consultation-put:${ip}`, 30, 60_000)
        if (!rl.allowed) {
            return failTooManyRequests("Too many update attempts", undefined, requestId)
        }

        const body = await req.json();
        const parsed = z.object({
            consultationId: z.string().min(1),
            rating: z.number().int().min(1).max(5).optional(),
            notes: z.string().max(2000).optional(),
        }).safeParse(body)

        if (!parsed.success) {
            return failBadRequest("Invalid payload", requestId)
        }

        const { consultationId, rating, notes } = parsed.data;

        await prisma.videoConsultation.update({
            where: { id: consultationId },
            data: {
                rating: typeof rating === "number" ? rating : undefined,
                notes,
                status: "COMPLETED",
            },
        });

        return okWithRequestId({
            message: "Consultation updated successfully",
            consultation: { id: consultationId, rating, notes },
        }, requestId);
    } catch (error) {
        return failInternal("Failed to update consultation", requestId);
    }
}
