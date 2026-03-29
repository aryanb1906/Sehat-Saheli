import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createAccessToken, verifyToken } from "@/lib/tokens"
import { clientIp, rateLimit } from "@/lib/rate-limit"

const refreshSchema = z.object({
    refreshToken: z.string().min(20),
})

export async function POST(req: NextRequest) {
    const ip = clientIp(req)
    const rl = await rateLimit(`auth-token-issue:${ip}`, 20, 60_000)
    if (!rl.allowed) {
        return NextResponse.json({ error: "Too many token requests" }, { status: 429 })
    }

    // Direct token minting is intentionally disabled.
    // Authentication should be handled via NextAuth session endpoints.
    return NextResponse.json(
        {
            error: "Direct token issuance is disabled. Use NextAuth sign-in flow.",
        },
        { status: 403 },
    )
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
