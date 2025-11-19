"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getContent, type LanguageContent } from "./multilingual-content"

interface LanguageContextType {
  language: string
  content: LanguageContent
  setLanguage: (lang: string) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>("en")
  const [content, setContent] = useState<LanguageContent>(getContent("en"))

  useEffect(() => {
    // Load language from localStorage on mount
    const savedLanguage = localStorage.getItem("selectedLanguage")
    if (savedLanguage) {
      setLanguageState(savedLanguage)
      setContent(getContent(savedLanguage))
    }
  }, [])

  const setLanguage = (lang: string) => {
    setLanguageState(lang)
    setContent(getContent(lang))
    localStorage.setItem("selectedLanguage", lang)
  }

  return <LanguageContext.Provider value={{ language, content, setLanguage }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
