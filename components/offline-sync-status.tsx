"use client"

import { useEffect, useState } from "react"
import { RefreshCw, Wifi, WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
    clearOfflineSyncConflicts,
    flushOfflineQueue,
    getOfflineSyncConflicts,
    getOfflineSyncStatus,
    initOfflineSync,
    resolveOfflineSyncConflict,
    subscribeOfflineSyncStatus,
    type OfflineSyncStatus,
} from "@/lib/offline-sync-client"

export function OfflineSyncStatusWidget() {
    const [mounted, setMounted] = useState(false)
    const [isMinimized, setIsMinimized] = useState(true)
    const [status, setStatus] = useState<OfflineSyncStatus>(() => ({
        online: true,
        queuedCount: 0,
        isSyncing: false,
        conflictsCount: 0,
        lastSyncAt: null,
        lastError: null,
    }))
    const [showResolver, setShowResolver] = useState(false)
    const [conflicts, setConflicts] = useState<ReturnType<typeof getOfflineSyncConflicts>>([])

    useEffect(() => {
        setMounted(true)
        initOfflineSync()
        setStatus(getOfflineSyncStatus())
        return subscribeOfflineSyncStatus((nextStatus) => {
            setStatus(nextStatus)
            setConflicts(getOfflineSyncConflicts())
        })
    }, [])

    if (!mounted) return null

    const isIdle = status.online && status.queuedCount === 0 && status.conflictsCount === 0 && !status.isSyncing
    if (isIdle) return null

    if (isMinimized) {
        return (
            <div className="fixed bottom-4 left-4 z-50 animate-fade-up">
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full shadow-lg bg-card/80 backdrop-blur-xl backdrop-saturate-[1.8] border border-border/70 gap-2 px-4 h-12 transition-all hover:scale-105 hover:bg-card/90 active:scale-95 text-foreground"
                    onClick={() => setIsMinimized(false)}
                >
                    {status.online ? (
                        <Wifi className="h-4 w-4 text-success" />
                    ) : (
                        <WifiOff className="h-4 w-4 text-alert" />
                    )}
                    {status.queuedCount > 0 && <span className="text-xs font-semibold">{status.queuedCount} pending</span>}
                </Button>
            </div>
        )
    }

    return (
        <div className="fixed bottom-4 left-4 z-50 w-[min(20rem,calc(100vw-2rem))] animate-fade-up">
            <Card className="gap-3 border border-border/70 px-4 py-4 shadow-xl bg-card/90 backdrop-blur-xl backdrop-saturate-[1.8]">
                <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                        {status.online ? (
                            <Wifi className="h-4 w-4 text-success" />
                        ) : (
                            <WifiOff className="h-4 w-4 text-alert" />
                        )}
                        <p className="text-xs font-semibold">
                            {status.online ? (status.isSyncing ? "Sync in progress" : "Online") : "Offline mode"}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={status.queuedCount > 0 ? "secondary" : "outline"}>{status.queuedCount} pending</Badge>
                        <Button variant="ghost" size="icon" className="h-7 w-7 -mr-2 text-muted-foreground hover:text-foreground" onClick={() => setIsMinimized(true)}>
                            <span className="text-xs">✕</span>
                        </Button>
                    </div>
                </div>

                {status.conflictsCount > 0 && (
                    <p className="text-xs font-medium text-foreground/80">{status.conflictsCount} conflict(s) captured for manual review.</p>
                )}

                {status.lastSyncAt && (
                    <p className="text-[11px] text-muted-foreground">
                        Last sync: {new Date(status.lastSyncAt).toLocaleString()}
                    </p>
                )}

                {status.lastError && <p className="text-[11px] text-destructive">{status.lastError}</p>}

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        disabled={!status.online || status.isSyncing || status.queuedCount === 0}
                        onClick={() => {
                            void flushOfflineQueue()
                        }}
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${status.isSyncing ? "animate-spin" : ""}`} />
                        Sync now
                    </Button>

                    {status.conflictsCount > 0 && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => setShowResolver((value) => !value)}
                        >
                            {showResolver ? "Hide resolver" : "Resolve conflicts"}
                        </Button>
                    )}

                    {status.conflictsCount > 0 && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => {
                                clearOfflineSyncConflicts()
                            }}
                        >
                            Clear conflicts
                        </Button>
                    )}
                </div>

                {showResolver && conflicts.length > 0 && (
                    <div className="space-y-2 rounded-lg border bg-muted/20 p-2">
                        {conflicts.slice(0, 5).map((conflict) => (
                            <div key={conflict.id} className="rounded border bg-background p-2">
                                <p className="text-xs font-semibold">
                                    {conflict.endpointType.toUpperCase()} conflict: {conflict.reason}
                                </p>
                                <p className="text-[11px] text-muted-foreground break-all">{conflict.request.url}</p>
                                <div className="mt-2 flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 text-[11px]"
                                        onClick={() => resolveOfflineSyncConflict(conflict.id, "retry")}
                                    >
                                        Retry
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 text-[11px]"
                                        onClick={() => resolveOfflineSyncConflict(conflict.id, "drop")}
                                    >
                                        Drop
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    )
}
