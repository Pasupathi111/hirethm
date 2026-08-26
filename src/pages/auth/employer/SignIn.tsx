import { motion } from "framer-motion"
import { Briefcase, ShieldCheck, Users } from "lucide-react"
import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"

import { Logo } from "@/components/layout/Logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "@/lib/authClient"
import { fadeInUp, staggerContainer, useReducedMotion, withReducedMotion } from "@/lib/motion"

const points = [
  { icon: Users, text: "Manage every recruiter and hiring manager from one workspace." },
  { icon: Briefcase, text: "AI-matched candidates, ranked by Mutual Readiness." },
  { icon: ShieldCheck, text: "Consent-first — you never see a profile until they say yes." },
]

export function EmployerSignIn() {
  const [searchParams] = useSearchParams()
  /**
   * Where to land after a successful sign-in. Set by flows that need the user
   * authenticated before they can continue — the invitation-accept page is the
   * one that uses it today. Only same-origin relative paths are honoured, so a
   * crafted `?next=https://evil.example` cannot turn this into an open redirect.
   */
  const nextParam = searchParams.get("next")
  const nextPath = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : null

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

    const sessionRes = await fetch("/api/auth/get-session", { credentials: "include" })
    const session = sessionRes.ok ? await sessionRes.json() : null

    // Hard navigation — ensures the destination route reads a fresh session, not a stale cache.
    window.location.href =
      nextPath ?? (session?.session?.activeOrganizationId ? "/admin" : "/onboarding/create-org")
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-secondary px-12 text-secondary-foreground lg:flex lg:flex-col lg:items-start lg:justify-center">
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(500px circle at 20% 15%, rgba(16,185,129,0.15), transparent 65%)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.div className="relative max-w-sm" variants={withReducedMotion(reduced, staggerContainer)} initial="hidden" animate="show">
          <motion.div variants={withReducedMotion(reduced, fadeInUp)}>
            <Logo className="text-white" />
            <h2 className="mt-6 text-3xl text-white">Hire the right people, faster.</h2>
            <p className="mt-2 text-white/60">One workspace for your whole hiring team.</p>
          </motion.div>

          <motion.ul variants={withReducedMotion(reduced, staggerContainer)} className="mt-8 space-y-4">
            {points.map(({ icon: Icon, text }) => (
              <motion.li key={text} variants={withReducedMotion(reduced, fadeInUp)} className="flex items-start gap-3 text-sm text-white/80">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-mint">
                  <Icon className="size-4" />
                </span>
                <span className="pt-1.5">{text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>

      <div className="flex flex-col items-center justify-center bg-background px-4 py-16">
        <Link to="/" className="mb-8 lg:hidden">
          <Logo />
        </Link>

        <motion.div
          className="w-full max-w-sm"
          variants={withReducedMotion(reduced, fadeInUp)}
          initial="hidden"
          animate="show"
        >
          <h1 className="text-3xl">Employer sign in</h1>
          <p className="mt-2 text-muted-foreground">Sign in to your hiring workspace.</p>

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
              <Label htmlFor="email">Work email</Label>
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
              New workspace?{" "}
              <Link to="/employer/sign-up" className="font-semibold text-primary">
                Get started
              </Link>
            </p>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Looking for work instead?{" "}
            <Link to="/candidate/sign-in" className="font-semibold text-foreground">
              Candidate sign in →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
