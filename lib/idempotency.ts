type CachedResponse = {
    status: number
    body: unknown
    createdAt: number
}

declare global {
    // eslint-disable-next-line no-var
    var __idempotencyCache: Record<string, CachedResponse> | undefined
}

const DEFAULT_TTL_MS = 5 * 60 * 1000

function getStore() {
    if (!global.__idempotencyCache) global.__idempotencyCache = {}
    return global.__idempotencyCache
}

export function readIdempotent(key: string, ttlMs = DEFAULT_TTL_MS): CachedResponse | null {
    const store = getStore()
    const value = store[key]
    if (!value) return null
    if (Date.now() - value.createdAt > ttlMs) {
        delete store[key]
        return null
    }
    return value
}

export function writeIdempotent(key: string, status: number, body: unknown) {
    const store = getStore()
    store[key] = {
        status,
        body,
        createdAt: Date.now(),
    }
}
