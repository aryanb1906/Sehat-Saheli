import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";

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
    try {
        const rl = await rateLimit(`asha-tasks-get:${clientIp(req)}`, 100, 60_000)
        if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 })

        const { searchParams } = new URL(req.url);
        const ashId = searchParams.get("ashId") || "asha_001";
        const status = searchParams.get("status");

        const dbTasks = await prisma.ashaTask.findMany({
            where: {
                ashId,
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

        return NextResponse.json({
            success: true,
            tasks: filteredTasks,
            totalTasks: filteredTasks.length,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch tasks" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const rl = await rateLimit(`asha-tasks-post:${clientIp(req)}`, 40, 60_000)
        if (!rl.allowed) return NextResponse.json({ error: "Too many create requests" }, { status: 429 })

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
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
        }

        const { ashId, patientId, taskType, description, dueDate, priority, location } = parsed.data;

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

        return NextResponse.json({
            success: true,
            message: "Task created successfully",
            task: newTask,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create task" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const rl = await rateLimit(`asha-tasks-put:${clientIp(req)}`, 60, 60_000)
        if (!rl.allowed) return NextResponse.json({ error: "Too many update requests" }, { status: 429 })

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
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
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

        return NextResponse.json({
            success: true,
            message: "Task updated successfully",
            task: { id: taskId, status, notes, completedAt },
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to update task" },
            { status: 500 }
        );
    }
}
