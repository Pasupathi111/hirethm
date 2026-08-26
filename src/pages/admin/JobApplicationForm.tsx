import { GripVertical, Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Navigate, useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { SectionCard } from "@/components/cards/SectionCard"
import { Skeleton } from "@/components/feedback/Skeleton"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ApiError, api } from "@/lib/api"
import type { ApiJob } from "@/types"

type QuestionType = "short_text" | "long_text" | "checkbox" | "file_upload"

const fieldTypes: { value: QuestionType; label: string }[] = [
  { value: "short_text", label: "Short answer" },
  { value: "long_text", label: "Long answer" },
  { value: "checkbox", label: "Yes / No" },
  { value: "file_upload", label: "File upload" },
]

interface JobQuestion {
  id: string
  jobId: string
  type: QuestionType
  label: string
  description: string | null
  required: boolean
  options: string[] | null
  displayOrder: number
}

export function AdminJobApplicationForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [job, setJob] = useState<ApiJob | null>(null)
  const [questions, setQuestions] = useState<JobQuestion[]>([])
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | number | null>(null)

  useEffect(() => {
    if (!id) return
    Promise.all([api.get<ApiJob>(`/api/jobs/${id}`), api.get<JobQuestion[]>(`/api/jobs/${id}/questions`)])
      .then(([jobRes, questionsRes]) => {
        setJob(jobRes)
        setQuestions(questionsRes)
      })
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

  const addQuestion = async () => {
    setSavingId("new")
    try {
      const created = await api.post<JobQuestion>(`/api/jobs/${id}/questions`, {
        label: "New question",
        type: "short_text",
        required: false,
        displayOrder: questions.length,
      })
      setQuestions((prev) => [...prev, created])
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to add question")
    } finally {
      setSavingId(null)
    }
  }

  const updateQuestion = async (questionId: string, patch: Partial<Pick<JobQuestion, "label" | "type" | "required">>) => {
    setQuestions((prev) => prev.map((f) => (f.id === questionId ? { ...f, ...patch } : f)))
    setSavingId(questionId)
    try {
      await api.patch<JobQuestion>(`/api/jobs/${id}/questions/${questionId}`, patch)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save question")
    } finally {
      setSavingId(null)
    }
  }

  const removeQuestion = async (questionId: string) => {
    setSavingId(questionId)
    try {
      await api.del(`/api/jobs/${id}/questions/${questionId}`)
      setQuestions((prev) => prev.filter((f) => f.id !== questionId))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to remove question")
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref={`/admin/jobs/${job.id}`}
        backLabel="Back to job"
        initials={job.title.slice(0, 2).toUpperCase()}
        name="Application form"
        meta={job.title}
        actions={
          // Every edit on this screen already persists immediately, so "Done"
          // has nothing to save — it just returns to the job.
          <Button variant="dark" onClick={() => navigate(`/admin/jobs/${job.id}`)}>
            Done
          </Button>
        }
      />

      <SectionCard
        title="Screening questions"
        description="Candidates answer these when applying to this job, in addition to their profile. Changes save immediately."
        animate={false}
        actions={
          <Button variant="outline" size="sm" disabled={savingId === "new"} onClick={addQuestion}>
            <Plus className="size-4" /> Add question
          </Button>
        }
      >
        <div className="space-y-3">
          {questions.map((field) => (
            <div key={field.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
              <GripVertical className="size-4 shrink-0 text-muted-foreground" />
              <Input
                value={field.label}
                onChange={(e) => setQuestions((prev) => prev.map((f) => (f.id === field.id ? { ...f, label: e.target.value } : f)))}
                onBlur={(e) => updateQuestion(field.id, { label: e.target.value })}
                placeholder="Question label"
                className="min-w-48 flex-1"
              />
              <Select value={field.type} onValueChange={(v) => updateQuestion(field.id, { type: v as QuestionType })}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch checked={field.required} onCheckedChange={(v) => updateQuestion(field.id, { required: v })} />
                Required
              </label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={savingId === field.id}
                onClick={() => removeQuestion(field.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          {questions.length === 0 && <p className="text-sm text-muted-foreground">No screening questions yet — add one above.</p>}
        </div>
      </SectionCard>
    </div>
  )
}
