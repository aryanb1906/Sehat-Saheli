import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    const isGuest = req.cookies.get("sehat_guest")?.value === "1"
    const isProtected =
        req.nextUrl.pathname.startsWith("/mother") ||
        req.nextUrl.pathname.startsWith("/asha") ||
        req.nextUrl.pathname.startsWith("/doctor")

    if (!isProtected) {
        return NextResponse.next()
    }

    if (!token && !isGuest) {
        const signInUrl = new URL("/auth/signin", req.nextUrl.origin)
        signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
        return NextResponse.redirect(signInUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/mother/:path*", "/asha/:path*", "/doctor/:path*"],
}
