import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { clientIp, rateLimit } from "@/lib/rate-limit"
import { hasRole, requireSessionUser } from "@/lib/api-auth"
import { failForbidden, failInternal, failNotFound, failTooManyRequests, failUnauthorized, okWithRequestId } from "@/lib/api-response"
import { getRequestId } from "@/lib/observability"

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
    const requestId = getRequestId(_)
    const user = await requireSessionUser()
    if (!user) return failUnauthorized("Authentication required", requestId)
    if (!hasRole(user.role, ["ASHA", "DOCTOR"])) return failForbidden("Not allowed to access this resource", requestId)

    const { id } = await context.params

    const patient = await prisma.patientProfile.findUnique({ where: { id } })
    if (!patient) {
        return failNotFound("Patient not found", requestId)
    }

    if (user.role === "ASHA" && patient.ashaWorkerId !== user.id) {
        return failForbidden("Cannot access another ASHA worker's patient", requestId)
    }

    const [healthLogs, appointments] = await Promise.all([
        prisma.patientHealthLog.findMany({ where: { patientId: id }, orderBy: { date: "desc" } }),
        prisma.patientAppointment.findMany({ where: { patientId: id }, orderBy: { date: "asc" } }),
    ])

    return okWithRequestId({
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
    }, requestId)
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const requestId = getRequestId(req)
    const user = await requireSessionUser()
    if (!user) return failUnauthorized("Authentication required", requestId)
    if (!hasRole(user.role, ["ASHA", "DOCTOR"])) return failForbidden("Not allowed to access this resource", requestId)

    const { id } = await context.params
    const rl = await rateLimit(`asha-patient-update:${clientIp(req)}`, 30, 60_000)
    if (!rl.allowed) return failTooManyRequests("Too many updates", undefined, requestId)

    const existing = await prisma.patientProfile.findUnique({ where: { id } })
    if (!existing) return failNotFound("Patient not found", requestId)
    if (user.role === "ASHA" && existing.ashaWorkerId !== user.id) {
        return failForbidden("Cannot update another ASHA worker's patient", requestId)
    }

    try {
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

        return okWithRequestId({ patient: updated }, requestId)
    } catch {
        return failInternal("Failed to update patient", requestId)
    }
}
