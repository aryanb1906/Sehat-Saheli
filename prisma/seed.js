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

    console.log("Seed complete: demo users, chat room, and consultation created")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
