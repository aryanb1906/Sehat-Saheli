import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createAccessToken, createRefreshToken, verifyToken } from "@/lib/tokens"
import { clientIp, rateLimit } from "@/lib/rate-limit"

const issueSchema = z.object({
    userId: z.string().min(1),
    email: z.string().email(),
    role: z.enum(["MOTHER", "ASHA", "DOCTOR"]),
})

const refreshSchema = z.object({
    refreshToken: z.string().min(20),
})

export async function POST(req: NextRequest) {
    const ip = clientIp(req)
    const rl = await rateLimit(`auth-token-issue:${ip}`, 20, 60_000)
    if (!rl.allowed) {
        return NextResponse.json({ error: "Too many token requests" }, { status: 429 })
    }

    const raw = await req.json()
    const parsed = issueSchema.safeParse(raw)

    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const accessToken = createAccessToken(parsed.data)
    const refreshToken = createRefreshToken({ userId: parsed.data.userId })

    return NextResponse.json({
        success: true,
        accessToken,
        refreshToken,
        tokenType: "Bearer",
    })
}

export async function PUT(req: NextRequest) {
    const ip = clientIp(req)
    const rl = await rateLimit(`auth-token-refresh:${ip}`, 30, 60_000)
    if (!rl.allowed) {
        return NextResponse.json({ error: "Too many refresh attempts" }, { status: 429 })
    }

    const body = await req.json()
    const parsed = refreshSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json({ error: "refreshToken is required" }, { status: 400 })
    }

    try {
        const payload = verifyToken(parsed.data.refreshToken) as { userId: string }
        const accessToken = createAccessToken({ userId: payload.userId })

        return NextResponse.json({ success: true, accessToken, tokenType: "Bearer" })
    } catch {
        return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
    }
}
