const REQUIRED_IN_PROD = ["DATABASE_URL", "AUTH_SECRET"]

export function getEnv(name: string, fallback = "") {
    const value = process.env[name]
    if (value == null || value === "") return fallback
    return value
}

export function assertCriticalEnv() {
    if (process.env.NODE_ENV !== "production") return

    const hasAuthSecret = Boolean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET)
    const missing = REQUIRED_IN_PROD.filter((k) => {
        if (k === "AUTH_SECRET") return !hasAuthSecret
        return !process.env[k]
    })
    if (missing.length > 0) {
        throw new Error(`Missing required env vars: ${missing.join(", ")}`)
    }
}

export function getAuthSecret() {
    return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || ""
}

export function hasRedisRateLimitConfig() {
    return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

export function hasDatabaseUrl() {
    return Boolean(process.env.DATABASE_URL)
}
