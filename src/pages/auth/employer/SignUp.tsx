import { motion } from "framer-motion"
import { Building2, Sparkles, Users2 } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

import { Logo } from "@/components/layout/Logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUp } from "@/lib/authClient"
import { fadeInUp, staggerContainer, useReducedMotion, withReducedMotion } from "@/lib/motion"

const points = [
  { icon: Building2, text: "Set up your company workspace in under a minute." },
  { icon: Users2, text: "Invite recruiters and hiring managers as your team grows." },
  { icon: Sparkles, text: "AI-scored candidates, matched against your open roles." },
]

export function EmployerSignUp() {
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
    window.location.href = "/onboarding/create-org"
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
            <h2 className="mt-6 text-3xl text-white">Build your hiring workspace.</h2>
            <p className="mt-2 text-white/60">Free to start. Invite your team once you're set up.</p>
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
          <h1 className="text-3xl">Create your workspace</h1>
          <p className="mt-2 text-muted-foreground">Start hiring with AI-matched, consent-first candidates.</p>

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
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required minLength={8} />
            </div>
            <Button type="submit" variant="dark" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating workspace…" : "Create workspace"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have a workspace?{" "}
              <Link to="/employer/sign-in" className="font-semibold text-primary">
                Sign in
              </Link>
            </p>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Looking for work instead?{" "}
            <Link to="/candidate/sign-up" className="font-semibold text-foreground">
              Candidate sign up →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
