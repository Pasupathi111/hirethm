import { motion } from "framer-motion"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { Logo } from "@/components/layout/Logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fadeInUp, useReducedMotion, withReducedMotion } from "@/lib/motion"

export function AcceptInvitation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
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
        <Avatar className="mx-auto size-14">
          <AvatarFallback className="bg-slate-800 text-lg text-white">AB</AvatarFallback>
        </Avatar>
        <h1 className="mt-4 text-3xl">You're invited</h1>
        <p className="mt-2 text-muted-foreground">
          ABC Technologies invited you to join their HireThm workspace as a Recruiter. Set a password to accept.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Invitation ID: {id}</p>

        <form
          className="mt-8 space-y-5 rounded-lg border border-border bg-card p-6 text-left"
          onSubmit={(e) => {
            e.preventDefault()
            toast.success("Invitation accepted", { description: "Welcome to ABC Technologies." })
            navigate("/app")
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="password">Set a password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </div>
          <Button type="submit" variant="dark" size="lg" className="w-full">
            Accept invitation
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
