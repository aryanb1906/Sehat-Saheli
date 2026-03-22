"use client"

import type React from "react"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/lib/language-context"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <LanguageProvider>{children}</LanguageProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
