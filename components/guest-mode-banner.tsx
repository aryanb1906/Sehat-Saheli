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
        <div className="fixed bottom-4 left-1/2 z-50 w-max -translate-x-1/2 animate-fade-up">
            <div className="flex items-center gap-3 rounded-full border border-white/70 bg-white/70 px-4 py-2 backdrop-blur-xl backdrop-saturate-[1.8] shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alert/80 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-alert drop-shadow-sm"></span>
                </span>
                <p className="text-[11px] font-bold tracking-wide uppercase text-alert/90">
                    Guest Mode • Unsaved
                </p>
                <Button
                    size="sm"
                    className="h-7 px-4 ml-1 text-[11px] tracking-wide shrink-0 rounded-full font-bold bg-alert text-white hover:bg-alert/90 hover:scale-105 active:scale-95 transition-all w-auto shadow-md shadow-alert/20"
                    onClick={() => {
                        document.cookie = "sehat_guest=; path=/; max-age=0; SameSite=Lax"
                        router.push(`/auth/signin?callbackUrl=${callbackUrl}`)
                    }}
                >
                    Sign In
                </Button>
            </div>
        </div>
    )
}
