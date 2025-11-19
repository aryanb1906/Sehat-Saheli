'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, AlertTriangle, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLanguage } from '@/lib/language-context'

export default function DangerSignsPage() {
  const router = useRouter()
  const { content } = useLanguage()
  const [activeSigns, setActiveSigns] = useState<string[]>([])

  const dangerSigns = [
    { sign: 'Heavy Bleeding', icon: '🩸', severity: 'critical', action: 'Call 108 immediately' },
    { sign: 'Severe Abdominal Pain', icon: '🤕', severity: 'critical', action: 'Go to hospital now' },
    { sign: 'High Fever (>100.4°F)', icon: '🌡️', severity: 'urgent', action: 'Contact doctor within 1 hour' },
    { sign: 'No Fetal Movement', icon: '👶', severity: 'urgent', action: 'Count kicks immediately' },
    { sign: 'Severe Headache', icon: '😵', severity: 'urgent', action: 'Rest, call doctor if persistent' },
    { sign: 'Vision Changes', icon: '👁️', severity: 'critical', action: 'Seek medical help' },
    { sign: 'Shortness of Breath', icon: '💨', severity: 'urgent', action: 'Rest and call doctor' },
    { sign: 'Swelling & Pressure', icon: '🚨', severity: 'critical', action: 'Could be preeclampsia - urgent' }
  ]

  const handleEmergency = (sign: string) => {
    setActiveSigns(prev => 
      prev.includes(sign) ? prev.filter(s => s !== sign) : [...prev, sign]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-alert/10 via-alert/5 to-background">
      <div className="sticky top-0 bg-gradient-to-r from-alert to-alert/80 p-6 text-white z-10">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" className="text-white" onClick={() => router.back()}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-3xl font-bold">Danger Signs</h1>
        </div>
        <p className="text-white/90">Know when to seek immediate help</p>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Active Danger Signs */}
        {activeSigns.length > 0 && (
          <Card className="p-6 bg-alert text-white border-alert animate-pulse">
            <div className="flex items-start gap-4 mb-4">
              <AlertTriangle className="w-8 h-8 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Emergency Alert!</h2>
                <p className="mb-4">You reported {activeSigns.length} danger sign(s):</p>
                <ul className="list-disc pl-5 space-y-1 mb-4">
                  {activeSigns.map(sign => <li key={sign}>{sign}</li>)}
                </ul>
                <Button 
                  onClick={() => window.location.href = 'tel:108'} 
                  className="bg-white text-alert hover:bg-white/90 font-bold"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  CALL 108 EMERGENCY
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Danger Signs List */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold mb-4">Select if you're experiencing:</h2>
          {dangerSigns.map(({ sign, icon, severity, action }) => (
            <Card
              key={sign}
              onClick={() => handleEmergency(sign)}
              className={`p-4 cursor-pointer transition-all ${
                activeSigns.includes(sign)
                  ? 'bg-alert border-alert shadow-lg ring-2 ring-alert'
                  : severity === 'critical'
                  ? 'bg-alert/10 border-alert/30 hover:bg-alert/20'
                  : 'bg-warning/10 border-warning/30 hover:bg-warning/20'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">{icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{sign}</h3>
                  <p className="text-sm text-foreground/70 mt-1">{action}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    severity === 'critical' ? 'bg-alert/20 text-alert' : 'bg-warning/20 text-warning'
                  }`}>
                    {severity.toUpperCase()}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={activeSigns.includes(sign)}
                  onChange={() => {}}
                  className="w-6 h-6 mt-2"
                />
              </div>
            </Card>
          ))}
        </div>

        {/* Emergency Contacts */}
        <Card className="p-6 bg-success/10 border-success/30">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Phone className="w-6 h-6 text-success" />
            Emergency Contacts
          </h2>
          <div className="space-y-3">
            {[
              { name: 'National Emergency', number: '112', icon: '🚨' },
              { name: 'Ambulance', number: '108', icon: '🚑' },
              { name: 'Doctor Helpline', number: '1800-HEALTH', icon: '⚕️' }
            ].map(contact => (
              <Button
                key={contact.number}
                onClick={() => window.location.href = `tel:${contact.number}`}
                className="w-full h-auto p-4 justify-start bg-white hover:bg-success/5 text-foreground border border-success/30"
                variant="outline"
              >
                <span className="text-2xl mr-4">{contact.icon}</span>
                <div className="text-left">
                  <p className="font-semibold">{contact.name}</p>
                  <p className="text-lg font-bold text-success">{contact.number}</p>
                </div>
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
