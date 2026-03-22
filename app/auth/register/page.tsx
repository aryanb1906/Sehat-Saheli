"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Role = "MOTHER" | "ASHA" | "DOCTOR"

export default function RegisterPage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState<Role>("MOTHER")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, role }),
        })

        if (!res.ok) {
            const body = await res.json()
            setError(body.error || "Registration failed")
            setLoading(false)
            return
        }

        await signIn("credentials", { email, password, redirect: false })
        document.cookie = "sehat_guest=; path=/; max-age=0; SameSite=Lax"
        setLoading(false)
        router.push("/role-select")
    }

    const fillDemoDetails = () => {
        const stamp = Math.floor(Math.random() * 100000)
        setName("Demo User")
        setEmail(`demo.user.${stamp}@sehat.local`)
        setPassword("demo1234")
        setRole("MOTHER")
        setError("")
    }

    const continueAsGuest = () => {
        document.cookie = "sehat_guest=1; path=/; max-age=2592000; SameSite=Lax"
        router.push("/role-select")
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-trust/10 to-background p-4">
            <Card className="w-full max-w-md p-6">
                <h1 className="text-2xl font-bold mb-2">Create Account</h1>
                <p className="text-sm text-muted-foreground mb-6">Register as Mother, ASHA, or Doctor</p>

                <form onSubmit={onSubmit} className="space-y-4">
                    <Input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
                    <Input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <Input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <select
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                        value={role}
                        onChange={(e) => setRole(e.target.value as Role)}
                    >
                        <option value="MOTHER">Mother</option>
                        <option value="ASHA">ASHA Worker</option>
                        <option value="DOCTOR">Doctor</option>
                    </select>

                    {error && <p className="text-sm text-alert">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating account..." : "Register"}
                    </Button>
                </form>

                <Button type="button" variant="outline" className="w-full mt-3" onClick={fillDemoDetails}>
                    Use Demo Details
                </Button>

                <Button type="button" variant="ghost" className="w-full mt-2" onClick={continueAsGuest}>
                    Skip Sign In (Continue as Guest)
                </Button>
            </Card>
        </div>
    )
}
