import { Eye } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"

import { Skeleton } from "@/components/feedback/Skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import type { ApiJob } from "@/types"

export function AdminJobPreview() {
  const { id } = useParams()
  const [job, setJob] = useState<ApiJob | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api
      .get<ApiJob>(`/api/jobs/${id}`)
      .then(setJob)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (notFound) return <Navigate to="/admin/jobs" replace />
  if (loading || !job) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Eye className="size-4" /> Preview mode — this is how candidates will see the job.
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to={`/admin/jobs/${job.id}`}>Back to editor</Link>
        </Button>
      </div>

      <div className="mx-auto max-w-4xl rounded-lg border border-border bg-card p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="bg-secondary text-lg text-secondary-foreground">
              {job.title.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl">{job.title}</h1>
            <p className="mt-1 text-muted-foreground">
              {job.location ?? "Location not set"} · Posted {new Date(job.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Badge>{job.type.replace("_", " ")}</Badge>
          {job.remoteStatus && <Badge className="capitalize">{job.remoteStatus}</Badge>}
          {job.experienceLevel && <Badge className="capitalize">{job.experienceLevel}</Badge>}
        </div>
        {job.salaryMin != null && job.salaryMax != null && (
          <p className="mt-3 text-xl font-display font-semibold tracking-[-0.02em] text-primary">
            ${(job.salaryMin / 1000).toFixed(0)}K – ${(job.salaryMax / 1000).toFixed(0)}K
          </p>
        )}

        <section className="mt-8">
          <h2 className="text-xl">About the role</h2>
          <p className="mt-3 whitespace-pre-line text-muted-foreground">{job.description || "No description added yet."}</p>
        </section>

        <Button className="mt-8 w-full" size="lg" disabled>
          Apply Now
        </Button>
      </div>
    </div>
  )
}
