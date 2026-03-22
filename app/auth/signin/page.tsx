"use client"

import { FormEvent, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SignInPage() {
    const router = useRouter()
    const params = useSearchParams()
    const callbackUrl = params.get("callbackUrl") || "/role-select"
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        })

        setLoading(false)

        if (res?.error) {
            setError("Invalid email or password")
            return
        }

        document.cookie = "sehat_guest=; path=/; max-age=0; SameSite=Lax"
        router.push(callbackUrl)
    }

    const continueAsGuest = () => {
        document.cookie = "sehat_guest=1; path=/; max-age=2592000; SameSite=Lax"
        router.push("/role-select")
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-trust/10 to-background p-4">
            <Card className="w-full max-w-md p-6">
                <h1 className="text-2xl font-bold mb-2">Sign In</h1>
                <p className="text-sm text-muted-foreground mb-6">Use your Sehat Saheli account</p>

                <form onSubmit={onSubmit} className="space-y-4">
                    <Input
                        type="email"
                        required
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                        type="password"
                        required
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <p className="text-sm text-alert">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                    </Button>
                </form>

                <Button
                    variant="outline"
                    className="w-full mt-3"
                    onClick={() => signIn("google", { callbackUrl })}
                >
                    Continue with Google
                </Button>

                <Button
                    variant="ghost"
                    className="w-full mt-2"
                    onClick={continueAsGuest}
                    type="button"
                >
                    Skip Sign In (Continue as Guest)
                </Button>

                <p className="text-sm mt-4 text-center">
                    No account? <a href="/auth/register" className="text-trust font-medium">Create one</a>
                </p>
            </Card>
        </div>
    )
}
