import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare } from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { assertCriticalEnv, canUseDevAuthFallback, getAuthSecret, hasDatabaseUrl } from "@/lib/env"
import { findDevUserByEmail } from "@/lib/dev-auth-store"

assertCriticalEnv()
const hasDb = hasDatabaseUrl()
const useDevFallback = canUseDevAuthFallback()

const credentialSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

const providers: NextAuthOptions["providers"] = [
    CredentialsProvider({
        name: "Email and Password",
        credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" },
        },
        async authorize(raw) {
            const parsed = credentialSchema.safeParse(raw)
            if (!parsed.success) return null

            const normalizedEmail = parsed.data.email.toLowerCase()
            let user = findDevUserByEmail(normalizedEmail)
            if (hasDb) {
                try {
                    const dbUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
                    if (dbUser) {
                        user = dbUser
                    }
                } catch {
                    if (!useDevFallback) {
                        throw new Error("Authentication backend unavailable")
                    }
                }
            }

            if (!user?.passwordHash) return null

            const ok = await compare(parsed.data.password, user.passwordHash)
            if (!ok) return null

            return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            } as any
        },
    }),
]

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
    )
}

export const authOptions: NextAuthOptions = {
    ...(hasDb ? { adapter: PrismaAdapter(prisma) } : {}),
    secret: getAuthSecret() || "dev-secret-change-me",
    session: { strategy: "jwt" },
    providers,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                ; (token as any).role = (user as any).role
                    ; (token as any).userId = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                ; (session.user as any).id = ((token as any).userId || token.sub || "") as string
                    ; (session.user as any).role = ((token as any).role || "MOTHER") as "MOTHER" | "ASHA" | "DOCTOR"
            }
            return session
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
}
