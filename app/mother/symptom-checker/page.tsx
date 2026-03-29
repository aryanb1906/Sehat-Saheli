"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle, AlertTriangle, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"

interface SymptomResult {
    symptom: string
    severityLevel: "Mild" | "Moderate" | "Severe"
    possibleConditions: string[]
    recommendedAction: "Home Care" | "Contact ASHA" | "Visit Hospital" | "Call 108"
    homeCareTips?: string[]
    whenToSeekHelp: string[]
}

export default function SymptomCheckerPage() {
    const router = useRouter()
    const { content } = useLanguage()
    const { toast } = useToast()
    const [selectedSymptom, setSelectedSymptom] = useState("")
    const [result, setResult] = useState<SymptomResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const commonSymptoms = [
        "Severe Vaginal Bleeding",
        "Severe Abdominal Pain",
        "Fever",
        "Unusual Swelling",
        "Dizziness or Fainting",
        "Severe Headache",
        "No Fetal Movement",
    ]

    const checkSymptom = async (symptom: string) => {
        setError("")

        if (!symptom || symptom.trim().length < 5) {
            setError("Please describe your symptom in at least 5 characters")
            toast({
                title: "⚠️ Input Error",
                description: "Please provide more details about your symptom",
                variant: "destructive",
            })
            return
        }

        setLoading(true)
        try {
            const response = await fetch("/api/ai-assessment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "symptom-check",
                    data: { symptom },
                }),
            })

            const data = await response.json()
            setResult(data.result)
            toast({
                title: "✅ Analysis Complete",
                description: "Review the recommendations below carefully",
            })
        } catch (error) {
            console.error("Failed to check symptom:", error)
            toast({
                title: "Error",
                description: "Failed to analyze symptom. Please try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const getActionColor = (action: string) => {
        switch (action) {
            case "Call 108":
                return "bg-alert"
            case "Visit Hospital":
                return "bg-warning"
            case "Contact ASHA":
                return "bg-blue-600"
            default:
                return "bg-success"
        }
    }

    const getSeverityBadge = (severity: string) => {
        const badges: Record<string, { label: string; color: string }> = {
            Mild: { label: "Mild", color: "bg-blue-100 text-blue-800" },
            Moderate: { label: "Moderate", color: "bg-warning/20 text-warning" },
            Severe: { label: "Severe", color: "bg-alert/20 text-alert" },
        }
        return badges[severity]
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-princess-1/20 via-white to-princess-1/10 pb-10">
            <div className="mx-3 mt-4 overflow-hidden rounded-3xl bg-gradient-to-r from-princess-4 to-primary p-5 text-white sticky top-4 z-30 shadow-lg shadow-princess-4/20 border border-white/20 md:mx-6 2xl:mx-auto 2xl:max-w-7xl">
                <div className="flex items-center gap-4 mb-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold">AI Symptom Checker</h1>
                </div>
                <p className="text-white/90 leading-relaxed">Report symptoms and get expert recommendations</p>
            </div>

            <div className="p-6 max-w-4xl mx-auto">
                {!result ? (
                    <>
                        <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
                            <p className="text-sm text-foreground/80 leading-relaxed">
                                ⚠️ <strong>Important:</strong> This is not a medical diagnosis. If experiencing
                                emergency symptoms, call 108 immediately.
                            </p>
                        </Card>

                        <div>
                            <h2 className="text-lg font-bold mb-4 leading-relaxed">Select or describe your symptom:</h2>

                            {error && (
                                <Card className="p-4 mb-4 bg-alert/10 border-alert/50">
                                    <p className="text-sm text-alert leading-relaxed">{error}</p>
                                </Card>
                            )}

                            <div className="grid md:grid-cols-2 gap-3 mb-6">
                                {commonSymptoms.map((symptom) => (
                                    <Button
                                        key={symptom}
                                        variant="outline"
                                        className="justify-start h-auto py-3 text-left leading-relaxed"
                                        onClick={() => checkSymptom(symptom)}
                                        disabled={loading}
                                    >
                                        {symptom}
                                    </Button>
                                ))}
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold mb-2 leading-relaxed">Or describe your symptom:</label>
                                <textarea
                                    className="w-full p-4 border border-gray-300 rounded-lg leading-relaxed"
                                    rows={4}
                                    placeholder="Describe what you're experiencing..."
                                    onChange={(e) => {
                                        setSelectedSymptom(e.target.value)
                                        setError("")
                                    }}
                                    value={selectedSymptom}
                                ></textarea>
                                <Button
                                    className="w-full mt-3 bg-accent text-white h-11"
                                    onClick={() => checkSymptom(selectedSymptom)}
                                    disabled={!selectedSymptom || loading}
                                >
                                    {loading ? "Analyzing..." : "Check Symptom"}
                                </Button>
                            </div>
                        </div>
                    </>
                ) : loading ? (
                    <div className="space-y-6">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Result Header */}
                        <Card className={`p-6 text-white ${getActionColor(result.recommendedAction)}`}>
                            <div className="flex items-start gap-4">
                                <div>
                                    {result.recommendedAction === "Call 108" && (
                                        <AlertTriangle className="w-8 h-8" />
                                    )}
                                    {result.recommendedAction === "Visit Hospital" && (
                                        <AlertTriangle className="w-8 h-8" />
                                    )}
                                    {result.recommendedAction !== "Call 108" &&
                                        result.recommendedAction !== "Visit Hospital" && (
                                            <CheckCircle className="w-8 h-8" />
                                        )}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold mb-2 leading-relaxed">{result.symptom}</h2>
                                    <p className="text-lg font-semibold leading-relaxed">
                                        Recommended Action: {result.recommendedAction}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Severity */}
                        <Card className="p-6">
                            <h3 className="font-bold mb-3 leading-relaxed">Severity Level</h3>
                            <span
                                className={`inline-block px-4 py-2 rounded-full font-semibold ${getSeverityBadge(result.severityLevel).color
                                    }`}
                            >
                                {result.severityLevel}
                            </span>
                        </Card>

                        {/* When to Seek Help */}
                        <Card className="p-6 border-alert/30 bg-alert/5">
                            <h3 className="font-bold mb-3 text-alert leading-relaxed">⚠️ When to Seek Help</h3>
                            <ul className="space-y-2">
                                {result.whenToSeekHelp.map((tip, i) => (
                                    <li key={i} className="flex gap-2 text-sm leading-relaxed">
                                        <span className="text-alert flex-shrink-0">✓</span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        {/* Possible Conditions */}
                        <Card className="p-6">
                            <h3 className="font-bold mb-3 leading-relaxed">Possible Conditions</h3>
                            <ul className="space-y-2">
                                {result.possibleConditions.map((condition, i) => (
                                    <li key={i} className="text-sm p-2 bg-gray-50 rounded leading-relaxed">
                                        • {condition}
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        {/* Home Care Tips */}
                        {result.homeCareTips && result.homeCareTips.length > 0 && (
                            <Card className="p-6 border-success/30 bg-success/5">
                                <h3 className="font-bold mb-3 text-success leading-relaxed">💚 Home Care Tips</h3>
                                <ul className="space-y-2">
                                    {result.homeCareTips.map((tip, i) => (
                                        <li key={i} className="flex gap-2 text-sm leading-relaxed">
                                            <span className="text-success flex-shrink-0">✓</span>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            {result.recommendedAction === "Call 108" && (
                                <Button className="flex-1 bg-alert text-white h-11">
                                    <Phone className="w-4 h-4 mr-2" />
                                    Call 108 Now
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                className="flex-1 h-11"
                                onClick={() => {
                                    setResult(null)
                                    setSelectedSymptom("")
                                    setError("")
                                }}
                            >
                                Check Another Symptom
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
