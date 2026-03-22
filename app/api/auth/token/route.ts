import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createAccessToken, createRefreshToken, verifyToken } from "@/lib/tokens"

const issueSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["MOTHER", "ASHA", "DOCTOR"]),
})

export async function POST(req: NextRequest) {
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
  const body = await req.json()
  const refreshToken = body?.refreshToken

  if (!refreshToken || typeof refreshToken !== "string") {
    return NextResponse.json({ error: "refreshToken is required" }, { status: 400 })
  }

  try {
    const payload = verifyToken(refreshToken) as { userId: string }
    const accessToken = createAccessToken({ userId: payload.userId })

    return NextResponse.json({ success: true, accessToken, tokenType: "Bearer" })
  } catch {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
  }
}
