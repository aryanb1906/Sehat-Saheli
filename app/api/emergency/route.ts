import { NextRequest, NextResponse } from "next/server";

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
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type"); // "contacts", "history", "danger-signs"

        if (type === "contacts") {
            return getEmergencyContacts();
        } else if (type === "history") {
            return getSOSHistory();
        } else if (type === "danger-signs") {
            return getDangerSigns();
        }

        return NextResponse.json(
            { error: "Invalid query type" },
            { status: 400 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch emergency data" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, data } = body;

        if (action === "trigger-sos") {
            return triggerSOS(data);
        } else if (action === "add-contact") {
            return addEmergencyContact(data);
        } else if (action === "call-108") {
            return initiateAmbulanCall(data);
        }

        return NextResponse.json(
            { error: "Invalid action" },
            { status: 400 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to process emergency action" },
            { status: 500 }
        );
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

function triggerSOS(data: any): Response {
    const { userId, location, reason } = data;

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

    return NextResponse.json({
        success: true,
        message: "Emergency alert sent to contacts and 108",
        sos: sosAlert,
    });
}

function addEmergencyContact(data: any): Response {
    const { name, relationship, phone, priority } = data;

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

function initiateAmbulanCall(data: any): Response {
    const { location, reason } = data;

    // In production: Integrate with ambulance service API
    return NextResponse.json({
        success: true,
        message: "Ambulance request sent. You will receive a call shortly.",
        ambulanceETA: "8-10 minutes",
        driverContact: "+91-XXXXXXXXXX",
    });
}
