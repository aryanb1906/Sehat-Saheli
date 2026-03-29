import { NextRequest } from "next/server"
import { z } from "zod"
import { clientIp, rateLimit } from "@/lib/rate-limit"
import { parseVoiceCommand } from "@/lib/voice-assistant/command-parser"
import { getRequestId, logError, withTiming } from "@/lib/observability"
import { failBadRequest, failInternal, failTooManyRequests, okWithRequestId } from "@/lib/api-response"

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
            return failTooManyRequests("Too many voice parsing requests", undefined, requestId)
        }

        const parsedPayload = requestSchema.safeParse(await req.json())
        if (!parsedPayload.success) {
            return failBadRequest("Invalid voice command payload", requestId)
        }

        const { transcript, language, path } = parsedPayload.data
        const result = await withTiming("voice-assistant.parse", () => parseVoiceCommand(transcript, language, path || "/"))

        return okWithRequestId({ result }, requestId)
    } catch (error) {
        logError("voice-assistant.parse.failed", {
            requestId,
            error: error instanceof Error ? error.message : "unknown",
        })
        return failInternal("Failed to parse voice command", requestId)
    }
}
