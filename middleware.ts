import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    const isGuest = req.cookies.get("sehat_guest")?.value === "1"
    const pathname = req.nextUrl.pathname
    const isMotherRoute = pathname.startsWith("/mother")
    const isAshaRoute = pathname.startsWith("/asha")
    const isDoctorRoute = pathname.startsWith("/doctor")
    const isAdminRoute = pathname.startsWith("/admin")
    const isProtected = isMotherRoute || isAshaRoute || isDoctorRoute || isAdminRoute

    if (!isProtected) {
        return NextResponse.next()
    }

    if (!token && !(isGuest && (isMotherRoute || isAshaRoute))) {
        const signInUrl = new URL("/auth/signin", req.nextUrl.origin)
        signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
        return NextResponse.redirect(signInUrl)
    }

    if (isGuest && (isDoctorRoute || isAdminRoute)) {
        const signInUrl = new URL("/auth/signin", req.nextUrl.origin)
        signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
        return NextResponse.redirect(signInUrl)
    }

    const role = (token as any)?.role as string | undefined

    if (token && isAshaRoute && role !== "ASHA" && role !== "DOCTOR") {
        return NextResponse.redirect(new URL("/", req.nextUrl.origin))
    }

    if (token && (isDoctorRoute || isAdminRoute) && role !== "DOCTOR") {
        return NextResponse.redirect(new URL("/", req.nextUrl.origin))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/mother/:path*", "/asha/:path*", "/doctor/:path*", "/admin/:path*"],
}
