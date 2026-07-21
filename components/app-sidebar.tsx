"use client"

import { useRouter, usePathname } from 'next/navigation'
import { Home, Mic, BookOpen, Heart, Phone, Calendar, MessageCircle, Baby, Pill, TrendingUp, Users, BarChart3, LogOut, Utensils, Dumbbell, GraduationCap, FileText, Video, Share2, Zap, AlertTriangle, MapPin, Globe, HeartPulse } from 'lucide-react'
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
    { icon: Users, label: content.communitySupport, path: "/mother/community" },
    { icon: Baby, label: content.motherPregnancyTracker || "Pregnancy Tracker", path: "/mother/pregnancy-tracker" },
    { icon: Pill, label: content.motherMedications || "Medications", path: "/mother/medications" },
    { icon: TrendingUp, label: content.motherKickCounter || "Kick Counter", path: "/mother/kick-counter" },
    { icon: Utensils, label: content.motherNutritionTracker || "Nutrition Tracker", path: "/mother/nutrition" },
    { icon: Dumbbell, label: content.motherPregnancyExercises || "Pregnancy Exercises", path: "/mother/exercises" },
    { icon: FileText, label: content.motherMedicalRecords || "Medical Records", path: "/mother/medical-records" },
    { icon: TrendingUp, label: content.motherVitalSigns || "Vital Signs", path: "/mother/vital-signs" },
    { icon: Video, label: content.motherDoctorConsultation || "Doctor Consultation", path: "/mother/doctor-consultation" },
    { icon: Share2, label: content.motherFamilySharing || "Family Sharing", path: "/mother/family-sharing" },
    { icon: Zap, label: content.motherLaborSigns || "Labor Signs", path: "/mother/labor-signs" },
    { icon: Heart, label: content.motherBirthPlan || "Birth Plan", path: "/mother/birth-plan" },
    { icon: AlertTriangle, label: content.motherSOSEmergency || "SOS Emergency", path: "/mother/sos-emergency" },
    { icon: BookOpen, label: content.motherPregnancyJournal || "Pregnancy Journal", path: "/mother/pregnancy-journal" },
    { icon: MapPin, label: content.motherHospitalFinder || "Hospital Finder", path: "/mother/hospital-finder" },
  ]

  const ashaMenuItems = [
    { icon: Home, label: content.ashaDashboard, path: "/asha" },
    { icon: Users, label: content.myPatients, path: "/asha" },
    { icon: BarChart3, label: content.analyticsDashboard, path: "/asha/analytics" },
    { icon: GraduationCap, label: content.ashaTrainingModules || "Training Modules", path: "/asha/training" },
  ]

  const menuItems = role === "mother" ? motherMenuItems : ashaMenuItems

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 gap-0">
        <SheetHeader className="border-b border-border/70 pb-4">
          <SheetTitle className="flex items-center gap-2 text-2xl font-bold">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-warm to-care text-white shadow-sm">
              <HeartPulse className="h-5 w-5" />
            </span>
            <span className="bg-gradient-to-r from-trust to-accent bg-clip-text text-transparent">
              SehatSaheli
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 flex-1 space-y-1 overflow-y-auto px-1 pb-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                className={`h-12 w-full justify-start gap-3 rounded-xl text-base transition-all ${isActive
                    ? "bg-gradient-to-r from-trust to-accent text-white shadow-sm"
                    : "text-foreground/80 hover:text-foreground"
                  }`}
                onClick={() => handleNavigation(item.path)}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Button>
            )
          })}

          <div className="mt-4 space-y-1 border-t border-border/70 pt-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12 rounded-xl text-base border-trust/30 text-trust hover:bg-trust/10"
              onClick={() => handleNavigation("/")}
            >
              <Globe className="w-5 h-5" />
              <span>Landing Page Demo</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 rounded-xl text-base text-alert hover:text-alert hover:bg-alert/10"
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
