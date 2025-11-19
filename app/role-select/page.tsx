"use client"

import { useRouter } from "next/navigation"
import { Heart, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"

export default function RoleSelect() {
  const router = useRouter()
  const { content } = useLanguage()

  const selectRole = (role: "mother" | "asha") => {
    localStorage.setItem("userRole", role)
    localStorage.setItem("demoRole", role)
    router.push(`/${role}`)
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
            className="h-auto p-0 overflow-hidden group bg-white hover:bg-white/95 border-0"
          >
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-warm to-care rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Heart className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">{content.iAmMother}</h2>
              <p className="text-muted-foreground">{content.motherDescription}</p>
            </div>
          </Button>

          <Button
            onClick={() => selectRole("asha")}
            className="h-auto p-0 overflow-hidden group bg-white hover:bg-white/95 border-0"
          >
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-trust to-accent rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">{content.iAmASHA}</h2>
              <p className="text-muted-foreground">{content.ashaDescription}</p>
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}
