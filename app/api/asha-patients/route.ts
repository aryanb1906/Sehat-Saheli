import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { clientIp, rateLimit } from "@/lib/rate-limit"

type Risk = "Low" | "Medium" | "High"

const createPatientSchema = z.object({
    ashaWorkerId: z.string().min(1),
    name: z.string().min(2),
    age: z.number().int().min(15).max(55),
    weeks: z.number().int().min(1).max(42),
    risk: z.enum(["LOW", "MEDIUM", "HIGH"]),
    phone: z.string().min(8),
    village: z.string().min(2),
    bloodPressure: z.string().min(3),
    hemoglobin: z.number().min(3).max(20),
    weight: z.number().min(25).max(150),
    symptoms: z.array(z.string()).default([]),
})

function toRiskLabel(risk: string): Risk {
    if (risk === "HIGH") return "High"
    if (risk === "MEDIUM") return "Medium"
    return "Low"
}

export async function GET(req: NextRequest) {
    const rl = rateLimit(`asha-patients:${clientIp(req)}`, 100, 60_000)
    if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 })

    const { searchParams } = new URL(req.url)
    const ashaWorkerId = searchParams.get("ashaWorkerId") || "asha_001"
    const q = (searchParams.get("q") || "").trim().toLowerCase()

    const patients = await prisma.patientProfile.findMany({
        where: {
            ashaWorkerId,
            ...(q
                ? {
                    OR: [
                        { name: { contains: q, mode: "insensitive" } },
                        { village: { contains: q, mode: "insensitive" } },
                    ],
                }
                : {}),
        },
        orderBy: { updatedAt: "desc" },
    })

    const mapped = patients.map((p) => ({
        id: p.id,
        name: p.name,
        age: p.age,
        weeks: p.weeks,
        risk: toRiskLabel(p.risk),
        lastCheckup: p.lastCheckup,
        phone: p.phone,
        village: p.village,
        bloodPressure: p.bloodPressure,
        hemoglobin: p.hemoglobin,
        weight: p.weight,
        symptoms: (p.symptoms as string[]) || [],
        nextAppointment: p.nextAppointment,
        ashaWorkerId: p.ashaWorkerId,
        mentalHealthScore: p.mentalHealthScore,
        emergencyContact: p.emergencyContact,
    }))

    return NextResponse.json({
        success: true,
        patients: mapped,
        stats: {
            total: mapped.length,
            high: mapped.filter((p) => p.risk === "High").length,
            medium: mapped.filter((p) => p.risk === "Medium").length,
            low: mapped.filter((p) => p.risk === "Low").length,
        },
    })
}

export async function POST(req: NextRequest) {
    const rl = rateLimit(`asha-patients-create:${clientIp(req)}`, 20, 60_000)
    if (!rl.allowed) return NextResponse.json({ error: "Too many create requests" }, { status: 429 })

    const raw = await req.json()
    const parsed = createPatientSchema.safeParse(raw)
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 })
    }

    const created = await prisma.patientProfile.create({
        data: {
            ashaWorkerId: parsed.data.ashaWorkerId,
            name: parsed.data.name,
            age: parsed.data.age,
            weeks: parsed.data.weeks,
            risk: parsed.data.risk,
            lastCheckup: new Date().toISOString().split("T")[0],
            phone: parsed.data.phone,
            village: parsed.data.village,
            bloodPressure: parsed.data.bloodPressure,
            hemoglobin: parsed.data.hemoglobin,
            weight: parsed.data.weight,
            symptoms: parsed.data.symptoms,
            nextAppointment: null,
            mentalHealthScore: 7,
            emergencyContact: parsed.data.phone,
        },
    })

    return NextResponse.json({ success: true, patient: created })
}
