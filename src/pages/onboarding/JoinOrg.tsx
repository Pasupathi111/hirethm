import { motion } from "framer-motion"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { Logo } from "@/components/layout/Logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { fadeInUp, useReducedMotion, withReducedMotion } from "@/lib/motion"

export function JoinOrg() {
  const { token } = useParams()
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const [declined, setDeclined] = useState(false)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
      <Link to="/" className="mb-8">
        <Logo />
      </Link>

      <motion.div
        className="w-full max-w-sm rounded-lg border border-border bg-card p-6 text-center"
        variants={withReducedMotion(reduced, fadeInUp)}
        initial="hidden"
        animate="show"
      >
        {declined ? (
          <>
            <h1 className="text-2xl">Invitation declined</h1>
            <p className="mt-2 text-sm text-muted-foreground">You can ask your admin to resend it if you change your mind.</p>
            <Button asChild variant="outline" className="mt-6 w-full">
              <Link to="/">Back to home</Link>
            </Button>
          </>
        ) : (
          <>
            <Avatar className="mx-auto size-14">
              <AvatarFallback className="bg-purple-700 text-lg text-white">NS</AvatarFallback>
            </Avatar>
            <h1 className="mt-4 text-2xl">Join Nova Systems</h1>
            <p className="mt-2 text-sm text-muted-foreground">Marcus Diallo invited you to join their team on HireThm.</p>
            <p className="mt-1 text-xs text-muted-foreground">Invite token: {token}</p>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeclined(true)}>
                Decline
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  toast.success("Joined Nova Systems")
                  navigate("/admin")
                }}
              >
                Accept
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
