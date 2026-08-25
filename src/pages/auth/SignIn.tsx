import { motion } from "framer-motion"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { Logo } from "@/components/layout/Logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fadeInUp, useReducedMotion, withReducedMotion } from "@/lib/motion"

export function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("alex.johnson@email.com")
  const [password, setPassword] = useState("hirethm2026")
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
        <h1 className="text-3xl">Welcome back</h1>
        <p className="mt-2 text-muted-foreground">Sign in to your HireThm profile.</p>

        <form
          className="mt-8 space-y-5 rounded-lg border border-border bg-card p-6 text-left"
          onSubmit={(e) => {
            e.preventDefault()
            navigate("/app")
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" variant="dark" size="lg" className="w-full">
            Sign In
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/create-profile" className="font-semibold text-primary">
              Create a profile
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}
