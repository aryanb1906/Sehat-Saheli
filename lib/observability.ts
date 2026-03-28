type Severity = "info" | "error" | "warn" | "critical"

const LOG_SINK_URL = process.env.LOG_SINK_URL || process.env.OBSERVABILITY_SINK_URL || ""
const ALERT_WEBHOOK_URL = process.env.ALERT_WEBHOOK_URL || ""

async function shipToRemote(payload: Record<string, unknown>) {
    if (!LOG_SINK_URL) return
    try {
        await fetch(LOG_SINK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
    } catch {
        // Keep non-blocking behavior for observability transport.
    }
}

function writeStructuredLog(level: Severity, event: string, data: Record<string, unknown>) {
    const payload = {
        level,
        event,
        timestamp: new Date().toISOString(),
        ...data,
    }

    if (level === "error" || level === "critical") {
        console.error(JSON.stringify(payload))
    } else if (level === "warn") {
        console.warn(JSON.stringify(payload))
    } else {
        console.info(JSON.stringify(payload))
    }

    void shipToRemote(payload)
}

export function getRequestId(req: Request) {
    return req.headers.get("x-request-id") || crypto.randomUUID()
}

export function logInfo(event: string, data: Record<string, unknown>) {
    writeStructuredLog("info", event, data)
}

export function logWarn(event: string, data: Record<string, unknown>) {
    writeStructuredLog("warn", event, data)
}

export function logError(event: string, data: Record<string, unknown>) {
    writeStructuredLog("error", event, data)
}

export async function sendAlert(
    event: string,
    title: string,
    data: Record<string, unknown>,
    severity: "error" | "critical" = "error",
) {
    const payload = {
        event,
        title,
        severity,
        timestamp: new Date().toISOString(),
        ...data,
    }

    writeStructuredLog(severity, `alert.${event}`, payload)

    if (!ALERT_WEBHOOK_URL) return
    try {
        await fetch(ALERT_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
    } catch {
        // Keep alert pipeline best-effort.
    }
}

export async function withTiming<T>(metric: string, fn: () => Promise<T>) {
    const start = Date.now()
    try {
        const result = await fn()
        const durationMs = Date.now() - start
        logInfo("latency", { metric, durationMs })
        return result
    } catch (error) {
        const durationMs = Date.now() - start
        logError("latency", { metric, durationMs, failed: true })
        throw error
    }
}
