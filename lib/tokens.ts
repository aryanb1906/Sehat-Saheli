import jwt from "jsonwebtoken"

const ACCESS_EXPIRES_IN = "15m"
const REFRESH_EXPIRES_IN = "30d"

function getSecret() {
    return process.env.AUTH_SECRET || "dev-secret-change-me"
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
