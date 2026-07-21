"use client"

import { useRouter } from "next/navigation"
import { Heart, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { useAppStore } from "@/store/use-app-store"

export default function RoleSelect() {
  const router = useRouter()
  const { content } = useLanguage()
  const setUserRole = useAppStore((state) => state.setUserRole)

  const selectRole = (role: "mother" | "asha") => {
    const targetPath = `/${role}`
    setUserRole(role)
    localStorage.setItem("userRole", role)
    localStorage.setItem("demoRole", role)

    // Keep role-select usable in demo mode where users are not fully signed in.
    document.cookie = "sehat_guest=1; path=/; max-age=2592000; SameSite=Lax"

    router.push(targetPath)
    setTimeout(() => {
      if (window.location.pathname !== targetPath) {
        window.location.assign(targetPath)
      }
    }, 120)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm via-care to-trust flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{content.welcomeTo}</h1>
          <p className="text-xl text-white/90">{content.whoAreYou}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Button
            onClick={() => selectRole("mother")}
            type="button"
            className="h-auto p-0 overflow-hidden group bg-card hover:bg-card/95 border-0 whitespace-normal shadow-xl"
          >
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-warm to-care rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Heart className="w-12 h-12 text-white" />
              </div>
              <h2 className="mb-3 text-2xl font-bold text-foreground break-words">{content.iAmMother}</h2>
              <p className="max-w-[34ch] text-muted-foreground leading-relaxed break-words">{content.motherDescription}</p>
            </div>
          </Button>

          <Button
            onClick={() => selectRole("asha")}
            type="button"
            className="h-auto p-0 overflow-hidden group bg-card hover:bg-card/95 border-0 whitespace-normal shadow-xl"
          >
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-trust to-accent rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-12 h-12 text-white" />
              </div>
              <h2 className="mb-3 text-2xl font-bold text-foreground break-words">{content.iAmASHA}</h2>
              <p className="max-w-[34ch] text-muted-foreground leading-relaxed break-words">{content.ashaDescription}</p>
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}
