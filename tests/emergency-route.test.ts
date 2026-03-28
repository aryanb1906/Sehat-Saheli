import { beforeEach, describe, expect, it, vi } from "vitest"

const sessionMock = vi.fn()

vi.mock("@/lib/api-auth", () => ({
    requireSessionUser: () => sessionMock(),
}))

vi.mock("@/lib/rate-limit", () => ({
    clientIp: () => "127.0.0.1",
    rateLimit: async () => ({ allowed: true, remaining: 80, resetAt: Date.now() + 60_000 }),
}))

vi.mock("@/lib/audit-log", () => ({
    addAuditEvent: async () => ({}),
}))

describe("/api/emergency route", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("returns unauthorized without session", async () => {
        sessionMock.mockResolvedValueOnce(null)
        const { GET } = await import("@/app/api/emergency/route")
        const res = await GET(new Request("http://localhost/api/emergency?type=contacts") as any)

        expect(res.status).toBe(401)
    })

    it("validates SOS payload", async () => {
        sessionMock.mockResolvedValueOnce({ id: "mother_1", role: "MOTHER", email: "m@x.com" })

        const { POST } = await import("@/app/api/emergency/route")
        const res = await POST(
            new Request("http://localhost/api/emergency", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "trigger-sos", data: { reason: "pain" } }),
            }) as any,
        )

        expect(res.status).toBe(400)
    })
})
