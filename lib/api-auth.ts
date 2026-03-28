import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export type AppRole = "MOTHER" | "ASHA" | "DOCTOR"

export async function requireSessionUser() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return null
    return {
        id: session.user.id,
        role: session.user.role as AppRole,
        email: session.user.email || "",
    }
}

export function hasRole(userRole: AppRole, allowed: AppRole[]) {
    return allowed.includes(userRole)
}
