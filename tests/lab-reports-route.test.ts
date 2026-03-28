import { beforeEach, describe, expect, it, vi } from "vitest"

const findManyMock = vi.fn()
const sessionMock = vi.fn()

vi.mock("@/lib/prisma", () => ({
    prisma: {
        labReport: {
            findMany: (...args: any[]) => findManyMock(...args),
        },
    },
}))

vi.mock("@/lib/api-auth", () => ({
    requireSessionUser: () => sessionMock(),
    hasRole: (role: string, allowed: string[]) => allowed.includes(role),
}))

vi.mock("@/lib/rate-limit", () => ({
    clientIp: () => "127.0.0.1",
    rateLimit: async () => ({ allowed: true, remaining: 99, resetAt: Date.now() + 60_000 }),
}))

describe("/api/lab-reports route", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("prevents mother from reading another patient reports", async () => {
        sessionMock.mockResolvedValueOnce({ id: "mother_1", role: "MOTHER", email: "m@x.com" })

        const { GET } = await import("@/app/api/lab-reports/route")
        const res = await GET(new Request("http://localhost/api/lab-reports?patientId=mother_2") as any)

        expect(res.status).toBe(403)
    })

    it("allows doctor read access", async () => {
        sessionMock.mockResolvedValueOnce({ id: "doctor_1", role: "DOCTOR", email: "d@x.com" })
        findManyMock.mockResolvedValueOnce([])

        const { GET } = await import("@/app/api/lab-reports/route")
        const res = await GET(new Request("http://localhost/api/lab-reports?patientId=mother_2") as any)

        expect(res.status).toBe(200)
    })
})
