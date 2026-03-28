import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AppProviders } from "@/components/app-providers"
import { GuestModeBanner } from "@/components/guest-mode-banner"
import { OfflineSyncStatusWidget } from "@/components/offline-sync-status"
import { PwaRegister } from "@/components/pwa-register"
import { VoiceAssistWidget } from "@/components/voice-assist-widget"
import { WebVitals } from "@/components/web-vitals"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SehatSaheli - AI Maternal Health Companion",
  description: "Empowering Rural Women & ASHA Workers with Multilingual, Offline-first AI Support",
  keywords: ["maternal health", "ASHA", "AI health", "rural healthcare", "pregnancy tracking"],
  icons: {
    icon: [
      {
        url: "/heart_icon_down.svg",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/heart_icon_down.svg",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/heart_icon_down.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <AppProviders>
          <GuestModeBanner />
          {children}
          <OfflineSyncStatusWidget />
          <VoiceAssistWidget />
        </AppProviders>
        <PwaRegister />
        <WebVitals />
        <Analytics />
      </body>
    </html>
  )
}
