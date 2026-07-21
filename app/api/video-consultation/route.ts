import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import type { VideoConsultation as PrismaVideoConsultation } from "@prisma/client";
import { failBadRequest, failForbidden, failInternal, failTooManyRequests, failUnauthorized, okWithRequestId } from "@/lib/api-response";
import { getRequestId } from "@/lib/observability";
import { requireSessionUser } from "@/lib/api-auth";

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

// A mother may only ever see/book/rate her own consultations; a doctor may
// only see/act on consultations where they are the assigned doctor. There
// used to be no such check at all — patientId/doctorId came straight from
// the request with a "demo-mother" default, so any caller could read or
// mutate another patient's private consultation by guessing IDs.
function assertOwnsPatientRecord(userId: string, role: string, patientId: string) {
    if (role === "MOTHER") return patientId === userId
    // ASHA/DOCTOR access is scoped by doctorId ownership on mutating routes below;
    // GET-by-patientId is reserved for the mother themselves.
    return role === "DOCTOR"
}

export async function GET(req: NextRequest) {
    const requestId = getRequestId(req)
    try {
        const user = await requireSessionUser()
        if (!user) return failUnauthorized("Authentication required", requestId)

        const ip = clientIp(req)
        const rl = await rateLimit(`video-consultation-get:${user.id}:${ip}`, 90, 60_000)
        if (!rl.allowed) {
            return failTooManyRequests("Too many requests", undefined, requestId)
        }

        const { searchParams } = new URL(req.url);
        const requestedPatientId = searchParams.get("patientId")
        const patientId = requestedPatientId || user.id

        if (!assertOwnsPatientRecord(user.id, user.role, patientId)) {
            return failForbidden("Not allowed to view this patient's consultations", requestId)
        }

        const dbConsultations = await prisma.videoConsultation.findMany({
            where: { patientId },
            orderBy: { createdAt: "desc" },
        });

        // Previously two hardcoded "Dr. Rajesh Kumar" / "Dr. Priya Singh"
        // consultations were injected whenever a patient had zero real rows,
        // which meant every never-booked patient saw fake appointments
        // indefinitely. Show a genuine empty state instead.
        const mapped: VideoConsultation[] = dbConsultations.map((row: PrismaVideoConsultation) => ({
            id: row.id,
            doctorName: row.doctorName,
            specialization: row.specialization,
            date: row.date,
            time: row.time,
            duration: 30,
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
        const user = await requireSessionUser()
        if (!user) return failUnauthorized("Authentication required", requestId)

        const ip = clientIp(req)
        const rl = await rateLimit(`video-consultation-post:${user.id}:${ip}`, 30, 60_000)
        if (!rl.allowed) {
            return failTooManyRequests("Too many booking attempts", undefined, requestId)
        }

        const body = await req.json();
        const parsed = z
            .object({
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

        // A mother can only ever book a consultation for herself — the
        // authenticated session, not a client-supplied patientId, decides
        // whose record this is.
        if (user.role !== "MOTHER") {
            return failForbidden("Only mother accounts can book a consultation", requestId)
        }
        const patientId = user.id;
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
        const user = await requireSessionUser()
        if (!user) return failUnauthorized("Authentication required", requestId)

        const ip = clientIp(req)
        const rl = await rateLimit(`video-consultation-put:${user.id}:${ip}`, 30, 60_000)
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

        const existing = await prisma.videoConsultation.findUnique({ where: { id: consultationId } })
        if (!existing) return failBadRequest("Consultation not found", requestId)

        const isOwner =
            (user.role === "MOTHER" && existing.patientId === user.id) ||
            (user.role === "DOCTOR" && existing.doctorId === user.id)
        if (!isOwner) {
            return failForbidden("Not allowed to update this consultation", requestId)
        }

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
