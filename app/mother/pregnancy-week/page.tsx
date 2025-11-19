'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Baby, Zap, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLanguage } from '@/lib/language-context'

export default function PregnancyWeekPage() {
  const router = useRouter()
  const { content } = useLanguage()
  const [week, setWeek] = useState(24)

  const weeklyData: Record<number, any> = {
    24: {
      babySize: 'Corn',
      babyWeight: '600g',
      babyLength: '30cm',
      growth: 'Baby can hear sounds, eyelids are forming',
      bodyChanges: 'Swollen feet, backache, increased energy',
      expectations: 'You may feel baby kicking, belly gets bigger',
      doctorTips: 'Stay hydrated, do light exercises, eat calcium-rich foods'
    },
    25: {
      babySize: 'Turnip',
      babyWeight: '660g',
      babyLength: '32cm',
      growth: 'Baby is developing taste buds, hair growing',
      bodyChanges: 'Possible varicose veins, leg cramps at night',
      expectations: 'Strong movements visible, mood swings normal',
      doctorTips: 'Elevate legs when sitting, eat iron-rich foods, regular checkups'
    },
    26: {
      babySize: 'Zucchini',
      babyWeight: '760g',
      babyLength: '35cm',
      growth: 'Baby can open eyes, fingerprints forming',
      bodyChanges: 'Braxton Hicks contractions may start',
      expectations: 'Feel baby hiccupping, movements increase',
      doctorTips: 'Practice breathing exercises, avoid stress, get rest'
    }
  }

  const data = weeklyData[week] || weeklyData[24]

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm/10 via-care/10 to-background">
      <div className="sticky top-0 bg-gradient-to-r from-warm to-care p-6 text-white z-10">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" className="text-white" onClick={() => router.back()}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-3xl font-bold">Week {week} of Pregnancy</h1>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Week Navigator */}
        <Card className="p-4 bg-gradient-to-r from-success/10 to-success/5 border-success/20">
          <label className="block text-sm font-semibold mb-3">Select Pregnancy Week:</label>
          <div className="flex gap-2 flex-wrap">
            {[24, 25, 26].map(w => (
              <Button
                key={w}
                onClick={() => setWeek(w)}
                className={`${week === w ? 'bg-success text-white' : 'bg-white border-success/30'}`}
                variant={week === w ? 'default' : 'outline'}
              >
                Week {w}
              </Button>
            ))}
          </div>
        </Card>

        {/* Baby Growth */}
        <Card className="p-6 bg-gradient-to-br from-care/5 to-trust/5 border-care/20">
          <div className="flex items-center gap-3 mb-4">
            <Baby className="w-6 h-6 text-care" />
            <h2 className="text-2xl font-bold">Baby Growth</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Baby Size</p>
              <p className="text-lg font-bold text-care">{data.babySize}</p>
            </div>
            <div className="bg-white p-3 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Weight</p>
              <p className="text-lg font-bold text-trust">{data.babyWeight}</p>
            </div>
            <div className="bg-white p-3 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Length</p>
              <p className="text-lg font-bold text-success">{data.babyLength}</p>
            </div>
            <div className="bg-white p-3 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Development</p>
              <p className="text-lg font-bold text-warm">📍 On Track</p>
            </div>
          </div>
          <p className="mt-4 text-foreground leading-relaxed">{data.growth}</p>
        </Card>

        {/* Body Changes */}
        <Card className="p-6 bg-gradient-to-br from-alert/5 to-alert/10 border-alert/20">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-alert" />
            Body Changes This Week
          </h2>
          <div className="bg-white p-4 rounded-lg text-foreground leading-relaxed">
            {data.bodyChanges}
          </div>
        </Card>

        {/* What to Expect */}
        <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <h2 className="text-2xl font-bold mb-4">What to Expect This Week</h2>
          <div className="bg-white p-4 rounded-lg text-foreground leading-relaxed">
            {data.expectations}
          </div>
        </Card>

        {/* Doctor Tips */}
        <Card className="p-6 bg-gradient-to-br from-trust/5 to-trust/10 border-trust/20">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-trust" />
            Doctor's Tips
          </h2>
          <div className="bg-white p-4 rounded-lg text-foreground leading-relaxed">
            {data.doctorTips}
          </div>
        </Card>
      </div>
    </div>
  )
}
