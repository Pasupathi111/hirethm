import { Building2, Check, Link2, Loader2, Search, UserPlus } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"

import { Logo } from "@/components/layout/Logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { authClient, organization } from "@/lib/authClient"
import type { OrgSearchResult } from "@/types"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function extractToken(input: string): string {
  const trimmed = input.trim()
  try {
    const url = new URL(trimmed)
    const segments = url.pathname.split("/").filter(Boolean)
    return segments[segments.length - 1] || trimmed
  } catch {
    return trimmed
  }
}

export function CreateOrg() {
  const [viewMode, setViewMode] = useState<"create" | "join">("create")

  // Picker: if the signed-in user already belongs to one or more orgs but this
  // session has none active yet, auto-switch (single org) or let them pick (multiple)
  // instead of dumping them on the create-a-new-org form.
  const { data: orgs, isPending: isOrgsLoading } = authClient.useListOrganizations()
  const [autoSwitching, setAutoSwitching] = useState(false)
  const [switchingOrgId, setSwitchingOrgId] = useState<string | null>(null)
  const [pickerDismissed, setPickerDismissed] = useState(false)
  const showPicker = !pickerDismissed && !!orgs && orgs.length > 1

  useEffect(() => {
    if (isOrgsLoading || autoSwitching) return
    if (orgs && orgs.length === 1) {
      setAutoSwitching(true)
      organization.setActive({ organizationId: orgs[0].id }).then(() => {
        window.location.href = "/admin"
      })
    }
  }, [orgs, isOrgsLoading, autoSwitching])

  const handlePickOrg = async (orgId: string) => {
    setSwitchingOrgId(orgId)
    await organization.setActive({ organizationId: orgId })
    window.location.href = "/admin"
  }

  // Create org
  const [orgName, setOrgName] = useState("")
  const [slug, setSlug] = useState("")
  const [slugEdited, setSlugEdited] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleOrgNameChange = (value: string) => {
    setOrgName(value)
    if (!slugEdited) setSlug(generateSlug(value))
  }

  const handleCreateOrg = async () => {
    setError("")
    if (!orgName.trim()) return setError("Organization name is required.")
    if (!slug.trim()) return setError("Slug is required.")
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(slug)) {
      return setError("Slug must be lowercase alphanumeric with hyphens, and cannot start or end with a hyphen.")
    }
    setIsLoading(true)

    const result = await organization.create({ name: orgName.trim(), slug: slug.trim() })

    if (result.error) {
      setIsLoading(false)
      setError(result.error.message ?? "Failed to create organization. The slug may already be taken.")
      return
    }

    if (result.data?.id) {
      await organization.setActive({ organizationId: result.data.id })
    }

    // Hard navigation — ensures RequireAuth reads the freshly-active org, not a stale client cache.
    window.location.href = "/admin"
  }

  // Join — invite code
  const [inviteCode, setInviteCode] = useState("")
  const [inviteCodeError, setInviteCodeError] = useState("")
  const [isAcceptingCode, setIsAcceptingCode] = useState(false)
  const [inviteCodeSuccess, setInviteCodeSuccess] = useState(false)

  const handleAcceptInviteCode = async () => {
    setInviteCodeError("")
    const token = extractToken(inviteCode)
    if (!token) return setInviteCodeError("Please enter an invite link or code.")

    setIsAcceptingCode(true)
    try {
      const res = await fetch("/api/invite-links/accept", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.statusMessage ?? "Invalid, expired, or already used invite link.")
      }
      const result = await res.json()
      if (result.organizationId) {
        await organization.setActive({ organizationId: result.organizationId })
      }
      setInviteCodeSuccess(true)
      setTimeout(() => {
        window.location.href = "/admin"
      }, 1200)
    } catch (err) {
      setInviteCodeError(err instanceof Error ? err.message : "Invalid, expired, or already used invite link.")
    } finally {
      setIsAcceptingCode(false)
    }
  }

  // Join — search & request
  const [orgSearch, setOrgSearch] = useState("")
  const [orgSearchResults, setOrgSearchResults] = useState<OrgSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<OrgSearchResult | null>(null)
  const [joinRequestMessage, setJoinRequestMessage] = useState("")
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  const [requestSuccess, setRequestSuccess] = useState("")
  const [requestError, setRequestError] = useState("")
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    const q = orgSearch.trim()
    if (q.length < 2) {
      setOrgSearchResults([])
      return
    }
    setIsSearching(true)
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/org-search?q=${encodeURIComponent(q)}`, { credentials: "include" })
        const data = res.ok ? await res.json() : []
        setOrgSearchResults(data as OrgSearchResult[])
      } catch {
        setOrgSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)
    return () => clearTimeout(searchTimer.current)
  }, [orgSearch])

  const handleSubmitJoinRequest = async () => {
    if (!selectedOrg) return
    setIsSubmittingRequest(true)
    setRequestError("")
    try {
      const res = await fetch("/api/join-requests", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: selectedOrg.id, message: joinRequestMessage.trim() || undefined }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.statusMessage ?? "Failed to send join request")
      }
      setRequestSuccess(`Join request sent to ${selectedOrg.name}! An admin will review it.`)
      setSelectedOrg(null)
      setJoinRequestMessage("")
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : "Failed to send join request")
    } finally {
      setIsSubmittingRequest(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
      <Link to="/" className="mb-8">
        <Logo />
      </Link>

      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        {isOrgsLoading || autoSwitching ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Setting up your workspace…</p>
          </div>
        ) : showPicker ? (
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <h1 className="text-xl">Select an organization</h1>
              <p className="mt-1 text-sm text-muted-foreground">Choose which workspace to open.</p>
            </div>
            {orgs.map((org) => (
              <button
                key={org.id}
                onClick={() => handlePickOrg(org.id)}
                disabled={switchingOrgId !== null}
                className="flex items-center gap-3 rounded-md border border-border px-4 py-3 text-left text-sm hover:border-primary hover:bg-accent disabled:opacity-60"
              >
                <Building2 className="size-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{org.name}</div>
                  <div className="text-xs text-muted-foreground">{org.slug}</div>
                </div>
                {switchingOrgId === org.id && <Loader2 className="ml-auto size-4 animate-spin" />}
              </button>
            ))}
            <div className="mt-2 flex flex-col items-center gap-2 border-t border-hairline pt-2">
              <button
                className="text-sm font-semibold text-primary hover:underline"
                onClick={() => {
                  setViewMode("create")
                  setPickerDismissed(true)
                }}
              >
                Create a new organization
              </button>
              <button
                className="text-sm font-semibold text-primary hover:underline"
                onClick={() => {
                  setViewMode("join")
                  setPickerDismissed(true)
                }}
              >
                Join an existing organization
              </button>
            </div>
          </div>
        ) : inviteCodeSuccess ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
              <Check className="size-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">You're in!</h2>
              <p className="mt-1 text-sm text-muted-foreground">Redirecting to dashboard…</p>
            </div>
          </div>
        ) : viewMode === "join" ? (
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <h1 className="text-xl">Join an organization</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter an invite link/code, or search for an organization to request access.
              </p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="mb-3 flex items-center gap-2">
                <Link2 className="size-4 text-primary" />
                <h3 className="text-sm font-semibold">Have an invite link?</h3>
              </div>
              <div className="flex gap-2">
                <Input
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Paste invite link or code"
                  onKeyDown={(e) => e.key === "Enter" && handleAcceptInviteCode()}
                  className="flex-1"
                />
                <Button disabled={isAcceptingCode || !inviteCode.trim()} onClick={handleAcceptInviteCode}>
                  {isAcceptingCode && <Loader2 className="size-4 animate-spin" />}
                  Join
                </Button>
              </div>
              {inviteCodeError && <p className="mt-2 text-xs font-semibold text-destructive">{inviteCodeError}</p>}
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="mb-3 flex items-center gap-2">
                <Search className="size-4 text-primary" />
                <h3 className="text-sm font-semibold">Request to join</h3>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Search by organization name or slug. An admin must approve your request.
              </p>

              <div className="relative">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={orgSearch}
                  onChange={(e) => setOrgSearch(e.target.value)}
                  placeholder="Search organizations…"
                  className="pl-9"
                />
                {isSearching && (
                  <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>

              {orgSearchResults.length > 0 && !selectedOrg && (
                <div className="mt-2 overflow-hidden rounded-md border border-border">
                  {orgSearchResults.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => setSelectedOrg(org)}
                      className="flex w-full items-center gap-3 border-b border-hairline px-3 py-2.5 text-left text-sm last:border-0 hover:bg-muted"
                    >
                      <Building2 className="size-4 shrink-0 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{org.name}</div>
                        <div className="text-xs text-muted-foreground">{org.slug}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {orgSearch.trim().length >= 2 && !isSearching && orgSearchResults.length === 0 && !selectedOrg && (
                <p className="mt-2 py-2 text-center text-xs text-muted-foreground">No organizations found</p>
              )}

              {selectedOrg && (
                <div className="mt-3 rounded-md border border-primary/30 bg-accent p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="size-4 text-primary" />
                      <span className="text-sm font-medium">{selectedOrg.name}</span>
                    </div>
                    <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setSelectedOrg(null)}>
                      Change
                    </button>
                  </div>
                  <Label htmlFor="joinMessage" className="text-xs">
                    Message (optional)
                  </Label>
                  <Textarea
                    id="joinMessage"
                    value={joinRequestMessage}
                    onChange={(e) => setJoinRequestMessage(e.target.value)}
                    placeholder="Tell the admin why you'd like to join…"
                    rows={2}
                    maxLength={500}
                    className="mt-1 resize-none"
                  />
                  <Button className="mt-2 w-full" disabled={isSubmittingRequest} onClick={handleSubmitJoinRequest}>
                    {isSubmittingRequest ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                    {isSubmittingRequest ? "Sending…" : "Send join request"}
                  </Button>
                </div>
              )}

              {requestError && <p className="mt-2 text-xs font-semibold text-destructive">{requestError}</p>}

              {requestSuccess && (
                <div className="mt-2 flex items-center gap-2 rounded-md border border-success/30 bg-success/10 p-3 text-xs text-success">
                  <Check className="size-4 shrink-0" />
                  {requestSuccess}
                </div>
              )}
            </div>

            <button
              className="text-center text-sm font-semibold text-primary hover:underline"
              onClick={() => (orgs && orgs.length > 1 ? setPickerDismissed(false) : setViewMode("create"))}
            >
              {orgs && orgs.length > 1 ? "Back to organization list" : "Create a new organization instead"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <h1 className="text-xl">Create your organization</h1>
              <p className="mt-1 text-sm text-muted-foreground">Set up your workspace to start managing candidates and jobs.</p>
            </div>

            {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

            <div className="space-y-2">
              <Label htmlFor="orgName">Organization name</Label>
              <Input id="orgName" value={orgName} onChange={(e) => handleOrgNameChange(e.target.value)} placeholder="Acme Corp" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value)
                  setSlugEdited(true)
                }}
                placeholder="acme-corp"
                required
              />
              <p className="text-xs text-muted-foreground">Used in URLs. Lowercase letters, numbers, and hyphens only.</p>
            </div>

            <Button className="mt-2 w-full" size="lg" disabled={isLoading} onClick={handleCreateOrg}>
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              {isLoading ? "Creating…" : "Create organization"}
            </Button>

            <button
              className="text-center text-sm font-semibold text-primary hover:underline"
              onClick={() => setViewMode("join")}
            >
              Join an existing organization instead
            </button>
            {orgs && orgs.length > 1 && (
              <button
                className="text-center text-sm font-semibold text-muted-foreground hover:underline"
                onClick={() => setPickerDismissed(false)}
              >
                Back to organization list
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
