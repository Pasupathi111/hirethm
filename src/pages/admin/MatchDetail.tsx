import { Link, Navigate, useParams } from "react-router-dom"

import { ReadinessRing } from "@/components/cards/ReadinessRing"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { adminCandidates, adminMatches, jobs, matches } from "@/data/mockData"

function initialsFromName(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function AdminMatchDetail() {
  const { id } = useParams()
  const match = adminMatches.find((m) => m.id === id)

  if (!match) return <Navigate to="/admin/matches" replace />

  const candidate = adminCandidates.find((c) => c.name === match.candidate)
  const job = jobs.find((j) => j.title === match.job && j.company === match.employer)
  const detail = matches.find((m) => m.title === match.job && m.company === match.employer)

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref="/admin/matches"
        backLabel="Back to matches"
        initials={initialsFromName(match.candidate)}
        name={match.candidate}
        meta={`${match.id} · ${match.job} at ${match.employer} · Created ${match.created}`}
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

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card p-6 text-center">
          <ReadinessRing value={match.readiness} label="Mutual Readiness" />
          <StatusBadge status={match.status} />
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          {detail ? (
            <>
              <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Why HireThm matched them</p>
              <ul className="mt-2 space-y-1.5">
                {detail.reasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 text-primary">✓</span>
                    {reason}
                  </li>
                ))}
              </ul>
              <div className="mt-5 space-y-3">
                {detail.criteria.map((c) => (
                  <div key={c.label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">{c.label}</span>
                      <span className="font-semibold">{c.value}%</span>
                    </div>
                    <Progress value={c.value} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              This match was scored at {match.readiness}% Mutual Readiness. Criterion-level breakdown is available to{" "}
              {match.candidate} in their candidate portal.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
