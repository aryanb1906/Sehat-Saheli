import { describe, it, expect, vi, beforeEach } from "vitest"

const prismaMock = {
    user: {
        findUnique: vi.fn(),
        create: vi.fn(),
    },
}

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))
vi.mock("@/lib/rate-limit", () => ({
    clientIp: () => "127.0.0.1",
    rateLimit: async () => ({ allowed: true, remaining: 9, resetAt: Date.now() + 60_000 }),
}))
vi.mock("@/lib/audit-log", () => ({
    addAuditEvent: async () => ({}),
}))

describe("POST /api/auth/register", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("creates a user when payload is valid", async () => {
        prismaMock.user.findUnique.mockResolvedValue(null)
        prismaMock.user.create.mockResolvedValue({
            id: "u_1",
            name: "Aryan",
            email: "aryan@example.com",
            role: "MOTHER",
        })

        const { POST } = await import("@/app/api/auth/register/route")

        const req = new Request("http://localhost/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Aryan",
                email: "aryan@example.com",
                password: "secret123",
                role: "MOTHER",
            }),
        })

        const res = await POST(req as any)
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.user.email).toBe("aryan@example.com")
    })
})
