'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, Send, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLanguage } from '@/lib/language-context'

export default function AppointmentRemindersPage() {
  const router = useRouter()
  const { content, language } = useLanguage()
  const t = (copy: Record<string, string>) => copy[language] || copy.en
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
          <h1 className="text-3xl font-bold">{content.appointmentReminders || t({ en: 'Appointment Reminders', hi: 'अपॉइंटमेंट रिमाइंडर', or: 'ଅପଏଣ୍ଟମେଣ୍ଟ ସ୍ମୃତିପତ୍ର', bn: 'অ্যাপয়েন্টমেন্ট রিমাইন্ডার', te: 'అపాయింట్‌మెంట్ రిమైండర్లు', ta: 'சந்திப்பு நினைவூட்டல்கள்', mr: 'अपॉइंटमेंट स्मरणपत्रे', gu: 'અપોઇન્ટમેન્ટ રિમાઇન્ડર્સ' })}</h1>
        </div>
        <p className="text-white/90">{content.sendReminders || t({ en: 'Send reminders to pregnant women before their checkups', hi: 'जांच से पहले गर्भवती महिलाओं को रिमाइंडर भेजें', or: 'ଚେକଅପ୍ ପୂର୍ବରୁ ଗର୍ଭବତୀ ମହିଳାଙ୍କୁ ସ୍ମୃତିପତ୍ର ପଠାନ୍ତୁ', bn: 'চেকআপের আগে গর্ভবতী মহিলাদের রিমাইন্ডার পাঠান', te: 'చెకప్ ముందు గర్భిణీ స్త్రీలకు రిమైండర్లు పంపండి', ta: 'பரிசோதனைக்கு முன் கர்ப்பிணி பெண்களுக்கு நினைவூட்டல் அனுப்புங்கள்', mr: 'तपासणीपूर्वी गर्भवती महिलांना स्मरणपत्रे पाठवा', gu: 'ચેકઅપ પહેલાં ગર્ભવતી મહિલાઓને રિમાઇન્ડર મોકલો' })}</p>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-success/10 border-success/20">
            <p className="text-sm text-muted-foreground">{content.reminderSent || t({ en: 'Reminders Sent', hi: 'रिमाइंडर भेजे गए', or: 'ସ୍ମୃତିପତ୍ର ପଠାଗଲା', bn: 'রিমাইন্ডার পাঠানো হয়েছে', te: 'రిమైండర్లు పంపబడ్డాయి', ta: 'நினைவூட்டல்கள் அனுப்பப்பட்டன', mr: 'स्मरणपत्रे पाठवली', gu: 'રિમાઇન્ડર્સ મોકલાયા' })}</p>
            <p className="text-3xl font-bold text-success">
              {reminders.filter(r => r.message === 'sent').length}
            </p>
          </Card>
          <Card className="p-4 bg-warning/10 border-warning/20">
            <p className="text-sm text-muted-foreground">{t({ en: 'Pending', hi: 'लंबित', or: 'ବକେୟା', bn: 'অপেক্ষমাণ', te: 'పెండింగ్', ta: 'நிலுவை', mr: 'प्रलंबित', gu: 'બાકી' })}</p>
            <p className="text-3xl font-bold text-warning">
              {reminders.filter(r => r.message === 'pending').length}
            </p>
          </Card>
        </div>

        {/* Reminders List */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold mb-4">{content.upcomingAppointments || t({ en: 'Upcoming Appointments', hi: 'आगामी अपॉइंटमेंट', or: 'ଆସନ୍ତା ଅପଏଣ୍ଟମେଣ୍ଟ', bn: 'আসন্ন অ্যাপয়েন্টমেন্ট', te: 'రాబోయే అపాయింట్‌మెంట్లు', ta: 'வரவிருக்கும் சந்திப்புகள்', mr: 'आगामी अपॉइंटमेंट्स', gu: 'આગામી અપૉઇન્ટમેન્ટ્સ' })}</h2>
          {reminders.map(reminder => (
            <Card key={reminder.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{reminder.patientName}</h3>
                  <p className="text-sm text-muted-foreground">
                    📅 {new Date(reminder.appointmentDate).toLocaleDateString('en-IN')} | 👨‍⚕️ {reminder.doctorName}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${reminder.message === 'sent' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                  }`}>
                  {reminder.message === 'sent' ? t({ en: 'Sent', hi: 'भेजा गया', or: 'ପଠାଗଲା', bn: 'পাঠানো হয়েছে', te: 'పంపబడింది', ta: 'அனுப்பப்பட்டது', mr: 'पाठवले', gu: 'મોકલ્યું' }) : t({ en: 'Pending', hi: 'लंबित', or: 'ବକେୟା', bn: 'অপেক্ষমাণ', te: 'పెండింగ్', ta: 'நிலுவை', mr: 'प्रलंबित', gu: 'બાકી' })}
                </span>
              </div>

              <div className="bg-background p-3 rounded-lg mb-3 text-sm">
                <p className="font-semibold mb-2">📋 {content.preVisitInstructions || t({ en: 'Pre-visit Instructions', hi: 'भेंट से पहले निर्देश', or: 'ଭିଜିଟ୍ ପୂର୍ବ ନିର୍ଦ୍ଦେଶ', bn: 'ভিজিটের আগে নির্দেশনা', te: 'సందర్శనకు ముందు సూచనలు', ta: 'வருகைக்கு முன் வழிமுறைகள்', mr: 'भेटीपूर्व सूचना', gu: 'મુલાકાત પહેલા સૂચનાઓ' })}:</p>
                <ul className="list-disc pl-5 space-y-1 text-foreground/70">
                  <li>{content.keepFastEmpty || t({ en: 'Keep empty stomach from 12 AM night before', hi: 'रात 12 बजे के बाद खाली पेट रहें', or: 'ରାତି 12 ପରେ ଖାଲି ପେଟ ରୁହନ୍ତୁ', bn: 'রাত ১২টার পর খালি পেটে থাকুন', te: 'రాత్రి 12 తర్వాత ఖాళీ కడుపుతో ఉండండి', ta: 'இரவு 12 மணிக்குப் பிறகு காலியான வயிற்றில் இருங்கள்', mr: 'रात्री 12 नंतर उपाशी रहा', gu: 'રાતે 12 પછી ખાલી પેટ રહો' })}</li>
                  <li>{content.bringReports || t({ en: 'Bring previous checkup reports', hi: 'पिछली जांच रिपोर्ट साथ लाएं', or: 'ପୂର୍ବ ଚେକଅପ୍ ରିପୋର୍ଟ ଆଣନ୍ତୁ', bn: 'আগের চেকআপ রিপোর্ট আনুন', te: 'మునుపటి చెకప్ రిపోర్టులు తీసుకురండి', ta: 'முந்தைய பரிசோதனை அறிக்கைகளை கொண்டு வாருங்கள்', mr: 'मागील तपासणी अहवाल आणा', gu: 'પાછલા ચેકઅપ રિપોર્ટ લાવો' })}</li>
                  <li>{content.noteSymptoms || t({ en: 'Note down any symptoms you noticed', hi: 'जो भी लक्षण दिखें उन्हें नोट करें', or: 'ଦେଖିଥିବା ଲକ୍ଷଣ ଲେଖନ୍ତୁ', bn: 'যে কোনো উপসর্গ লিখে রাখুন', te: 'గమనించిన లక్షణాలను నమోదు చేయండి', ta: 'கண்ட அறிகுறிகளை பதிவு செய்யுங்கள்', mr: 'दिसलेली लक्षणे नोंदवा', gu: 'જોવામાં આવેલા લક્ષણો નોંધો' })}</li>
                  <li>{content.arriveEarly || t({ en: 'Arrive 10 minutes early', hi: '10 मिनट पहले पहुंचें', or: '10 ମିନିଟ୍ ପୂର୍ବରୁ ପହଞ୍ଚନ୍ତୁ', bn: '১০ মিনিট আগে পৌঁছান', te: '10 నిమిషాల ముందే రండి', ta: '10 நிமிடம் முன் வரவும்', mr: '10 मिनिटे आधी या', gu: '10 મિનિટ વહેલા પહોંચો' })}</li>
                </ul>
              </div>

              {reminder.message === 'pending' && (
                <Button
                  onClick={() => sendReminder(reminder.id)}
                  className="w-full bg-linear-to-r from-accent to-trust hover:from-accent/90 hover:to-trust/90 text-white gap-2"
                >
                  <Send className="w-4 h-4" />
                  {content.sendReminderSMS || t({ en: 'Send Reminder via SMS', hi: 'SMS से रिमाइंडर भेजें', or: 'SMS ଦ୍ୱାରା ସ୍ମୃତିପତ୍ର ପଠାନ୍ତୁ', bn: 'SMS-এ রিমাইন্ডার পাঠান', te: 'SMS ద్వారా రిమైండర్ పంపండి', ta: 'SMS மூலம் நினைவூட்டல் அனுப்பவும்', mr: 'SMS द्वारे स्मरणपत्र पाठवा', gu: 'SMS દ્વારા રિમાઇન્ડર મોકલો' })}
                </Button>
              )}
              {reminder.message === 'sent' && (
                <Button disabled className="w-full bg-success/30 text-success cursor-not-allowed gap-2">
                  <Bell className="w-4 h-4" />
                  {content.reminderSent || t({ en: 'Reminder Sent', hi: 'रिमाइंडर भेजा गया', or: 'ସ୍ମୃତିପତ୍ର ପଠାଗଲା', bn: 'রিমাইন্ডার পাঠানো হয়েছে', te: 'రిమైండర్ పంపబడింది', ta: 'நினைவூட்டல் அனுப்பப்பட்டது', mr: 'स्मरणपत्र पाठवले', gu: 'રિમાઇન્ડર મોકલાયો' })}
                </Button>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
