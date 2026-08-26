import { Sparkles } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { JobDescriptionAiDialog } from "@/components/dialogs/JobDescriptionAiDialog"
import { JobForm, useJobFormState, type JobFormValues } from "@/components/forms/JobForm"
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

  /**
   * Creates the job from an explicit set of values.
   *
   * Takes `values` as an argument rather than reading `state.values` through
   * the closure: the AI path applies a draft and creates the job in the same
   * tick, and React state updates are asynchronous, so reading through the
   * closure there would post the pre-draft (empty) form and 400.
   */
  const createJob = async (values: JobFormValues, status: "draft" | "open") => {
    const { title, location, type, remoteStatus, experienceLevel, salaryMin, salaryMax, closingDate, description, skills } = values
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

  const submit = (status: "draft" | "open") => createJob(state.values, status)

  const applyAiDraft = ({ mode, draft }: { mode: "draft" | "open"; draft: JdAiDraft }) => {
    const department = draft.department?.trim()
    const values: JobFormValues = {
      ...state.values,
      title: draft.title,
      location: draft.location ?? "",
      type: draft.employmentType,
      experienceLevel: draft.experienceLevel,
      remoteStatus: draft.remoteStatus ?? "",
      salaryMin: draft.salaryMin != null ? String(draft.salaryMin) : "",
      salaryMax: draft.salaryMax != null ? String(draft.salaryMax) : "",
      // The manual form has no dedicated "department" field — fold it into the description.
      description: department ? `**Department:** ${department}\n\n${draft.description}` : draft.description,
      skills: draft.skills,
    }

    // Mirror the draft into the form too, so the values are visible and
    // editable if creation fails and the user is left on the wizard.
    state.setTitle(values.title)
    state.setLocation(values.location)
    state.setType(values.type)
    state.setExperienceLevel(values.experienceLevel)
    state.setRemoteStatus(values.remoteStatus)
    state.setSalaryMin(values.salaryMin)
    state.setSalaryMax(values.salaryMax)
    state.setDescription(values.description)
    state.setSkills(values.skills)

    setShowAiDialog(false)
    void createJob(values, mode)
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
