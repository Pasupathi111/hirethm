import { motion } from "framer-motion"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Logo } from "@/components/layout/Logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fadeInUp, useReducedMotion, withReducedMotion } from "@/lib/motion"

export function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const reduced = useReducedMotion()
  const mismatch = confirm.length > 0 && password !== confirm

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
        <h1 className="text-3xl">Set a new password</h1>
        <p className="mt-2 text-muted-foreground">Choose a strong password you haven't used before.</p>

        <form
          className="mt-8 space-y-5 rounded-lg border border-border bg-card p-6 text-left"
          onSubmit={(e) => {
            e.preventDefault()
            if (mismatch) return
            toast.success("Password updated", { description: "Sign in with your new password." })
            navigate("/sign-in")
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            {mismatch && <p className="text-xs font-semibold text-destructive">Passwords don't match.</p>}
          </div>
          <Button type="submit" variant="dark" size="lg" className="w-full" disabled={mismatch}>
            Update password
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
