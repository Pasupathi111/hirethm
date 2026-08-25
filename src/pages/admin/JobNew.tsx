import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { JobForm, useJobFormState } from "@/components/forms/JobForm"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { Button } from "@/components/ui/button"
import { ApiError, api } from "@/lib/api"
import type { ApiJob } from "@/types"
import { useState } from "react"

export function AdminJobNew() {
  const navigate = useNavigate()
  const state = useJobFormState()
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const submit = async (status: "draft" | "open") => {
    const { title, location, type, remoteStatus, experienceLevel, salaryMin, salaryMax, closingDate, description } = state.values
    setError("")
    setIsSaving(true)
    try {
      const job = await api.post<ApiJob>("/api/jobs", {
        title: title.trim(),
        location: location.trim() || undefined,
        type,
        remoteStatus: remoteStatus || undefined,
        experienceLevel: experienceLevel || undefined,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        validThrough: closingDate || undefined,
        description: description.trim() || undefined,
        status,
      })
      toast.success(status === "open" ? "Job published" : "Draft saved", { description: `${job.title} was created.` })
      navigate("/admin/jobs")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create job")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref="/admin/jobs"
        backLabel="Back to jobs"
        initials="NW"
        name="New job posting"
        meta="Draft, not yet published"
        actions={
          <>
            <Button variant="outline" disabled={isSaving || !state.values.title.trim()} onClick={() => submit("draft")}>
              Save draft
            </Button>
            <Button variant="dark" disabled={isSaving || !state.values.title.trim()} onClick={() => submit("open")}>
              Publish job
            </Button>
          </>
        }
      />

      {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <JobForm state={state} />
    </div>
  )
}
