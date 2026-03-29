import { beforeEach, describe, expect, it, vi } from "vitest"

const sessionMock = vi.fn()
const getConsentMock = vi.fn()
const getConsentHistoryMock = vi.fn()
const saveConsentMock = vi.fn()
const revokeConsentMock = vi.fn()
const createAuditLogMock = vi.fn()

vi.mock("@/lib/api-auth", () => ({
    requireSessionUser: () => sessionMock(),
}))

vi.mock("@/lib/persistence-store", () => ({
    getConsent: (...args: any[]) => getConsentMock(...args),
    getConsentHistory: (...args: any[]) => getConsentHistoryMock(...args),
    saveConsent: (...args: any[]) => saveConsentMock(...args),
    revokeConsent: (...args: any[]) => revokeConsentMock(...args),
    createAuditLog: (...args: any[]) => createAuditLogMock(...args),
}))

vi.mock("@/lib/rate-limit", () => ({
    clientIp: () => "127.0.0.1",
    rateLimit: async () => ({ allowed: true, remaining: 70, resetAt: Date.now() + 60_000 }),
}))

describe("/api/privacy-consent route", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("returns consent with history", async () => {
        sessionMock.mockResolvedValueOnce({ id: "mother_1", role: "MOTHER", email: "m@x.com" })
        getConsentMock.mockResolvedValueOnce({ userId: "mother_1", consentDataShare: true, consentAiTraining: false, retentionDays: 365 })
        getConsentHistoryMock.mockResolvedValueOnce([{ id: "h1", version: 1, action: "UPDATED", createdAt: new Date().toISOString() }])

        const { GET } = await import("@/app/api/privacy-consent/route")
        const res = await GET(new Request("http://localhost/api/privacy-consent?includeHistory=1") as any)
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(data.success).toBe(true)
        expect(Array.isArray(data.history)).toBe(true)
    })

    it("supports revoke action", async () => {
        sessionMock.mockResolvedValueOnce({ id: "mother_1", role: "MOTHER", email: "m@x.com" })
        revokeConsentMock.mockResolvedValueOnce({ userId: "mother_1", consentDataShare: false, consentAiTraining: false, version: 2 })

        const { POST } = await import("@/app/api/privacy-consent/route")
        const res = await POST(
            new Request("http://localhost/api/privacy-consent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "revoke", userId: "mother_1" }),
            }) as any,
        )

        expect(res.status).toBe(200)
    })
})
