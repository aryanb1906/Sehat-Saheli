"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, Eye, Calendar, AlertCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"

interface LabReport {
    id: string
    date: string
    testType: string
    results: Record<string, string | number>
    status: "normal" | "alert" | "critical"
    doctorNotes?: string
    imageUrl?: string
}

export default function LabReportsPage() {
    const router = useRouter()
    const { toast } = useToast()
    const { content } = useLanguage()
    const [reports, setReports] = useState<LabReport[]>([])
    const [selectedReport, setSelectedReport] = useState<LabReport | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchReports()
    }, [])

    const fetchReports = async () => {
        try {
            const response = await fetch("/api/lab-reports")
            const data = await response.json()
            setReports(data.reports || [])
        } catch (error) {
            console.error("Failed to fetch reports:", error)
            toast({
                title: "Error loading lab reports",
                description: "Please check your connection and try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "critical":
                return "bg-alert/20 text-alert border-alert/30"
            case "alert":
                return "bg-warning/20 text-warning border-warning/30"
            default:
                return "bg-success/20 text-success border-success/30"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "critical":
                return <AlertCircle className="w-5 h-5 text-alert" />
            case "alert":
                return <AlertCircle className="w-5 h-5 text-warning" />
            default:
                return <Check className="w-5 h-5 text-success" />
        }
    }

    const getTestTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            blood: "🩸 Blood Test",
            ultrasound: "📊 Ultrasound",
            urine: "💧 Urine Test",
        }
        return labels[type] || type
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-princess-1/20 via-white to-princess-1/10 pb-10">
            {/* Header */}
            <div className="mx-3 mt-4 overflow-hidden rounded-3xl bg-gradient-to-r from-princess-4 to-primary p-5 text-white sticky top-4 z-30 shadow-lg shadow-princess-4/20 border border-white/20 md:mx-6 2xl:mx-auto 2xl:max-w-7xl">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold">Lab Reports & Test Results</h1>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 max-w-4xl mx-auto">
                {/* Upload New Report */}
                <Card className="mb-6 p-6 border-dashed border-2 border-trust/30 bg-trust/5">
                    <div className="text-center">
                        <p className="text-foreground/70 mb-3 leading-relaxed">
                            📁 Upload your lab reports and ultrasound images here
                        </p>
                        <Button className="bg-trust text-white h-11" onClick={() => toast({
                            title: "Upload feature coming soon",
                            description: "You'll be able to upload reports directly."
                        })}>
                            Upload Report
                        </Button>
                    </div>
                </Card>

                {/* Reports Timeline - Loading State */}
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i} className="p-6">
                                <div className="space-y-4">
                                    <Skeleton className="h-6 w-1/3" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <div className="grid grid-cols-4 gap-3">
                                        {[...Array(4)].map((_, j) => (
                                            <Skeleton key={j} className="h-12 w-full" />
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : !reports || reports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <AlertCircle className="w-12 h-12 text-trust/30 mb-4" />
                        <p className="text-lg font-semibold text-foreground/80">No lab reports yet</p>
                        <p className="text-sm text-foreground/60 mt-2 leading-relaxed">Start uploading your test results to track your health</p>
                        <Button variant="outline" className="mt-4 h-11" onClick={() => toast({
                            title: "Upload your first report",
                            description: "Lab reports help track your pregnancy health."
                        })}>
                            Upload First Report
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reports?.map((report) => (
                            <Card
                                key={report.id}
                                className={`p-6 cursor-pointer hover:shadow-lg transition-all border ${getStatusColor(
                                    report.status
                                )}`}
                                onClick={() => setSelectedReport(report)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            {getStatusIcon(report.status)}
                                            <span className="font-semibold leading-relaxed">{getTestTypeLabel(report.testType)}</span>
                                        </div>
                                        <p className="text-sm text-foreground/60 flex items-center gap-2 leading-relaxed">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(report.date).toLocaleDateString("en-IN", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                                report.status
                                            )}`}
                                        >
                                            {report.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {/* Quick Results Preview */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {Object.entries(report.results)
                                        .slice(0, 4)
                                        .map(([key, value]: [string, any]) => (
                                            <div key={key} className="bg-white/50 rounded p-2">
                                                <p className="text-xs text-foreground/60 capitalize leading-relaxed">{key}</p>
                                                <p className="text-sm font-semibold leading-relaxed">{String(value)}</p>
                                            </div>
                                        ))}
                                </div>

                                {report.doctorNotes && (
                                    <p className="text-sm mt-3 p-3 bg-blue-50 rounded text-foreground/80 leading-relaxed">
                                        💬 {report.doctorNotes}
                                    </p>
                                )}

                                <div className="flex gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-10"
                                        onClick={() => setSelectedReport(report)}
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        View Details
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-10" onClick={() => toast({
                                        title: "✅ Downloaded",
                                        description: `${report.testType} report downloaded successfully.`
                                    })}>
                                        <Download className="w-4 h-4 mr-1" />
                                        Download
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Report Detail Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-2xl w-full max-h-96 overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">
                                    {getTestTypeLabel(selectedReport.testType)}
                                </h2>
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedReport(null)}
                                >
                                    ✕
                                </Button>
                            </div>

                            <div className="mb-6">
                                <p className="text-sm text-foreground/60 mb-2">Test Date</p>
                                <p className="text-lg font-semibold">{selectedReport.date}</p>
                            </div>

                            <div className="mb-6">
                                <p className="text-sm text-foreground/60 mb-3">Results</p>
                                <div className="space-y-2 leading-relaxed">
                                    {Object.entries(selectedReport.results).map(([key, value]) => (
                                        <div
                                            key={key}
                                            className="flex justify-between p-3 bg-gray-50 rounded"
                                        >
                                            <span className="font-medium capitalize">{key}</span>
                                            <span className="text-foreground/70">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedReport.doctorNotes && (
                                <div className="mb-6">
                                    <p className="text-sm text-foreground/60 mb-2">Doctor Notes</p>
                                    <p className="p-4 bg-blue-50 rounded text-foreground">
                                        {selectedReport.doctorNotes}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button className="flex-1 bg-trust text-white h-11" onClick={() => toast({
                                    title: "Shared with Doctor",
                                    description: "Your lab report has been shared."
                                })}>
                                    Share with Doctor
                                </Button>
                                <Button variant="outline" className="flex-1 h-11" onClick={() => toast({
                                    title: "Downloaded PDF",
                                    description: "Lab report downloaded as PDF."
                                })}>
                                    Download PDF
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
