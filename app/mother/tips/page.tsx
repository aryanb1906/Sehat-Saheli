"use client"
import { useRouter } from "next/navigation"
import { ArrowLeft, Apple, Activity, Moon, Droplets, Baby, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/lib/language-context"

export default function HealthTips() {
  const router = useRouter()
  const { language, content } = useLanguage()

  const nutritionTips = content.tips || [
    "Eat iron-rich foods like spinach and lentils",
    "Include dairy products for calcium",
    "Consume fresh fruits and vegetables daily",
    "Take folic acid supplements as prescribed",
    "Avoid raw or undercooked food",
  ]

  const exerciseTips = [
    "Take gentle walks for 20-30 minutes daily if your doctor approves",
    "Practice prenatal yoga to strengthen your body and reduce stress",
    "Do pelvic floor exercises (Kegel) to prepare for delivery",
    "Avoid heavy lifting and strenuous activities",
    "Rest when you feel tired and listen to your body",
  ]

  const sleepTips = [
    "Sleep on your left side to improve blood flow to the baby",
    "Use pillows between your knees for comfort",
    "Establish a regular bedtime routine",
    "Avoid screens 1 hour before bedtime",
    "Take short naps during the day if needed",
  ]

  const hydrationTips = [
    "Keep a water bottle with you at all times",
    "Drink coconut water for natural electrolytes",
    "Limit caffeine and avoid alcohol completely",
    "Eat water-rich fruits like watermelon and cucumber",
    "Sip water frequently rather than drinking large amounts at once",
  ]

  const weeklyTips = [
    "Week 12: Baby is the size of a lime. All organs are forming!",
    "Week 20: You might feel the first kicks. Baby can hear sounds now.",
    "Week 28: Baby's eyes can open and close. Brain is developing rapidly.",
    "Week 36: Baby is getting ready for birth. Practice breathing exercises.",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-care/10 to-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-care to-warm p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{content.healthTipsTitle}</h1>
            <p className="text-white/80 text-sm">Expert advice for your pregnancy</p>
          </div>
          <div className="flex items-center gap-2 text-xs bg-white/20 px-3 py-1 rounded-full">
            <Globe className="w-3 h-3" />
            <span>{language.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="nutrition" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="exercise">Exercise</TabsTrigger>
            <TabsTrigger value="wellness">Wellness</TabsTrigger>
          </TabsList>

          <TabsContent value="nutrition" className="space-y-4">
            <Card className="p-5 bg-gradient-to-br from-success/10 to-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center">
                  <Apple className="w-6 h-6 text-success" />
                </div>
                <h2 className="text-xl font-bold">Nutrition Tips</h2>
              </div>
              <ul className="space-y-3">
                {nutritionTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-success mt-1 font-bold">{index + 1}.</span>
                    <span className="text-sm leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-trust/10 to-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-trust/20 rounded-full flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-trust" />
                </div>
                <h2 className="text-xl font-bold">Stay Hydrated</h2>
              </div>
              <ul className="space-y-3">
                {hydrationTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-trust mt-1 font-bold">{index + 1}.</span>
                    <span className="text-sm leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </TabsContent>

          <TabsContent value="exercise" className="space-y-4">
            <Card className="p-5 bg-gradient-to-br from-care/10 to-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-care/20 rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-care" />
                </div>
                <h2 className="text-xl font-bold">Exercise Safely</h2>
              </div>
              <ul className="space-y-3">
                {exerciseTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-care mt-1 font-bold">{index + 1}.</span>
                    <span className="text-sm leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5 bg-alert/10 border-alert">
              <p className="text-sm font-semibold text-center">
                ⚠️ Always consult your doctor before starting any exercise routine
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="wellness" className="space-y-4">
            <Card className="p-5 bg-gradient-to-br from-warm/10 to-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-warm/20 rounded-full flex items-center justify-center">
                  <Moon className="w-6 h-6 text-warm" />
                </div>
                <h2 className="text-xl font-bold">Sleep Well</h2>
              </div>
              <ul className="space-y-3">
                {sleepTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-warm mt-1 font-bold">{index + 1}.</span>
                    <span className="text-sm leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-care/10 to-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-care/20 rounded-full flex items-center justify-center">
                  <Baby className="w-6 h-6 text-care" />
                </div>
                <h2 className="text-xl font-bold">Week by Week</h2>
              </div>
              <ul className="space-y-3">
                {weeklyTips.map((tip, index) => (
                  <li key={index} className="p-3 bg-card rounded-lg border">
                    <span className="text-sm leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="p-5 mt-6 bg-gradient-to-br from-alert/10 to-card border-alert">
          <h2 className="text-xl font-bold mb-4">{content.emergencyTitle}</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-card rounded-lg">
              <span className="font-medium">{content.nationalEmergency}</span>
              <Button size="sm" className="bg-alert hover:bg-alert/90">
                {content.callNow}
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-card rounded-lg">
              <span className="font-medium">{content.ambulance}</span>
              <Button size="sm" className="bg-alert hover:bg-alert/90">
                {content.callNow}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
