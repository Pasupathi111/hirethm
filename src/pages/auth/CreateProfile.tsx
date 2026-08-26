import { motion } from "framer-motion"
import { Check, Loader2, Upload } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"

import { Logo } from "@/components/layout/Logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiError, api } from "@/lib/api"
import { useSession } from "@/lib/authClient"
import { fadeInUp, useReducedMotion, withReducedMotion } from "@/lib/motion"
import type { ApiDocument, MyCandidate } from "@/types"

/**
 * Real self-serve candidate profile creation (issue #46).
 *
 * Two genuine steps, both hitting real APIs:
 *   1. POST /api/me/candidate   — creates the platform-level candidate row
 *   2. POST /api/me/documents   — uploads the CV, which the backend parses to
 *                                 extract skills automatically
 *
 * Everything else (salary, locations, availability) is editable afterwards in
 * the portal, which is already fully built — so this stays deliberately short
 * to minimise drop-off before the candidate reaches value.
 */
export function CreateProfile() {
  const reduced = useReducedMotion()
  const { data: session, isPending: sessionPending } = useSession()

  const [checking, setChecking] = useState(true)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const [creating, setCreating] = useState(false)

  const [profile, setProfile] = useState<MyCandidate | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState<ApiDocument | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // If a profile already exists (e.g. they applied to a job before signing up,
  // or refreshed mid-flow), skip straight to the CV step instead of failing.
  // Also prefills the name from their signup name so the form isn't empty.
  useEffect(() => {
    if (sessionPending || !session) return
    let cancelled = false

    const nameParts = (session.user.name ?? "").trim().split(/\s+/).filter(Boolean)

    api
      .get<MyCandidate>("/api/me/candidate")
      .then((c) => {
        if (cancelled) return
        setProfile(c)
        setFirstName(c.firstName ?? "")
        setLastName(c.lastName ?? "")
      })
      .catch(() => {
        // 404 is the normal "no profile yet" case — fall back to the signup name.
        if (cancelled) return
        setFirstName(nameParts[0] ?? "")
        setLastName(nameParts.slice(1).join(" "))
      })
      .finally(() => { if (!cancelled) setChecking(false) })

    return () => { cancelled = true }
  }, [session, sessionPending])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setCreating(true)
    try {
      const created = await api.post<MyCandidate>("/api/me/candidate", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || null,
      })
      setProfile(created)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create your profile.")
    } finally {
      setCreating(false)
    }
  }

  const handleUpload = async (file: File) => {
    setError("")
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "resume")
      setUploaded(await api.upload<ApiDocument>("/api/me/documents", formData))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not upload your CV.")
    } finally {
      setUploading(false)
    }
  }

  // Signed-out resolves during render — no effect needed, so no extra pass.
  if (sessionPending || (session && checking)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <Logo />
        <h1 className="mt-6 text-2xl">Sign in to build your profile</h1>
        <Button asChild variant="dark" className="mt-6">
          <Link to="/candidate/sign-up">Create an account</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-16">
      <Link to="/" className="mb-8">
        <Logo />
      </Link>

      <motion.div
        className="w-full max-w-md"
        variants={withReducedMotion(reduced, fadeInUp)}
        initial="hidden"
        animate="show"
      >
        {/* Step indicator */}
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold">
          <span className={profile ? "text-primary" : "text-foreground"}>1. Your details</span>
          <span className="h-px flex-1 bg-border" />
          <span className={profile ? "text-foreground" : "text-muted-foreground"}>2. Your CV</span>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </motion.p>
        )}

        {!profile ? (
          <form className="space-y-5 rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)]" onSubmit={handleCreate}>
            <div>
              <h1 className="text-2xl">Build your profile</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Signed in as {session.user.email}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <Button type="submit" variant="dark" size="lg" className="w-full" disabled={creating}>
              {creating ? "Creating…" : "Continue"}
            </Button>
          </form>
        ) : (
          <div className="space-y-5 rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl">Add your CV</h1>
                <Badge variant="success">Profile created</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                We read your CV to extract your skills, which is what powers matching.
              </p>
            </div>

            {uploaded ? (
              <div className="flex items-center gap-3 rounded-md border border-success/30 bg-success/10 p-4 text-sm">
                <Check className="size-5 shrink-0 text-success" />
                <div>
                  <p className="font-semibold">{uploaded.originalFilename}</p>
                  <p className="text-muted-foreground">Uploaded and analyzed.</p>
                </div>
              </div>
            ) : (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleUpload(f)
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                  {uploading ? "Uploading…" : "Upload CV (PDF or Word)"}
                </Button>
              </>
            )}

            <Button asChild variant="dark" size="lg" className="w-full">
              <a href="/app">{uploaded ? "Go to my dashboard" : "Skip for now"}</a>
            </Button>
            {!uploaded && (
              <p className="text-center text-xs text-muted-foreground">
                You can add your CV later — but matching needs it to find roles for you.
              </p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
