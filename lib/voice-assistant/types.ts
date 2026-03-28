export type AssistantStatus = "idle" | "listening" | "processing" | "responding" | "error"

export type VoiceIntent =
    | "SHOW_CHECKLIST"
    | "MARK_TASK_COMPLETE"
    | "GET_RISK_STATUS"
    | "OPEN_EMERGENCY_MODE"
    | "OPEN_APPOINTMENTS"
    | "OPEN_MEDICATIONS"
    | "OPEN_LAB_REPORTS"
    | "OPEN_COMMUNITY"
    | "OPEN_ASHA_DASHBOARD"
    | "OPEN_ASHA_PATIENTS"
    | "OPEN_ASHA_TASKS"
    | "OPEN_ASHA_ANALYTICS"
    | "OPEN_ROUTE"
    | "UNKNOWN"

export interface VoiceCommandParseRequest {
    transcript: string
    language: string
    path?: string
}

export interface VoiceCommandParseResult {
    intent: VoiceIntent
    confidence: number
    route?: string
    entity?: string
    assistantReply: string
}

export const VOICE_ACTION_EVENT = "voice-assistant:action"

export type VoiceActionEventDetail = {
    intent: VoiceIntent
    entity?: string
}

export interface VoiceAssistantAnalyticsEvent {
    ts: string
    transcript: string
    language: string
    intent: VoiceIntent
    confidence: number
    success: boolean
    source: "speech" | "suggestion"
    path: string
    error?: string
}

export interface VoiceAssistantAnalyticsSummary {
    total: number
    successRate: number
    failures: number
    topIntents: Array<{ intent: VoiceIntent; count: number }>
    recent: VoiceAssistantAnalyticsEvent[]
}
