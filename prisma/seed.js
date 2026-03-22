const { PrismaClient } = require("@prisma/client")
const { hash } = require("bcryptjs")

const prisma = new PrismaClient()

async function upsertUser({ name, email, role, password }) {
    const passwordHash = await hash(password, 12)
    return prisma.user.upsert({
        where: { email },
        update: { name, role, passwordHash },
        create: { name, email, role, passwordHash },
    })
}

async function main() {
    // Reset demo domain data to keep seeding idempotent.
    await prisma.labReport.deleteMany({})
    await prisma.ashaTask.deleteMany({})
    await prisma.patientAppointment.deleteMany({})
    await prisma.patientHealthLog.deleteMany({})
    await prisma.patientProfile.deleteMany({})
    await prisma.videoConsultation.deleteMany({})

    const mother = await upsertUser({
        name: "Demo Mother",
        email: "mother@sehat.dev",
        role: "MOTHER",
        password: "demo1234",
    })

    const doctor = await upsertUser({
        name: "Demo Doctor",
        email: "doctor@sehat.dev",
        role: "DOCTOR",
        password: "demo1234",
    })

    const asha = await upsertUser({
        name: "Demo ASHA",
        email: "asha@sehat.dev",
        role: "ASHA",
        password: "demo1234",
    })

    await prisma.chatRoom.upsert({
        where: {
            motherId_doctorId: {
                motherId: mother.id,
                doctorId: doctor.id,
            },
        },
        update: {},
        create: {
            motherId: mother.id,
            doctorId: doctor.id,
        },
    })

    await prisma.videoConsultation.create({
        data: {
            patientId: mother.id,
            doctorId: doctor.id,
            doctorName: doctor.name,
            specialization: "Obstetrics & Gynecology",
            date: "2026-03-25",
            time: "10:00",
            reason: "Routine checkup",
            roomId: `sehat-seed-${Date.now()}`,
        },
    })

    const p1 = await prisma.patientProfile.create({
        data: {
            ashaWorkerId: asha.id,
            userId: mother.id,
            name: "Sita Devi",
            age: 26,
            weeks: 28,
            risk: "HIGH",
            lastCheckup: "2026-03-20",
            phone: "+91 9876511111",
            village: "Rampur",
            bloodPressure: "145/95",
            hemoglobin: 9.2,
            weight: 58,
            symptoms: ["Severe headache", "Swelling"],
            nextAppointment: "2026-03-28",
            mentalHealthScore: 6,
            emergencyContact: "+91 9876500001",
        },
    })

    const p2 = await prisma.patientProfile.create({
        data: {
            ashaWorkerId: asha.id,
            name: "Priya Sharma",
            age: 24,
            weeks: 32,
            risk: "LOW",
            lastCheckup: "2026-03-21",
            phone: "+91 9876522222",
            village: "Sitapur",
            bloodPressure: "118/76",
            hemoglobin: 11.5,
            weight: 62,
            symptoms: [],
            nextAppointment: "2026-03-30",
            mentalHealthScore: 8,
            emergencyContact: "+91 9876500002",
        },
    })

    await prisma.patientHealthLog.createMany({
        data: [
            {
                patientId: p1.id,
                date: "2026-03-22",
                symptoms: ["Headache"],
                mood: "Worried",
                notes: "Headache since morning",
                bloodPressure: "142/92",
                weight: 58,
            },
            {
                patientId: p2.id,
                date: "2026-03-22",
                symptoms: [],
                mood: "Happy",
                notes: "Feeling normal",
                bloodPressure: "116/74",
                weight: 62,
            },
        ],
    })

    await prisma.patientAppointment.createMany({
        data: [
            {
                patientId: p1.id,
                date: "2026-03-28",
                time: "10:00",
                type: "Antenatal Checkup",
                location: "PHC Rampur",
                status: "upcoming",
                notes: "Regular ANC checkup",
            },
            {
                patientId: p2.id,
                date: "2026-03-30",
                time: "11:30",
                type: "Ultrasound",
                location: "District Hospital",
                status: "upcoming",
            },
        ],
    })

    await prisma.ashaTask.createMany({
        data: [
            {
                ashId: asha.id,
                patientId: p1.id,
                taskType: "home-visit",
                description: "Weekly ANC checkup",
                dueDate: "2026-03-24",
                status: "PENDING",
                priority: "HIGH",
                location: "Rampur",
            },
            {
                ashId: asha.id,
                patientId: p2.id,
                taskType: "follow-up",
                description: "Iron supplement adherence",
                dueDate: "2026-03-25",
                status: "IN_PROGRESS",
                priority: "MEDIUM",
            },
        ],
    })

    await prisma.labReport.createMany({
        data: [
            {
                patientId: p1.id,
                date: "2026-03-20",
                testType: "blood",
                results: { hemoglobin: "9.2 g/dL", wbc: "6.3 K/uL" },
                status: "ALERT",
                doctorNotes: "Continue iron therapy",
            },
            {
                patientId: p2.id,
                date: "2026-03-21",
                testType: "blood",
                results: { hemoglobin: "11.5 g/dL", wbc: "6.8 K/uL" },
                status: "NORMAL",
            },
        ],
    })

    console.log("Seed complete: users, chat, consultation, ASHA patients, tasks, logs, appointments, lab reports")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
