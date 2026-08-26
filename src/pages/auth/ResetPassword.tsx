import { motion } from "framer-motion"
import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"

import { Logo } from "@/components/layout/Logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPassword } from "@/lib/authClient"
import { fadeInUp, useReducedMotion, withReducedMotion } from "@/lib/motion"

export function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone] = useState(false)
  const reduced = useReducedMotion()
  const mismatch = confirm.length > 0 && password !== confirm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mismatch) return
    if (!token) {
      setError("This reset link is missing its token. Request a new one.")
      return
    }
    setError("")
    setIsLoading(true)
    const { error: resetError } = await resetPassword({ newPassword: password, token })
    setIsLoading(false)
    if (resetError) {
      setError(resetError.message ?? "Failed to reset password. The link may have expired.")
      return
    }
    setDone(true)
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
        {done ? (
          <div className="rounded-lg border border-border bg-card p-6">
            <h1 className="text-2xl">Password updated</h1>
            <p className="mt-2 text-sm text-muted-foreground">Sign in with your new password.</p>
            <Button asChild variant="dark" className="mt-6 w-full">
              <Link to="/sign-in">Back to sign in</Link>
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-3xl">Set a new password</h1>
            <p className="mt-2 text-muted-foreground">Choose a strong password you haven't used before.</p>

            <form className="mt-8 space-y-5 rounded-lg border border-border bg-card p-6 text-left" onSubmit={handleSubmit}>
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
                <Label htmlFor="password">New password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required minLength={8} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
                {mismatch && <p className="text-xs font-semibold text-destructive">Passwords don't match.</p>}
              </div>
              <Button type="submit" variant="dark" size="lg" className="w-full" disabled={mismatch || isLoading}>
                {isLoading ? "Updating…" : "Update password"}
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}
