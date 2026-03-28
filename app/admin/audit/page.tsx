"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"

type AuditRole = "MOTHER" | "ASHA" | "DOCTOR" | "SYSTEM"

type AuditLog = {
  id: string
  timestamp: string
  actorRole: AuditRole
  actorId?: string
  action: string
  resource: string
  metadata?: Record<string, unknown>
}

export default function AdminAuditPage() {
  const { data: session, status } = useSession()
  const [roleFilter, setRoleFilter] = useState<AuditRole | "">("")
  const [actionFilter, setActionFilter] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const query = useMemo(() => {
    const params = new URLSearchParams()
    params.set("limit", "200")
    if (roleFilter) params.set("role", roleFilter)
    if (actionFilter.trim()) params.set("action", actionFilter.trim())
    if (fromDate) params.set("from", `${fromDate}T00:00:00.000Z`)
    if (toDate) params.set("to", `${toDate}T23:59:59.999Z`)
    return params.toString()
  }, [roleFilter, actionFilter, fromDate, toDate])

  useEffect(() => {
    if (status !== "authenticated") return

    const run = async () => {
      setLoading(true)
      setError("")
      try {
        const response = await fetch(`/api/audit-logs?${query}`, { cache: "no-store" })
        const payload = await response.json()
        if (!response.ok) {
          setError(payload?.error?.message || payload?.error || "Failed to load logs")
          setLogs([])
          return
        }

        setLogs(payload.logs || [])
      } catch {
        setError("Failed to load logs")
        setLogs([])
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [query, status])

  if (status === "loading") {
    return <div className="p-6">Loading session...</div>
  }

  if (!session?.user) {
    return <div className="p-6">Please sign in to access audit logs.</div>
  }

  if (session.user.role !== "DOCTOR") {
    return <div className="p-6">Only administrators can access this page.</div>
  }

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Admin Audit Viewer</h1>
        <p className="text-sm text-gray-600">Filter and review high-signal system actions across the platform.</p>
      </header>

      <section className="rounded-xl border bg-white p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as AuditRole | "")}
          className="rounded-md border px-3 py-2"
        >
          <option value="">All roles</option>
          <option value="MOTHER">MOTHER</option>
          <option value="ASHA">ASHA</option>
          <option value="DOCTOR">DOCTOR</option>
          <option value="SYSTEM">SYSTEM</option>
        </select>

        <input
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          placeholder="Action contains..."
          className="rounded-md border px-3 py-2"
        />

        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="rounded-md border px-3 py-2"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="rounded-md border px-3 py-2"
        />
      </section>

      {error && <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="rounded-xl border bg-white overflow-hidden">
        <div className="border-b p-3 text-sm text-gray-600">{loading ? "Loading..." : `${logs.length} log entries`}</div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-3 py-2">Timestamp</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Actor</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Resource</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="px-3 py-2 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-3 py-2">{log.actorRole}</td>
                  <td className="px-3 py-2">{log.actorId || "-"}</td>
                  <td className="px-3 py-2">{log.action}</td>
                  <td className="px-3 py-2">{log.resource}</td>
                </tr>
              ))}
              {!loading && logs.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-gray-500" colSpan={5}>
                    No audit logs found for current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
