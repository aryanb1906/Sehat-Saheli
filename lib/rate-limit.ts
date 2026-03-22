import { Redis } from "@upstash/redis"
import { hasRedisRateLimitConfig } from "@/lib/env"

const buckets = new Map<string, { count: number; resetAt: number }>()

let redisClient: Redis | null = null

function getRedisClient() {
    if (!hasRedisRateLimitConfig()) return null
    if (!redisClient) {
        redisClient = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL!,
            token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        })
    }
    return redisClient
}

async function inMemoryRateLimit(key: string, limit: number, windowMs: number) {
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

export async function rateLimit(key: string, limit: number, windowMs: number) {
    const redis = getRedisClient()
    if (!redis) {
        return inMemoryRateLimit(key, limit, windowMs)
    }

    const count = await redis.incr(key)
    if (count === 1) {
        await redis.pexpire(key, windowMs)
    }

    const ttl = await redis.pttl(key)
    const resetAt = Date.now() + Math.max(0, Number(ttl))
    const allowed = Number(count) <= limit

    return {
        allowed,
        remaining: allowed ? Math.max(0, limit - Number(count)) : 0,
        resetAt,
    }
}

export function clientIp(req: Request) {
    const forwarded = req.headers.get("x-forwarded-for")
    if (forwarded) return forwarded.split(",")[0].trim()
    return "unknown"
}
