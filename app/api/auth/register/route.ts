import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["MOTHER", "ASHA", "DOCTOR"]),
})

export async function POST(req: NextRequest) {
    try {
        const raw = await req.json()
        const parsed = registerSchema.safeParse(raw)

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid payload", issues: parsed.error.flatten() },
                { status: 400 },
            )
        }

        const email = parsed.data.email.toLowerCase()
        const existing = await prisma.user.findUnique({ where: { email } })

        if (existing) {
            return NextResponse.json({ error: "Email already registered" }, { status: 409 })
        }

        const passwordHash = await hash(parsed.data.password, 12)
        const user = await prisma.user.create({
            data: {
                name: parsed.data.name,
                email,
                role: parsed.data.role,
                passwordHash,
            },
        })

        return NextResponse.json({
            success: true,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        })
    } catch (error) {
        return NextResponse.json({ error: "Registration failed" }, { status: 500 })
    }
}
