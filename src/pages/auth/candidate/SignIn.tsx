import { motion } from "framer-motion"
import { useState } from "react"
import { Link } from "react-router-dom"

import { ReadinessRing } from "@/components/cards/ReadinessRing"
import { Logo } from "@/components/layout/Logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "@/lib/authClient"
import { fadeInUp, staggerContainer, useReducedMotion, withReducedMotion } from "@/lib/motion"

export function CandidateSignIn() {
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

    // Signed in on the candidate page with no profile yet — finish creating it
    // rather than dropping them into the employer org-creation flow (#46).
    window.location.href = "/create-profile"
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center bg-background px-4 py-16">
        <Link to="/" className="mb-8">
          <Logo />
        </Link>

        <motion.div
          className="w-full max-w-sm"
          variants={withReducedMotion(reduced, fadeInUp)}
          initial="hidden"
          animate="show"
        >
          <h1 className="text-3xl">Welcome back</h1>
          <p className="mt-2 text-muted-foreground">Sign in to your HireThm profile.</p>

          <form className="mt-8 space-y-5 rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)]" onSubmit={handleSubmit}>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </motion.p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
              <Link to="/forgot-password" className="text-xs font-semibold text-primary">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" variant="dark" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in…" : "Sign In"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link to="/candidate/sign-up" className="font-semibold text-primary">
                Create an account
              </Link>
            </p>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Hiring instead?{" "}
            <Link to="/employer/sign-in" className="font-semibold text-foreground">
              Employer sign in →
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.12),transparent_55%)] lg:flex lg:flex-col lg:items-center lg:justify-center lg:bg-muted lg:px-12">
        <motion.div
          className="w-full max-w-sm"
          variants={withReducedMotion(reduced, staggerContainer)}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={withReducedMotion(reduced, fadeInUp)}>
            <Badge variant="success">Candidate-first matching</Badge>
            <h2 className="mt-4 text-3xl">Find work that fits you.</h2>
            <p className="mt-2 text-muted-foreground">You're notified of a match before any employer sees your profile.</p>
          </motion.div>

          <motion.div
            variants={withReducedMotion(reduced, fadeInUp)}
            className="mt-8 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center justify-between">
              <p className="eyebrow">Mutual Readiness</p>
              {/* Labelled: an illustration of the match card, not a real match.
                  It previously carried a fake match number and read as data. */}
              <Badge variant="outline">Example</Badge>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <ReadinessRing value={91} label="Ready" size={72} strokeWidth={6} />
              <div>
                <h3 className="text-base font-semibold">Senior Product Engineer</h3>
                <p className="text-sm text-muted-foreground">ABC Technologies · Remote</p>
              </div>
            </div>
          </motion.div>

          <motion.ul variants={withReducedMotion(reduced, staggerContainer)} className="mt-6 space-y-2 text-sm text-muted-foreground">
            {["Your profile belongs to you, not an employer's database.", "Contact details stay private until you accept a match.", "Nothing happens until you say yes."].map((point) => (
              <motion.li key={point} variants={withReducedMotion(reduced, fadeInUp)} className="flex items-start gap-2">
                <span className="mt-0.5 text-primary">✓</span>
                {point}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </div>
  )
}
