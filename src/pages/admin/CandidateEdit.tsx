import { useEffect, useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { CandidateForm, useCandidateFormState } from "@/components/forms/CandidateForm"
import { Skeleton } from "@/components/feedback/Skeleton"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { Button } from "@/components/ui/button"
import { ApiError, api } from "@/lib/api"
import type { ApiCandidate } from "@/types"

function CandidateEditForm({ candidate }: { candidate: ApiCandidate }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const state = useCandidateFormState({
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    email: candidate.email,
    phone: candidate.phone ?? "",
    gender: candidate.gender ?? "",
    dateOfBirth: candidate.dateOfBirth ?? "",
    quickNotes: candidate.quickNotes ?? "",
  })
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const { firstName, lastName, email, phone, gender, dateOfBirth, quickNotes } = state.values
  const canSubmit = firstName.trim() && lastName.trim() && email.trim()

  const submit = async () => {
    setError("")
    setIsSaving(true)
    try {
      const updated = await api.patch<ApiCandidate>(`/api/candidates/${id}`, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        gender: gender || undefined,
        dateOfBirth: dateOfBirth || undefined,
        quickNotes: quickNotes.trim() || undefined,
      })
      toast.success("Candidate updated", { description: `${updated.firstName} ${updated.lastName} was saved.` })
      navigate(`/admin/candidates/${id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update candidate")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref={`/admin/candidates/${id}`}
        backLabel="Back to candidate"
        initials={`${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase()}
        name={`Edit: ${candidate.displayName || `${candidate.firstName} ${candidate.lastName}`}`}
        meta={candidate.email}
        actions={
          <Button variant="dark" disabled={!canSubmit || isSaving} onClick={submit}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        }
      />

      {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <CandidateForm state={state} />
    </div>
  )
}

export function AdminCandidateEdit() {
  const { id } = useParams()
  const [candidate, setCandidate] = useState<ApiCandidate | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api
      .get<ApiCandidate>(`/api/candidates/${id}`)
      .then(setCandidate)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (notFound) return <Navigate to="/admin/candidates" replace />
  if (loading || !candidate) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  return <CandidateEditForm candidate={candidate} />
}
