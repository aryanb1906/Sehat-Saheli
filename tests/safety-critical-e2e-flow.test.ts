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

vi.mock("@/lib/audit-log", () => ({
  addAuditEvent: async () => ({}),
  listAuditEvents: async () => (global as any).__auditFallbackStore || [],
}))

describe("Safety critical integration paths", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-03-30T09:00:00.000Z"))
    ;(global as any).__referralFallbackStore = {}
    ;(global as any).__sosFallbackStore = {}
    ;(global as any).__sosStatusFallbackStore = {}
    ;(global as any).__emergencyContactsFallbackStore = {}
    ;(global as any).__auditFallbackStore = []
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("covers symptom/risk to referral to status update", async () => {
    // /api/check-symptom now requires an authenticated session (it used to
    // accept anonymous callers — see remediation Phase 1), so this flow
    // needs a session mock just like the referral/emergency calls below.
    sessionMock.mockResolvedValue({ id: "mother_1", role: "MOTHER", email: "mother@example.com" })
    const { POST: checkSymptom } = await import("@/app/api/check-symptom/route")
    const symptomRes = await checkSymptom(
      new Request("http://localhost/api/check-symptom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "I have severe headache and bleeding" }),
      }) as any,
    )
    const symptomPayload = await symptomRes.json()

    expect(symptomRes.status).toBe(200)
    expect(symptomPayload.risk).toBe("High")

    sessionMock.mockResolvedValue({ id: "doctor_1", role: "DOCTOR", email: "doctor@example.com" })
    const { POST: createReferral, PUT: updateReferral } = await import("@/app/api/referrals/route")

    const createRes = await createReferral(
      new Request("http://localhost/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-request-id": "req-ref-1" },
        body: JSON.stringify({
          patientId: "mother_1",
          consultationId: "cons_1",
          note: "Urgent referral after high risk symptom",
          status: "generated",
        }),
      }) as any,
    )
    const createPayload = await createRes.json()

    expect(createRes.status).toBe(200)
    expect(createPayload.success).toBe(true)
    expect(createPayload.requestId).toBeTruthy()

    const updateRes = await updateReferral(
      new Request("http://localhost/api/referrals", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-request-id": "req-ref-2" },
        body: JSON.stringify({
          id: createPayload.referral.id,
          status: "in-treatment",
        }),
      }) as any,
    )
    const updatePayload = await updateRes.json()

    expect(updateRes.status).toBe(200)
    expect(updatePayload.referral.status).toBe("in-treatment")
  })

  it("covers SOS trigger to acknowledgement/status", async () => {
    const { POST: emergencyPost, GET: emergencyGet } = await import("@/app/api/emergency/route")

    sessionMock.mockResolvedValue({ id: "mother_1", role: "MOTHER", email: "mother@example.com" })
    const triggerRes = await emergencyPost(
      new Request("http://localhost/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-request-id": "req-sos-1" },
        body: JSON.stringify({
          action: "trigger-sos",
          data: {
            location: { lat: 20.3, lng: 85.8 },
            reason: "heavy bleeding",
          },
        }),
      }) as any,
    )
    const triggerPayload = await triggerRes.json()

    expect(triggerRes.status).toBe(200)
    expect(triggerPayload.sos.status).toBe("active")

    sessionMock.mockResolvedValue({ id: "asha_7", role: "ASHA", email: "asha@example.com" })
    const ackRes = await emergencyPost(
      new Request("http://localhost/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-request-id": "req-sos-2" },
        body: JSON.stringify({
          action: "update-sos-status",
          data: {
            userId: "mother_1",
            sosId: triggerPayload.sos.id,
            status: "acknowledged",
          },
        }),
      }) as any,
    )

    expect(ackRes.status).toBe(200)

    sessionMock.mockResolvedValue({ id: "mother_1", role: "MOTHER", email: "mother@example.com" })
    const historyRes = await emergencyGet(new Request("http://localhost/api/emergency?type=history") as any)
    const historyPayload = await historyRes.json()

    expect(historyRes.status).toBe(200)
    expect(historyPayload.sosHistory[0].status).toBe("acknowledged")
  })
})
