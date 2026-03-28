"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"

interface Task {
    id: string
    patientId: string
    taskType: string
    description: string
    dueDate: string
    status: "pending" | "in-progress" | "completed"
    priority: "low" | "medium" | "high"
    location?: string
    notes?: string
}

interface AutomationPlanItem {
    id: string
    patientId: string
    patientName: string
    village: string
    taskType: string
    description: string
    dueDate: string
    priority: "low" | "medium" | "high"
    patientRisk: "low" | "medium" | "high"
    score: number
    reasons: string[]
}

interface AutomationPlanResponse {
    success: boolean
    stats: {
        totalPending: number
        highRiskInTodayPlan: number
        remindersGenerated: number
        escalationsGenerated: number
    }
    todayPlan: AutomationPlanItem[]
    reminders: Array<{ message: string }>
    escalations: Array<{ reason: string; action: string }>
}

export default function ASHATaskManagement() {
    const router = useRouter()
    const { content } = useLanguage()
    const { toast } = useToast()
    const [tasks, setTasks] = useState<Task[]>([])
    const [filter, setFilter] = useState("all")
    const [loading, setLoading] = useState(true)
    const [automationLoading, setAutomationLoading] = useState(false)
    const [automationPlan, setAutomationPlan] = useState<AutomationPlanResponse | null>(null)

    useEffect(() => {
        fetchTasks()
    }, [])

    const fetchTasks = async () => {
        try {
            const response = await fetch("/api/asha-tasks?ashId=asha_001")
            const data = await response.json()
            setTasks(data.tasks)
        } catch (error) {
            console.error("Failed to fetch tasks:", error)
        } finally {
            setLoading(false)
        }
    }

    const updateTaskStatus = async (taskId: string, status: string) => {
        try {
            await fetch("/api/asha-tasks", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    taskId,
                    status,
                    completedAt: new Date().toISOString(),
                }),
            })

            toast({
                title: "✅ Task Updated",
                description: `Task marked as ${status.replace("-", " ")}`,
            })

            fetchTasks()
        } catch (error) {
            console.error("Failed to update task:", error)
            toast({
                title: "Error",
                description: "Failed to update task. Please try again.",
                variant: "destructive",
            })
        }
    }

    const generateAutomationPlan = async () => {
        setAutomationLoading(true)
        try {
            const response = await fetch("/api/asha-tasks/automation-plan?ashId=asha_001")
            const data = await response.json()
            setAutomationPlan(data)

            toast({
                title: "✅ Daily Plan Generated",
                description: `Prioritized ${data?.todayPlan?.length || 0} tasks with ${data?.stats?.remindersGenerated || 0} reminders`,
            })
        } catch (error) {
            console.error("Failed to generate automation plan:", error)
            toast({
                title: "Error",
                description: "Unable to generate automation plan right now.",
                variant: "destructive",
            })
        } finally {
            setAutomationLoading(false)
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-alert/20 text-alert border-alert/30"
            case "medium":
                return "bg-warning/20 text-warning border-warning/30"
            default:
                return "bg-gray-100 text-gray-700 border-gray-200"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle2 className="w-5 h-5 text-success" />
            case "in-progress":
                return <Clock className="w-5 h-5 text-warning" />
            default:
                return <AlertCircle className="w-5 h-5 text-foreground/50" />
        }
    }

    const filteredTasks = tasks.filter((t) => filter === "all" || t.status === filter)

    const stats = {
        pending: tasks.filter((t) => t.status === "pending").length,
        inProgress: tasks.filter((t) => t.status === "in-progress").length,
        completed: tasks.filter((t) => t.status === "completed").length,
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-trust/10 to-background">
            <div className="bg-gradient-to-r from-trust to-accent p-6 text-white sticky top-0 z-50">
                <div className="flex items-center gap-4 mb-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold">Task Management</h1>
                </div>
            </div>

            <div className="p-6 max-w-4xl mx-auto">
                {loading ? (
                    <div className="grid md:grid-cols-4 gap-4 mb-6">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i} className="p-4 text-center">
                                <Skeleton className="h-8 w-16 mx-auto mb-3" />
                                <Skeleton className="h-4 w-full" />
                            </Card>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid md:grid-cols-4 gap-4 mb-6">
                            <Card className="p-4 text-center">
                                <p className="text-3xl font-bold text-warning leading-relaxed">{stats.pending}</p>
                                <p className="text-sm text-foreground/60 leading-relaxed">Pending Tasks</p>
                            </Card>
                            <Card className="p-4 text-center">
                                <p className="text-3xl font-bold text-blue-600 leading-relaxed">{stats.inProgress}</p>
                                <p className="text-sm text-foreground/60 leading-relaxed">In Progress</p>
                            </Card>
                            <Card className="p-4 text-center">
                                <p className="text-3xl font-bold text-success leading-relaxed">{stats.completed}</p>
                                <p className="text-sm text-foreground/60 leading-relaxed">Completed</p>
                            </Card>
                            <Card className="p-4 text-center">
                                <p className="text-3xl font-bold text-accent leading-relaxed">
                                    {tasks.length > 0 ? Math.round((stats.completed / tasks.length) * 100) : 0}%
                                </p>
                                <p className="text-sm text-foreground/60 leading-relaxed">Completion</p>
                            </Card>
                        </div>
                    </>
                )}

                {/* Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {["all", "pending", "in-progress", "completed"].map((f) => (
                        <Button
                            key={f}
                            variant={filter === f ? "default" : "outline"}
                            onClick={() => setFilter(f)}
                            className="capitalize whitespace-nowrap h-10"
                        >
                            {f.replace("-", " ")}
                        </Button>
                    ))}
                </div>

                {/* Add Task Button */}
                <div className="mb-6 flex flex-wrap items-center gap-3">
                    <Button className="bg-trust text-white h-11">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Task
                    </Button>
                    <Button
                        variant="outline"
                        className="h-11"
                        disabled={automationLoading}
                        onClick={generateAutomationPlan}
                    >
                        {automationLoading ? "Generating plan..." : "Generate Today Plan"}
                    </Button>
                </div>

                {automationPlan?.success && (
                    <Card className="p-4 mb-6 border-trust/25 bg-trust/5">
                        <h3 className="font-semibold text-base mb-3">Automation Engine Output</h3>
                        <div className="grid md:grid-cols-4 gap-3 mb-4">
                            <div>
                                <p className="text-2xl font-bold text-trust">{automationPlan.stats.totalPending}</p>
                                <p className="text-xs text-foreground/70">Pending Tasks</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-alert">{automationPlan.stats.highRiskInTodayPlan}</p>
                                <p className="text-xs text-foreground/70">High-Risk in Plan</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-600">{automationPlan.stats.remindersGenerated}</p>
                                <p className="text-xs text-foreground/70">Smart Reminders</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-warning">{automationPlan.stats.escalationsGenerated}</p>
                                <p className="text-xs text-foreground/70">Escalations</p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <p className="text-sm font-semibold">Top Visits for Today</p>
                            {automationPlan.todayPlan.slice(0, 4).map((item) => (
                                <div key={item.id} className="rounded-lg border bg-background px-3 py-2">
                                    <p className="text-sm font-medium">{item.patientName} - {item.description}</p>
                                    <p className="text-xs text-foreground/70">
                                        {item.village} | Due {new Date(item.dueDate).toLocaleDateString()} | Score {item.score}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {automationPlan.escalations.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-warning">Escalation Alerts</p>
                                {automationPlan.escalations.slice(0, 2).map((item, index) => (
                                    <p key={index} className="text-xs text-foreground/75">
                                        • {item.reason} - {item.action}
                                    </p>
                                ))}
                            </div>
                        )}
                    </Card>
                )}

                {/* Tasks List */}
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i} className="p-4">
                                <Skeleton className="h-6 w-32 mb-3" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-10 w-24" />
                            </Card>
                        ))}
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <AlertCircle className="w-12 h-12 text-primary/30 mb-4" />
                        <p className="text-lg font-semibold leading-relaxed">No tasks found</p>
                        <p className="text-sm text-foreground/60 mt-2 leading-relaxed">All tasks completed or filtered out</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredTasks.map((task) => (
                            <Card key={task.id} className="p-4 hover:shadow-lg transition-shadow">
                                <div className="flex items-start gap-4">
                                    {getStatusIcon(task.status)}

                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-semibold leading-relaxed">{task.description}</h3>
                                                <p className="text-sm text-foreground/60 capitalize leading-relaxed">
                                                    {task.taskType.replace("-", " ")}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                                                {task.priority.toUpperCase()}
                                            </span>
                                        </div>

                                        {task.location && (
                                            <p className="text-xs text-foreground/60 mb-2 leading-relaxed">📍 {task.location}</p>
                                        )}

                                        <p className="text-xs text-foreground/60 mb-3 leading-relaxed">
                                            Due: {new Date(task.dueDate).toLocaleDateString()}
                                        </p>

                                        {task.status === "pending" && (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-10"
                                                    onClick={() => updateTaskStatus(task.id, "in-progress")}
                                                >
                                                    Start Task
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-10"
                                                    onClick={() => updateTaskStatus(task.id, "completed")}
                                                >
                                                    Mark Complete
                                                </Button>
                                            </div>
                                        )}

                                        {task.status === "in-progress" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-10"
                                                onClick={() => updateTaskStatus(task.id, "completed")}
                                            >
                                                Mark Complete
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
