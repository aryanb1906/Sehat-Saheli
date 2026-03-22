import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { clientIp, rateLimit } from "@/lib/rate-limit"

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params

    const patient = await prisma.patientProfile.findUnique({ where: { id } })
    if (!patient) {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    const [healthLogs, appointments] = await Promise.all([
        prisma.patientHealthLog.findMany({ where: { patientId: id }, orderBy: { date: "desc" } }),
        prisma.patientAppointment.findMany({ where: { patientId: id }, orderBy: { date: "asc" } }),
    ])

    return NextResponse.json({
        success: true,
        patient: {
            id: patient.id,
            name: patient.name,
            age: patient.age,
            weeks: patient.weeks,
            risk: patient.risk === "HIGH" ? "High" : patient.risk === "MEDIUM" ? "Medium" : "Low",
            lastCheckup: patient.lastCheckup,
            phone: patient.phone,
            village: patient.village,
            bloodPressure: patient.bloodPressure,
            hemoglobin: patient.hemoglobin,
            weight: patient.weight,
            symptoms: (patient.symptoms as string[]) || [],
            nextAppointment: patient.nextAppointment,
            ashaWorkerId: patient.ashaWorkerId,
            mentalHealthScore: patient.mentalHealthScore,
            emergencyContact: patient.emergencyContact,
        },
        healthLogs: healthLogs.map((log) => ({
            id: log.id,
            patientId: log.patientId,
            date: log.date,
            symptoms: (log.symptoms as string[]) || [],
            mood: log.mood,
            notes: log.notes,
            bloodPressure: log.bloodPressure,
            weight: log.weight,
        })),
        appointments,
    })
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params
    const rl = await rateLimit(`asha-patient-update:${clientIp(req)}`, 30, 60_000)
    if (!rl.allowed) return NextResponse.json({ error: "Too many updates" }, { status: 429 })

    const body = await req.json()

    const updated = await prisma.patientProfile.update({
        where: { id },
        data: {
            bloodPressure: body.bloodPressure,
            hemoglobin: body.hemoglobin,
            weight: body.weight,
            symptoms: body.symptoms,
            risk: body.risk,
            lastCheckup: new Date().toISOString().split("T")[0],
        },
    })

    return NextResponse.json({ success: true, patient: updated })
}
