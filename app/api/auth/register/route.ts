import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { clientIp, rateLimit } from "@/lib/rate-limit"
import { createDevUser, findDevUserByEmail } from "@/lib/dev-auth-store"
import { canUseDevAuthFallback, hasDatabaseUrl } from "@/lib/env"
import { addAuditEvent } from "@/lib/audit-log"

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["MOTHER", "ASHA", "DOCTOR"]),
})

export async function POST(req: NextRequest) {
    try {
        const hasDb = hasDatabaseUrl()
        const useDevFallback = canUseDevAuthFallback()
        const ip = clientIp(req)
        const rl = await rateLimit(`auth-register:${ip}`, 10, 60_000)
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
        const devExisting = findDevUserByEmail(email)
        let dbExisting = null
        if (hasDb) {
            try {
                dbExisting = await prisma.user.findUnique({ where: { email } })
            } catch (error) {
                if (!useDevFallback) {
                    throw error
                }
            }
        }
        const existing = dbExisting || devExisting

        if (existing) {
            return NextResponse.json({ error: "Email already registered" }, { status: 409 })
        }

        const passwordHash = await hash(parsed.data.password, 12)
        let user

        if (hasDb) {
            try {
                user = await prisma.user.create({
                    data: {
                        name: parsed.data.name,
                        email,
                        role: parsed.data.role,
                        passwordHash,
                    },
                })
            } catch (error) {
                if (!useDevFallback) {
                    throw error
                }
                user = createDevUser({
                    name: parsed.data.name,
                    email,
                    role: parsed.data.role,
                    passwordHash,
                })
            }
        } else {
            user = createDevUser({
                name: parsed.data.name,
                email,
                role: parsed.data.role,
                passwordHash,
            })
        }

        await addAuditEvent({
            actorRole: parsed.data.role,
            actorId: user.id,
            action: "USER_REGISTERED",
            resource: "user",
            metadata: { email },
        })

        return NextResponse.json({
            success: true,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        })
    } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2021" || error.code === "P2022") {
                return NextResponse.json(
                    {
                        error:
                            "Database schema is not initialized. Run: npm run prisma:push and npm run prisma:seed",
                    },
                    { status: 503 },
                )
            }
        }

        if (error instanceof Prisma.PrismaClientInitializationError) {
            return NextResponse.json(
                {
                    error:
                        "Database connection failed. Check DATABASE_URL and ensure the database is running.",
                },
                { status: 503 },
            )
        }

        return NextResponse.json(
            {
                error: "Registration failed. Please verify backend setup.",
            },
            { status: 500 },
        )
    }
}
