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
            ; (global as any).__sosFallbackStore = {}
            ; (global as any).__sosStatusFallbackStore = {}
            ; (global as any).__emergencyContactsFallbackStore = {}
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

    it("supports SOS status acknowledgement flow", async () => {
        const { POST, GET } = await import("@/app/api/emergency/route")

        sessionMock.mockResolvedValue({ id: "mother_1", role: "MOTHER", email: "m@x.com" })

        const triggerRes = await POST(
            new Request("http://localhost/api/emergency", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "trigger-sos",
                    data: {
                        location: { lat: 20.2, lng: 85.8 },
                        reason: "severe pain",
                    },
                }),
            }) as any,
        )

        expect(triggerRes.status).toBe(200)
        const triggerPayload = await triggerRes.json()
        expect(triggerPayload.success).toBe(true)

        const sosId = triggerPayload.sos.id

        sessionMock.mockResolvedValue({ id: "asha_1", role: "ASHA", email: "asha@x.com" })

        const ackRes = await POST(
            new Request("http://localhost/api/emergency", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "update-sos-status",
                    data: {
                        userId: "mother_1",
                        sosId,
                        status: "acknowledged",
                    },
                }),
            }) as any,
        )

        expect(ackRes.status).toBe(200)
        const ackPayload = await ackRes.json()
        expect(ackPayload.sos.status).toBe("acknowledged")

        sessionMock.mockResolvedValue({ id: "mother_1", role: "MOTHER", email: "m@x.com" })
        const historyRes = await GET(new Request("http://localhost/api/emergency?type=history") as any)
        const historyPayload = await historyRes.json()

        expect(historyRes.status).toBe(200)
        expect(historyPayload.sosHistory[0].id).toBe(sosId)
        expect(historyPayload.sosHistory[0].status).toBe("acknowledged")
    })
})
