'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, Send, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLanguage } from '@/lib/language-context'

export default function AppointmentRemindersPage() {
  const router = useRouter()
  const { content } = useLanguage()
  const [reminders, setReminders] = useState([
    { id: 1, patientName: 'Priya Singh', appointmentDate: '2024-11-25', doctorName: 'Dr. Sharma', message: 'sent' },
    { id: 2, patientName: 'Rajni Devi', appointmentDate: '2024-11-26', doctorName: 'Dr. Patel', message: 'pending' },
    { id: 3, patientName: 'Meera Joshi', appointmentDate: '2024-11-27', doctorName: 'Dr. Gupta', message: 'sent' }
  ])

  const sendReminder = (id: number) => {
    setReminders(prev =>
      prev.map(r => r.id === id ? { ...r, message: 'sent' } : r)
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-accent/10 to-background">
      <div className="sticky top-0 bg-linear-to-r from-accent to-trust p-6 text-white z-10">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" className="text-white" onClick={() => router.back()}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-3xl font-bold">Appointment Reminders</h1>
        </div>
        <p className="text-white/90">Send reminders to pregnant women before their checkups</p>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-success/10 border-success/20">
            <p className="text-sm text-muted-foreground">Reminders Sent</p>
            <p className="text-3xl font-bold text-success">
              {reminders.filter(r => r.message === 'sent').length}
            </p>
          </Card>
          <Card className="p-4 bg-warning/10 border-warning/20">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-3xl font-bold text-warning">
              {reminders.filter(r => r.message === 'pending').length}
            </p>
          </Card>
        </div>

        {/* Reminders List */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold mb-4">Upcoming Appointments</h2>
          {reminders.map(reminder => (
            <Card key={reminder.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{reminder.patientName}</h3>
                  <p className="text-sm text-muted-foreground">
                    📅 {new Date(reminder.appointmentDate).toLocaleDateString('en-IN')} | 👨‍⚕️ {reminder.doctorName}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  reminder.message === 'sent' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                }`}>
                  {reminder.message === 'sent' ? '✓ SENT' : 'PENDING'}
                </span>
              </div>

              <div className="bg-background p-3 rounded-lg mb-3 text-sm">
                <p className="font-semibold mb-2">📋 Pre-visit Instructions:</p>
                <ul className="list-disc pl-5 space-y-1 text-foreground/70">
                  <li>Keep empty stomach from 12 AM night before</li>
                  <li>Bring previous checkup reports</li>
                  <li>Note down any symptoms you noticed</li>
                  <li>Arrive 10 minutes early</li>
                </ul>
              </div>

              {reminder.message === 'pending' && (
                <Button
                  onClick={() => sendReminder(reminder.id)}
                  className="w-full bg-linear-to-r from-accent to-trust hover:from-accent/90 hover:to-trust/90 text-white gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Reminder via SMS
                </Button>
              )}
              {reminder.message === 'sent' && (
                <Button disabled className="w-full bg-success/30 text-success cursor-not-allowed gap-2">
                  <Bell className="w-4 h-4" />
                  Reminder Sent
                </Button>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
