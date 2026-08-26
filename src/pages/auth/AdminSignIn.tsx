import { motion } from "framer-motion"
import { ShieldCheck } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

import { Logo } from "@/components/layout/Logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api, ApiError } from "@/lib/api"
import { signIn, signOut } from "@/lib/authClient"
import { fadeInUp, useReducedMotion, withReducedMotion } from "@/lib/motion"

export function AdminSignIn() {
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

    try {
      const { isPlatformAdmin } = await api.get<{ isPlatformAdmin: boolean }>("/api/platform/me")
      if (!isPlatformAdmin) {
        await signOut()
        setIsLoading(false)
        setError("This account does not have platform-admin access.")
        return
      }
    } catch (err) {
      await signOut()
      setIsLoading(false)
      setError(err instanceof ApiError ? err.message : "Failed to verify admin access.")
      return
    }

    // Hard navigation — ensures /admin reads a fresh session, not a stale cache.
    window.location.href = "/admin"
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-secondary px-4 py-16 text-secondary-foreground">
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(600px circle at 50% 20%, rgba(16,185,129,0.12), transparent 70%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      <motion.div
        className="relative flex items-center gap-2"
        variants={withReducedMotion(reduced, fadeInUp)}
        initial="hidden"
        animate="show"
      >
        <Logo className="text-white" />
        <Badge variant="dark" className="border border-white/20 bg-white/10 text-mint">
          ADMIN
        </Badge>
      </motion.div>

      <motion.div
        className="relative mt-8 w-full max-w-sm text-center"
        variants={withReducedMotion(reduced, fadeInUp)}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.1 }}
      >
        <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-white/10 text-mint">
          <ShieldCheck className="size-5" />
        </div>
        <h1 className="text-3xl text-white">Platform administration</h1>
        <p className="mt-2 text-sm text-white/50">Restricted to HireThm staff. All actions are recorded in the audit log.</p>

        <form className="mt-8 space-y-5 rounded-lg border border-white/10 bg-white/5 p-6 text-left backdrop-blur-sm" onSubmit={handleSubmit}>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-md border border-destructive/40 bg-destructive/15 p-3 text-sm text-destructive"
            >
              {error}
            </motion.p>
          )}
          <div className="space-y-2">
            <Label htmlFor="work-email" className="text-white/70">
              Work email
            </Label>
            <Input
              id="work-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-white/15 bg-black/30 text-white placeholder:text-white/30"
              autoComplete="username"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password" className="text-white/70">
              Password
            </Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-white/15 bg-black/30 text-white placeholder:text-white/30"
              autoComplete="current-password"
              required
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? "Verifying…" : "Sign in to admin"}
          </Button>
        </form>

        <Link to="/" className="mt-6 inline-block text-sm text-white/50 hover:text-white">
          ← Back to hirethm.com
        </Link>
      </motion.div>
    </div>
  )
}
