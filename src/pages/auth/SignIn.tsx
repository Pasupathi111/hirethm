import { motion } from "framer-motion"
import { useState } from "react"
import { Link } from "react-router-dom"

import { Logo } from "@/components/layout/Logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "@/lib/authClient"
import { fadeInUp, useReducedMotion, withReducedMotion } from "@/lib/motion"

export function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const reduced = useReducedMotion()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const { error: signInError } = await signIn.email({ email, password })

    if (signInError) {
      setIsLoading(false)
      setError(signInError.message ?? "Invalid email or password.")
      return
    }

    // Figure out where this account actually belongs: org members go to the
    // admin ATS, candidates go to their portal. Hard navigation throughout —
    // ensures the destination route reads a fresh session, not a stale cache.
    const sessionRes = await fetch("/api/auth/get-session", { credentials: "include" })
    const session = sessionRes.ok ? await sessionRes.json() : null

    if (session?.session?.activeOrganizationId) {
      window.location.href = "/admin"
      return
    }

    const candidateRes = await fetch("/api/me/candidate", { credentials: "include" })
    if (candidateRes.ok) {
      window.location.href = "/app"
      return
    }

    window.location.href = "/onboarding/create-org"
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
      <Link to="/" className="mb-8">
        <Logo />
      </Link>

      <motion.div
        className="w-full max-w-sm text-center"
        variants={withReducedMotion(reduced, fadeInUp)}
        initial="hidden"
        animate="show"
      >
        <h1 className="text-3xl">Welcome back</h1>
        <p className="mt-2 text-muted-foreground">Sign in to your HireThm profile.</p>

        <form className="mt-8 space-y-5 rounded-lg border border-border bg-card p-6 text-left" onSubmit={handleSubmit}>
          {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" variant="dark" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in…" : "Sign In"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/sign-up" className="font-semibold text-primary">
              Create an account
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}
