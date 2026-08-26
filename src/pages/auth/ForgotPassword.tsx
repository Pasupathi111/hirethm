import { motion } from "framer-motion"
import { MailCheck } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

import { Logo } from "@/components/layout/Logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestPasswordReset } from "@/lib/authClient"
import { fadeInUp, useReducedMotion, withReducedMotion } from "@/lib/motion"

export function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const reduced = useReducedMotion()

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
        {sent ? (
          <div className="rounded-lg border border-border bg-card p-6">
            <MailCheck className="mx-auto size-10 text-primary" />
            <h1 className="mt-4 text-2xl">Check your email</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              If an account exists for <span className="font-semibold text-foreground">{email}</span>, we've sent a link to reset your password.
            </p>
            <Button asChild variant="outline" className="mt-6 w-full">
              <Link to="/sign-in">Back to sign in</Link>
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-3xl">Forgot your password?</h1>
            <p className="mt-2 text-muted-foreground">Enter your email and we'll send you a reset link.</p>

            <form
              className="mt-8 space-y-5 rounded-lg border border-border bg-card p-6 text-left"
              onSubmit={async (e) => {
                e.preventDefault()
                setError("")
                setIsLoading(true)
                const { error: resetError } = await requestPasswordReset({ email, redirectTo: "/reset-password" })
                setIsLoading(false)
                if (resetError) {
                  setError(resetError.message ?? "Failed to send reset link.")
                  return
                }
                setSent(true)
              }}
            >
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
              <Button type="submit" variant="dark" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending…" : "Send reset link"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                <Link to="/sign-in" className="font-semibold text-primary">
                  Back to sign in
                </Link>
              </p>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}
