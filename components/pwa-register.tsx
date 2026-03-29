"use client"

import { useEffect } from "react"

export function PwaRegister() {
    useEffect(() => {
        if (typeof window === "undefined" || !("serviceWorker" in navigator)) return

        const manageServiceWorker = async () => {
            if (process.env.NODE_ENV !== "production") {
                // In local dev, always remove old SW/caches to avoid stale blank pages.
                const registrations = await navigator.serviceWorker.getRegistrations()
                await Promise.all(registrations.map((registration) => registration.unregister()))

                if ("caches" in window) {
                    const cacheKeys = await caches.keys()
                    await Promise.all(cacheKeys.map((key) => caches.delete(key)))
                }
                return
            }

            await navigator.serviceWorker.register("/sw.js")
        }

        void manageServiceWorker().catch(() => {
            // Non-blocking: app should continue even if SW handling fails.
        })
    }, [])

    return null
}
