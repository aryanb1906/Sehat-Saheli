"use client"

import { useRouter } from 'next/navigation'
import { Heart, Shield, Users, Globe, ArrowRight, Mic, Phone, Sparkles, Activity, Book, Droplets, Baby, Sun, Quote, Star, MessageSquare, Calendar, Apple, Zap } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function LandingPage() {
  const router = useRouter()

  const handleDemoLogin = () => {
    router.push("/language")
  }

  const pregnancyTips = [
    {
      icon: Book,
      title: "Regular Checkups",
      description:
        "Visit your health worker on schedule. ANC checkups track your baby's health and catch problems early.",
      color: "from-care to-warm",
    },
    {
      icon: Droplets,
      title: "Take Iron & Folic Acid",
      description: "Daily supplements prevent anemia and help your baby's brain develop properly. Never skip them.",
      color: "from-trust to-accent",
    },
    {
      icon: Activity,
      title: "Balanced Diet",
      description:
        "Eat more protein, vegetables, fruits, and drink plenty of water. Your baby needs these nutrients to grow.",
      color: "from-success to-care",
    },
    {
      icon: Baby,
      title: "Track Baby Movement",
      description:
        "After 20 weeks, count kicks daily. If movement reduces or stops, contact your health worker immediately.",
      color: "from-warm to-care",
    },
    {
      icon: Shield,
      title: "Know Warning Signs",
      description:
        "Severe bleeding, severe pain, fever, or headaches are danger signs. Seek medical help without delay.",
      color: "from-alert to-alert/70",
    },
    {
      icon: Sun,
      title: "Rest & Avoid Stress",
      description: "Get enough sleep and avoid heavy work. Rest helps your baby grow and keeps you healthy.",
      color: "from-accent to-trust",
    },
  ]

  const positiveThoughts = [
    {
      quote: "Your body is creating a miracle. Trust the journey and embrace each moment.",
      author: "Mother's Wisdom",
    },
    {
      quote: "You are strong, capable, and already the perfect mother for your baby.",
      author: "Ancient Blessing",
    },
    {
      quote: "Every kick, every flutter is your baby saying 'I love you, Maa.'",
      author: "Heart to Heart",
    },
  ]

  const testimonials = [
    {
      name: "Sunita Devi",
      location: "Odisha",
      text: "SehatSaheli helped me understand my pregnancy in my own language. I felt supported every day.",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      location: "Bihar",
      text: "The AI detected my high blood pressure early. The ASHA worker came immediately and saved my baby.",
      rating: 5,
    },
    {
      name: "Lakshmi",
      location: "Tamil Nadu",
      text: "I could talk to Saheli anytime I was worried. It felt like having a friend who always cared.",
      rating: 5,
    },
  ]

  const allFeatures = [
    {
      icon: Mic,
      title: "AI Voice Assistant",
      description: "Talk to Saheli in your language. Get instant health advice, symptom checking, and emotional support anytime.",
      gradient: "from-warm to-care",
    },
    {
      icon: Shield,
      title: "Risk Monitoring",
      description: "AI-powered detection system identifies complications early and connects you with healthcare workers immediately.",
      gradient: "from-trust to-accent",
    },
    {
      icon: MessageSquare,
      title: "Community Support Groups",
      description: "Connect with other pregnant women, mothers, and local experts in safe, monitored groups. Share experiences and get support.",
      gradient: "from-warm to-accent",
    },
    {
      icon: Heart,
      title: "Mental Wellness",
      description: "Sentiment analysis and counseling resources for prenatal and postpartum mental health support.",
      gradient: "from-care to-warm",
    },
    {
      icon: Globe,
      title: "8+ Languages",
      description: "Full support for Hindi, English, Bengali, Tamil, Telugu, Marathi, Gujarati, and Odia with more coming soon.",
      gradient: "from-accent to-care",
    },
    {
      icon: Users,
      title: "ASHA Dashboard",
      description: "Complete patient management system with risk tracking, communication tools, and health analytics.",
      gradient: "from-success to-trust",
    },
    {
      icon: Calendar,
      title: "Pregnancy Week Tracker",
      description: "Week-by-week baby growth updates, body changes, what to expect, and doctor tips tailored to your stage.",
      gradient: "from-care to-success",
    },
    {
      icon: Apple,
      title: "Nutrition Planner",
      description: "Trimester-based meal plans, iron-rich foods, budget-friendly options, and food preferences.",
      gradient: "from-trust to-warm",
    },
    {
      icon: Zap,
      title: "Emergency Alert System",
      description: "Know danger signs with SOS alerts and one-tap access to emergency contacts and nearest health facilities.",
      gradient: "from-alert to-alert/70",
    },
    {
      icon: Phone,
      title: "Emergency Support",
      description: "One-tap emergency calling with SMS alerts to family members and nearest health facilities instantly.",
      gradient: "from-alert to-alert/70",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-warm to-care rounded-2xl blur-md opacity-70" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-warm to-care rounded-2xl flex items-center justify-center">
                <Heart className="w-7 h-7 text-white" fill="currentColor" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-warm via-care to-trust bg-clip-text text-transparent">
                SehatSaheli
              </h1>
              <p className="text-xs text-muted-foreground">सेहत सहेली</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#tips"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Health Tips
            </a>
            <a
              href="#impact"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Impact
            </a>
            <Button
              onClick={handleDemoLogin}
              className="bg-gradient-to-r from-warm to-care hover:from-warm/90 hover:to-care/90 text-white shadow-lg hover:shadow-xl transition-all"
            >
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-care/10 to-warm/10 rounded-full border border-care/20">
              <Sparkles className="w-4 h-4 text-care" />
              <p className="text-sm font-semibold bg-gradient-to-r from-warm to-care bg-clip-text text-transparent">
                AI-Powered Maternal Healthcare
              </p>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-balance">
                Your Health,{" "}
                <span className="bg-gradient-to-r from-warm via-care to-trust bg-clip-text text-transparent">
                  Your Language
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground text-pretty leading-relaxed">
                Multilingual AI companion supporting pregnant mothers and ASHA workers across rural India. Healthcare
                that speaks your language, understands your needs.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={handleDemoLogin}
                className="h-14 px-8 text-lg bg-gradient-to-r from-warm to-care hover:from-warm/90 hover:to-care/90 text-white shadow-2xl hover:shadow-3xl hover:scale-105 transition-all"
              >
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg border-2 border-border hover:bg-secondary/50 transition-all bg-transparent"
                onClick={() => {
                  document.getElementById("tips")?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t">
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-warm to-care bg-clip-text text-transparent">
                  8+
                </div>
                <div className="text-sm text-muted-foreground">Languages</div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-trust to-accent bg-clip-text text-transparent">
                  24/7
                </div>
                <div className="text-sm text-muted-foreground">AI Support</div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-success to-warm bg-clip-text text-transparent">
                  100%
                </div>
                <div className="text-sm text-muted-foreground">Offline</div>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-warm/10 via-care/10 to-trust/10 rounded-3xl blur-3xl" />
            <div className="relative space-y-4">
              <Card className="p-6 bg-gradient-to-br from-background to-secondary/30 backdrop-blur border-warm/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-warm to-care rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                    <Globe className="w-7 h-7 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Speak Your Language</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Hindi, Odia, Bengali, Telugu, Tamil, Marathi, Gujarati & English support with voice input
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-background to-secondary/30 backdrop-blur border-trust/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-trust to-accent rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">AI Risk Detection</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Early warning system identifies high-risk pregnancies and alerts healthcare workers instantly
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-background to-secondary/30 backdrop-blur border-success/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-success to-success/70 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                    <Activity className="w-7 h-7 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Works Offline</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Full functionality without internet connection, perfect for rural areas with limited connectivity
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-warm/5 via-care/10 to-trust/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmY3ZWQiIGZpbGwtb3BhY2l0eT0iMC4zIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <Badge className="px-4 py-2 bg-care/10 text-care border-care/20">Words of Encouragement</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-balance">
              You Are{" "}
              <span className="bg-gradient-to-r from-warm via-care to-trust bg-clip-text text-transparent">
                Creating Magic
              </span>
            </h2>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
              Positive affirmations to uplift and inspire you on this beautiful journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {positiveThoughts.map((thought, index) => (
              <Card
                key={index}
                className="group p-8 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-background to-warm/5 backdrop-blur border-warm/20 hover:scale-105 relative overflow-hidden"
              >
                <div className="absolute top-4 left-4 w-12 h-12 bg-gradient-to-br from-warm/20 to-care/20 rounded-full flex items-center justify-center">
                  <Quote className="w-6 h-6 text-warm" />
                </div>
                <div className="pt-16 space-y-4">
                  <p className="text-lg leading-relaxed text-pretty italic text-foreground/90">{thought.quote}</p>
                  <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                    <Heart className="w-4 h-4 text-care fill-care" />
                    <p className="text-sm font-medium text-muted-foreground">{thought.author}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Card className="inline-block px-8 py-6 bg-gradient-to-r from-care/10 to-warm/10 border-care/20">
              <p className="text-xl font-semibold bg-gradient-to-r from-warm to-care bg-clip-text text-transparent">
                Remember: You are not alone. We are here for you, every step of the way.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section id="tips" className="py-20 bg-gradient-to-br from-care/5 via-warm/5 to-care/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16 space-y-4">
            <Badge className="px-4 py-2 bg-warm/10 text-warm border-warm/20">Essential Knowledge</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-balance">
              Important Tips for{" "}
              <span className="bg-gradient-to-r from-warm via-care to-trust bg-clip-text text-transparent">
                Pregnant Women
              </span>
            </h2>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
              Simple, actionable advice to help you and your baby stay healthy throughout pregnancy
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pregnancyTips.map((tip, index) => (
              <Card
                key={index}
                className="group p-8 hover:shadow-2xl transition-all duration-300 bg-card/80 backdrop-blur border-border/50 hover:scale-105 hover:border-warm/30"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${tip.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}
                >
                  <tip.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-balance">{tip.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-pretty">{tip.description}</p>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Card className="inline-block p-6 bg-gradient-to-br from-alert/10 to-alert/5 border-alert/20">
              <div className="flex items-start gap-4 text-left">
                <Shield className="w-8 h-8 text-alert shrink-0 mt-1" />
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-alert">Emergency Warning Signs</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-2xl">
                    If you experience severe bleeding, severe abdominal pain, high fever, severe headache with blurred
                    vision, or reduced fetal movement —{" "}
                    <strong className="text-foreground">seek medical care immediately</strong>. These could be signs of
                    serious complications.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-secondary/30 via-care/5 to-secondary/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-block px-4 py-2 bg-warm/10 rounded-full">
              <p className="text-sm font-semibold text-warm">Powerful Features</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-balance">
              Comprehensive Care for{" "}
              <span className="bg-gradient-to-r from-warm via-care to-trust bg-clip-text text-transparent">
                Every Mother
              </span>
            </h2>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Tools designed specifically for India's maternal healthcare challenges with the latest features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allFeatures.map((feature, index) => (
              <div
                key={index}
                className="group p-8 hover:shadow-2xl transition-all duration-300 bg-card/80 backdrop-blur border border-border/50 hover:scale-105 hover:border-warm/30 rounded-2xl"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-trust/5 via-care/5 to-accent/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16 space-y-4">
            <Badge className="px-4 py-2 bg-trust/10 text-trust border-trust/20">Real Stories</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-balance">
              Mothers Who{" "}
              <span className="bg-gradient-to-r from-warm via-care to-trust bg-clip-text text-transparent">
                Trust Saheli
              </span>
            </h2>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
              Hear from women whose lives were transformed by SehatSaheli
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="group p-8 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-background to-secondary/30 backdrop-blur border-border/50 hover:scale-105"
              >
                <div className="space-y-4">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-warm fill-warm" />
                    ))}
                  </div>
                  <p className="text-lg leading-relaxed text-pretty italic text-foreground/90">"{testimonial.text}"</p>
                  <div className="pt-4 border-t border-border/50">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">Real Impact, Real Lives</h2>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Transforming maternal healthcare across rural India, one mother at a time
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "85%", label: "Non-English Speakers Supported", gradient: "from-warm to-care" },
              { value: "24/7", label: "AI Health Assistance", gradient: "from-care to-trust" },
              { value: "8+", label: "Indian Languages Supported", gradient: "from-trust to-success" },
              { value: "100%", label: "Offline Functionality", gradient: "from-success to-warm" },
            ].map((stat, index) => (
              <Card key={index} className="p-8 text-center hover:shadow-xl transition-all hover:scale-105">
                <div
                  className={`text-5xl md:text-6xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-3`}
                >
                  {stat.value}
                </div>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-warm via-care to-trust" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-balance leading-tight">
              Ready to Transform Maternal Healthcare?
            </h2>
            <p className="text-xl md:text-2xl text-white/95 text-balance leading-relaxed">
              Join thousands using SehatSaheli. Experience AI-driven care in your language, community support, pregnancy tracking, nutrition guidance, and emergency alerts designed for rural India.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button
                size="lg"
                onClick={handleDemoLogin}
                className="h-16 px-10 text-lg bg-white text-foreground hover:bg-white/90 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all"
              >
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary/20 py-12 border-t">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-warm to-care rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" fill="currentColor" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">SehatSaheli</h3>
                  <p className="text-xs text-muted-foreground">सेहत सहेली</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Empowering rural women and ASHA workers with AI-powered maternal healthcare in their native language.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#tips" className="hover:text-foreground transition-colors">
                    Health Tips
                  </a>
                </li>
                <li>
                  <a href="#impact" className="hover:text-foreground transition-colors">
                    Impact
                  </a>
                </li>
                <li>
                  <button onClick={handleDemoLogin} className="hover:text-foreground transition-colors">
                    Get Started
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Languages</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Hindi • हिंदी</li>
                <li>Bengali • বাংলা</li>
                <li>Tamil • தமிழ்</li>
                <li>Telugu • తెలుగు</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Mission</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Making quality maternal healthcare accessible to every woman in rural India, regardless of language or
                location.
              </p>
            </div>
          </div>
          <div className="border-t pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 SehatSaheli. Built with <Heart className="inline w-4 h-4 text-care fill-care" /> for India's
              mothers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
