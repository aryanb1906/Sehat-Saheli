import { NextResponse } from "next/server"
import { auth } from "@/auth"

export default auth((req) => {
    const isProtected =
        req.nextUrl.pathname.startsWith("/mother") ||
        req.nextUrl.pathname.startsWith("/asha") ||
        req.nextUrl.pathname.startsWith("/doctor")

    if (!isProtected) return NextResponse.next()

    if (!req.auth?.user) {
        const signInUrl = new URL("/auth/signin", req.nextUrl.origin)
        signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
        return NextResponse.redirect(signInUrl)
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/mother/:path*", "/asha/:path*", "/doctor/:path*"],
}
