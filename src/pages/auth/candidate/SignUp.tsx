import { motion } from "framer-motion"
import { useState } from "react"
import { Link } from "react-router-dom"

import { Logo } from "@/components/layout/Logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUp } from "@/lib/authClient"
import { fadeInUp, staggerContainer, useReducedMotion, withReducedMotion } from "@/lib/motion"

const steps = [
  { step: 1, title: "Build your profile", description: "Upload a CV. HireThm extracts your experience automatically." },
  { step: 2, title: "Set your intent", description: "Roles, locations, salary, availability, and career direction." },
  { step: 3, title: "Get matched first", description: "A Mutual Readiness Score is computed against live roles." },
]

export function CandidateSignUp() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const reduced = useReducedMotion()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const { error: signUpError } = await signUp.email({ name, email, password })
    if (signUpError) {
      setIsLoading(false)
      setError(signUpError.message ?? "Failed to create account.")
      return
    }
    // Hard navigation — ensures the onboarding page reads a fresh session, not a stale client cache.
    // NOTE: there is no real "create candidate profile" flow yet (CreateProfile.tsx is
    // fully mock, no API calls) — this matches the original SignUp.tsx behavior rather
    // than routing into that fake wizard. See issue filed for the real gap.
    window.location.href = "/onboarding/create-org"
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_70%_30%,rgba(16,185,129,0.12),transparent_55%)] lg:order-1 lg:flex lg:flex-col lg:items-center lg:justify-center lg:bg-muted lg:px-12">
        <motion.div
          className="w-full max-w-sm"
          variants={withReducedMotion(reduced, staggerContainer)}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={withReducedMotion(reduced, fadeInUp)}>
            <Badge variant="success">Free for candidates</Badge>
            <h2 className="mt-4 text-3xl">Build the profile once. Get matched for years.</h2>
            <p className="mt-2 text-muted-foreground">Your data, your decisions, always.</p>
          </motion.div>

          <motion.ol variants={withReducedMotion(reduced, staggerContainer)} className="mt-8 space-y-5">
            {steps.map((s) => (
              <motion.li key={s.step} variants={withReducedMotion(reduced, fadeInUp)} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {s.step}
                </span>
                <div>
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </motion.div>
      </div>

      <div className="flex flex-col items-center justify-center bg-background px-4 py-16 lg:order-2">
        <Link to="/" className="mb-8">
          <Logo />
        </Link>

        <motion.div
          className="w-full max-w-sm"
          variants={withReducedMotion(reduced, fadeInUp)}
          initial="hidden"
          animate="show"
        >
          <h1 className="text-3xl">Create your account</h1>
          <p className="mt-2 text-muted-foreground">Get matched to roles that fit you, without applying blind.</p>

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
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required minLength={8} />
            </div>
            <Button type="submit" variant="dark" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account…" : "Create account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have a profile?{" "}
              <Link to="/candidate/sign-in" className="font-semibold text-primary">
                Sign in
              </Link>
            </p>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Hiring instead?{" "}
            <Link to="/employer/sign-up" className="font-semibold text-foreground">
              Create an employer workspace →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
