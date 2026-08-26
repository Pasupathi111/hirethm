import { useEffect, useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"

import { ReadinessRing } from "@/components/cards/ReadinessRing"
import { Skeleton } from "@/components/feedback/Skeleton"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ApiError, api } from "@/lib/api"
import type { ApiAdminMatchDetail } from "@/types"

const statusLabel: Record<string, string> = {
  new: "New",
  waiting: "Waiting for Decision",
  accepted: "Accepted",
  rejected: "Rejected",
  in_progress: "In Progress",
}

export function AdminMatchDetail() {
  const { id } = useParams()
  const [match, setMatch] = useState<ApiAdminMatchDetail | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api
      .get<ApiAdminMatchDetail>(`/api/matches/${id}`)
      .then(setMatch)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (notFound) return <Navigate to="/admin/matches" replace />
  if (loading || !match) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  const candidateName = `${match.candidateFirstName} ${match.candidateLastName}`

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref="/admin/matches"
        backLabel="Back to matches"
        initials={`${match.candidateFirstName[0] ?? ""}${match.candidateLastName[0] ?? ""}`.toUpperCase()}
        name={candidateName}
        meta={`${match.jobTitle} at ${match.organizationName} · Matched ${new Date(match.matchedAt).toLocaleDateString()}`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to={`/admin/candidates/${match.candidateId}`}>View candidate</Link>
            </Button>
            <Button asChild variant="dark">
              <Link to={`/admin/jobs/${match.jobId}`}>View job</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card p-6 text-center">
          <ReadinessRing value={match.score} label="Mutual Readiness" />
          <StatusBadge status={statusLabel[match.status] ?? match.status} />
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Why HireThm matched them</p>
            <Badge variant="ai">AI-generated</Badge>
          </div>
          <ul className="mt-2 space-y-1.5">
            {match.reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 text-primary">✓</span>
                {reason}
              </li>
            ))}
          </ul>
          {match.gap && (
            <p className="mt-3 text-sm text-muted-foreground">
              <span className="font-semibold">Potential gap:</span> {match.gap}
            </p>
          )}
          <div className="mt-5 space-y-3">
            {match.criteria.map((c) => (
              <div key={c.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">{c.label}</span>
                  <span className="font-semibold">{c.value}%</span>
                </div>
                <Progress value={c.value} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
