import { Link, Navigate, useParams } from "react-router-dom"

import { StatusBadge } from "@/components/feedback/StatusBadge"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { Button } from "@/components/ui/button"
import { adminCandidates, adminInterviews, interviews, jobs } from "@/data/mockData"

function initialsFromName(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function AdminInterviewDetail() {
  const { id } = useParams()
  const interview = adminInterviews.find((i) => i.id === id)

  if (!interview) return <Navigate to="/admin/interviews" replace />

  const candidate = adminCandidates.find((c) => c.name === interview.candidate)
  const job = jobs.find((j) => j.title === interview.job && j.company === interview.employer)
  const detail = interviews.find((i) => i.title === interview.job && i.company === interview.employer && i.type === interview.type)

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref="/admin/interviews"
        backLabel="Back to interviews"
        initials={initialsFromName(interview.candidate)}
        name={interview.candidate}
        meta={`${interview.id} · ${interview.type} · ${interview.employer} · ${interview.date}`}
        actions={
          <>
            {candidate && (
              <Button asChild variant="outline">
                <Link to={`/admin/candidates/${candidate.id}`}>View candidate</Link>
              </Button>
            )}
            {job && (
              <Button asChild variant="dark">
                <Link to={`/admin/jobs/${job.id}`}>View job</Link>
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="mt-1">
            <StatusBadge status={interview.status} className="text-base" />
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Interview type</p>
          <p className="font-display mt-1 text-lg font-semibold tracking-[-0.02em]">{interview.type}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Date</p>
          <p className="font-display mt-1 text-lg font-semibold tracking-[-0.02em]">{interview.date}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2>Schedule</h2>
        {detail ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {detail.time} · {detail.location} · Slot {detail.slotConfirmed ? "confirmed by the candidate" : "not yet confirmed"}.
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            {interview.candidate} is scheduled for a {interview.type.toLowerCase()} with {interview.employer} on {interview.date}.
          </p>
        )}
      </div>
    </div>
  )
}
