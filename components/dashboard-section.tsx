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
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
                {subtitle ? <p className="text-sm font-medium text-muted-foreground">{subtitle}</p> : null}
            </div>
            {children}
        </section>
    )
}
