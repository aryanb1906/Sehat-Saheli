'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLanguage } from '@/lib/language-context'

export default function VaccinationTrackerPage() {
  const router = useRouter()
  const { content } = useLanguage()
  const [vaccinations, setVaccinations] = useState({
    tt1: { done: true, date: '2024-01-15' },
    tt2: { done: true, date: '2024-02-15' },
    ttBooster: { done: false, date: null },
    iron: { done: true, startDate: '2024-01-10' },
    calcium: { done: true, startDate: '2024-01-10' },
    folicAcid: { done: true, startDate: '2024-01-10' }
  })

  const schedules = [
    { trimester: '1st', items: ['Folic Acid', 'Iron Supplements', 'Blood Test', 'Blood Pressure Check'] },
    { trimester: '2nd', items: ['Glucose Test', 'TT Vaccine 1st Dose', 'Iron Supplements', 'Regular Checkups'] },
    { trimester: '3rd', items: ['TT Vaccine 2nd Dose', 'Calcium Supplements', 'Fetal Monitoring', 'Final Checkup'] }
  ]

  const toggleVaccination = (key: string) => {
    setVaccinations(prev => ({
      ...prev,
      [key]: {
        ...prev[key as keyof typeof prev],
        done: !prev[key as keyof typeof prev].done,
        date: !prev[key as keyof typeof prev].done ? new Date().toISOString().split('T')[0] : null
      }
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-trust/10 via-accent/5 to-background">
      <div className="sticky top-0 bg-gradient-to-r from-trust to-accent p-6 text-white z-10">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" className="text-white" onClick={() => router.back()}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-3xl font-bold">Vaccination Tracker</h1>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Vaccines */}
        <Card className="p-6 bg-white">
          <h2 className="text-2xl font-bold mb-4">TT Vaccine Schedule</h2>
          <div className="space-y-3">
            {[
              { key: 'tt1', name: 'TT Vaccine (1st Dose)', due: '7th month' },
              { key: 'tt2', name: 'TT Vaccine (2nd Dose)', due: '1 month after 1st' },
              { key: 'ttBooster', name: 'TT Vaccine (Booster)', due: '6-12 months before conception' }
            ].map(vac => (
              <div
                key={vac.key}
                onClick={() => toggleVaccination(vac.key)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  vaccinations[vac.key as keyof typeof vaccinations].done
                    ? 'bg-success/10 border-success'
                    : 'bg-warning/10 border-warning/30 hover:border-warning'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{vac.name}</p>
                    <p className="text-sm text-muted-foreground">Due: {vac.due}</p>
                  </div>
                  {vaccinations[vac.key as keyof typeof vaccinations].done ? (
                    <CheckCircle className="w-6 h-6 text-success" />
                  ) : (
                    <Clock className="w-6 h-6 text-warning" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Supplements */}
        <Card className="p-6 bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <h2 className="text-2xl font-bold mb-4">Daily Supplements</h2>
          <div className="space-y-3">
            {[
              { key: 'iron', name: 'Iron Tablets', dose: '1 tablet daily' },
              { key: 'calcium', name: 'Calcium Supplements', dose: '1000mg daily' },
              { key: 'folicAcid', name: 'Folic Acid', dose: '400mcg daily' }
            ].map(sup => (
              <div
                key={sup.key}
                onClick={() => toggleVaccination(sup.key)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  vaccinations[sup.key as keyof typeof vaccinations].done
                    ? 'bg-success/10 border-success'
                    : 'bg-warning/10 border-warning/30 hover:border-warning'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{sup.name}</p>
                    <p className="text-sm text-muted-foreground">{sup.dose}</p>
                  </div>
                  {vaccinations[sup.key as keyof typeof vaccinations].done ? (
                    <CheckCircle className="w-6 h-6 text-success" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-warning" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Trimester Checklists */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Trimester Checklists</h2>
          {schedules.map(schedule => (
            <Card key={schedule.trimester} className="p-6 bg-white">
              <h3 className="font-bold text-lg mb-4 text-trust">{schedule.trimester} Trimester</h3>
              <div className="space-y-2">
                {schedule.items.map(item => (
                  <div key={item} className="flex items-center gap-3 p-3 bg-background rounded">
                    <input type="checkbox" className="w-5 h-5" defaultChecked={Math.random() > 0.5} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
