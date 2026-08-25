import { AlertTriangle, Building2, Check, Loader2, Shield, ShieldCheck, UserPlus } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { Logo } from "@/components/layout/Logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { organization, useSession } from "@/lib/authClient"

interface InviteLinkInfo {
  organizationName: string
  organizationSlug: string
  role: string
  invitedByName: string | null
  expiresAt: string
}

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function JoinOrg() {
  const { token } = useParams()
  const { data: session } = useSession()

  const [isLoading, setIsLoading] = useState(true)
  const [isAccepting, setIsAccepting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [linkInfo, setLinkInfo] = useState<InviteLinkInfo | null>(null)

  useEffect(() => {
    if (!token) return
    let cancelled = false

    async function fetchLinkInfo() {
      setIsLoading(true)
      setError("")
      try {
        const res = await fetch(`/api/invite-links/info/${token}`, { credentials: "include" })
        if (!res.ok) {
          const body = await res.json().catch(() => null)
          throw new Error(body?.statusMessage ?? "This invite link is invalid or has expired.")
        }
        const data = (await res.json()) as InviteLinkInfo
        if (!cancelled) setLinkInfo(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "This invite link is invalid or has expired.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchLinkInfo()
    return () => {
      cancelled = true
    }
  }, [token])

  const handleAccept = async () => {
    if (!linkInfo || !token) return
    setIsAccepting(true)
    setError("")
    try {
      const res = await fetch("/api/invite-links/accept", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.statusMessage ?? "Failed to join organization")
      }
      const result = await res.json()
      if (result.organizationId) {
        await organization.setActive({ organizationId: result.organizationId })
      }
      setSuccess(true)
      setTimeout(() => {
        window.location.href = "/admin"
      }, 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join organization")
    } finally {
      setIsAccepting(false)
    }
  }

  const roleLabel = linkInfo?.role === "admin" ? "Admin" : "Member"
  const RoleIcon = linkInfo?.role === "admin" ? ShieldCheck : Shield

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
      <Link to="/" className="mb-8">
        <Logo />
      </Link>

      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading invite details…</p>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
              <Check className="size-6" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">You're in!</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                You've joined <span className="font-semibold text-foreground">{linkInfo?.organizationName}</span>. Redirecting to
                dashboard…
              </p>
            </div>
          </div>
        ) : error && !linkInfo ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertTriangle className="size-6" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Invalid invite link</h1>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
            <Link to="/sign-in" className="text-sm font-semibold text-primary hover:underline">
              Go to sign in
            </Link>
          </div>
        ) : linkInfo ? (
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <h1 className="text-xl">Join organization</h1>
              <p className="mt-1 text-sm text-muted-foreground">You've been invited to join a team on HireThm.</p>
            </div>

            <div className="rounded-xl border border-border bg-muted/50 p-5">
              <div className="mb-3 flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarFallback className="bg-primary/15 text-primary">{initialsFor(linkInfo.organizationName)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{linkInfo.organizationName}</div>
                  <div className="text-xs text-muted-foreground">{linkInfo.organizationSlug}</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <RoleIcon className="size-3.5" />
                  <span>
                    Join as <span className="font-semibold text-foreground">{roleLabel}</span>
                  </span>
                </div>
                {linkInfo.invitedByName && (
                  <div className="flex items-center gap-1.5">
                    <UserPlus className="size-3.5" />
                    <span>
                      Invited by <span className="font-semibold text-foreground">{linkInfo.invitedByName}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

            {session ? (
              <Button className="w-full" disabled={isAccepting} onClick={handleAccept}>
                {isAccepting ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                {isAccepting ? "Joining…" : `Join ${linkInfo.organizationName}`}
              </Button>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-center text-sm text-muted-foreground">Sign in or create an account to accept this invitation.</p>
                <div className="flex gap-3">
                  <Button asChild className="flex-1">
                    <Link to="/sign-in">Sign in</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link to="/sign-up">Create account</Link>
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-center text-xs text-muted-foreground">
              <Building2 className="size-3.5 shrink-0" />
              Invite links are created from your organization's Members settings.
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
