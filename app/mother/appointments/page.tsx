"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock, MapPin, Plus, Bell, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"

interface Appointment {
  id: string
  date: string
  time: string
  type: string
  location: string
  doctor: string
  status: "upcoming" | "completed" | "cancelled"
}

export default function Appointments() {
  const router = useRouter()
  const { toast } = useToast()
  const { language } = useLanguage()
  const t = (copy: Record<string, string>) => copy[language] || copy.en
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      date: "2025-01-15",
      time: "10:00 AM",
      type: "Regular Checkup",
      location: "Primary Health Center, Village",
      doctor: "Dr. Anjali Sharma",
      status: "upcoming",
    },
    {
      id: "2",
      date: "2025-01-20",
      time: "2:00 PM",
      type: "Ultrasound Scan",
      location: "District Hospital",
      doctor: "Dr. Rajesh Kumar",
      status: "upcoming",
    },
    {
      id: "3",
      date: "2025-01-05",
      time: "11:00 AM",
      type: "Blood Test",
      location: "Community Health Center",
      doctor: "Lab Technician",
      status: "completed",
    },
  ])

  const handleSetReminder = (appointment: Appointment) => {
    toast({
      title: t({ en: "Reminder Set!", hi: "रिमाइंडर सेट!", or: "ସ୍ମୃତିପତ୍ର ସେଟ୍!", bn: "রিমাইন্ডার সেট!", te: "రిమైండర్ సెట్!", ta: "நினைவூட்டல் அமைக்கப்பட்டது!", mr: "स्मरणपत्र सेट!", gu: "રિમાઇન્ડર સેટ!" }),
      description: `${t({ en: "You will be notified 1 day before", hi: "1 दिन पहले आपको सूचित किया जाएगा", or: "1 ଦିନ ପୂର୍ବରୁ ଆପଣଙ୍କୁ ସୂଚନା ମିଳିବ", bn: "1 দিন আগে আপনাকে জানানো হবে", te: "1 రోజు ముందుగా మీకు తెలియజేయబడుతుంది", ta: "1 நாள் முன் உங்களுக்கு அறிவிக்கப்படும்", mr: "1 दिवस आधी तुम्हाला सूचना दिली जाईल", gu: "1 દિવસ પહેલા તમને જાણ કરવામાં આવશે" })} ${appointment.type} (${new Date(appointment.date).toLocaleDateString("en-IN")})`,
    })
  }

  const handleReschedule = (appointmentId: string) => {
    router.push(`/mother/appointments/reschedule/${appointmentId}`)
  }

  const handleDelete = (appointmentId: string) => {
    if (confirm(t({ en: "Are you sure you want to cancel this appointment?", hi: "क्या आप यह अपॉइंटमेंट रद्द करना चाहती हैं?", or: "ଆପଣ ଏହି ନିଯୁକ୍ତିକୁ ବାତିଲ୍ କରିବାକୁ ନିଶ୍ଚିତ କି?", bn: "আপনি কি এই অ্যাপয়েন্টমেন্ট বাতিল করতে চান?", te: "ఈ అపాయింట్‌మెంట్‌ను రద్దు చేయాలని ఖచ్చితమా?", ta: "இந்த நியமனத்தை ரத்து செய்ய விரும்புகிறீர்களா?", mr: "ही अपॉइंटमेंट रद्द करायची आहे का?", gu: "શું તમે આ અપોઇન્ટમેન્ટ રદ કરવા માંગો છો?" }))) {
      setAppointments(appointments.filter((apt) => apt.id !== appointmentId))
      toast({
        title: t({ en: "Appointment Cancelled", hi: "अपॉइंटमेंट रद्द", or: "ନିଯୁକ୍ତି ବାତିଲ୍", bn: "অ্যাপয়েন্টমেন্ট বাতিল", te: "అపాయింట్‌మెంట్ రద్దు", ta: "நியமனம் ரத்து", mr: "अपॉइंटमेंट रद्द", gu: "અપોઇન્ટમેન્ટ રદ" }),
        description: t({ en: "The appointment has been removed from your schedule.", hi: "अपॉइंटमेंट आपके शेड्यूल से हटाया गया है।", or: "ନିଯୁକ୍ତି ଆପଣଙ୍କ ସୂଚିରୁ ହଟାଯାଇଛି।", bn: "অ্যাপয়েন্টমেন্ট আপনার সূচি থেকে সরানো হয়েছে।", te: "అపాయింట్‌మెంట్ మీ షెడ్యూల్ నుండి తొలగించబడింది.", ta: "நியமனம் உங்கள் அட்டவணையில் இருந்து நீக்கப்பட்டது.", mr: "अपॉइंटमेंट तुमच्या वेळापत्रकातून काढले आहे.", gu: "અપોઇન્ટમેન્ટ તમારા શેડ્યૂલમાંથી દૂર કરવામાં આવ્યું છે." }),
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-trust text-white"
      case "completed":
        return "bg-success text-white"
      case "cancelled":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-princess-1/20 via-white to-princess-1/10 pb-10">
      {/* Header */}
      <div className="mx-3 mt-4 overflow-hidden rounded-3xl bg-gradient-to-r from-princess-4 to-primary p-6 text-white shadow-lg shadow-princess-4/20 border border-white/20 md:mx-6 2xl:mx-auto 2xl:max-w-7xl">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white hover:bg-white/20 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{t({ en: "My Appointments", hi: "मेरी अपॉइंटमेंट", or: "ମୋର ନିଯୁକ୍ତି", bn: "আমার অ্যাপয়েন্টমেন্ট", te: "నా అపాయింట్‌మెంట్లు", ta: "என் நியமனங்கள்", mr: "माझ्या अपॉइंटमेंट्स", gu: "મારી અપોઇન્ટમેન્ટ્સ" })}</h1>
            <p className="text-white/80 text-sm">{t({ en: "Upcoming and past appointments", hi: "आगामी और पिछली अपॉइंटमेंट", or: "ଆସନ୍ତା ଏବଂ ପୂର୍ବ ନିଯୁକ୍ତି", bn: "আসন্ন এবং পূর্বের অ্যাপয়েন্টমেন্ট", te: "రాబోయే మరియు గత అపాయింట్‌మెంట్లు", ta: "வரவிருக்கும் மற்றும் கடந்த நியமனங்கள்", mr: "आगामी आणि मागील अपॉइंटमेंट्स", gu: "આગામી અને ભૂતકાળની અપોઇન્ટમેન્ટ્સ" })}</p>
          </div>
          <Button
            onClick={() => router.push("/mother/appointments/add")}
            size="icon"
            className="bg-white text-trust hover:bg-white/90"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {appointments.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">{t({ en: "No appointments scheduled yet.", hi: "अभी कोई अपॉइंटमेंट निर्धारित नहीं है।", or: "ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ନିଯୁକ୍ତି ନାହିଁ।", bn: "এখনও কোনও অ্যাপয়েন্টমেন্ট নির্ধারিত হয়নি।", te: "ఇప్పటికీ అపాయింట్‌మెంట్లు షెడ్యూల్ కాలేదు.", ta: "இதுவரை எந்த நியமனமும் திட்டமிடப்படவில்லை.", mr: "अजून कोणतीही अपॉइंटमेंट ठरलेली नाही.", gu: "હજુ સુધી કોઈ અપોઇન્ટમેન્ટ નક્કી નથી." })}</p>
            <Button onClick={() => router.push("/mother/appointments/add")} className="bg-trust">
              <Plus className="w-4 h-4 mr-2" />
              {t({ en: "Schedule Appointment", hi: "अपॉइंटमेंट तय करें", or: "ନିଯୁକ୍ତି ନିର୍ଦ୍ଧାରଣ କରନ୍ତୁ", bn: "অ্যাপয়েন্টমেন্ট নির্ধারণ করুন", te: "అపాయింట్‌మెంట్ షెడ్యూల్ చేయండి", ta: "நியமனத்தை திட்டமிடுங்கள்", mr: "अपॉइंटमेंट ठरवा", gu: "અપોઇન્ટમેન્ટ શેડ્યૂલ કરો" })}
            </Button>
          </Card>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id} className="p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{appointment.type}</h3>
                  <p className="text-sm text-muted-foreground">{appointment.doctor}</p>
                </div>
                <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {new Date(appointment.date).toLocaleDateString("en-IN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{appointment.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{appointment.location}</span>
                </div>
              </div>

              {appointment.status === "upcoming" && (
                <div className="mt-4 pt-4 border-t flex gap-2">
                  <Button onClick={() => handleSetReminder(appointment)} variant="outline" size="sm" className="flex-1">
                    <Bell className="w-4 h-4 mr-2" />
                    {t({ en: "Set Reminder", hi: "रिमाइंडर सेट करें", or: "ସ୍ମୃତିପତ୍ର ସେଟ୍ କରନ୍ତୁ", bn: "রিমাইন্ডার সেট করুন", te: "రిమైండర్ సెట్ చేయండి", ta: "நினைவூட்டலை அமைக்கவும்", mr: "स्मरणपत्र सेट करा", gu: "રિમાઇન્ડર સેટ કરો" })}
                  </Button>
                  <Button
                    onClick={() => handleReschedule(appointment.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    {t({ en: "Reschedule", hi: "पुनर्निर्धारित करें", or: "ପୁନର୍ନିର୍ଦ୍ଧାରଣ", bn: "পুনঃনির্ধারণ", te: "మళ్లీ షెడ్యూల్", ta: "மீண்டும் நேரமிடுங்கள்", mr: "पुन्हा वेळ ठरवा", gu: "ફરી શેડ્યૂલ કરો" })}
                  </Button>
                  <Button
                    onClick={() => handleDelete(appointment.id)}
                    variant="outline"
                    size="sm"
                    className="text-alert hover:bg-alert/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
