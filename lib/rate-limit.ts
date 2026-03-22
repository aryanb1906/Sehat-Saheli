const buckets = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, limit: number, windowMs: number) {
    const now = Date.now()
    const current = buckets.get(key)

    if (!current || current.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + windowMs })
        return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
    }

    if (current.count >= limit) {
        return { allowed: false, remaining: 0, resetAt: current.resetAt }
    }

    current.count += 1
    buckets.set(key, current)
    return { allowed: true, remaining: limit - current.count, resetAt: current.resetAt }
}

export function clientIp(req: Request) {
    const forwarded = req.headers.get("x-forwarded-for")
    if (forwarded) return forwarded.split(",")[0].trim()
    return "unknown"
}
