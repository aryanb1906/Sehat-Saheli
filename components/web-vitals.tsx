"use client"

import { useReportWebVitals } from "next/web-vitals"

export function WebVitals() {
    useReportWebVitals((metric) => {
        // Keep this lightweight; replace with Sentry/Mixpanel in production.
        if (process.env.NODE_ENV !== "production") {
            console.log("[WebVitals]", metric.name, metric.value)
        }
    })

    return null
}
