"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { ArrowLeft, Apple, Carrot, Fish, Milk, Wheat, Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/lib/language-context"

export default function NutritionTracker() {
  const router = useRouter()
  const { content } = useLanguage()
  const [meals, setMeals] = useState([
    { id: 1, name: "Breakfast", items: ["Milk", "Bread"], time: "8:00 AM", calories: 350 },
    { id: 2, name: "Lunch", items: ["Rice", "Dal", "Vegetables"], time: "1:00 PM", calories: 550 },
  ])

  const [dailyIntake] = useState({
    calories: 900,
    protein: 45,
    iron: 12,
    calcium: 800,
  })

  const targets = {
    calories: 2400,
    protein: 70,
    iron: 27,
    calcium: 1200,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-trust/5 to-background">
      <div className="bg-gradient-to-r from-success to-trust p-6 text-white">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Nutrition Tracker</h1>
            <p className="text-white/80 text-sm">Track your daily nutrition intake</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <Card className="p-6 bg-gradient-to-br from-success/10 to-trust/10 border-2">
          <h2 className="text-lg font-semibold mb-4">Daily Nutrition Goals</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Calories</span>
                <span className="text-sm text-muted-foreground">
                  {dailyIntake.calories}/{targets.calories} kcal
                </span>
              </div>
              <Progress value={(dailyIntake.calories / targets.calories) * 100} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Protein</span>
                <span className="text-sm text-muted-foreground">
                  {dailyIntake.protein}/{targets.protein}g
                </span>
              </div>
              <Progress value={(dailyIntake.protein / targets.protein) * 100} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Iron</span>
                <span className="text-sm text-muted-foreground">
                  {dailyIntake.iron}/{targets.iron}mg
                </span>
              </div>
              <Progress value={(dailyIntake.iron / targets.iron) * 100} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Calcium</span>
                <span className="text-sm text-muted-foreground">
                  {dailyIntake.calcium}/{targets.calcium}mg
                </span>
              </div>
              <Progress value={(dailyIntake.calcium / targets.calcium) * 100} className="h-2" />
            </div>
          </div>
        </Card>

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Today's Meals</h2>
          <Button className="bg-success hover:bg-success/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Meal
          </Button>
        </div>

        <div className="space-y-4">
          {meals.map((meal) => (
            <Card key={meal.id} className="p-4 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{meal.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {meal.time}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {meal.items.map((item, idx) => (
                      <Badge key={idx} className="bg-trust/10 text-trust hover:bg-trust/20">
                        {item}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{meal.calories} calories</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 bg-gradient-to-br from-accent/10 to-success/10 border-2">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Apple className="w-5 h-5 text-success" />
            Recommended Foods
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
              <Milk className="w-5 h-5 text-trust" />
              <span className="text-sm">Dairy Products</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
              <Carrot className="w-5 h-5 text-warn" />
              <span className="text-sm">Green Vegetables</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
              <Fish className="w-5 h-5 text-accent" />
              <span className="text-sm">Protein Rich</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
              <Wheat className="w-5 h-5 text-warn" />
              <span className="text-sm">Whole Grains</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
