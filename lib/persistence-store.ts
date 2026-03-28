import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

const prismaAny = prisma as any
import { hasDatabaseUrl } from "@/lib/env"

type ConsentRecord = {
    userId: string
    consentDataShare: boolean
    consentAiTraining: boolean
    retentionDays: number
    version: number
    revokedAt?: string | null
    updatedAt: string
}

type ConsentHistoryRecord = {
    id: string
    userId: string
    version: number
    consentDataShare: boolean
    consentAiTraining: boolean
    retentionDays: number
    action: "UPDATED" | "REVOKED"
    actorId?: string
    createdAt: string
}

type ReferralStatus = "generated" | "shared" | "in-treatment" | "completed" | "breached"

type ReferralRecord = {
    id: string
    patientId: string
    consultationId: string
    note: string
    status: ReferralStatus
    createdAt: string
    updatedAt: string
    slaDeadline?: string
    breachedAt?: string
    matchedFacility?: string
    capacityScore?: number
}

type AuditRecord = {
    id: string
    timestamp: string
    actorRole: "MOTHER" | "ASHA" | "DOCTOR" | "SYSTEM"
    actorId?: string
    action: string
    resource: string
    endpoint?: string
    requestId?: string
    latencyMs?: number
    statusCode?: number
    metadata?: Record<string, unknown>
}

declare global {
    // eslint-disable-next-line no-var
    var __consentFallbackStore: Record<string, ConsentRecord> | undefined
    // eslint-disable-next-line no-var
    var __consentHistoryFallbackStore: ConsentHistoryRecord[] | undefined
    // eslint-disable-next-line no-var
    var __referralFallbackStore: Record<string, ReferralRecord> | undefined
    // eslint-disable-next-line no-var
    var __auditFallbackStore: AuditRecord[] | undefined
}

function fallbackConsentStore() {
    if (!global.__consentFallbackStore) global.__consentFallbackStore = {}
    return global.__consentFallbackStore
}

function fallbackConsentHistoryStore() {
    if (!global.__consentHistoryFallbackStore) global.__consentHistoryFallbackStore = []
    return global.__consentHistoryFallbackStore
}

function fallbackReferralStore() {
    if (!global.__referralFallbackStore) global.__referralFallbackStore = {}
    return global.__referralFallbackStore
}

function fallbackAuditStore() {
    if (!global.__auditFallbackStore) global.__auditFallbackStore = []
    return global.__auditFallbackStore
}

function toPrismaReferralStatus(status: ReferralStatus) {
    if (status === "shared") return "SHARED"
    if (status === "in-treatment") return "IN_TREATMENT"
    if (status === "completed") return "COMPLETED"
    if (status === "breached") return "BREACHED"
    return "GENERATED"
}

function fromPrismaReferralStatus(status: string): ReferralStatus {
    if (status === "SHARED") return "shared"
    if (status === "IN_TREATMENT") return "in-treatment"
    if (status === "COMPLETED") return "completed"
    if (status === "BREACHED") return "breached"
    return "generated"
}

function computeReferralSla(note: string) {
    const lower = note.toLowerCase()
    if (lower.includes("urgent") || lower.includes("severe") || lower.includes("high-risk")) {
        return 12
    }
    return 48
}

function facilityMatchForReferral(note: string) {
    const lower = note.toLowerCase()
    if (lower.includes("high-risk") || lower.includes("bp") || lower.includes("severe")) {
        return { matchedFacility: "District Hospital", capacityScore: 82 }
    }
    if (lower.includes("follow-up") || lower.includes("routine")) {
        return { matchedFacility: "Community Health Centre", capacityScore: 71 }
    }
    return { matchedFacility: "Primary Health Centre", capacityScore: 65 }
}

export async function saveConsent(record: {
    userId: string
    consentDataShare: boolean
    consentAiTraining: boolean
    retentionDays: number
    actorId?: string
}) {
    const nowIso = new Date().toISOString()

    if (!hasDatabaseUrl()) {
        const existing = fallbackConsentStore()[record.userId]
        const nextVersion = (existing?.version || 0) + 1
        const full: ConsentRecord = {
            userId: record.userId,
            consentDataShare: record.consentDataShare,
            consentAiTraining: record.consentAiTraining,
            retentionDays: record.retentionDays,
            version: nextVersion,
            revokedAt: null,
            updatedAt: nowIso,
        }
        fallbackConsentStore()[record.userId] = full
        fallbackConsentHistoryStore().unshift({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            userId: record.userId,
            version: nextVersion,
            consentDataShare: full.consentDataShare,
            consentAiTraining: full.consentAiTraining,
            retentionDays: full.retentionDays,
            action: "UPDATED",
            actorId: record.actorId,
            createdAt: nowIso,
        })
        return full
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const txAny = tx as any
            const existing = await txAny.privacyConsent.findUnique({ where: { userId: record.userId } })
            const nextVersion = (existing?.version || 0) + 1

            const consent = await txAny.privacyConsent.upsert({
                where: { userId: record.userId },
                update: {
                    consentDataShare: record.consentDataShare,
                    consentAiTraining: record.consentAiTraining,
                    retentionDays: record.retentionDays,
                    version: nextVersion,
                    revokedAt: null,
                },
                create: {
                    userId: record.userId,
                    consentDataShare: record.consentDataShare,
                    consentAiTraining: record.consentAiTraining,
                    retentionDays: record.retentionDays,
                    version: 1,
                    revokedAt: null,
                },
            })

            await txAny.consentHistory.create({
                data: {
                    userId: record.userId,
                    version: consent.version,
                    consentDataShare: consent.consentDataShare,
                    consentAiTraining: consent.consentAiTraining,
                    retentionDays: consent.retentionDays,
                    action: "UPDATED",
                    actorId: record.actorId,
                },
            })

            return consent
        })

        return {
            userId: result.userId,
            consentDataShare: result.consentDataShare,
            consentAiTraining: result.consentAiTraining,
            retentionDays: result.retentionDays,
            version: result.version,
            revokedAt: result.revokedAt?.toISOString() || null,
            updatedAt: result.updatedAt.toISOString(),
        } satisfies ConsentRecord
    } catch {
        const existing = fallbackConsentStore()[record.userId]
        const nextVersion = (existing?.version || 0) + 1
        const nowIso = new Date().toISOString()
        const full: ConsentRecord = {
            userId: record.userId,
            consentDataShare: record.consentDataShare,
            consentAiTraining: record.consentAiTraining,
            retentionDays: record.retentionDays,
            version: nextVersion,
            revokedAt: null,
            updatedAt: nowIso,
        }
        fallbackConsentStore()[record.userId] = full
        fallbackConsentHistoryStore().unshift({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            userId: record.userId,
            version: nextVersion,
            consentDataShare: full.consentDataShare,
            consentAiTraining: full.consentAiTraining,
            retentionDays: full.retentionDays,
            action: "UPDATED",
            actorId: record.actorId,
            createdAt: nowIso,
        })
        return full
    }
}

export async function revokeConsent(userId: string, actorId?: string) {
    const nowIso = new Date().toISOString()

    const revokeInFallback = () => {
        const current = fallbackConsentStore()[userId]
        if (!current) return null
        const nextVersion = current.version + 1
        const updated: ConsentRecord = {
            ...current,
            consentDataShare: false,
            consentAiTraining: false,
            version: nextVersion,
            revokedAt: nowIso,
            updatedAt: nowIso,
        }
        fallbackConsentStore()[userId] = updated
        fallbackConsentHistoryStore().unshift({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            userId,
            version: nextVersion,
            consentDataShare: false,
            consentAiTraining: false,
            retentionDays: updated.retentionDays,
            action: "REVOKED",
            actorId,
            createdAt: nowIso,
        })
        return updated
    }

    if (!hasDatabaseUrl()) {
        return revokeInFallback()
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const txAny = tx as any
            const existing = await txAny.privacyConsent.findUnique({ where: { userId } })
            if (!existing) return null

            const updated = await txAny.privacyConsent.update({
                where: { userId },
                data: {
                    consentDataShare: false,
                    consentAiTraining: false,
                    version: existing.version + 1,
                    revokedAt: new Date(nowIso),
                },
            })

            await txAny.consentHistory.create({
                data: {
                    userId,
                    version: updated.version,
                    consentDataShare: updated.consentDataShare,
                    consentAiTraining: updated.consentAiTraining,
                    retentionDays: updated.retentionDays,
                    action: "REVOKED",
                    actorId,
                },
            })

            return updated
        })

        if (!result) return null

        return {
            userId: result.userId,
            consentDataShare: result.consentDataShare,
            consentAiTraining: result.consentAiTraining,
            retentionDays: result.retentionDays,
            version: result.version,
            revokedAt: result.revokedAt?.toISOString() || null,
            updatedAt: result.updatedAt.toISOString(),
        } satisfies ConsentRecord
    } catch {
        return revokeInFallback()
    }
}

export async function getConsent(userId: string): Promise<ConsentRecord | null> {
    if (!hasDatabaseUrl()) {
        return fallbackConsentStore()[userId] || null
    }

    try {
        const consent = await prismaAny.privacyConsent.findUnique({ where: { userId } })
        if (!consent) return null

        return {
            userId: consent.userId,
            consentDataShare: consent.consentDataShare,
            consentAiTraining: consent.consentAiTraining,
            retentionDays: consent.retentionDays,
            version: consent.version,
            revokedAt: consent.revokedAt?.toISOString() || null,
            updatedAt: consent.updatedAt.toISOString(),
        }
    } catch {
        return fallbackConsentStore()[userId] || null
    }
}

export async function getConsentHistory(userId: string, limit = 20): Promise<ConsentHistoryRecord[]> {
    if (!hasDatabaseUrl()) {
        return fallbackConsentHistoryStore().filter((entry) => entry.userId === userId).slice(0, limit)
    }

    try {
        const history = await prismaAny.consentHistory.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: Math.max(1, Math.min(100, limit)),
        })

        return history.map((row: any) => ({
            id: row.id,
            userId: row.userId,
            version: row.version,
            consentDataShare: row.consentDataShare,
            consentAiTraining: row.consentAiTraining,
            retentionDays: row.retentionDays,
            action: row.action,
            actorId: row.actorId || undefined,
            createdAt: row.createdAt.toISOString(),
        }))
    } catch {
        return fallbackConsentHistoryStore().filter((entry) => entry.userId === userId).slice(0, limit)
    }
}

export async function createReferral(input: {
    patientId: string
    consultationId: string
    note: string
    status: Exclude<ReferralStatus, "breached">
}) {
    const nowIso = new Date().toISOString()
    const slaHours = computeReferralSla(input.note)
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000)
    const facilityMatch = facilityMatchForReferral(input.note)

    const createInFallback = () => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        const fallbackItem: ReferralRecord = {
            id,
            patientId: input.patientId,
            consultationId: input.consultationId,
            note: input.note,
            status: input.status,
            createdAt: nowIso,
            updatedAt: nowIso,
            slaDeadline: slaDeadline.toISOString(),
            matchedFacility: facilityMatch.matchedFacility,
            capacityScore: facilityMatch.capacityScore,
        }
        fallbackReferralStore()[id] = fallbackItem
        return fallbackItem
    }

    if (!hasDatabaseUrl()) {
        return createInFallback()
    }

    try {
        const created = await prismaAny.referral.create({
            data: {
                patientId: input.patientId,
                consultationId: input.consultationId,
                note: input.note,
                status: toPrismaReferralStatus(input.status),
                slaDeadline,
                matchedFacility: facilityMatch.matchedFacility,
                capacityScore: facilityMatch.capacityScore,
            },
        })

        return {
            id: created.id,
            patientId: created.patientId,
            consultationId: created.consultationId,
            note: created.note,
            status: fromPrismaReferralStatus(created.status),
            createdAt: created.createdAt.toISOString(),
            updatedAt: created.updatedAt.toISOString(),
            slaDeadline: created.slaDeadline?.toISOString(),
            breachedAt: created.breachedAt?.toISOString(),
            matchedFacility: created.matchedFacility || undefined,
            capacityScore: created.capacityScore || undefined,
        } satisfies ReferralRecord
    } catch {
        return createInFallback()
    }
}

export async function updateReferralStatus(id: string, status: Exclude<ReferralStatus, "breached">) {
    const nowIso = new Date().toISOString()
    const store = fallbackReferralStore()

    if (store[id]) {
        store[id] = { ...store[id], status, updatedAt: nowIso }
    }

    if (!hasDatabaseUrl()) {
        return store[id] || null
    }

    try {
        const updated = await prismaAny.referral.update({
            where: { id },
            data: {
                status: toPrismaReferralStatus(status),
            },
        })

        return {
            id: updated.id,
            patientId: updated.patientId,
            consultationId: updated.consultationId,
            note: updated.note,
            status: fromPrismaReferralStatus(updated.status),
            createdAt: updated.createdAt.toISOString(),
            updatedAt: updated.updatedAt.toISOString(),
            slaDeadline: updated.slaDeadline?.toISOString(),
            breachedAt: updated.breachedAt?.toISOString(),
            matchedFacility: updated.matchedFacility || undefined,
            capacityScore: updated.capacityScore || undefined,
        } satisfies ReferralRecord
    } catch {
        return store[id] || null
    }
}

export async function listReferrals(patientId: string) {
    const listFromFallback = () => {
        const now = Date.now()
        const store = fallbackReferralStore()
        for (const key of Object.keys(store)) {
            const item = store[key]
            if (item.patientId !== patientId) continue
            if (item.status === "completed" || item.status === "breached") continue
            if (item.slaDeadline && new Date(item.slaDeadline).getTime() < now) {
                store[key] = {
                    ...item,
                    status: "breached",
                    breachedAt: new Date(now).toISOString(),
                    updatedAt: new Date(now).toISOString(),
                }
            }
        }

        return Object.values(fallbackReferralStore())
            .filter((item) => item.patientId === patientId)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    }

    if (!hasDatabaseUrl()) {
        return listFromFallback()
    }

    try {
        const now = new Date()

        // Auto-mark overdue referrals as breached for SLA visibility.
        await prismaAny.referral.updateMany({
            where: {
                patientId,
                status: { notIn: ["COMPLETED", "BREACHED"] },
                slaDeadline: { lt: now },
            },
            data: {
                status: "BREACHED",
                breachedAt: now,
            },
        })

        const rows = await prismaAny.referral.findMany({
            where: { patientId },
            orderBy: { createdAt: "desc" },
        })

        return rows.map((row: any) => ({
            id: row.id,
            patientId: row.patientId,
            consultationId: row.consultationId,
            note: row.note,
            status: fromPrismaReferralStatus(row.status),
            createdAt: row.createdAt.toISOString(),
            updatedAt: row.updatedAt.toISOString(),
            slaDeadline: row.slaDeadline?.toISOString(),
            breachedAt: row.breachedAt?.toISOString(),
            matchedFacility: row.matchedFacility || undefined,
            capacityScore: row.capacityScore || undefined,
        }))
    } catch {
        return listFromFallback()
    }
}

export async function createAuditLog(input: Omit<AuditRecord, "id" | "timestamp">) {
    const item: AuditRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        actorRole: input.actorRole,
        actorId: input.actorId,
        action: input.action,
        resource: input.resource,
        endpoint: input.endpoint,
        requestId: input.requestId,
        latencyMs: input.latencyMs,
        statusCode: input.statusCode,
        metadata: input.metadata,
    }

    const fallback = fallbackAuditStore()
    fallback.unshift(item)
    if (fallback.length > 1000) fallback.length = 1000

    if (!hasDatabaseUrl()) return item

    try {
        const created = await prismaAny.auditLog.create({
            data: {
                actorRole: item.actorRole,
                actorId: item.actorId,
                action: item.action,
                resource: item.resource,
                endpoint: item.endpoint,
                requestId: item.requestId,
                latencyMs: item.latencyMs,
                statusCode: item.statusCode,
                metadata: (item.metadata as Prisma.InputJsonValue | undefined),
            },
        })

        return {
            ...item,
            id: created.id,
            timestamp: created.timestamp.toISOString(),
        }
    } catch {
        return item
    }
}

export async function getAuditLogs(limit = 100, role?: AuditRecord["actorRole"]) {
    if (!hasDatabaseUrl()) {
        return fallbackAuditStore()
            .filter((item) => (!role ? true : item.actorRole === role))
            .slice(0, Math.max(1, Math.min(500, limit)))
    }

    try {
        const rows = await prismaAny.auditLog.findMany({
            where: role ? { actorRole: role } : undefined,
            orderBy: { timestamp: "desc" },
            take: Math.max(1, Math.min(500, limit)),
        })

        return rows.map((row: any) => ({
            id: row.id,
            timestamp: row.timestamp.toISOString(),
            actorRole: row.actorRole as AuditRecord["actorRole"],
            actorId: row.actorId || undefined,
            action: row.action,
            resource: row.resource,
            endpoint: row.endpoint || undefined,
            requestId: row.requestId || undefined,
            latencyMs: row.latencyMs || undefined,
            statusCode: row.statusCode || undefined,
            metadata: (row.metadata as Record<string, unknown> | null) || undefined,
        }))
    } catch {
        return fallbackAuditStore()
            .filter((item) => (!role ? true : item.actorRole === role))
            .slice(0, Math.max(1, Math.min(500, limit)))
    }
}
