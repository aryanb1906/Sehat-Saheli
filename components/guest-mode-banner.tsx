"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

function readGuestCookie() {
    if (typeof document === "undefined") return false
    return document.cookie.split(";").some((part) => part.trim() === "sehat_guest=1")
}

export function GuestModeBanner() {
    const router = useRouter()
    const pathname = usePathname()
    const [isGuest, setIsGuest] = useState(false)

    useEffect(() => {
        setIsGuest(readGuestCookie())
    }, [pathname])

    const hiddenOnRoute = useMemo(() => pathname.startsWith("/auth"), [pathname])
    if (!isGuest || hiddenOnRoute) return null

    const callbackUrl = encodeURIComponent(pathname || "/role-select")

    return (
        <div className="sticky top-0 z-50 px-3 pt-2 md:px-5">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-xl border border-warm/25 bg-gradient-to-r from-warm/15 to-care/15 px-4 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/85 md:px-5">
                <p className="text-sm font-medium text-foreground">
                    Guest Mode is active. Your data may not be saved permanently.
                </p>
                <Button
                    size="sm"
                    className="shrink-0"
                    onClick={() => {
                        document.cookie = "sehat_guest=; path=/; max-age=0; SameSite=Lax"
                        router.push(`/auth/signin?callbackUrl=${callbackUrl}`)
                    }}
                >
                    Sign In for Permanent Account
                </Button>
            </div>
        </div>
    )
}
