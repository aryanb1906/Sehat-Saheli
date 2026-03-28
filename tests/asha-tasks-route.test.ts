import { describe, it, expect, vi, beforeEach } from "vitest"

const prismaMock = {
    ashaTask: {
        findMany: vi.fn(),
    },
}

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))
vi.mock("@/lib/rate-limit", () => ({
    clientIp: () => "127.0.0.1",
    rateLimit: async () => ({ allowed: true, remaining: 99, resetAt: Date.now() + 60_000 }),
}))
vi.mock("@/lib/api-auth", () => ({
    requireSessionUser: async () => ({ id: "asha_001", role: "ASHA", email: "asha@example.com" }),
    hasRole: (role: string, allowed: string[]) => allowed.includes(role),
}))

describe("GET /api/asha-tasks", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("returns mapped task data", async () => {
        prismaMock.ashaTask.findMany.mockResolvedValue([
            {
                id: "t_1",
                ashId: "asha_001",
                patientId: "p_1",
                taskType: "home-visit",
                description: "Visit patient",
                dueDate: "2026-03-30",
                status: "PENDING",
                priority: "HIGH",
                location: "Rampur",
                notes: null,
                completedAt: null,
            },
        ])

        const { GET } = await import("@/app/api/asha-tasks/route")
        const req = new Request("http://localhost/api/asha-tasks?ashId=asha_001")

        const res = await GET(req as any)
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.tasks[0].status).toBe("pending")
        expect(data.tasks[0].priority).toBe("high")
    })
})
