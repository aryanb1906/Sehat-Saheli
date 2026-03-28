"use client"

type MutatingMethod = "POST" | "PUT" | "PATCH" | "DELETE"

type QueuedRequest = {
    id: string
    url: string
    method: MutatingMethod
    headers: Record<string, string>
    body: string | null
    createdAt: string
    retries: number
}

type SyncConflict = {
    id: string
    request: QueuedRequest
    reason: string
    endpointType: "emergency" | "tasks" | "referrals" | "general"
    createdAt: string
}

export type OfflineSyncStatus = {
    online: boolean
    queuedCount: number
    isSyncing: boolean
    conflictsCount: number
    lastSyncAt: string | null
    lastError: string | null
}

const QUEUE_KEY = "sehat-offline-write-queue"
const CONFLICTS_KEY = "sehat-offline-sync-conflicts"
const LAST_SYNC_KEY = "sehat-offline-last-sync"
const STATUS_EVENT = "sehat-offline-sync-status"
const MUTATING_METHODS = new Set<MutatingMethod>(["POST", "PUT", "PATCH", "DELETE"])

let initialized = false
let originalFetch: typeof window.fetch | null = null
let isSyncing = false
let lastError: string | null = null

function endpointTypeFromUrl(url: string): "emergency" | "tasks" | "referrals" | "general" {
    if (url.includes("/api/emergency")) return "emergency"
    if (url.includes("/api/asha-tasks")) return "tasks"
    if (url.includes("/api/referrals")) return "referrals"
    return "general"
}

function retryPolicy(url: string) {
    const endpointType = endpointTypeFromUrl(url)
    if (endpointType === "emergency") return { maxRetries: 5, backoffMs: 3000 }
    if (endpointType === "tasks") return { maxRetries: 4, backoffMs: 5000 }
    if (endpointType === "referrals") return { maxRetries: 4, backoffMs: 5000 }
    return { maxRetries: 3, backoffMs: 8000 }
}

function safeParse<T>(value: string | null, fallback: T): T {
    if (!value) return fallback
    try {
        return JSON.parse(value) as T
    } catch {
        return fallback
    }
}

function readQueue(): QueuedRequest[] {
    if (typeof window === "undefined") return []
    return safeParse<QueuedRequest[]>(window.localStorage.getItem(QUEUE_KEY), [])
}

function writeQueue(queue: QueuedRequest[]) {
    if (typeof window === "undefined") return
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

function readConflicts(): SyncConflict[] {
    if (typeof window === "undefined") return []
    return safeParse<SyncConflict[]>(window.localStorage.getItem(CONFLICTS_KEY), [])
}

function writeConflicts(conflicts: SyncConflict[]) {
    if (typeof window === "undefined") return
    window.localStorage.setItem(CONFLICTS_KEY, JSON.stringify(conflicts))
}

function saveLastSync(timestamp: string) {
    if (typeof window === "undefined") return
    window.localStorage.setItem(LAST_SYNC_KEY, timestamp)
}

function getLastSync(): string | null {
    if (typeof window === "undefined") return null
    return window.localStorage.getItem(LAST_SYNC_KEY)
}

function emitStatus() {
    if (typeof window === "undefined") return
    window.dispatchEvent(new CustomEvent(STATUS_EVENT, { detail: getOfflineSyncStatus() }))
}

function isApiMutation(url: string, method: string) {
    if (!MUTATING_METHODS.has(method as MutatingMethod)) return false

    try {
        const resolved = new URL(url, window.location.origin)
        return resolved.origin === window.location.origin && resolved.pathname.startsWith("/api/")
    } catch {
        return false
    }
}

function buildQueuedResponse(id: string) {
    return new Response(
        JSON.stringify({
            queued: true,
            requestId: id,
            message: "Request saved offline and will sync automatically.",
        }),
        {
            status: 202,
            headers: {
                "Content-Type": "application/json",
                "x-offline-queued": "1",
            },
        },
    )
}

async function toQueuedRequest(request: Request): Promise<QueuedRequest> {
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
        headers[key] = value
    })

    let body: string | null = null
    if (request.method !== "GET" && request.method !== "HEAD") {
        try {
            body = await request.clone().text()
            if (body === "") body = null
        } catch {
            body = null
        }
    }

    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        url: request.url,
        method: request.method as MutatingMethod,
        headers,
        body,
        createdAt: new Date().toISOString(),
        retries: 0,
    }
}

function enqueueRequest(item: QueuedRequest) {
    const queue = readQueue()
    queue.push(item)
    writeQueue(queue)
    emitStatus()
}

function markConflict(item: QueuedRequest, reason: string) {
    const conflicts = readConflicts()
    conflicts.push({
        id: `${item.id}-conflict`,
        request: item,
        reason,
        endpointType: endpointTypeFromUrl(item.url),
        createdAt: new Date().toISOString(),
    })
    writeConflicts(conflicts)
    emitStatus()
}

export function clearOfflineSyncConflicts() {
    writeConflicts([])
    emitStatus()
}

export function getOfflineSyncConflicts() {
    return readConflicts().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function resolveOfflineSyncConflict(id: string, action: "drop" | "retry") {
    const conflicts = readConflicts()
    const target = conflicts.find((entry) => entry.id === id)
    const next = conflicts.filter((entry) => entry.id !== id)
    writeConflicts(next)

    if (target && action === "retry") {
        const queue = readQueue()
        queue.unshift({ ...target.request, retries: 0 })
        writeQueue(queue)
    }

    emitStatus()
}

export function getOfflineSyncStatus(): OfflineSyncStatus {
    const queue = readQueue()
    const conflicts = readConflicts()
    return {
        online: typeof navigator !== "undefined" ? navigator.onLine : true,
        queuedCount: queue.length,
        isSyncing,
        conflictsCount: conflicts.length,
        lastSyncAt: getLastSync(),
        lastError,
    }
}

export function subscribeOfflineSyncStatus(listener: (status: OfflineSyncStatus) => void) {
    if (typeof window === "undefined") return () => { }

    const handler = (event: Event) => {
        listener((event as CustomEvent<OfflineSyncStatus>).detail)
    }

    window.addEventListener(STATUS_EVENT, handler)
    listener(getOfflineSyncStatus())

    return () => {
        window.removeEventListener(STATUS_EVENT, handler)
    }
}

export async function flushOfflineQueue() {
    if (typeof window === "undefined" || !originalFetch || isSyncing || !navigator.onLine) {
        return
    }

    isSyncing = true
    lastError = null
    emitStatus()

    const pending = [...readQueue()]
    const nextQueue: QueuedRequest[] = []

    for (const item of pending) {
        try {
            const policy = retryPolicy(item.url)
            if (item.retries > 0) {
                await new Promise((resolve) => setTimeout(resolve, policy.backoffMs))
            }

            const response = await originalFetch(item.url, {
                method: item.method,
                headers: {
                    ...item.headers,
                    "x-offline-replay": "1",
                },
                body: item.body ?? undefined,
            })

            if (response.ok) {
                continue
            }

            if (response.status === 409) {
                markConflict(item, "Server conflict (HTTP 409). Please review this record.")
                continue
            }

            if (response.status >= 500 || response.status === 429) {
                if (item.retries + 1 >= policy.maxRetries) {
                    markConflict(item, `Retry budget exceeded (${policy.maxRetries})`)
                } else {
                    nextQueue.push({ ...item, retries: item.retries + 1 })
                }
                continue
            }

            markConflict(item, `Request failed with HTTP ${response.status}.`)
        } catch {
            // Network dropped again; keep the current and remaining items queued.
            nextQueue.push(item)
            const currentIndex = pending.findIndex((pendingItem) => pendingItem.id === item.id)
            nextQueue.push(...pending.slice(currentIndex + 1))
            break
        }
    }

    writeQueue(nextQueue)

    if (nextQueue.length === 0) {
        saveLastSync(new Date().toISOString())
    }

    isSyncing = false
    if (nextQueue.length > 0 && navigator.onLine) {
        lastError = "Some requests are still pending and will retry automatically"
    }
    emitStatus()
}

export function initOfflineSync() {
    if (typeof window === "undefined" || initialized) return

    initialized = true
    originalFetch = window.fetch.bind(window)

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        if (!originalFetch) {
            return fetch(input, init)
        }

        const request = input instanceof Request ? input : new Request(input, init)
        const method = request.method.toUpperCase()
        const isMutation = isApiMutation(request.url, method)

        if (!isMutation) {
            return originalFetch(input, init)
        }

        const queueAndReturn = async () => {
            const queued = await toQueuedRequest(request)
            enqueueRequest(queued)
            return buildQueuedResponse(queued.id)
        }

        if (!navigator.onLine) {
            return queueAndReturn()
        }

        try {
            const response = await originalFetch(input, init)
            if (response.status >= 500) {
                return queueAndReturn()
            }
            return response
        } catch {
            return queueAndReturn()
        }
    }

    window.addEventListener("online", () => {
        void flushOfflineQueue()
    })

    emitStatus()
}
