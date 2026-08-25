import { motion } from "framer-motion"
import { useState } from "react"
import { Link } from "react-router-dom"

import { Logo } from "@/components/layout/Logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUp } from "@/lib/authClient"
import { fadeInUp, useReducedMotion, withReducedMotion } from "@/lib/motion"

export function SignUp() {
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
        <h1 className="text-3xl">Create your account</h1>
        <p className="mt-2 text-muted-foreground">Get matched to roles that fit you, without applying blind.</p>

        <form className="mt-8 space-y-5 rounded-lg border border-border bg-card p-6 text-left" onSubmit={handleSubmit}>
          {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </div>
          <Button type="submit" variant="dark" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account…" : "Create account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have a profile?{" "}
            <Link to="/sign-in" className="font-semibold text-primary">
              Sign in
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}
