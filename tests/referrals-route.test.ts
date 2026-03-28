import { beforeEach, describe, expect, it, vi } from "vitest"

const listReferralsMock = vi.fn()
const createReferralMock = vi.fn()
const updateReferralStatusMock = vi.fn()
const sessionMock = vi.fn()

vi.mock("@/lib/persistence-store", () => ({
    listReferrals: listReferralsMock,
    createReferral: createReferralMock,
    updateReferralStatus: updateReferralStatusMock,
}))

vi.mock("@/lib/api-auth", () => ({
    requireSessionUser: () => sessionMock(),
    hasRole: (role: string, allowed: string[]) => allowed.includes(role),
}))

vi.mock("@/lib/rate-limit", () => ({
    clientIp: () => "127.0.0.1",
    rateLimit: async () => ({ allowed: true, remaining: 50, resetAt: Date.now() + 60_000 }),
}))

describe("/api/referrals route", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("returns unauthorized when no session", async () => {
        sessionMock.mockResolvedValueOnce(null)
        const { GET } = await import("@/app/api/referrals/route")
        const res = await GET(new Request("http://localhost/api/referrals") as any)
        expect(res.status).toBe(401)
    })

    it("blocks mother from creating referral for another patient", async () => {
        sessionMock.mockResolvedValueOnce({ id: "mother_1", role: "MOTHER", email: "m@x.com" })
        const { POST } = await import("@/app/api/referrals/route")

        const req = new Request("http://localhost/api/referrals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                patientId: "another_mother",
                consultationId: "c1",
                note: "Need follow-up",
                status: "generated",
            }),
        })

        const res = await POST(req as any)
        expect(res.status).toBe(403)
    })

    it("lists referrals for authorized doctor", async () => {
        sessionMock.mockResolvedValueOnce({ id: "doctor_1", role: "DOCTOR", email: "d@x.com" })
        listReferralsMock.mockResolvedValueOnce([{ id: "r1", patientId: "p1", status: "generated" }])

        const { GET } = await import("@/app/api/referrals/route")
        const res = await GET(new Request("http://localhost/api/referrals?patientId=p1") as any)
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.total).toBe(1)
    })
})
