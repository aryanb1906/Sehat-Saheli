import { NextResponse } from "next/server"

export type ApiErrorCode =
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "BAD_REQUEST"
    | "TOO_MANY_REQUESTS"
    | "NOT_FOUND"
    | "INTERNAL_ERROR"

function withRequestIdHeaders(init: ResponseInit | undefined, requestId?: string) {
    if (!requestId) return init || {}
    const headers = new Headers(init?.headers)
    headers.set("x-request-id", requestId)
    return { ...(init || {}), headers }
}

export function ok<T>(data: T, init?: ResponseInit) {
    return NextResponse.json(data, { status: 200, ...(init || {}) })
}

export function okWithRequestId<T extends Record<string, unknown>>(data: T, requestId: string, init?: ResponseInit) {
    return NextResponse.json(
        {
            success: true,
            requestId,
            ...data,
        },
        {
            status: 200,
            ...withRequestIdHeaders(init, requestId),
        },
    )
}

export function fail(code: ApiErrorCode, message: string, status: number, init?: ResponseInit, requestId?: string) {
    return NextResponse.json(
        {
            success: false,
            ...(requestId ? { requestId } : {}),
            error: {
                code,
                message,
            },
        },
        { status, ...withRequestIdHeaders(init, requestId) },
    )
}

export function failUnauthorized(message = "Authentication required", requestId?: string) {
    return fail("UNAUTHORIZED", message, 401, undefined, requestId)
}

export function failForbidden(message = "Not allowed to access this resource", requestId?: string) {
    return fail("FORBIDDEN", message, 403, undefined, requestId)
}

export function failBadRequest(message = "Invalid request", requestId?: string) {
    return fail("BAD_REQUEST", message, 400, undefined, requestId)
}

export function failTooManyRequests(message = "Too many requests", retryAfterSeconds?: number, requestId?: string) {
    return fail("TOO_MANY_REQUESTS", message, 429, {
        headers: retryAfterSeconds ? { "Retry-After": String(retryAfterSeconds) } : undefined,
    }, requestId)
}

export function failNotFound(message = "Resource not found", requestId?: string) {
    return fail("NOT_FOUND", message, 404, undefined, requestId)
}

export function failInternal(message = "Internal server error", requestId?: string) {
    return fail("INTERNAL_ERROR", message, 500, undefined, requestId)
}
