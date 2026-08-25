import { useEffect, useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { JobForm, useJobFormState } from "@/components/forms/JobForm"
import { Skeleton } from "@/components/feedback/Skeleton"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { Button } from "@/components/ui/button"
import { ApiError, api } from "@/lib/api"
import type { ApiJob } from "@/types"

function JobEditForm({ job }: { job: ApiJob }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const state = useJobFormState({
    title: job.title,
    location: job.location ?? "",
    type: job.type,
    remoteStatus: job.remoteStatus ?? "",
    experienceLevel: job.experienceLevel ?? "",
    salaryMin: job.salaryMin != null ? String(job.salaryMin) : "",
    salaryMax: job.salaryMax != null ? String(job.salaryMax) : "",
    closingDate: job.validThrough ? job.validThrough.slice(0, 10) : "",
    description: job.description ?? "",
  })
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const submit = async () => {
    const { title, location, type, remoteStatus, experienceLevel, salaryMin, salaryMax, closingDate, description } = state.values
    setError("")
    setIsSaving(true)
    try {
      const updated = await api.patch<ApiJob>(`/api/jobs/${id}`, {
        title: title.trim(),
        location: location.trim() || undefined,
        type,
        remoteStatus: remoteStatus || undefined,
        experienceLevel: experienceLevel || undefined,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        validThrough: closingDate || null,
        description: description.trim() || undefined,
      })
      toast.success("Job updated", { description: `${updated.title} was saved.` })
      navigate(`/admin/jobs/${id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update job")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref={`/admin/jobs/${id}`}
        backLabel="Back to job"
        initials={job.title.slice(0, 2).toUpperCase()}
        name={`Edit: ${job.title}`}
        meta={`Status: ${job.status}`}
        actions={
          <Button variant="dark" disabled={isSaving || !state.values.title.trim()} onClick={submit}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        }
      />

      {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <JobForm state={state} />
    </div>
  )
}

export function AdminJobEdit() {
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
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  return <JobEditForm job={job} />
}
