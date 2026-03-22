import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { clientIp, rateLimit } from "@/lib/rate-limit"

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["MOTHER", "ASHA", "DOCTOR"]),
})

export async function POST(req: NextRequest) {
    try {
        const ip = clientIp(req)
        const rl = rateLimit(`auth-register:${ip}`, 10, 60_000)
        if (!rl.allowed) {
            const retryAfter = Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000))
            return NextResponse.json(
                { error: "Too many registration attempts. Try again later." },
                { status: 429, headers: { "Retry-After": String(retryAfter) } },
            )
        }

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
