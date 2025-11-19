"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Languages, CheckCircle, Sparkles, Globe } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"

const languages = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    icon: "🌐",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिंदी",
    icon: "🇮🇳",
    gradient: "from-orange-500 to-orange-600",
  },
  {
    code: "or",
    name: "Odia",
    nativeName: "ଓଡ଼ିଆ",
    icon: "📿",
    gradient: "from-emerald-500 to-emerald-600",
  },
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    icon: "🎨",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    icon: "🎭",
    gradient: "from-pink-500 to-pink-600",
  },
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    icon: "🏛️",
    gradient: "from-red-500 to-red-600",
  },
  {
    code: "mr",
    name: "Marathi",
    nativeName: "मराठी",
    icon: "⚡",
    gradient: "from-amber-500 to-amber-600",
  },
  {
    code: "gu",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    icon: "🪔",
    gradient: "from-teal-500 to-teal-600",
  },
]

export default function LanguageSelection() {
  const router = useRouter()
  const { setLanguage } = useLanguage()
  const [selectedLang, setSelectedLang] = useState<string>("")

  const handleLanguageSelect = (code: string) => {
    setSelectedLang(code)
    setLanguage(code)
    setTimeout(() => {
      router.push("/role-select")
    }, 400)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm/5 via-care/10 to-trust/5 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-warm via-care to-trust rounded-3xl shadow-2xl mb-6 animate-pulse">
            <Globe className="w-12 h-12 text-white" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-warm via-care to-trust bg-clip-text text-transparent">
                SehatSaheli
              </h1>
              <Sparkles className="w-8 h-8 text-care animate-pulse" />
            </div>
            <p className="text-3xl md:text-4xl font-semibold text-foreground">Choose Your Language</p>
            <p className="text-xl text-muted-foreground">अपनी भाषा चुनें • ভাষা নির্বাচন করুন • మీ భాష ఎంచుకోండి</p>
          </div>

          <Card className="inline-block px-6 py-3 bg-secondary/50 border-warm/20 shadow-lg">
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-warm" />
              <p className="text-sm font-medium text-muted-foreground">
                Supporting 8+ Indian languages with AI voice assistance
              </p>
            </div>
          </Card>
        </div>

        {/* Language Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className={`relative h-40 rounded-2xl overflow-hidden group transition-all duration-300 ${
                selectedLang === lang.code
                  ? "ring-4 ring-warm shadow-2xl scale-105"
                  : "hover:scale-105 hover:shadow-xl ring-1 ring-border"
              } bg-card`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-background to-secondary/30" />

              <div className="relative h-full flex flex-col items-center justify-center gap-3 p-4">
                <div
                  className={`text-5xl transition-transform ${
                    selectedLang === lang.code ? "scale-110" : "group-hover:scale-110"
                  }`}
                >
                  {lang.icon}
                </div>
                <div className="text-center space-y-1">
                  <span className="text-lg font-bold text-foreground block">{lang.nativeName}</span>
                  <span className="text-xs text-muted-foreground">{lang.name}</span>
                </div>

                {selectedLang === lang.code && (
                  <div className="absolute top-3 right-3">
                    <div className="w-8 h-8 bg-warm rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
              </div>

              <div
                className={`absolute inset-0 bg-gradient-to-br ${lang.gradient} opacity-0 group-hover:opacity-5 transition-opacity ${
                  selectedLang === lang.code ? "opacity-5" : ""
                }`}
              />
            </button>
          ))}
        </div>

        {/* Footer Text */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-warm/10 to-care/10 rounded-full">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <p className="text-sm font-medium text-foreground">Your health companion in your language</p>
          </div>
          <p className="text-sm text-muted-foreground">
            आपकी भाषा में आपका स्वास्थ्य साथी • ভাষায় আপনার স্বাস্থ্য সঙ্গী • మీ భాషలో మీ ఆరోగ్య సహాయకురాలు
          </p>
        </div>
      </div>
    </div>
  )
}
