import { beforeEach, describe, expect, it, vi } from "vitest"

const sessionMock = vi.fn()

vi.mock("@/lib/api-auth", () => ({
    requireSessionUser: () => sessionMock(),
}))

vi.mock("@/lib/rate-limit", () => ({
    clientIp: () => "127.0.0.1",
    rateLimit: async () => ({ allowed: true, remaining: 70, resetAt: Date.now() + 60_000 }),
}))

describe("Privacy consent revoke/history e2e", () => {
    beforeEach(() => {
        vi.clearAllMocks()
            ; (global as any).__consentFallbackStore = {}
            ; (global as any).__consentHistoryFallbackStore = []
            ; (global as any).__auditFallbackStore = []
    })

    it("saves consent, revokes consent, and keeps versioned history", async () => {
        sessionMock.mockResolvedValue({ id: "mother_1", role: "MOTHER", email: "mother@example.com" })

        const { POST, GET } = await import("@/app/api/privacy-consent/route")

        const saveRes = await POST(
            new Request("http://localhost/api/privacy-consent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: "mother_1",
                    consentDataShare: true,
                    consentAiTraining: true,
                    retentionDays: 365,
                }),
            }) as any,
        )

        expect(saveRes.status).toBe(200)

        const revokeRes = await POST(
            new Request("http://localhost/api/privacy-consent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "revoke", userId: "mother_1" }),
            }) as any,
        )

        expect(revokeRes.status).toBe(200)

        const readRes = await GET(new Request("http://localhost/api/privacy-consent?userId=mother_1&includeHistory=1") as any)
        const payload = await readRes.json()

        expect(readRes.status).toBe(200)
        expect(payload.consent.consentDataShare).toBe(false)
        expect(payload.consent.consentAiTraining).toBe(false)
        expect(payload.consent.version).toBeGreaterThanOrEqual(2)
        expect(Array.isArray(payload.history)).toBe(true)
        expect(payload.history.some((entry: { action: string }) => entry.action === "REVOKED")).toBe(true)

        const auditLogs = (global as any).__auditFallbackStore || []
        const auditActions = auditLogs.map((entry: { action: string }) => entry.action)
        expect(auditActions).toContain("PRIVACY_CONSENT_UPDATED")
        expect(auditActions).toContain("PRIVACY_CONSENT_REVOKED")
    })
})
