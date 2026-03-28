import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { clientIp, rateLimit } from "@/lib/rate-limit"
import { getRequestId, logError } from "@/lib/observability"
import {
    VoiceAssistantAnalyticsEvent,
    VoiceIntent,
} from "@/lib/voice-assistant/types"
import { addVoiceAnalyticsEvent, getVoiceAnalyticsSummary } from "@/lib/voice-assistant/analytics-store"

const intentEnum = z.enum([
    "SHOW_CHECKLIST",
    "MARK_TASK_COMPLETE",
    "GET_RISK_STATUS",
    "OPEN_EMERGENCY_MODE",
    "OPEN_APPOINTMENTS",
    "OPEN_MEDICATIONS",
    "OPEN_LAB_REPORTS",
    "OPEN_COMMUNITY",
    "OPEN_ASHA_DASHBOARD",
    "OPEN_ASHA_PATIENTS",
    "OPEN_ASHA_TASKS",
    "OPEN_ASHA_ANALYTICS",
    "OPEN_ROUTE",
    "UNKNOWN",
])

const postSchema = z.object({
    transcript: z.string().default(""),
    language: z.string().min(2).max(8).default("en"),
    intent: intentEnum,
    confidence: z.number().min(0).max(1).default(0),
    success: z.boolean(),
    source: z.enum(["speech", "suggestion"]).default("speech"),
    path: z.string().default("/"),
    error: z.string().optional(),
})

function normalizeIntent(intent: string): VoiceIntent {
    return intentEnum.parse(intent)
}

export async function POST(req: NextRequest) {
    const requestId = getRequestId(req)
    try {
        const rl = await rateLimit(`voice-analytics-post:${clientIp(req)}`, 300, 60_000)
        if (!rl.allowed) {
            return NextResponse.json({ error: "Too many analytics events" }, { status: 429 })
        }

        const parsed = postSchema.safeParse(await req.json())
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid analytics payload" }, { status: 400 })
        }

        const event: VoiceAssistantAnalyticsEvent = {
            ts: new Date().toISOString(),
            transcript: parsed.data.transcript,
            language: parsed.data.language,
            intent: normalizeIntent(parsed.data.intent),
            confidence: parsed.data.confidence,
            success: parsed.data.success,
            source: parsed.data.source,
            path: parsed.data.path,
            error: parsed.data.error,
        }

        addVoiceAnalyticsEvent(event)
        return NextResponse.json({ success: true, requestId })
    } catch (error) {
        logError("voice-assistant.analytics.post.failed", {
            requestId,
            error: error instanceof Error ? error.message : "unknown",
        })
        return NextResponse.json({ error: "Failed to write analytics", requestId }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    const requestId = getRequestId(req)
    try {
        const rl = await rateLimit(`voice-analytics-get:${clientIp(req)}`, 120, 60_000)
        if (!rl.allowed) {
            return NextResponse.json({ error: "Too many analytics read requests" }, { status: 429 })
        }

        const { searchParams } = new URL(req.url)
        const limit = Number(searchParams.get("limit") || 50)
        const summary = getVoiceAnalyticsSummary(limit)

        return NextResponse.json({ success: true, requestId, summary })
    } catch (error) {
        logError("voice-assistant.analytics.get.failed", {
            requestId,
            error: error instanceof Error ? error.message : "unknown",
        })
        return NextResponse.json({ error: "Failed to load analytics", requestId }, { status: 500 })
    }
}
