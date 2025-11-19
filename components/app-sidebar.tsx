"use client"

import { useRouter, usePathname } from 'next/navigation'
import { Home, Mic, BookOpen, Heart, Phone, Calendar, MessageCircle, Baby, Pill, TrendingUp, Users, BarChart3, LogOut, Utensils, Dumbbell, GraduationCap, FileText, Video, Share2, Zap, AlertTriangle, MapPin } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface AppSidebarProps {
  isOpen: boolean
  onClose: () => void
  role: "mother" | "asha"
}

export function AppSidebar({ isOpen, onClose, role }: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { content } = useLanguage()

  const handleNavigation = (path: string) => {
    router.push(path)
    onClose()
  }

  const motherMenuItems = [
    { icon: Home, label: content.home, path: "/mother" },
    { icon: Mic, label: content.talkToSaheli, path: "/mother/talk" },
    { icon: BookOpen, label: content.myHealthLog, path: "/mother/health-log" },
    { icon: Heart, label: content.mentalHealth, path: "/mother/mental-health" },
    { icon: Phone, label: content.emergencyCall, path: "/mother/emergency" },
    { icon: Calendar, label: content.myAppointments, path: "/mother/appointments" },
    { icon: MessageCircle, label: content.healthTips, path: "/mother/tips" },
    { icon: Users, label: "Community Support", path: "/mother/community" },
    { icon: Baby, label: "Pregnancy Tracker", path: "/mother/pregnancy-tracker" },
    { icon: Pill, label: "Medications", path: "/mother/medications" },
    { icon: TrendingUp, label: "Kick Counter", path: "/mother/kick-counter" },
    { icon: Utensils, label: "Nutrition Tracker", path: "/mother/nutrition" },
    { icon: Dumbbell, label: "Pregnancy Exercises", path: "/mother/exercises" },
    { icon: FileText, label: "Medical Records", path: "/mother/medical-records" },
    { icon: TrendingUp, label: "Vital Signs", path: "/mother/vital-signs" },
    { icon: Video, label: "Doctor Consultation", path: "/mother/doctor-consultation" },
    { icon: Share2, label: "Family Sharing", path: "/mother/family-sharing" },
    { icon: Zap, label: "Labor Signs", path: "/mother/labor-signs" },
    { icon: Heart, label: "Birth Plan", path: "/mother/birth-plan" },
    { icon: AlertTriangle, label: "SOS Emergency", path: "/mother/sos-emergency" },
    { icon: BookOpen, label: "Pregnancy Journal", path: "/mother/pregnancy-journal" },
    { icon: MapPin, label: "Hospital Finder", path: "/mother/hospital-finder" },
  ]

  const ashaMenuItems = [
    { icon: Home, label: content.ashaDashboard, path: "/asha" },
    { icon: Users, label: content.myPatients, path: "/asha" },
    { icon: BarChart3, label: content.analyticsDashboard, path: "/asha/analytics" },
    { icon: GraduationCap, label: "Training Modules", path: "/asha/training" },
  ]

  const menuItems = role === "mother" ? motherMenuItems : ashaMenuItems

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-trust to-accent bg-clip-text text-transparent">
            SehatSaheli
          </SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-3 h-12 text-base ${
                  isActive ? "bg-gradient-to-r from-trust to-accent text-white" : ""
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Button>
            )
          })}

          <div className="pt-4 border-t mt-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 text-base text-alert hover:text-alert hover:bg-alert/10"
              onClick={() => handleNavigation("/")}
            >
              <LogOut className="w-5 h-5" />
              <span>{content.logout}</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
