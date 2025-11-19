"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, HelpCircle, Book, Video, MessageCircle, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function HelpPage() {
  const router = useRouter()

  const faqs = [
    {
      question: "How do I change the language?",
      answer:
        "Go to Settings from the main menu and select 'Language Preferences'. You can choose from 10+ Indian languages including Hindi, Tamil, Bengali, and more.",
    },
    {
      question: "Does the app work without internet?",
      answer:
        "Yes! SehatSaheli is designed to work offline. All core features including health tips, symptom checker, and health log work without internet. Emergency calling uses your phone's cellular network.",
    },
    {
      question: "How accurate is the AI symptom checker?",
      answer:
        "Our AI is trained on maternal health data and provides preliminary guidance. However, it should not replace professional medical advice. Always consult with your ASHA worker or doctor for serious concerns.",
    },
    {
      question: "Is my health data private and secure?",
      answer:
        "Absolutely. We use AES-256 encryption and store data locally on your device. Data is only shared with your consent and transmitted securely to your ASHA worker.",
    },
    {
      question: "How do I add a new appointment?",
      answer:
        "From the Mother Dashboard, tap 'My Appointments' and then tap the '+' button in the top right. Fill in the appointment details and save.",
    },
    {
      question: "What should I do in an emergency?",
      answer:
        "Tap the 'Emergency Call' button from your dashboard. This will show quick-access buttons to call your ASHA worker, local hospital, or ambulance service (108).",
    },
    {
      question: "Can my family members access my health information?",
      answer:
        "You can choose to share specific health reports with family members through the app's sharing feature. You have complete control over what information is shared.",
    },
    {
      question: "How do ASHA workers see my information?",
      answer:
        "When your ASHA worker adds you as a patient, they can see your risk level, appointment history, and health logs. This helps them provide better care.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-care/5 to-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-care to-warm p-6 text-white">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push("/")} variant="ghost" size="icon" className="text-white">
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Help Center</h1>
              <p className="text-white/80">Find answers to common questions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 space-y-12">
        {/* Quick Links */}
        <section>
          <h2 className="text-2xl font-bold mb-6">How can we help you?</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer text-center">
              <div className="w-12 h-12 bg-trust/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Book className="w-6 h-6 text-trust" />
              </div>
              <h3 className="font-semibold mb-1">User Guide</h3>
              <p className="text-sm text-muted-foreground">Step-by-step tutorials</p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer text-center">
              <div className="w-12 h-12 bg-alert/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Video className="w-6 h-6 text-alert" />
              </div>
              <h3 className="font-semibold mb-1">Video Tutorials</h3>
              <p className="text-sm text-muted-foreground">Watch and learn</p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer text-center">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold mb-1">Chat Support</h3>
              <p className="text-sm text-muted-foreground">Talk to our team</p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer text-center">
              <div className="w-12 h-12 bg-care/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="w-6 h-6 text-care" />
              </div>
              <h3 className="font-semibold mb-1">Call Us</h3>
              <p className="text-sm text-muted-foreground">1800-123-4567</p>
            </Card>
          </div>
        </section>

        {/* FAQs */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-8 h-8 text-care" />
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          </div>
          <Card className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </section>

        {/* Still Need Help */}
        <section>
          <Card className="p-8 bg-gradient-to-br from-trust/10 to-care/10 text-center">
            <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto text-balance">
              Our support team is here to help you. Reach out via email, phone, or visit our contact page.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => router.push("/contact")} className="bg-trust hover:bg-trust/90">
                Contact Support
              </Button>
              <Button variant="outline">Community Forum</Button>
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}
