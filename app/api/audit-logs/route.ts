import { NextRequest } from "next/server"
import { addAuditEvent, listAuditEvents } from "@/lib/audit-log"
import { requireSessionUser } from "@/lib/api-auth"
import { failBadRequest, failForbidden, failInternal, failUnauthorized, okWithRequestId } from "@/lib/api-response"
import { getRequestId, logError, withTiming } from "@/lib/observability"

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req)
  try {
    const user = await requireSessionUser()
    if (!user) return failUnauthorized("Authentication required", requestId)
    if (user.role !== "DOCTOR") return failForbidden("Only administrators can view audit logs", requestId)

    const { searchParams } = new URL(req.url)
    const limit = Math.max(1, Math.min(500, Number(searchParams.get("limit") || 100)))
    const roleFilter = searchParams.get("role") as "MOTHER" | "ASHA" | "DOCTOR" | "SYSTEM" | null
    const actionFilter = searchParams.get("action")?.trim().toLowerCase() || ""
    const endpointFilter = searchParams.get("endpoint")?.trim().toLowerCase() || ""
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    const logs = await withTiming("audit-logs.get", () => listAuditEvents(limit, roleFilter || undefined))
    const filtered = logs.filter((log: { action: string; timestamp: string; metadata?: Record<string, unknown> }) => {
      if (actionFilter && !log.action.toLowerCase().includes(actionFilter)) return false
      if (endpointFilter) {
        const endpoint = typeof log.metadata?.endpoint === "string" ? log.metadata.endpoint.toLowerCase() : ""
        if (!endpoint.includes(endpointFilter)) return false
      }
      if (from && new Date(log.timestamp).getTime() < new Date(from).getTime()) return false
      if (to && new Date(log.timestamp).getTime() > new Date(to).getTime()) return false
      return true
    })

    return okWithRequestId({ logs: filtered, total: filtered.length }, requestId)
  } catch (error) {
    logError("audit-logs.get.failed", { requestId, error: error instanceof Error ? error.message : "unknown" })
    return failInternal("Failed to fetch audit logs", requestId)
  }
}

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req)
  try {
    const user = await requireSessionUser()
    if (!user) return failUnauthorized("Authentication required", requestId)

    const body = await req.json()
    if (!body?.action || !body?.resource) {
      return failBadRequest("action and resource are required", requestId)
    }

    const created = await withTiming("audit-logs.post", () =>
      addAuditEvent({
        actorRole: user.role,
        actorId: user.id,
        action: body.action,
        resource: body.resource,
        metadata: {
          ...(body?.metadata || {}),
          requestId,
          endpoint: req.nextUrl.pathname,
        },
      }),
    )

    return okWithRequestId({ event: created }, requestId)
  } catch (error) {
    logError("audit-logs.post.failed", { requestId, error: error instanceof Error ? error.message : "unknown" })
    return failInternal("Failed to write audit event", requestId)
  }
}
