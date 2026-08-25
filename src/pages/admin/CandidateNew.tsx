import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { CandidateForm, useCandidateFormState } from "@/components/forms/CandidateForm"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { Button } from "@/components/ui/button"
import { ApiError, api } from "@/lib/api"
import type { ApiCandidate } from "@/types"

export function AdminCandidateNew() {
  const navigate = useNavigate()
  const state = useCandidateFormState()
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const { firstName, lastName, email, phone, gender, dateOfBirth, quickNotes } = state.values
  const canSubmit = firstName.trim() && lastName.trim() && email.trim()

  const handleSubmit = async () => {
    setError("")
    setIsSaving(true)
    try {
      const candidate = await api.post<ApiCandidate>("/api/candidates", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        gender: gender || undefined,
        dateOfBirth: dateOfBirth || undefined,
        quickNotes: quickNotes.trim() || undefined,
      })
      toast.success("Candidate added", { description: `${candidate.firstName} ${candidate.lastName} was added.` })
      navigate("/admin/candidates")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create candidate")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref="/admin/candidates"
        backLabel="Back to candidates"
        initials={firstName || lastName ? `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() : "NW"}
        name="Add Candidate"
        meta="Manually created profile"
        actions={
          <Button variant="dark" disabled={!canSubmit || isSaving} onClick={handleSubmit}>
            Add Candidate
          </Button>
        }
      />

      {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <CandidateForm state={state} />
    </div>
  )
}
