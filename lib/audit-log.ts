import { createAuditLog, getAuditLogs } from "@/lib/persistence-store"

type AuditEvent = {
    id: string
    timestamp: string
    actorRole: "MOTHER" | "ASHA" | "DOCTOR" | "SYSTEM"
    actorId?: string
    action: string
    resource: string
    metadata?: Record<string, unknown>
}

export async function addAuditEvent(event: Omit<AuditEvent, "id" | "timestamp">) {
    return createAuditLog({
        actorRole: event.actorRole,
        actorId: event.actorId,
        action: event.action,
        resource: event.resource,
        metadata: event.metadata,
    })
}

export async function listAuditEvents(limit = 100, role?: AuditEvent["actorRole"]) {
    const rows = await getAuditLogs(limit, role)
    return rows.map((row: {
        id: string
        timestamp: string
        actorRole: "MOTHER" | "ASHA" | "DOCTOR" | "SYSTEM"
        actorId?: string
        action: string
        resource: string
        metadata?: Record<string, unknown>
    }) => ({
        id: row.id,
        timestamp: row.timestamp,
        actorRole: row.actorRole,
        actorId: row.actorId,
        action: row.action,
        resource: row.resource,
        metadata: row.metadata,
    }))
}
