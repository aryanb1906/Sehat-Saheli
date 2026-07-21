import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface DashboardSectionProps {
    title: string
    subtitle?: string
    className?: string
    children: ReactNode
}

export function DashboardSection({ title, subtitle, className, children }: DashboardSectionProps) {
    return (
        <section className={cn("space-y-3", className)}>
            <div className="flex items-end justify-between gap-3 border-b border-border/60 pb-2">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                    <span className="h-5 w-1 rounded-full bg-gradient-to-b from-warm to-trust" aria-hidden="true" />
                    {title}
                </h2>
                {subtitle ? <p className="text-sm font-medium text-muted-foreground">{subtitle}</p> : null}
            </div>
            {children}
        </section>
    )
}
