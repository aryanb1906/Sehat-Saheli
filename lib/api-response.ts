import { NextResponse } from "next/server"

export type ApiErrorCode =
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "BAD_REQUEST"
    | "TOO_MANY_REQUESTS"
    | "NOT_FOUND"
    | "INTERNAL_ERROR"

export function ok<T>(data: T, init?: ResponseInit) {
    return NextResponse.json(data, { status: 200, ...(init || {}) })
}

export function fail(code: ApiErrorCode, message: string, status: number, init?: ResponseInit) {
    return NextResponse.json(
        {
            success: false,
            error: {
                code,
                message,
            },
        },
        { status, ...(init || {}) },
    )
}

export function failUnauthorized(message = "Authentication required") {
    return fail("UNAUTHORIZED", message, 401)
}

export function failForbidden(message = "Not allowed to access this resource") {
    return fail("FORBIDDEN", message, 403)
}

export function failBadRequest(message = "Invalid request") {
    return fail("BAD_REQUEST", message, 400)
}

export function failTooManyRequests(message = "Too many requests", retryAfterSeconds?: number) {
    return fail("TOO_MANY_REQUESTS", message, 429, {
        headers: retryAfterSeconds ? { "Retry-After": String(retryAfterSeconds) } : undefined,
    })
}

export function failNotFound(message = "Resource not found") {
    return fail("NOT_FOUND", message, 404)
}

export function failInternal(message = "Internal server error") {
    return fail("INTERNAL_ERROR", message, 500)
}
