"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Heart, Globe, Shield, Users, Target, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function AboutPage() {
  const router = useRouter()

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
              <h1 className="text-3xl font-bold">About SehatSaheli</h1>
              <p className="text-white/80">Your AI Health Companion</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 space-y-12">
        {/* Mission */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-8 h-8 text-care" />
            <h2 className="text-3xl font-bold">Our Mission</h2>
          </div>
          <Card className="p-8 bg-gradient-to-br from-care/10 to-card">
            <p className="text-lg leading-relaxed text-pretty">
              SehatSaheli aims to reduce maternal mortality in rural India by providing accessible, multilingual,
              AI-powered healthcare support to pregnant mothers and ASHA workers. We break down language barriers,
              enable offline access, and empower communities with early risk detection and personalized care guidance.
            </p>
          </Card>
        </section>

        {/* Problem Statement */}
        <section>
          <h2 className="text-3xl font-bold mb-6">The Challenge</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3 text-alert">85% Language Barrier</h3>
              <p className="leading-relaxed text-muted-foreground">
                Existing health apps fail to serve non-English speakers, excluding the vast majority of rural women who
                need care the most.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3 text-alert">Poor Connectivity</h3>
              <p className="leading-relaxed text-muted-foreground">
                Rural areas lack reliable internet access, making traditional online healthcare apps unusable when
                needed most.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3 text-alert">Late Detection</h3>
              <p className="leading-relaxed text-muted-foreground">
                High-risk pregnancies are often detected too late due to lack of awareness and limited access to regular
                checkups.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3 text-alert">Mental Health Ignored</h3>
              <p className="leading-relaxed text-muted-foreground">
                Prenatal and postpartum mental health needs are largely unaddressed, worsening outcomes for mothers and
                babies.
              </p>
            </Card>
          </div>
        </section>

        {/* Solution */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Our Solution</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-trust/20 rounded-full flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-trust" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multilingual AI</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Voice-first interface supporting 10+ Indian languages including Hindi, Tamil, Bengali, and more.
              </p>
            </Card>
            <Card className="p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Offline-First</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Works without internet using local AI and SMS fallback for critical alerts.
              </p>
            </Card>
            <Card className="p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-alert/20 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-alert" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Risk Detection</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                AI-powered early warning system flags high-risk cases for immediate intervention.
              </p>
            </Card>
          </div>
        </section>

        {/* Technology */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Technology Stack</h2>
          <Card className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Frontend</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• React & Next.js for responsive UI</li>
                  <li>• Voice-first, icon-heavy design</li>
                  <li>• Progressive Web App (PWA)</li>
                  <li>• Offline data sync with PouchDB</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">AI & Backend</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Gemini AI for symptom analysis</li>
                  <li>• Bhashini API for translation</li>
                  <li>• Risk scoring algorithms</li>
                  <li>• Twilio SMS for offline alerts</li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* Impact */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-8 h-8 text-success" />
            <h2 className="text-3xl font-bold">Expected Impact</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6 text-center bg-gradient-to-br from-warm/10 to-card">
              <div className="text-4xl font-bold text-warm mb-2">85%</div>
              <p className="text-sm text-muted-foreground">Reach to non-English speakers</p>
            </Card>
            <Card className="p-6 text-center bg-gradient-to-br from-care/10 to-card">
              <div className="text-4xl font-bold text-care mb-2">24/7</div>
              <p className="text-sm text-muted-foreground">AI health support</p>
            </Card>
            <Card className="p-6 text-center bg-gradient-to-br from-trust/10 to-card">
              <div className="text-4xl font-bold text-trust mb-2">100%</div>
              <p className="text-sm text-muted-foreground">Offline capable</p>
            </Card>
            <Card className="p-6 text-center bg-gradient-to-br from-success/10 to-card">
              <div className="text-4xl font-bold text-success mb-2">1000s</div>
              <p className="text-sm text-muted-foreground">Lives to be saved</p>
            </Card>
          </div>
        </section>

        {/* Team CTA */}
        <section className="text-center">
          <Card className="p-12 bg-gradient-to-r from-warm/10 via-care/10 to-trust/10">
            <Users className="w-16 h-16 mx-auto mb-6 text-care" />
            <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto text-balance">
              Partner with us to transform maternal healthcare in rural India. Together, we can save lives.
            </p>
            <Button
              size="lg"
              onClick={() => router.push("/contact")}
              className="bg-gradient-to-r from-care to-warm hover:from-care/90 hover:to-warm/90 text-white"
            >
              Get In Touch
            </Button>
          </Card>
        </section>
      </div>
    </div>
  )
}
