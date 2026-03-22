import { NextRequest, NextResponse } from "next/server";

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
        const { searchParams } = new URL(req.url);
        const ashId = searchParams.get("ashId");
        const status = searchParams.get("status");

        // Mock data
        const tasks: Task[] = [
            {
                id: "task_001",
                ashId: "asha_001",
                patientId: "patient_001",
                taskType: "home-visit",
                description: "Weekly ANC checkup - blood pressure & weight monitoring",
                dueDate: "2024-03-23",
                status: "pending",
                priority: "high",
                location: "Village: Sundarpur, House No. 42",
            },
            {
                id: "task_002",
                ashId: "asha_001",
                patientId: "patient_002",
                taskType: "vaccination",
                description: "Administer Tetanus toxoid dose 2",
                dueDate: "2024-03-24",
                status: "pending",
                priority: "medium",
            },
            {
                id: "task_003",
                ashId: "asha_001",
                patientId: "patient_003",
                taskType: "follow-up",
                description: "Check if patient took iron supplements regularly",
                dueDate: "2024-03-25",
                status: "in-progress",
                priority: "medium",
            },
        ];

        let filteredTasks = tasks;
        if (status) {
            filteredTasks = filteredTasks.filter((t) => t.status === status);
        }

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
        const body = await req.json();
        const { ashId, patientId, taskType, description, dueDate, priority } =
            body;

        const newTask: Task = {
            id: `task_${Date.now()}`,
            ashId,
            patientId,
            taskType,
            description,
            dueDate,
            status: "pending",
            priority,
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
        const body = await req.json();
        const { taskId, status, notes, completedAt } = body;

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
