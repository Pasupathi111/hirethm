import { useEffect, useState } from "react"
import { Navigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { MetricTile } from "@/components/cards/MetricTile"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/feedback/Skeleton"
import { api } from "@/lib/api"
import type { ApiJob } from "@/types"

interface JobWithApplications extends ApiJob {
  applications: { id: string; candidateId: string; status: string; createdAt: string }[]
}

const statusLabel: Record<string, string> = {
  draft: "Draft",
  open: "Published",
  closed: "Closed",
  archived: "Archived",
}

export function AdminJobDetail() {
  const { id } = useParams()
  const [job, setJob] = useState<JobWithApplications | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api
      .get<JobWithApplications>(`/api/jobs/${id}`)
      .then(setJob)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (notFound) return <Navigate to="/admin/jobs" replace />
  if (loading || !job) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  const applications = job.applications ?? []
  const interviewCount = applications.filter((a) => a.status === "interview").length
  const hiredCount = applications.filter((a) => a.status === "hired").length

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref="/admin/jobs"
        backLabel="Back to jobs"
        initials={job.title.slice(0, 2).toUpperCase()}
        name={job.title}
        meta={`${job.location ?? "No location set"} · Created ${new Date(job.createdAt).toLocaleDateString()}`}
        actions={
          <Button variant="outline" onClick={() => toast("Editing a published job isn't wired up yet")}>
            Edit
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="mt-1">
            <StatusBadge status={statusLabel[job.status] ?? job.status} className="text-base" />
          </p>
        </div>
        <MetricTile label="Applications" value={applications.length} />
        <MetricTile label="Interviews" value={interviewCount} />
        <MetricTile label="Hired" value={hiredCount} />
      </div>

      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div>
          <h2>About the role</h2>
          <p className="mt-2 text-sm text-muted-foreground">{job.description || "No description added yet."}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 text-sm">
          <div>
            <p className="text-muted-foreground">Type</p>
            <p className="font-semibold capitalize">{job.type.replace("_", " ")}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Workplace</p>
            <p className="font-semibold capitalize">{job.remoteStatus ?? "Not specified"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Experience level</p>
            <p className="font-semibold capitalize">{job.experienceLevel ?? "Not specified"}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2>Applications</h2>
        {applications.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No applications yet.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {applications.map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b border-hairline py-2 text-sm last:border-0">
                <span className="font-mono text-xs text-muted-foreground">{a.id.slice(0, 8)}</span>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
