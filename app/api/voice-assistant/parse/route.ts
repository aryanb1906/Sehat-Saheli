import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { clientIp, rateLimit } from "@/lib/rate-limit"
import { parseVoiceCommand } from "@/lib/voice-assistant/command-parser"
import { getRequestId, logError, withTiming } from "@/lib/observability"

const requestSchema = z.object({
    transcript: z.string().min(1),
    language: z.string().min(2).max(5).default("en"),
    path: z.string().optional(),
})

export async function POST(req: NextRequest) {
    const requestId = getRequestId(req)

    try {
        const rl = await rateLimit(`voice-assist-parse:${clientIp(req)}`, 80, 60_000)
        if (!rl.allowed) {
            return NextResponse.json({ error: "Too many voice parsing requests" }, { status: 429 })
        }

        const parsedPayload = requestSchema.safeParse(await req.json())
        if (!parsedPayload.success) {
            return NextResponse.json({ error: "Invalid voice command payload" }, { status: 400 })
        }

        const { transcript, language, path } = parsedPayload.data
        const result = await withTiming("voice-assistant.parse", () => parseVoiceCommand(transcript, language, path || "/"))

        return NextResponse.json({ success: true, requestId, result })
    } catch (error) {
        logError("voice-assistant.parse.failed", {
            requestId,
            error: error instanceof Error ? error.message : "unknown",
        })
        return NextResponse.json({ error: "Failed to parse voice command", requestId }, { status: 500 })
    }
}
