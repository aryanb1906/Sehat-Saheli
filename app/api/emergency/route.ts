import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addAuditEvent } from "@/lib/audit-log";
import { requireSessionUser } from "@/lib/api-auth";
import { failBadRequest, failForbidden, failInternal, failTooManyRequests, failUnauthorized } from "@/lib/api-response";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { readIdempotent, writeIdempotent } from "@/lib/idempotency";

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
    status: "active" | "resolved" | "cancelled";
    contactsNotified: string[];
    emergencyReason?: string;
}

export async function GET(req: NextRequest) {
    try {
        const user = await requireSessionUser()
        if (!user) return failUnauthorized()

        const rl = await rateLimit(`emergency-get:${user.id}:${clientIp(req)}`, 120, 60_000)
        if (!rl.allowed) return failTooManyRequests("Too many requests")

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type"); // "contacts", "history", "danger-signs"

        if (type === "contacts") {
            return getEmergencyContacts();
        } else if (type === "history") {
            return getSOSHistory();
        } else if (type === "danger-signs") {
            return getDangerSigns();
        }

        return failBadRequest("Invalid query type")
    } catch (error) {
        return failInternal("Failed to fetch emergency data")
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await requireSessionUser()
        if (!user) return failUnauthorized()

        const rl = await rateLimit(`emergency-post:${user.id}:${clientIp(req)}`, 40, 60_000)
        if (!rl.allowed) return failTooManyRequests("Too many emergency requests")

        const idempotencyKey = req.headers.get("idempotency-key")
        if (idempotencyKey) {
            const cached = readIdempotent(`emergency:${user.id}:${idempotencyKey}`)
            if (cached) {
                return NextResponse.json(cached.body, { status: cached.status })
            }
        }

        const body = await req.json();
        const parsed = z
            .object({
                action: z.enum(["trigger-sos", "add-contact", "call-108"]),
                data: z.record(z.unknown()).default({}),
            })
            .safeParse(body)

        if (!parsed.success) return failBadRequest("Invalid payload")

        const { action, data } = parsed.data;
        let response: Response

        if (action === "trigger-sos") {
            response = await triggerSOS(user.id, user.role, data);
        } else if (action === "add-contact") {
            response = addEmergencyContact(data);
        } else if (action === "call-108") {
            response = initiateAmbulanceCall(data);
        } else {
            return failBadRequest("Invalid action")
        }

        if (idempotencyKey) {
            const responseClone = response.clone()
            const bodyData = await responseClone.json()
            writeIdempotent(`emergency:${user.id}:${idempotencyKey}`, response.status, bodyData)
        }

        return response
    } catch (error) {
        return failInternal("Failed to process emergency action")
    }
}

function getEmergencyContacts(): Response {
    const contacts: EmergencyContact[] = [
        {
            id: "contact_001",
            name: "Husband (Rajesh)",
            relationship: "Spouse",
            phone: "+91-XXXXXXXXXX",
            priority: 1,
            canReceiveLocation: true,
        },
        {
            id: "contact_002",
            name: "Mother (Kamla)",
            relationship: "Mother",
            phone: "+91-XXXXXXXXXX",
            priority: 2,
            canReceiveLocation: true,
        },
        {
            id: "contact_003",
            name: "ASHA Worker (Smita)",
            relationship: "Health Worker",
            phone: "+91-XXXXXXXXXX",
            priority: 3,
            canReceiveLocation: true,
        },
    ];

    return NextResponse.json({
        success: true,
        contacts,
    });
}

function getSOSHistory(): Response {
    const sosHistory: SOS[] = [
        {
            id: "sos_001",
            userId: "user_001",
            timestamp: "2024-03-10T14:30:00",
            location: { lat: 20.5937, lng: 78.9629 },
            status: "resolved",
            contactsNotified: ["contact_001", "contact_002"],
            emergencyReason: "Severe pain",
        },
    ];

    return NextResponse.json({
        success: true,
        sosHistory,
    });
}

function getDangerSigns(): Response {
    const dangerSigns = [
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
    ];

    return NextResponse.json({
        success: true,
        dangerSigns,
    });
}

async function triggerSOS(userId: string, actorRole: "MOTHER" | "ASHA" | "DOCTOR", data: Record<string, unknown>): Promise<Response> {
    const parsed = z
        .object({
            userId: z.string().optional(),
            location: z.object({ lat: z.number(), lng: z.number() }),
            reason: z.string().min(2).optional(),
        })
        .safeParse(data)

    if (!parsed.success) return failBadRequest("Invalid SOS payload")
    if (parsed.data.userId && parsed.data.userId !== userId) {
        return failForbidden("Cannot trigger SOS for another user")
    }

    const { location, reason } = parsed.data

    const sosAlert: SOS = {
        id: `sos_${Date.now()}`,
        userId,
        timestamp: new Date().toISOString(),
        location,
        status: "active",
        contactsNotified: [],
        emergencyReason: reason,
    };

    // In production: Send SMS/notifications to emergency contacts, ambulance service
    console.log("SOS TRIGGERED:", sosAlert);

    await addAuditEvent({
        actorRole,
        actorId: userId,
        action: "SOS_TRIGGERED",
        resource: "emergency",
        metadata: { reason, location },
    })

    return NextResponse.json({
        success: true,
        message: "Emergency alert sent to contacts and 108",
        sos: sosAlert,
    });
}

function addEmergencyContact(data: Record<string, unknown>): Response {
    const parsed = z
        .object({
            name: z.string().min(2),
            relationship: z.string().min(2),
            phone: z.string().min(8),
            priority: z.number().int().min(1).max(5),
        })
        .safeParse(data)

    if (!parsed.success) return failBadRequest("Invalid emergency contact payload")

    const { name, relationship, phone, priority } = parsed.data

    const newContact: EmergencyContact = {
        id: `contact_${Date.now()}`,
        name,
        relationship,
        phone,
        priority,
        canReceiveLocation: true,
    };

    return NextResponse.json({
        success: true,
        message: "Emergency contact added",
        contact: newContact,
    });
}

function initiateAmbulanceCall(data: Record<string, unknown>): Response {
    const parsed = z
        .object({
            location: z.object({ lat: z.number(), lng: z.number() }).optional(),
            reason: z.string().optional(),
        })
        .safeParse(data)

    if (!parsed.success) return failBadRequest("Invalid ambulance payload")

    const { location, reason } = parsed.data

    // In production: Integrate with ambulance service API
    return NextResponse.json({
        success: true,
        message: "Ambulance request sent. You will receive a call shortly.",
        ambulanceETA: "8-10 minutes",
        driverContact: "+91-XXXXXXXXXX",
    });
}
