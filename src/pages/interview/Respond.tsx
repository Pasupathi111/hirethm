import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"

import { Logo } from "@/components/layout/Logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ApiError, api } from "@/lib/api"
import { fadeInUp, useReducedMotion, withReducedMotion } from "@/lib/motion"

type CandidateAction = "accepted" | "declined" | "tentative"

interface RespondData {
  action: CandidateAction
  interview: {
    id: string
    title: string
    type: string
    status: string
    scheduledAt: string
    duration: number
    location: string | null
    candidateResponse: string
  }
  candidate: { firstName: string; lastName: string } | null
  jobTitle: string | null
  organizationName: string | null
}

const actionCopy: Record<CandidateAction, { verb: string; confirmLabel: string; badge: "success" | "destructive" | "warning" }> = {
  accepted: { verb: "accept", confirmLabel: "Confirm attendance", badge: "success" },
  declined: { verb: "decline", confirmLabel: "Confirm decline", badge: "destructive" },
  tentative: { verb: "tentatively accept", confirmLabel: "Confirm tentative response", badge: "warning" },
}

const typeLabels: Record<string, string> = {
  phone: "Phone Call",
  video: "Video Call",
  in_person: "In Person",
  panel: "Panel Interview",
  technical: "Technical Interview",
  take_home: "Take-Home Assignment",
}

export function InterviewRespond() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const reduced = useReducedMotion()

  const [data, setData] = useState<RespondData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!token) {
      setError("This link is missing its access token.")
      setLoading(false)
      return
    }
    api
      .get<RespondData>(`/api/public/interviews/respond?token=${encodeURIComponent(token)}`)
      .then((res) => {
        setData(res)
        if (res.interview.candidateResponse === res.action) setSubmitted(true)
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "This link is invalid or has expired."))
      .finally(() => setLoading(false))
  }, [token])

  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      await api.post("/api/public/interviews/respond", { token })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit your response.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-16">
      <Link to="/" className="mb-8">
        <Logo />
      </Link>

      <motion.div
        className="w-full max-w-2xl"
        variants={withReducedMotion(reduced, fadeInUp)}
        initial="hidden"
        animate="show"
      >
        {loading ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">Loading…</div>
        ) : error ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h1 className="text-2xl">Unable to load this invitation</h1>
            <p className="mt-2 text-muted-foreground">{error}</p>
          </div>
        ) : !data ? null : submitted ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h1 className="text-2xl">Response recorded</h1>
            <p className="mt-2 text-muted-foreground">
              You indicated you will {actionCopy[data.action].verb} this interview
              {data.jobTitle ? ` for ${data.jobTitle}` : ""}
              {data.organizationName ? ` at ${data.organizationName}` : ""}. The hiring team has been notified.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
            <Badge variant="info">{typeLabels[data.interview.type] ?? data.interview.type}</Badge>
            <h1 className="mt-3 text-3xl">{data.interview.title}</h1>
            <p className="mt-1 text-muted-foreground">
              {data.jobTitle ? `${data.jobTitle}${data.organizationName ? ` at ${data.organizationName}` : ""}` : data.organizationName}
            </p>

            <div className="mt-6 space-y-2 rounded-md border border-border p-4 text-sm">
              <p>
                <span className="font-semibold">When:</span>{" "}
                {new Date(data.interview.scheduledAt).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}
              </p>
              <p>
                <span className="font-semibold">Duration:</span> {data.interview.duration} minutes
              </p>
              {data.interview.location && (
                <p>
                  <span className="font-semibold">Location:</span> {data.interview.location}
                </p>
              )}
            </div>

            <div className="mt-8 space-y-3">
              <Badge variant={actionCopy[data.action].badge}>You are responding: {actionCopy[data.action].verb}</Badge>
              <p className="text-sm text-muted-foreground">Click below to confirm this response for the interview.</p>
              <Button size="lg" className="w-full" onClick={handleConfirm} disabled={submitting}>
                {submitting ? "Submitting…" : actionCopy[data.action].confirmLabel}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
