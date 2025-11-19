'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Utensils, Leaf, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLanguage } from '@/lib/language-context'

export default function NutritionPlannerPage() {
  const router = useRouter()
  const { content } = useLanguage()
  const [trimester, setTrimester] = useState('2nd')
  const [budget, setBudget] = useState('low')
  const [foodPreference, setFoodPreference] = useState('vegetarian')

  const mealPlans: Record<string, Record<string, any>> = {
    '1st': {
      vegetarian: {
        breakfast: '🥛 Milk with oats, toast with ghee, banana',
        lunch: '🥗 Dal chawal, seasonal vegetables, yogurt',
        snack: '🥜 Peanut butter, almonds, dates',
        dinner: '🥣 Light soup, bread, cucumber salad'
      },
      nonVegetarian: {
        breakfast: '🥛 Milk, egg scramble, whole wheat toast',
        lunch: '🍗 Chicken curry with rice, greens',
        snack: '🥚 Boiled eggs, almonds',
        dinner: '🐟 Fish with vegetables, rice'
      }
    },
    '2nd': {
      vegetarian: {
        breakfast: '🥛 Milk with fortified cereal, banana',
        lunch: '🥗 Lentil curry, brown rice, leafy greens',
        snack: '🥑 Avocado, almonds, dried fruits',
        dinner: '🥕 Vegetable soup, whole wheat bread'
      },
      nonVegetarian: {
        breakfast: '🥛 Milk, omelette with veggies',
        lunch: '🍗 Lean meat, vegetables, brown rice',
        snack: '🥚 Eggs, nuts, seeds',
        dinner: '🐟 Fish curry, whole wheat bread'
      }
    },
    '3rd': {
      vegetarian: {
        breakfast: '🥛 Milk with almonds, whole grain bread',
        lunch: '🥗 Dal, seasonal vegetables, rice, curd',
        snack: '🌽 Corn, nuts, date shake',
        dinner: '🥕 Mixed vegetable curry, roti'
      },
      nonVegetarian: {
        breakfast: '🥛 Milk, eggs, whole grain toast',
        lunch: '🍗 Chicken with greens, rice',
        snack: '🥚 Boiled eggs, nuts',
        dinner: '🐟 Fish or lean meat with vegetables'
      }
    }
  }

  const ironRichFoods = [
    '🥬 Spinach', '🍅 Tomatoes', '🥛 Milk', '🥚 Eggs', 
    '🌾 Whole grains', '🫘 Lentils', '🥬 Leafy greens'
  ]

  const plan = mealPlans[trimester]?.[foodPreference] || mealPlans['2nd'].vegetarian

  return (
    <div className="min-h-screen bg-gradient-to-br from-success/10 via-care/5 to-background">
      <div className="sticky top-0 bg-gradient-to-r from-success to-accent p-6 text-white z-10">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" className="text-white" onClick={() => router.back()}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-3xl font-bold">Nutrition Planner</h1>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Preferences */}
        <Card className="p-6 bg-white">
          <h2 className="text-xl font-bold mb-4">Your Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Trimester:</label>
              <div className="flex gap-2">
                {['1st', '2nd', '3rd'].map(t => (
                  <Button
                    key={t}
                    onClick={() => setTrimester(t)}
                    className={trimester === t ? 'bg-success text-white' : 'bg-success/10 text-foreground'}
                    variant={trimester === t ? 'default' : 'outline'}
                  >
                    {t} Trimester
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Food Preference:</label>
              <div className="flex gap-2">
                {['vegetarian', 'nonVegetarian'].map(pref => (
                  <Button
                    key={pref}
                    onClick={() => setFoodPreference(pref)}
                    className={foodPreference === pref ? 'bg-accent text-white' : 'bg-accent/10 text-foreground'}
                    variant={foodPreference === pref ? 'default' : 'outline'}
                  >
                    {pref === 'vegetarian' ? '🥗 Vegetarian' : '🍗 Non-Veg'}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Weekly Meal Plan */}
        <Card className="p-6 bg-gradient-to-br from-success/5 to-accent/5 border-success/20">
          <div className="flex items-center gap-3 mb-4">
            <Utensils className="w-6 h-6 text-success" />
            <h2 className="text-2xl font-bold">Weekly Meal Plan</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(plan).map(([meal, item]) => (
              <div key={meal} className="bg-white p-4 rounded-lg">
                <p className="font-semibold text-foreground capitalize mb-2">{meal}</p>
                <p className="text-foreground/80">{item}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Iron-Rich Foods */}
        <Card className="p-6 bg-gradient-to-br from-alert/5 to-alert/10 border-alert/20">
          <div className="flex items-center gap-3 mb-4">
            <Leaf className="w-6 h-6 text-alert" />
            <h2 className="text-2xl font-bold">Iron-Rich Foods</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ironRichFoods.map(food => (
              <div key={food} className="bg-white p-3 rounded-lg text-center font-semibold text-foreground">
                {food}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">💡 Tip: Combine iron-rich foods with vitamin C for better absorption</p>
        </Card>

        {/* Nutrition Checklist */}
        <Card className="p-6 bg-gradient-to-br from-trust/5 to-trust/10 border-trust/20">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-trust" />
            <h2 className="text-2xl font-bold">Daily Checklist</h2>
          </div>
          <div className="space-y-3">
            {['✓ Drink 2-3 liters water', '✓ Take iron tablets', '✓ Eat protein at every meal', 
              '✓ Include calcium-rich foods', '✓ Eat fresh vegetables', '✓ Limit spicy foods'].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <input type="checkbox" className="w-5 h-5" />
                <span className="text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
