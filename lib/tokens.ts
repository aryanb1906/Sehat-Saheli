import jwt from "jsonwebtoken"
import { getAuthSecret } from "@/lib/env"

const ACCESS_EXPIRES_IN = "15m"
const REFRESH_EXPIRES_IN = "30d"

function getSecret() {
    const secret = getAuthSecret()
    if (!secret && process.env.NODE_ENV === "production") {
        throw new Error("AUTH_SECRET is required in production")
    }
    return secret || "dev-secret-change-me"
}

export function createAccessToken(payload: Record<string, unknown>) {
    return jwt.sign(payload, getSecret(), { expiresIn: ACCESS_EXPIRES_IN })
}

export function createRefreshToken(payload: Record<string, unknown>) {
    return jwt.sign(payload, getSecret(), { expiresIn: REFRESH_EXPIRES_IN })
}

export function verifyToken(token: string) {
    return jwt.verify(token, getSecret())
}
