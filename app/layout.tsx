import type React from "react"
import type { Metadata, Viewport } from "next"
import { Nunito, Lora } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { AppProviders } from "@/components/app-providers"
import { GuestModeBanner } from "@/components/guest-mode-banner"
import { OfflineSyncStatusWidget } from "@/components/offline-sync-status"
import { PwaRegister } from "@/components/pwa-register"
import { VoiceAssistWidget } from "@/components/voice-assist-widget"
import { WebVitals } from "@/components/web-vitals"
import "./globals.css"

const nunito = Nunito({ 
  subsets: ["latin"],
  variable: "--font-sans"
})

const lora = Lora({ 
  subsets: ["latin"],
  variable: "--font-serif"
})

export const viewport: Viewport = {
  themeColor: "#ffc2cd",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

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
      <body className={`${nunito.variable} ${lora.variable} font-sans antialiased bg-background text-foreground`} suppressHydrationWarning>
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
