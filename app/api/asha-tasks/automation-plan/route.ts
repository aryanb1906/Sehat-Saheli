import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { clientIp, rateLimit } from "@/lib/rate-limit"
import { hasRole, requireSessionUser } from "@/lib/api-auth"
import { failBadRequest, failForbidden, failInternal, failTooManyRequests, failUnauthorized, okWithRequestId } from "@/lib/api-response"
import { getRequestId } from "@/lib/observability"

type RiskLabel = "high" | "medium" | "low"

type PlannedTask = {
  id: string
  patientId: string
  patientName: string
  village: string
  taskType: string
  description: string
  dueDate: string
  priority: "high" | "medium" | "low"
  patientRisk: RiskLabel
  score: number
  reasons: string[]
}

type RouteBundle = {
  village: string
  taskIds: string[]
  visits: number
  highRiskVisits: number
  estimatedTravelMinutes: number
}

function daysUntil(dateText: string) {
  const target = new Date(dateText)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function toRiskLabel(risk: "LOW" | "MEDIUM" | "HIGH"): RiskLabel {
  if (risk === "HIGH") return "high"
  if (risk === "MEDIUM") return "medium"
  return "low"
}

function scoreTask(task: {
  priority: "LOW" | "MEDIUM" | "HIGH"
  risk: "LOW" | "MEDIUM" | "HIGH"
  dueDate: string
  taskType: string
}) {
  const reasons: string[] = []
  let score = 0

  if (task.priority === "HIGH") {
    score += 40
    reasons.push("high-priority task")
  } else if (task.priority === "MEDIUM") {
    score += 25
  } else {
    score += 10
  }

  if (task.risk === "HIGH") {
    score += 35
    reasons.push("high-risk patient")
  } else if (task.risk === "MEDIUM") {
    score += 20
  } else {
    score += 5
  }

  const dueIn = daysUntil(task.dueDate)
  if (dueIn < 0) {
    score += 30
    reasons.push("overdue")
  } else if (dueIn === 0) {
    score += 25
    reasons.push("due today")
  } else if (dueIn <= 2) {
    score += 15
    reasons.push("due within 48h")
  } else {
    score += 5
  }

  const normalizedType = task.taskType.toLowerCase()
  if (normalizedType.includes("vaccination")) {
    score += 10
    reasons.push("time-sensitive vaccination")
  }
  if (normalizedType.includes("follow-up")) {
    score += 8
  }
  if (normalizedType.includes("home-visit")) {
    score += 6
  }

  return { score, reasons }
}

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req)
  try {
    const user = await requireSessionUser()
    if (!user) return failUnauthorized("Authentication required", requestId)
    if (!hasRole(user.role, ["ASHA", "DOCTOR"])) return failForbidden("Not allowed to access this resource", requestId)

    const rl = await rateLimit(`asha-automation-plan:${clientIp(req)}`, 80, 60_000)
    if (!rl.allowed) return failTooManyRequests("Too many requests", undefined, requestId)

    const { searchParams } = new URL(req.url)
    const requestedAshId = searchParams.get("ashId")
    const ashId = user.role === "ASHA" ? user.id : requestedAshId || undefined
    if (!ashId) return failBadRequest("ashId is required", requestId)

    const tasks = await prisma.ashaTask.findMany({
      where: {
        ashId,
        status: "PENDING",
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            village: true,
            risk: true,
          },
        },
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
    })

    const planned: PlannedTask[] = tasks.map((task) => {
      const { score, reasons } = scoreTask({
        priority: task.priority,
        risk: task.patient.risk,
        dueDate: task.dueDate,
        taskType: task.taskType,
      })

      return {
        id: task.id,
        patientId: task.patientId,
        patientName: task.patient.name,
        village: task.patient.village,
        taskType: task.taskType,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority.toLowerCase() as "high" | "medium" | "low",
        patientRisk: toRiskLabel(task.patient.risk),
        score,
        reasons,
      }
    })

    planned.sort((a, b) => b.score - a.score)

    const todayPlan = planned.slice(0, 8)

    const reminders = planned
      .filter((task) => {
        const dueIn = daysUntil(task.dueDate)
        return dueIn <= 2
      })
      .slice(0, 12)
      .map((task) => ({
        taskId: task.id,
        patientId: task.patientId,
        patientName: task.patientName,
        dueDate: task.dueDate,
        reminderType: task.taskType,
        message: `Reminder: ${task.taskType} for ${task.patientName} due on ${task.dueDate}`,
      }))

    const escalations = planned
      .filter((task) => {
        const dueIn = daysUntil(task.dueDate)
        return dueIn < -2 && task.patientRisk === "high"
      })
      .map((task) => ({
        taskId: task.id,
        patientId: task.patientId,
        patientName: task.patientName,
        reason: `Missed high-risk follow-up for ${Math.abs(daysUntil(task.dueDate))} days`,
        action: "Escalate to supervisor and trigger urgent re-visit",
      }))

    const byVillage = new Map<string, PlannedTask[]>()
    for (const item of todayPlan) {
      const group = byVillage.get(item.village) || []
      group.push(item)
      byVillage.set(item.village, group)
    }

    const routeBundles: RouteBundle[] = Array.from(byVillage.entries())
      .map(([village, tasksInVillage]) => {
        const highRiskVisits = tasksInVillage.filter((task) => task.patientRisk === "high").length
        const estimatedTravelMinutes = 8 + tasksInVillage.length * 12
        return {
          village,
          taskIds: tasksInVillage.map((task) => task.id),
          visits: tasksInVillage.length,
          highRiskVisits,
          estimatedTravelMinutes,
        }
      })
      .sort((a, b) => {
        if (b.highRiskVisits !== a.highRiskVisits) return b.highRiskVisits - a.highRiskVisits
        return a.estimatedTravelMinutes - b.estimatedTravelMinutes
      })

    return okWithRequestId({
      ashId,
      generatedAt: new Date().toISOString(),
      stats: {
        totalPending: planned.length,
        highRiskInTodayPlan: todayPlan.filter((task) => task.patientRisk === "high").length,
        remindersGenerated: reminders.length,
        escalationsGenerated: escalations.length,
      },
      todayPlan,
      routeOptimization: {
        totalVillages: routeBundles.length,
        estimatedTotalTravelMinutes: routeBundles.reduce((acc, item) => acc + item.estimatedTravelMinutes, 0),
        bundles: routeBundles,
      },
      reminders,
      escalations,
    }, requestId)
  } catch {
    return failInternal("Failed to generate automation plan", requestId)
  }
}
