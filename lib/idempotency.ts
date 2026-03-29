type CachedResponse = {
    status: number
    body: unknown
    createdAt: number
}

import { prisma } from "@/lib/prisma"
import { hasDatabaseUrl } from "@/lib/env"

const prismaAny = prisma as any

declare global {
    // eslint-disable-next-line no-var
    var __idempotencyCache: Record<string, CachedResponse> | undefined
}

const DEFAULT_TTL_MS = 5 * 60 * 1000

function canUseMemoryFallback() {
    return process.env.NODE_ENV !== "production"
}

function getStore() {
    if (!global.__idempotencyCache) global.__idempotencyCache = {}
    return global.__idempotencyCache
}

export async function readIdempotent(key: string, ttlMs = DEFAULT_TTL_MS): Promise<CachedResponse | null> {
    if (hasDatabaseUrl()) {
        try {
            const row = await prismaAny.idempotencyRecord.findUnique({ where: { key } })
            if (!row) return null
            if (new Date(row.expiresAt).getTime() <= Date.now()) {
                await prismaAny.idempotencyRecord.delete({ where: { key } }).catch(() => { })
                return null
            }
            return {
                status: row.statusCode,
                body: row.response,
                createdAt: new Date(row.createdAt).getTime(),
            }
        } catch {
            if (!canUseMemoryFallback()) {
                throw new Error("Idempotency store unavailable in production")
            }
        }
    }

    const store = getStore()
    const value = store[key]
    if (!value) return null
    if (Date.now() - value.createdAt > ttlMs) {
        delete store[key]
        return null
    }
    return value
}

export async function writeIdempotent(key: string, status: number, body: unknown, ttlMs = DEFAULT_TTL_MS) {
    if (hasDatabaseUrl()) {
        try {
            await prismaAny.idempotencyRecord.upsert({
                where: { key },
                update: {
                    statusCode: status,
                    response: body,
                    expiresAt: new Date(Date.now() + ttlMs),
                },
                create: {
                    key,
                    userId: "system",
                    endpoint: "idempotent",
                    method: "POST",
                    statusCode: status,
                    response: body,
                    expiresAt: new Date(Date.now() + ttlMs),
                },
            })
            return
        } catch {
            if (!canUseMemoryFallback()) {
                throw new Error("Idempotency store unavailable in production")
            }
        }
    }

    const store = getStore()
    store[key] = {
        status,
        body,
        createdAt: Date.now(),
    }
}
