import { useEffect, useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { Skeleton } from "@/components/feedback/Skeleton"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ApiError, api } from "@/lib/api"
import type { ApiInterviewDetail, ApiInterviewStatus } from "@/types"

const statusLabel: Record<ApiInterviewStatus, string> = {
  scheduled: "Upcoming",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
}

const transitionLabel: Record<ApiInterviewStatus, string> = {
  scheduled: "Mark as scheduled",
  completed: "Mark completed",
  cancelled: "Cancel interview",
  no_show: "Mark no-show",
}

const STATUS_TRANSITIONS: Record<ApiInterviewStatus, ApiInterviewStatus[]> = {
  scheduled: ["completed", "cancelled", "no_show"],
  completed: [],
  cancelled: ["scheduled"],
  no_show: ["scheduled"],
}

const responseLabel: Record<string, { text: string; variant: "success" | "destructive" | "warning" | "default" }> = {
  accepted: { text: "Accepted", variant: "success" },
  declined: { text: "Declined", variant: "destructive" },
  tentative: { text: "Tentative", variant: "warning" },
  pending: { text: "Awaiting response", variant: "default" },
}

function initialsFromName(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase()
}

export function AdminInterviewDetail() {
  const { id } = useParams()
  const [interview, setInterview] = useState<ApiInterviewDetail | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [sending, setSending] = useState(false)

  const load = () => {
    if (!id) return
    api
      .get<ApiInterviewDetail>(`/api/interviews/${id}`)
      .then(setInterview)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  const handleTransition = async (status: ApiInterviewStatus) => {
    if (!id) return
    setUpdating(true)
    try {
      await api.patch(`/api/interviews/${id}`, { status })
      toast.success(`Interview ${statusLabel[status].toLowerCase()}`)
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update interview")
    } finally {
      setUpdating(false)
    }
  }

  const handleSendInvitation = async () => {
    if (!id) return
    setSending(true)
    try {
      await api.post(`/api/interviews/${id}/send-invitation`, { templateId: "system-standard" })
      toast.success("Invitation sent")
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to send invitation")
    } finally {
      setSending(false)
    }
  }

  if (notFound) return <Navigate to="/admin/interviews" replace />
  if (loading || !interview) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  const response = responseLabel[interview.candidateResponse] ?? responseLabel.pending!

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref="/admin/interviews"
        backLabel="Back to interviews"
        initials={initialsFromName(interview.candidateFirstName, interview.candidateLastName)}
        name={`${interview.candidateFirstName} ${interview.candidateLastName}`}
        meta={`${interview.title} · ${interview.type.replace("_", " ")} · ${interview.jobTitle}`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to={`/admin/candidates/${interview.candidateId}`}>View candidate</Link>
            </Button>
            <Button asChild variant="dark">
              <Link to={`/admin/jobs/${interview.jobId}`}>View job</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="mt-1">
            <StatusBadge status={statusLabel[interview.status]} className="text-base" />
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Candidate response</p>
          <p className="mt-1">
            <Badge variant={response.variant}>{response.text}</Badge>
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Scheduled</p>
          <p className="font-display mt-1 text-lg font-semibold tracking-[-0.02em]">
            {new Date(interview.scheduledAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2>Schedule</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {interview.duration} minutes{interview.location ? ` · ${interview.location}` : ""}
          {interview.interviewers && interview.interviewers.length > 0 && ` · Interviewers: ${interview.interviewers.join(", ")}`}
        </p>
        {interview.notes && <p className="mt-2 text-sm text-muted-foreground">Notes: {interview.notes}</p>}
        {interview.googleCalendarEventLink && (
          <p className="mt-2 text-sm">
            <a href={interview.googleCalendarEventLink} target="_blank" rel="noreferrer" className="text-primary underline">
              View on Google Calendar
            </a>
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          {interview.invitationSentAt
            ? `Invitation sent ${new Date(interview.invitationSentAt).toLocaleString()}`
            : "Invitation not sent yet"}
          {interview.candidateRespondedAt && ` · Candidate responded ${new Date(interview.candidateRespondedAt).toLocaleString()}`}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={handleSendInvitation} disabled={sending || interview.status !== "scheduled"}>
          {sending ? "Sending…" : interview.invitationSentAt ? "Resend invitation" : "Send invitation"}
        </Button>
        {STATUS_TRANSITIONS[interview.status].map((status) => (
          <Button
            key={status}
            variant={status === "cancelled" ? "destructive" : "outline"}
            onClick={() => handleTransition(status)}
            disabled={updating}
          >
            {transitionLabel[status]}
          </Button>
        ))}
      </div>
    </div>
  )
}
