import {
    VoiceAssistantAnalyticsEvent,
    VoiceAssistantAnalyticsSummary,
    VoiceIntent,
} from "@/lib/voice-assistant/types"

declare global {
    // eslint-disable-next-line no-var
    var __voiceAnalyticsStore: VoiceAssistantAnalyticsEvent[] | undefined
}

function getStore() {
    if (!global.__voiceAnalyticsStore) global.__voiceAnalyticsStore = []
    return global.__voiceAnalyticsStore
}

export function addVoiceAnalyticsEvent(event: VoiceAssistantAnalyticsEvent) {
    const store = getStore()
    store.unshift(event)
    if (store.length > 2000) store.length = 2000
}

export function getVoiceAnalyticsSummary(limit = 30): VoiceAssistantAnalyticsSummary {
    const store = getStore()
    const safeLimit = Math.max(5, Math.min(200, limit))
    const sample = store.slice(0, safeLimit)

    const total = sample.length
    const successes = sample.filter((item) => item.success).length
    const failures = total - successes
    const successRate = total === 0 ? 0 : Math.round((successes / total) * 100)

    const intentCounts = new Map<VoiceIntent, number>()
    for (const item of sample) {
        intentCounts.set(item.intent, (intentCounts.get(item.intent) || 0) + 1)
    }

    const topIntents = Array.from(intentCounts.entries())
        .map(([intent, count]) => ({ intent, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)

    return {
        total,
        successRate,
        failures,
        topIntents,
        recent: sample.slice(0, 12),
    }
}
