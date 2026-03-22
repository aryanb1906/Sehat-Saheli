import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare } from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const credentialSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

const providers: any[] = [
    Credentials({
        name: "Email and Password",
        credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" },
        },
        async authorize(raw) {
            const parsed = credentialSchema.safeParse(raw)
            if (!parsed.success) return null

            const user = await prisma.user.findUnique({
                where: { email: parsed.data.email.toLowerCase() },
            })

            if (!user?.passwordHash) return null

            const ok = await compare(parsed.data.password, user.passwordHash)
            if (!ok) return null

            return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            }
        },
    }),
]

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
    )
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    providers,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role
                token.userId = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = (token.userId || token.sub || "") as string
                session.user.role = (token.role || "MOTHER") as any
            }
            return session
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
})
