"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function PrivacyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-trust/5 to-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-trust to-accent p-6 text-white">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push("/")} variant="ghost" size="icon" className="text-white">
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Privacy Policy</h1>
              <p className="text-white/80">Your data, your control</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-4xl space-y-8">
        <Card className="p-8 bg-gradient-to-br from-trust/10 to-card">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-trust" />
            <h2 className="text-2xl font-bold">Our Commitment to Your Privacy</h2>
          </div>
          <p className="leading-relaxed text-muted-foreground">
            At SehatSaheli, we understand that your health information is deeply personal. We are committed to
            protecting your privacy and ensuring your data is secure. This policy explains how we collect, use, and
            safeguard your information.
          </p>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Database className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">What Information We Collect</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Basic profile information (name, age, contact details)</li>
                  <li>• Health data you provide (symptoms, checkup results, appointment history)</li>
                  <li>• Pregnancy-related information (due date, week of pregnancy)</li>
                  <li>• Mental health check-in responses</li>
                  <li>• Voice recordings when you use the AI assistant (processed locally, not stored)</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-care/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-care" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">How We Protect Your Data</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    • <strong>End-to-end encryption:</strong> AES-256 encryption for all data transmission
                  </li>
                  <li>
                    • <strong>Local-first storage:</strong> Your data stays on your device by default
                  </li>
                  <li>
                    • <strong>Secure servers:</strong> Cloud data stored on HIPAA-compliant servers in India
                  </li>
                  <li>
                    • <strong>No third-party selling:</strong> We never sell your data to advertisers or third parties
                  </li>
                  <li>
                    • <strong>Regular security audits:</strong> Continuous monitoring and security updates
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-warm/10 rounded-full flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-5 h-5 text-warm" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Who Can Access Your Data</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    • <strong>You:</strong> Full access to view, edit, and delete your information
                  </li>
                  <li>
                    • <strong>Your ASHA worker:</strong> Access to basic health status and risk level (with your
                    consent)
                  </li>
                  <li>
                    • <strong>Emergency contacts:</strong> Limited access in emergency situations (with your
                    pre-approval)
                  </li>
                  <li>
                    • <strong>Medical professionals:</strong> Only when you explicitly share your health reports
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-alert/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 text-alert" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Your Privacy Rights</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    • <strong>Right to access:</strong> View all data we have about you
                  </li>
                  <li>
                    • <strong>Right to delete:</strong> Request deletion of your account and all associated data
                  </li>
                  <li>
                    • <strong>Right to export:</strong> Download a copy of your health data in standard format
                  </li>
                  <li>
                    • <strong>Right to withdraw consent:</strong> Revoke data sharing permissions at any time
                  </li>
                  <li>
                    • <strong>Right to correction:</strong> Update or correct any inaccurate information
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-muted/30">
            <h3 className="text-xl font-bold mb-3">Responsible AI & Data Usage</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Our AI models are trained on anonymized, aggregated data. Individual health records are never used for
              model training without explicit consent. All AI recommendations include explanations and are designed to
              supplement, not replace, professional medical advice.
            </p>
          </Card>

          <Card className="p-6 border-trust bg-trust/5">
            <h3 className="text-xl font-bold mb-3">Questions About Your Privacy?</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have any questions or concerns about how we handle your data, please contact our privacy team at
              privacy@sehatsaheli.org
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Last updated:</strong> January 2025
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
