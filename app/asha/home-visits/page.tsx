'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, MapPin, Phone, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLanguage } from '@/lib/language-context'

export default function HomeVisitsPage() {
  const router = useRouter()
  const { content, language } = useLanguage()
  const t = (copy: Record<string, string>) => copy[language] || copy.en
  const [visits, setVisits] = useState([
    { id: 1, patientName: 'Priya Singh', visitDate: '2024-11-20', status: 'completed', vitals: '120/80' },
    { id: 2, patientName: 'Rajni Devi', visitDate: '2024-11-21', status: 'scheduled', vitals: null },
    { id: 3, patientName: 'Meera Joshi', visitDate: '2024-11-22', status: 'pending', vitals: null }
  ])

  const statusLabel: Record<string, string> = {
    completed: t({ en: 'Completed', hi: 'पूर्ण', or: 'ସମ୍ପୂର୍ଣ୍ଣ', bn: 'সম্পন্ন', te: 'పూర్తి', ta: 'முடிந்தது', mr: 'पूर्ण', gu: 'પૂર્ણ' }),
    scheduled: t({ en: 'Scheduled', hi: 'निर्धारित', or: 'ନିର୍ଦ୍ଧାରିତ', bn: 'নির্ধারিত', te: 'షెడ్యూల్ చేసిన', ta: 'திட்டமிட்டது', mr: 'नियोजित', gu: 'નિર્ધારિત' }),
    pending: t({ en: 'Pending', hi: 'लंबित', or: 'ବକେୟା', bn: 'অপেক্ষমাণ', te: 'పెండింగ్', ta: 'நிலுவை', mr: 'प्रलंबित', gu: 'બાકી' }),
  }

  const markCompleted = (id: number) => {
    setVisits(prev =>
      prev.map(v => v.id === id ? { ...v, status: 'completed' } : v)
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-trust/10 to-background">
      <div className="sticky top-0 bg-gradient-to-r from-trust to-accent p-6 text-white z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-white" onClick={() => router.back()}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-3xl font-bold">{content.homeVisits || t({ en: 'Home Visits', hi: 'होम विजिट', or: 'ଘର ଭିଜିଟ୍', bn: 'হোম ভিজিট', te: 'హోమ్ విజిట్స్', ta: 'வீட்டு வருகைகள்', mr: 'घरभेटी', gu: 'ઘર મુલાકાતો' })}</h1>
          </div>
          <Button className="bg-white text-trust hover:bg-white/90 gap-2">
            <Plus className="w-5 h-5" />
            {content.scheduleVisit || t({ en: 'Schedule Visit', hi: 'विजिट निर्धारित करें', or: 'ଭିଜିଟ୍ ନିର୍ଧାରଣ କରନ୍ତୁ', bn: 'ভিজিট নির্ধারণ করুন', te: 'విజిట్ షెడ్యూల్ చేయండి', ta: 'வருகையை திட்டமிடுங்கள்', mr: 'भेट नियोजित करा', gu: 'મુલાકાત શેડ્યૂલ કરો' })}
          </Button>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Visit Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 bg-success/10 border-success/20">
            <p className="text-sm text-muted-foreground">{statusLabel.completed}</p>
            <p className="text-3xl font-bold text-success">
              {visits.filter(v => v.status === 'completed').length}
            </p>
          </Card>
          <Card className="p-4 bg-warning/10 border-warning/20">
            <p className="text-sm text-muted-foreground">{statusLabel.scheduled}</p>
            <p className="text-3xl font-bold text-warning">
              {visits.filter(v => v.status === 'scheduled').length}
            </p>
          </Card>
          <Card className="p-4 bg-alert/10 border-alert/20">
            <p className="text-sm text-muted-foreground">{statusLabel.pending}</p>
            <p className="text-3xl font-bold text-alert">
              {visits.filter(v => v.status === 'pending').length}
            </p>
          </Card>
        </div>

        {/* Visits List */}
        <div className="space-y-3">
          {visits.map(visit => (
            <Card key={visit.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{visit.patientName}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4" />
                    {new Date(visit.visitDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${visit.status === 'completed' ? 'bg-success/20 text-success' :
                    visit.status === 'scheduled' ? 'bg-warning/20 text-warning' :
                      'bg-alert/20 text-alert'
                  }`}>
                  {statusLabel[visit.status]}
                </span>
              </div>

              {visit.vitals && (
                <p className="text-sm text-foreground/70 mb-3">{t({ en: 'Vitals', hi: 'वाइटल्स', or: 'ଭାଇଟାଲ୍', bn: 'ভাইটাল', te: 'వైటల్స్', ta: 'உடல் அளவீடுகள்', mr: 'व्हायटल्स', gu: 'વાઇટલ્સ' })}: BP {visit.vitals}</p>
              )}

              <div className="flex gap-2">
                {visit.status === 'scheduled' && (
                  <>
                    <Button
                      onClick={() => markCompleted(visit.id)}
                      className="flex-1 bg-success hover:bg-success/90 text-white gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {content.markComplete || t({ en: 'Mark Complete', hi: 'पूर्ण चिह्नित करें', or: 'ସମ୍ପୂର୍ଣ୍ଣ ଚିହ୍ନିତ କରନ୍ତୁ', bn: 'সম্পন্ন চিহ্নিত করুন', te: 'పూర్తిగా గుర్తించండి', ta: 'முடிந்ததாக குறிக்கவும்', mr: 'पूर्ण म्हणून चिन्हांकित करा', gu: 'પૂર્ણ તરીકે ચિહ્નિત કરો' })}
                    </Button>
                    <Button
                      onClick={() => window.location.href = `tel:${visit.patientName}`}
                      variant="outline"
                      className="flex-1"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {t({ en: 'Call', hi: 'कॉल', or: 'କଲ୍', bn: 'কল', te: 'కాల్', ta: 'அழை', mr: 'कॉल', gu: 'કૉલ' })}
                    </Button>
                  </>
                )}
                {visit.status === 'completed' && (
                  <Button disabled className="w-full bg-success/30 text-success cursor-not-allowed">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {statusLabel.completed}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
