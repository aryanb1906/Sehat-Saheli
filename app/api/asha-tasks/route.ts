import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { addAuditEvent } from "@/lib/audit-log";
import { hasRole, requireSessionUser } from "@/lib/api-auth";
import { failBadRequest, failForbidden, failInternal, failTooManyRequests, failUnauthorized, okWithRequestId } from "@/lib/api-response";
import { readIdempotent, writeIdempotent } from "@/lib/idempotency";
import { getRequestId } from "@/lib/observability";

interface Task {
    id: string;
    ashId: string;
    patientId: string;
    taskType: string; // "home-visit", "follow-up", "vaccination", "training"
    description: string;
    dueDate: string;
    status: "pending" | "in-progress" | "completed";
    priority: "low" | "medium" | "high";
    location?: string;
    notes?: string;
    completedAt?: string;
}

export async function GET(req: NextRequest) {
    const requestId = getRequestId(req)
    try {
        const user = await requireSessionUser()
        if (!user) return failUnauthorized("Authentication required", requestId)
        if (!hasRole(user.role, ["ASHA", "DOCTOR"])) return failForbidden("Not allowed to access this resource", requestId)

        const rl = await rateLimit(`asha-tasks-get:${user.id}:${clientIp(req)}`, 100, 60_000)
        if (!rl.allowed) return failTooManyRequests("Too many requests", undefined, requestId)

        const { searchParams } = new URL(req.url);
        const requestedAshId = searchParams.get("ashId");
        const ashId = user.role === "ASHA" ? user.id : requestedAshId || undefined;
        const status = searchParams.get("status");

        if (!ashId && user.role !== "DOCTOR") {
            return failForbidden("Not allowed to access this resource", requestId)
        }

        const dbTasks = await prisma.ashaTask.findMany({
            where: {
                ...(ashId ? { ashId } : {}),
                ...(status
                    ? {
                        status:
                            status === "completed"
                                ? "COMPLETED"
                                : status === "in-progress"
                                    ? "IN_PROGRESS"
                                    : "PENDING",
                    }
                    : {}),
            },
            orderBy: { dueDate: "asc" },
        })

        const filteredTasks: Task[] = dbTasks.map((task) => ({
            id: task.id,
            ashId: task.ashId,
            patientId: task.patientId,
            taskType: task.taskType,
            description: task.description,
            dueDate: task.dueDate,
            status:
                task.status === "IN_PROGRESS"
                    ? "in-progress"
                    : task.status === "COMPLETED"
                        ? "completed"
                        : "pending",
            priority: task.priority.toLowerCase() as Task["priority"],
            location: task.location || undefined,
            notes: task.notes || undefined,
            completedAt: task.completedAt || undefined,
        }))

        return okWithRequestId({
            tasks: filteredTasks,
            totalTasks: filteredTasks.length,
        }, requestId);
    } catch (error) {
        return failInternal("Failed to fetch tasks", requestId)
    }
}

export async function POST(req: NextRequest) {
    const requestId = getRequestId(req)
    try {
        const user = await requireSessionUser()
        if (!user) return failUnauthorized("Authentication required", requestId)
        if (!hasRole(user.role, ["ASHA", "DOCTOR"])) return failForbidden("Not allowed to access this resource", requestId)

        const rl = await rateLimit(`asha-tasks-post:${user.id}:${clientIp(req)}`, 40, 60_000)
        if (!rl.allowed) return failTooManyRequests("Too many create requests", undefined, requestId)

        const idempotencyKey = req.headers.get("idempotency-key")
        if (idempotencyKey) {
            const cached = await readIdempotent(`asha-tasks:create:${user.id}:${idempotencyKey}`)
            if (cached) return NextResponse.json(cached.body, { status: cached.status })
        }

        const body = await req.json();
        const parsed = z
            .object({
                ashId: z.string().min(1),
                patientId: z.string().min(1),
                taskType: z.string().min(2),
                description: z.string().min(5),
                dueDate: z.string().min(8),
                priority: z.enum(["low", "medium", "high"]),
                location: z.string().optional(),
            })
            .safeParse(body)

        if (!parsed.success) {
            return failBadRequest("Invalid payload", requestId)
        }

        const { ashId, patientId, taskType, description, dueDate, priority, location } = parsed.data;
        if (user.role === "ASHA" && ashId !== user.id) {
            return failForbidden("Cannot create tasks for another ASHA worker", requestId)
        }

        const created = await prisma.ashaTask.create({
            data: {
                ashId,
                patientId,
                taskType,
                description,
                dueDate,
                priority: priority === "high" ? "HIGH" : priority === "low" ? "LOW" : "MEDIUM",
                location,
            },
        })

        const newTask: Task = {
            id: created.id,
            ashId,
            patientId,
            taskType,
            description,
            dueDate,
            status: "pending",
            priority,
            location: created.location || undefined,
        };

        const payload = {
            success: true,
            requestId,
            message: "Task created successfully",
            task: newTask,
        }
        if (idempotencyKey) await writeIdempotent(`asha-tasks:create:${user.id}:${idempotencyKey}`, 200, payload)
        return okWithRequestId({ message: "Task created successfully", task: newTask }, requestId);
    } catch (error) {
        return failInternal("Failed to create task", requestId)
    }
}

export async function PUT(req: NextRequest) {
    const requestId = getRequestId(req)
    try {
        const user = await requireSessionUser()
        if (!user) return failUnauthorized("Authentication required", requestId)
        if (!hasRole(user.role, ["ASHA", "DOCTOR"])) return failForbidden("Not allowed to access this resource", requestId)

        const rl = await rateLimit(`asha-tasks-put:${user.id}:${clientIp(req)}`, 60, 60_000)
        if (!rl.allowed) return failTooManyRequests("Too many update requests", undefined, requestId)

        const idempotencyKey = req.headers.get("idempotency-key")
        if (idempotencyKey) {
            const cached = await readIdempotent(`asha-tasks:update:${user.id}:${idempotencyKey}`)
            if (cached) return NextResponse.json(cached.body, { status: cached.status })
        }

        const body = await req.json();
        const parsed = z
            .object({
                taskId: z.string().min(1),
                status: z.enum(["pending", "in-progress", "completed"]),
                notes: z.string().optional(),
                completedAt: z.string().optional(),
            })
            .safeParse(body)

        if (!parsed.success) {
            return failBadRequest("Invalid payload", requestId)
        }

        const { taskId, status, notes, completedAt } = parsed.data;

        await prisma.ashaTask.update({
            where: { id: taskId },
            data: {
                status: status === "completed" ? "COMPLETED" : status === "in-progress" ? "IN_PROGRESS" : "PENDING",
                notes,
                completedAt,
            },
        })

        await addAuditEvent({
            actorRole: "ASHA",
            action: "TASK_STATUS_UPDATED",
            resource: "asha-task",
            metadata: { taskId, status },
        })

        const payload = {
            success: true,
            requestId,
            message: "Task updated successfully",
            task: { id: taskId, status, notes, completedAt },
        }
        if (idempotencyKey) await writeIdempotent(`asha-tasks:update:${user.id}:${idempotencyKey}`, 200, payload)
        return okWithRequestId({ message: "Task updated successfully", task: { id: taskId, status, notes, completedAt } }, requestId);
    } catch (error) {
        return failInternal("Failed to update task", requestId)
    }
}
