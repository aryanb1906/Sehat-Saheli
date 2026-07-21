import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addAuditEvent } from "@/lib/audit-log";
import { requireSessionUser } from "@/lib/api-auth";
import { failBadRequest, failForbidden, failInternal, failTooManyRequests, failUnauthorized, okWithRequestId } from "@/lib/api-response";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { readIdempotent, writeIdempotent } from "@/lib/idempotency";
import { getRequestId } from "@/lib/observability";
import { addEmergencyContactForUser, createSOSForUser, listEmergencyContacts, listSOSHistoryForUser, updateSOSStatusForUser } from "@/lib/persistence-store";

interface EmergencyContact {
    id: string;
    name: string;
    relationship: string;
    phone: string;
    priority: number;
    canReceiveLocation: boolean;
}

interface SOS {
    id: string;
    userId: string;
    timestamp: string;
    location: { lat: number; lng: number };
    status: "active" | "acknowledged" | "resolved" | "cancelled";
    contactsNotified: string[];
    emergencyReason?: string;
}

export async function GET(req: NextRequest) {
    const requestId = getRequestId(req)
    try {
        const user = await requireSessionUser()
        if (!user) return failUnauthorized("Authentication required", requestId)

        const rl = await rateLimit(`emergency-get:${user.id}:${clientIp(req)}`, 120, 60_000)
        if (!rl.allowed) return failTooManyRequests("Too many requests", undefined, requestId)

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type"); // "contacts", "history", "danger-signs"

        if (type === "contacts") {
            const contacts = await listEmergencyContacts(user.id)
            return okWithRequestId({ contacts }, requestId)
        } else if (type === "history") {
            const sosHistory = await listSOSHistoryForUser(user.id)
            return okWithRequestId({ sosHistory }, requestId)
        } else if (type === "danger-signs") {
            const dangerSigns = getDangerSigns()
            return okWithRequestId({ dangerSigns }, requestId)
        }

        return failBadRequest("Invalid query type", requestId)
    } catch (error) {
        return failInternal("Failed to fetch emergency data", requestId)
    }
}

export async function POST(req: NextRequest) {
    const requestId = getRequestId(req)
    try {
        const user = await requireSessionUser()
        if (!user) return failUnauthorized("Authentication required", requestId)

        const rl = await rateLimit(`emergency-post:${user.id}:${clientIp(req)}`, 40, 60_000)
        if (!rl.allowed) return failTooManyRequests("Too many emergency requests", undefined, requestId)

        const idempotencyKey = req.headers.get("idempotency-key")
        if (idempotencyKey) {
            const cached = await readIdempotent(`emergency:${user.id}:${idempotencyKey}`)
            if (cached) {
                return NextResponse.json(cached.body, { status: cached.status })
            }
        }

        const body = await req.json();
        const parsed = z
            .object({
                action: z.enum(["trigger-sos", "add-contact", "call-108", "update-sos-status"]),
                data: z.record(z.unknown()).default({}),
            })
            .safeParse(body)

        if (!parsed.success) return failBadRequest("Invalid payload", requestId)

        const { action, data } = parsed.data;
        let response: Response

        if (action === "trigger-sos") {
            response = await triggerSOS(user.id, user.role, data, requestId);
        } else if (action === "add-contact") {
            response = await addEmergencyContact(user.id, data, requestId);
        } else if (action === "call-108") {
            response = initiateAmbulanceCall(data, requestId);
        } else if (action === "update-sos-status") {
            response = await updateSOSStatus(user.id, user.role, data, requestId)
        } else {
            return failBadRequest("Invalid action", requestId)
        }

        if (idempotencyKey) {
            const responseClone = response.clone()
            const bodyData = await responseClone.json()
            await writeIdempotent(`emergency:${user.id}:${idempotencyKey}`, response.status, bodyData)
        }

        return response
    } catch (error) {
        return failInternal("Failed to process emergency action", requestId)
    }
}

function getDangerSigns() {
    return [
        {
            sign: "Severe Vaginal Bleeding",
            severity: "critical",
            action: "Call 108 immediately",
            description: "More blood than a normal period",
        },
        {
            sign: "Severe Abdominal Pain",
            severity: "critical",
            action: "Call 108 immediately",
            description: "Unbearable or sudden onset pain",
        },
        {
            sign: "Severe Headache",
            severity: "high",
            action: "Contact ASHA or visit hospital",
            description: "Persistent or with vision changes",
        },
        {
            sign: "Fever Above 38°C",
            severity: "high",
            action: "Contact ASHA",
            description: "With chills or body pain",
        },
        {
            sign: "Severe Swelling",
            severity: "high",
            action: "Contact ASHA",
            description: "Sudden swelling of face, hands, or feet",
        },
        {
            sign: "Loss of Consciousness",
            severity: "critical",
            action: "Call 108 immediately",
            description: "Any fainting episodes",
        },
        {
            sign: "No Fetal Movement",
            severity: "high",
            action: "Visit hospital immediately",
            description: "After 20 weeks, no movement for > 12 hours",
        },
    ]
}

async function triggerSOS(userId: string, actorRole: "MOTHER" | "ASHA" | "DOCTOR", data: Record<string, unknown>, requestId: string): Promise<Response> {
    const parsed = z
        .object({
            userId: z.string().optional(),
            location: z.object({ lat: z.number(), lng: z.number() }),
            reason: z.string().min(2).optional(),
        })
        .safeParse(data)

    if (!parsed.success) return failBadRequest("Invalid SOS payload", requestId)
    if (parsed.data.userId && parsed.data.userId !== userId) {
        return failForbidden("Cannot trigger SOS for another user", requestId)
    }

    const { location, reason } = parsed.data
    const contacts = await listEmergencyContacts(userId)
    const sosAlert = await createSOSForUser({
        userId,
        reason,
        location,
        contactsNotified: contacts.map((item) => item.id),
    })

    await addAuditEvent({
        actorRole,
        actorId: userId,
        action: "SOS_TRIGGERED",
        resource: "emergency",
        metadata: { reason, location },
    })

    return okWithRequestId({
        message: "Emergency alert sent to contacts and 108",
        sos: sosAlert,
    }, requestId);
}

async function addEmergencyContact(userId: string, data: Record<string, unknown>, requestId: string): Promise<Response> {
    const parsed = z
        .object({
            name: z.string().min(2),
            relationship: z.string().min(2),
            phone: z.string().min(8),
            priority: z.number().int().min(1).max(5),
        })
        .safeParse(data)

    if (!parsed.success) return failBadRequest("Invalid emergency contact payload", requestId)

    const { name, relationship, phone, priority } = parsed.data
    const newContact = await addEmergencyContactForUser({
        userId,
        name,
        relationship,
        phone,
        priority,
        canReceiveLocation: true,
    })

    return okWithRequestId({
        message: "Emergency contact added",
        contact: newContact,
    }, requestId);
}

function initiateAmbulanceCall(data: Record<string, unknown>, requestId: string): Response {
    const parsed = z
        .object({
            location: z.object({ lat: z.number(), lng: z.number() }).optional(),
            reason: z.string().optional(),
        })
        .safeParse(data)

    if (!parsed.success) return failBadRequest("Invalid ambulance payload", requestId)

    const { location, reason } = parsed.data

    // There is no real ambulance-dispatch integration wired up yet (no state
    // 108 aggregator / partner API). Do NOT fabricate an ETA or driver phone
    // number here — a fake confirmation in a real emergency is worse than no
    // confirmation. Tell the caller to dial 108 directly; the client is
    // responsible for firing a native tel:108 intent immediately alongside
    // this call (see lib/offline-sync-client.ts triggerLocalEmergencyFallback).
    return okWithRequestId({
        message: "No automated ambulance dispatch is connected yet. Call 108 directly now — do not wait for this app.",
        realDispatchIntegrated: false,
        callNowNumber: "108",
    }, requestId);
}

async function updateSOSStatus(
    userId: string,
    role: "MOTHER" | "ASHA" | "DOCTOR",
    data: Record<string, unknown>,
    requestId: string,
): Promise<Response> {
    const parsed = z
        .object({
            sosId: z.string().min(1),
            userId: z.string().optional(),
            status: z.enum(["acknowledged", "resolved", "cancelled"]),
        })
        .safeParse(data)

    if (!parsed.success) return failBadRequest("Invalid SOS status payload", requestId)

    const targetUserId = parsed.data.userId || userId
    if (targetUserId !== userId && role === "MOTHER") {
        return failForbidden("Cannot update SOS status for another user", requestId)
    }

    const updated = await updateSOSStatusForUser({
        userId: targetUserId,
        sosId: parsed.data.sosId,
        status: parsed.data.status,
        updatedBy: userId,
    })

    if (!updated) return failBadRequest("SOS record not found", requestId)

    await addAuditEvent({
        actorRole: role,
        actorId: userId,
        action: "SOS_STATUS_UPDATED",
        resource: "emergency",
        metadata: {
            targetUserId,
            sosId: parsed.data.sosId,
            status: parsed.data.status,
            requestId,
        },
    })

    return okWithRequestId(
        {
            message: "SOS status updated",
            sos: updated,
        },
        requestId,
    )
}
