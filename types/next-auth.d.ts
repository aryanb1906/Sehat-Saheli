import "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: "MOTHER" | "ASHA" | "DOCTOR"
            name?: string | null
            email?: string | null
            image?: string | null
        }
    }
}
