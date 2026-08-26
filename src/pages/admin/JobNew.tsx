import { Sparkles } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { JobDescriptionAiDialog } from "@/components/dialogs/JobDescriptionAiDialog"
import { JobForm, useJobFormState } from "@/components/forms/JobForm"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { Button } from "@/components/ui/button"
import { ApiError, api } from "@/lib/api"
import type { JdAiDraft } from "@/lib/useJdAiChat"
import type { ApiJob } from "@/types"
import { useState } from "react"

export function AdminJobNew() {
  const navigate = useNavigate()
  const state = useJobFormState()
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [showAiDialog, setShowAiDialog] = useState(false)

  const submit = async (status: "draft" | "open") => {
    const { title, location, type, remoteStatus, experienceLevel, salaryMin, salaryMax, closingDate, description, skills } = state.values
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
        skills,
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

  const applyAiDraft = ({ mode, draft }: { mode: "draft" | "open"; draft: JdAiDraft }) => {
    const department = draft.department?.trim()
    state.setTitle(draft.title)
    state.setLocation(draft.location ?? "")
    state.setType(draft.employmentType)
    state.setExperienceLevel(draft.experienceLevel)
    state.setRemoteStatus(draft.remoteStatus ?? "")
    state.setSalaryMin(draft.salaryMin != null ? String(draft.salaryMin) : "")
    state.setSalaryMax(draft.salaryMax != null ? String(draft.salaryMax) : "")
    // The manual form has no dedicated "department" field — fold it into the description.
    state.setDescription(department ? `**Department:** ${department}\n\n${draft.description}` : draft.description)
    state.setSkills(draft.skills)
    setShowAiDialog(false)
    void submit(mode)
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
            <Button variant="outline" disabled={isSaving} onClick={() => setShowAiDialog(true)}>
              <Sparkles className="size-4" />
              Create with AI
            </Button>
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

      <JobDescriptionAiDialog open={showAiDialog} onOpenChange={setShowAiDialog} onApply={applyAiDraft} />
    </div>
  )
}
