import { motion } from "framer-motion"
import { AlertTriangle, Building2, Check } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { Logo } from "@/components/layout/Logo"
import { Skeleton } from "@/components/feedback/Skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { authClient, useSession } from "@/lib/authClient"
import { fadeInUp, useReducedMotion, withReducedMotion } from "@/lib/motion"

interface InvitationDetails {
  organizationName: string
  role: string
  email: string
  inviterEmail: string
  expiresAt?: string
}

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Recruiter",
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}

/**
 * Accepts a Better Auth organization invitation.
 *
 * The invitation's details are only readable by the invited account:
 * `organization.getInvitation` requires a session whose email matches the
 * invitation's. That is deliberate on Better Auth's side — it stops an
 * invitation ID from leaking an organization's name to anyone holding the
 * link — so this page cannot show who invited you until you are signed in as
 * the right person, and it says so rather than guessing.
 */
export function AcceptInvitation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const { data: session, isPending: sessionPending } = useSession()

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)

  const signedIn = Boolean(session?.user)

  const loadInvitation = useCallback(() => {
    if (!id || !signedIn) return
    setLoading(true)
    setError("")
    authClient.organization
      .getInvitation({ query: { id } })
      .then((res) => {
        if (res.error) {
          setError(res.error.message ?? "This invitation is no longer valid.")
          return
        }
        setInvitation(res.data as unknown as InvitationDetails)
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load this invitation."))
      .finally(() => setLoading(false))
  }, [id, signedIn])

  useEffect(loadInvitation, [loadInvitation])

  const accept = async () => {
    if (!id) return
    setAccepting(true)
    setError("")
    try {
      const res = await authClient.organization.acceptInvitation({ invitationId: id })
      if (res.error) {
        setError(res.error.message ?? "Failed to accept this invitation.")
        return
      }

      // Make the joined organization active, otherwise every org-scoped route
      // in the console 403s with "No active organization" straight after join.
      const organizationId = res.data?.member?.organizationId
      if (organizationId) {
        await authClient.organization.setActive({ organizationId })
      }

      setAccepted(true)
      // Full reload rather than a client-side navigate: the session cookie now
      // carries a different active organization, and every cached query in the
      // app was made without it.
      window.location.href = "/admin"
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept this invitation.")
    } finally {
      setAccepting(false)
    }
  }

  const signInHref = `/employer/sign-in?next=${encodeURIComponent(`/accept-invitation/${id ?? ""}`)}`

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
        {sessionPending || loading ? (
          <>
            <Skeleton className="mx-auto size-14 rounded-full" />
            <Skeleton className="mx-auto mt-4 h-8 w-48" />
            <Skeleton className="mx-auto mt-3 h-4 w-64" />
          </>
        ) : !signedIn ? (
          <>
            <Avatar className="mx-auto size-14">
              <AvatarFallback className="bg-slate-800 text-white">
                <Building2 className="size-6" />
              </AvatarFallback>
            </Avatar>
            <h1 className="mt-4 text-3xl">You're invited</h1>
            <p className="mt-2 text-muted-foreground">
              Sign in with the email address this invitation was sent to, and we'll show you who invited you.
            </p>
            <div className="mt-8 space-y-3">
              <Button asChild variant="dark" size="lg" className="w-full">
                <Link to={signInHref}>Sign in to accept</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link to="/employer/sign-up">Create an account</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Your account's email must match the invited address, or the invitation won't be accepted.
            </p>
          </>
        ) : accepted ? (
          <>
            <Avatar className="mx-auto size-14">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Check className="size-6" />
              </AvatarFallback>
            </Avatar>
            <h1 className="mt-4 text-3xl">You're in</h1>
            <p className="mt-2 text-muted-foreground">Taking you to the workspace…</p>
          </>
        ) : error ? (
          <>
            <Avatar className="mx-auto size-14">
              <AvatarFallback className="bg-destructive/10 text-destructive">
                <AlertTriangle className="size-6" />
              </AvatarFallback>
            </Avatar>
            <h1 className="mt-4 text-3xl">Invitation unavailable</h1>
            <p className="mt-2 text-muted-foreground">{error}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Signed in as {session?.user.email}. If the invitation went to a different address, sign in with that one
              instead.
            </p>
            <div className="mt-8 space-y-3">
              <Button variant="outline" size="lg" className="w-full" onClick={loadInvitation}>
                Try again
              </Button>
              <Button variant="ghost" size="lg" className="w-full" onClick={() => navigate("/admin")}>
                Go to the console
              </Button>
            </div>
          </>
        ) : invitation ? (
          <>
            <Avatar className="mx-auto size-14">
              <AvatarFallback className="bg-slate-800 text-lg text-white">
                {initialsOf(invitation.organizationName) || <Building2 className="size-6" />}
              </AvatarFallback>
            </Avatar>
            <h1 className="mt-4 text-3xl">You're invited</h1>
            <p className="mt-2 text-muted-foreground">
              <span className="font-semibold text-foreground">{invitation.organizationName}</span> invited you to join
              their HireThm workspace.
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Badge variant="outline">{ROLE_LABEL[invitation.role] ?? invitation.role}</Badge>
              <span className="text-xs text-muted-foreground">invited by {invitation.inviterEmail}</span>
            </div>

            <div className="mt-8 rounded-lg border border-border bg-card p-6">
              <Button variant="dark" size="lg" className="w-full" onClick={accept} disabled={accepting}>
                {accepting ? "Accepting…" : "Accept invitation"}
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">
                Joining as {invitation.email}. You'll be taken straight into the workspace.
              </p>
            </div>
          </>
        ) : null}
      </motion.div>
    </div>
  )
}
