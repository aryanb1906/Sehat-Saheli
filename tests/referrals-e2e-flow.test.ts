import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const sessionMock = vi.fn()

vi.mock("@/lib/api-auth", () => ({
    requireSessionUser: () => sessionMock(),
    hasRole: (role: string, allowed: string[]) => allowed.includes(role),
}))

vi.mock("@/lib/rate-limit", () => ({
    clientIp: () => "127.0.0.1",
    rateLimit: async () => ({ allowed: true, remaining: 99, resetAt: Date.now() + 60_000 }),
}))

describe("Referral SLA flow e2e", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.useFakeTimers()
        vi.setSystemTime(new Date("2026-03-29T08:00:00.000Z"))
            ; (global as any).__referralFallbackStore = {}
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("creates referral, auto-breaches on SLA expiry, and returns breach alert", async () => {
        sessionMock.mockResolvedValue({ id: "doctor_1", role: "DOCTOR", email: "doctor@example.com" })

        const { POST, GET } = await import("@/app/api/referrals/route")

        const createRes = await POST(
            new Request("http://localhost/api/referrals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId: "mother_1",
                    consultationId: "cons_1",
                    note: "Urgent high-risk BP referral",
                    status: "generated",
                }),
            }) as any,
        )

        expect(createRes.status).toBe(200)

        vi.setSystemTime(new Date("2026-03-29T22:30:00.000Z"))

        const listRes = await GET(new Request("http://localhost/api/referrals?patientId=mother_1") as any)
        const data = await listRes.json()

        expect(listRes.status).toBe(200)
        expect(data.total).toBeGreaterThanOrEqual(1)
        expect(Array.isArray(data.breachAlerts)).toBe(true)
        expect(data.breachAlerts.length).toBeGreaterThanOrEqual(1)
        expect(data.referrals[0].status).toBe("breached")
    })
})
