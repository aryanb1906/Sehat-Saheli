"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Video, Calendar, Clock, Phone, Star, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"

interface Consultation {
    id: string
    doctorName: string
    specialization: string
    date: string
    time: string
    duration: number
    status: "scheduled" | "completed" | "cancelled"
    notes?: string
    rating?: number
}

export default function VideoConsultationPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const { content } = useLanguage()
    const { toast } = useToast()
    const patientId = (session?.user?.id as string) || "demo-mother"
    const [consultations, setConsultations] = useState<Consultation[]>([])
    const [loading, setLoading] = useState(true)
    const [showScheduleForm, setShowScheduleForm] = useState(false)
    const [formStep, setFormStep] = useState(1)
    const [formData, setFormData] = useState({
        specialty: "General Checkup",
        date: "",
        time: "",
        reason: "",
    })
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
    const [selectedReport, setSelectedReport] = useState<Consultation | null>(null)

    useEffect(() => {
        fetchConsultations()
    }, [patientId])

    const fetchConsultations = async () => {
        try {
            const response = await fetch(`/api/video-consultation?patientId=${patientId}`)
            const data = await response.json()
            setConsultations(data.consultations)
        } catch (error) {
            console.error("Failed to fetch consultations:", error)
            toast({
                title: "Error",
                description: "Failed to load consultations",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const validateStep = (step: number) => {
        const errors: Record<string, string> = {}

        if (step === 1 && !formData.specialty) {
            errors.specialty = "Please select a specialty"
        }

        if (step === 2) {
            if (!formData.date) errors.date = "Please select a date"
            if (!formData.time) errors.time = "Please select a time"
        }

        if (step === 3) {
            if (formData.reason.length < 10) {
                errors.reason = "Please provide at least 10 characters"
            }
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleNextStep = () => {
        if (validateStep(formStep)) {
            setFormStep(formStep + 1)
        }
    }

    const handleSubmit = async () => {
        if (validateStep(formStep)) {
            try {
                await fetch("/api/video-consultation", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "book-consultation",
                        patientId,
                        data: formData,
                    }),
                })

                toast({
                    title: "✅ Appointment Confirmed!",
                    description: "Your consultation has been booked successfully",
                })

                setShowScheduleForm(false)
                setFormStep(1)
                setFormData({ specialty: "General Checkup", date: "", time: "", reason: "" })
                fetchConsultations()
            } catch (error) {
                console.error("Failed to book consultation:", error)
                toast({
                    title: "Error",
                    description: "Failed to book consultation. Please try again.",
                    variant: "destructive",
                })
            }
        }
    }

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { label: string; color: string }> = {
            scheduled: { label: "Upcoming", color: "bg-blue-100 text-blue-800" },
            completed: { label: "Completed", color: "bg-success/20 text-success" },
            cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-800" },
        }
        return badges[status] || badges.scheduled
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-princess-1/20 via-white to-princess-1/10 pb-10">
            <div className="mx-3 mt-4 overflow-hidden rounded-3xl bg-gradient-to-r from-princess-4 to-primary p-5 text-white sticky top-4 z-30 shadow-lg shadow-princess-4/20 border border-white/20 md:mx-6 2xl:mx-auto 2xl:max-w-7xl">
                <div className="flex items-center gap-4 mb-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white h-11 w-11"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold">Video Consultation</h1>
                </div>
                <p className="text-white/90 leading-relaxed">Connect with doctors from home</p>
            </div>

            <div className="p-6 max-w-4xl mx-auto">
                <Card className="mb-6 p-6 bg-gradient-to-r from-trust/20 to-accent/20 border-trust/30">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold mb-2 leading-relaxed">Schedule a New Consultation</h2>
                            <p className="text-foreground/70 text-sm leading-relaxed">
                                Connect with specialists for medical guidance
                            </p>
                        </div>
                        <Button
                            onClick={() => {
                                setShowScheduleForm(!showScheduleForm)
                                setFormStep(1)
                            }}
                            className="bg-trust text-white h-11 whitespace-nowrap"
                        >
                            <Video className="w-4 h-4 mr-2" />
                            Schedule Now
                        </Button>
                    </div>
                </Card>

                {showScheduleForm && (
                    <Card className="mb-6 p-6 border-trust/50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold leading-relaxed">Step {formStep} of 3: Appointment Details</h3>
                            <button
                                onClick={() => setShowScheduleForm(false)}
                                className="text-foreground/60 hover:text-foreground text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex gap-2 mb-6">
                            {[1, 2, 3].map((step) => (
                                <div
                                    key={step}
                                    className={`flex-1 h-2 rounded-full transition ${step <= formStep ? "bg-trust" : "bg-gray-200"
                                        }`}
                                />
                            ))}
                        </div>

                        {formStep === 1 && (
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold mb-2 leading-relaxed">
                                    Select Doctor Specialty
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {["General Checkup", "Obstetrician", "Nutritionist", "Mental Health"].map(
                                        (spec) => (
                                            <button
                                                key={spec}
                                                onClick={() => setFormData({ ...formData, specialty: spec })}
                                                className={`p-4 rounded-lg border-2 text-sm font-semibold transition h-14 ${formData.specialty === spec
                                                        ? "border-trust bg-trust/10 text-trust"
                                                        : "border-gray-200 hover:border-trust/30"
                                                    }`}
                                            >
                                                {spec}
                                            </button>
                                        )
                                    )}
                                </div>
                                {formErrors.specialty && (
                                    <p className="text-alert text-sm mt-2 leading-relaxed">{formErrors.specialty}</p>
                                )}
                                <Button className="w-full bg-trust text-white h-11 mt-4" onClick={handleNextStep}>
                                    Continue
                                </Button>
                            </div>
                        )}

                        {formStep === 2 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 leading-relaxed">
                                        Preferred Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => {
                                            setFormData({ ...formData, date: e.target.value })
                                            if (formErrors.date) setFormErrors({ ...formErrors, date: "" })
                                        }}
                                        className={`w-full p-3 border rounded-lg h-11 leading-relaxed ${formErrors.date ? "border-alert" : "border-gray-300"
                                            }`}
                                    />
                                    {formErrors.date && (
                                        <p className="text-alert text-sm mt-1 leading-relaxed">{formErrors.date}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2 leading-relaxed">
                                        Preferred Time
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => {
                                            setFormData({ ...formData, time: e.target.value })
                                            if (formErrors.time) setFormErrors({ ...formErrors, time: "" })
                                        }}
                                        className={`w-full p-3 border rounded-lg h-11 leading-relaxed ${formErrors.time ? "border-alert" : "border-gray-300"
                                            }`}
                                    />
                                    {formErrors.time && (
                                        <p className="text-alert text-sm mt-1 leading-relaxed">{formErrors.time}</p>
                                    )}
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <Button variant="outline" className="flex-1 h-11" onClick={() => setFormStep(1)}>
                                        Back
                                    </Button>
                                    <Button className="flex-1 bg-trust text-white h-11" onClick={handleNextStep}>
                                        Continue
                                    </Button>
                                </div>
                            </div>
                        )}

                        {formStep === 3 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 leading-relaxed">
                                        Reason for Visit
                                    </label>
                                    <textarea
                                        value={formData.reason}
                                        onChange={(e) => {
                                            setFormData({ ...formData, reason: e.target.value })
                                            if (formErrors.reason) setFormErrors({ ...formErrors, reason: "" })
                                        }}
                                        className={`w-full p-3 border rounded-lg leading-relaxed ${formErrors.reason ? "border-alert" : "border-gray-300"
                                            }`}
                                        rows={3}
                                        placeholder="Describe your health concern..."
                                    />
                                    <p className="text-xs text-foreground/60 mt-1 leading-relaxed">
                                        {formData.reason.length}/200 characters
                                    </p>
                                    {formErrors.reason && (
                                        <p className="text-alert text-sm mt-1 leading-relaxed">{formErrors.reason}</p>
                                    )}
                                </div>

                                <Card className="p-4 bg-success/5 border-success/30">
                                    <p className="text-sm font-semibold mb-3 leading-relaxed">📋 Appointment Summary</p>
                                    <div className="space-y-2 text-sm text-foreground/70 leading-relaxed">
                                        <p>
                                            👋 <strong>Specialty:</strong> {formData.specialty}
                                        </p>
                                        <p>
                                            📅 <strong>Date:</strong>{" "}
                                            {new Date(formData.date).toLocaleDateString("en-IN", {
                                                weekday: "short",
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </p>
                                        <p>
                                            🕐 <strong>Time:</strong> {formData.time}
                                        </p>
                                    </div>
                                </Card>

                                <div className="flex gap-3 mt-4">
                                    <Button variant="outline" className="flex-1 h-11" onClick={() => setFormStep(2)}>
                                        Back
                                    </Button>
                                    <Button className="flex-1 bg-success text-white h-11" onClick={handleSubmit}>
                                        Confirm Appointment
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                )}

                <h2 className="text-xl font-bold mb-4 leading-relaxed">Your Consultations</h2>
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(2)].map((_, i) => (
                            <Card key={i} className="p-6">
                                <Skeleton className="h-6 w-1/3 mb-4" />
                                <div className="grid md:grid-cols-3 gap-4">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : consultations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Video className="w-12 h-12 text-trust/30 mb-4" />
                        <p className="text-lg font-semibold text-foreground/80 leading-relaxed">No consultations yet</p>
                        <p className="text-sm text-foreground/60 mt-2 leading-relaxed">
                            Schedule your first video consultation
                        </p>
                        <Button
                            className="mt-4 bg-trust text-white h-11"
                            onClick={() => {
                                setShowScheduleForm(true)
                                setFormStep(1)
                            }}
                        >
                            <Video className="w-4 h-4 mr-2" />
                            Schedule First Consultation
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {consultations.map((consultation) => (
                            <Card key={consultation.id} className="p-6 hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start gap-4 mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold leading-relaxed">{consultation.doctorName}</h3>
                                        <p className="text-sm text-foreground/60 leading-relaxed">
                                            {consultation.specialization}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${getStatusBadge(consultation.status).color
                                            }`}
                                    >
                                        {getStatusBadge(consultation.status).label}
                                    </span>
                                </div>

                                <div className="grid md:grid-cols-3 gap-4 mb-4">
                                    <div className="flex items-center gap-2 text-foreground/70 leading-relaxed">
                                        <Calendar className="w-4 h-4 flex-shrink-0" />
                                        {new Date(consultation.date).toLocaleDateString("en-IN")}
                                    </div>
                                    <div className="flex items-center gap-2 text-foreground/70 leading-relaxed">
                                        <Clock className="w-4 h-4 flex-shrink-0" />
                                        {consultation.time}
                                    </div>
                                    <div className="flex items-center gap-2 text-foreground/70 leading-relaxed">
                                        <Phone className="w-4 h-4 flex-shrink-0" />
                                        {consultation.duration} min
                                    </div>
                                </div>

                                {consultation.notes && (
                                    <p className="mb-4 p-3 bg-blue-50 rounded text-sm text-foreground/80 leading-relaxed">
                                        💬 {consultation.notes}
                                    </p>
                                )}

                                {consultation.rating && (
                                    <div className="mb-4 flex items-center gap-2">
                                        <span className="text-sm font-semibold leading-relaxed">Rating:</span>
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < (consultation.rating ?? 0)
                                                            ? "fill-warning text-warning"
                                                            : "text-gray-300"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    {consultation.status === "scheduled" && (
                                        <>
                                            <Button
                                                className="flex-1 bg-trust text-white h-11"
                                                onClick={() =>
                                                    toast({
                                                        title: "Joining consultation room...",
                                                        description: "Connecting with doctor",
                                                    })
                                                }
                                            >
                                                <Video className="w-4 h-4 mr-2" />
                                                Join
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="h-11"
                                                onClick={() =>
                                                    toast({
                                                        title: "Cancelled",
                                                        description: "Consultation cancelled",
                                                    })
                                                }
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    )}
                                    {consultation.status === "completed" && (
                                        <>
                                            <Button
                                                variant="outline"
                                                className="flex-1 h-11"
                                                onClick={() =>
                                                    toast({
                                                        title: "Message sent",
                                                        description: "Follow-up sent to doctor",
                                                    })
                                                }
                                            >
                                                <MessageSquare className="w-4 h-4 mr-2" />
                                                Follow-up
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="h-11"
                                                onClick={() =>
                                                    toast({
                                                        title: "Shared",
                                                        description: "Report shared",
                                                    })
                                                }
                                            >
                                                Share
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
