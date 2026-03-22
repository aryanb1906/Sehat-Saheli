import { NextRequest, NextResponse } from "next/server";

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
    try {
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

        return NextResponse.json({
            success: true,
            consultations,
            totalConsultations: consultations.length,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch consultations" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { doctorId, date, time, reason } = body;

        const newConsultation: VideoConsultation = {
            id: `vc_${Date.now()}`,
            doctorName: "Dr. Available",
            specialization: "Obstetrics & Gynecology",
            date,
            time,
            duration: 30,
            status: "scheduled",
            roomId: `sehat-saheli-vc-${Date.now()}`,
        };

        return NextResponse.json({
            success: true,
            message: "Consultation scheduled successfully",
            consultation: newConsultation,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to schedule consultation" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { consultationId, rating, notes } = body;

        return NextResponse.json({
            success: true,
            message: "Consultation updated successfully",
            consultation: { id: consultationId, rating, notes },
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update consultation" },
            { status: 500 }
        );
    }
}
