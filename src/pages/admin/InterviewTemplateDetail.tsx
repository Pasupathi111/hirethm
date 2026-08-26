import { Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { SectionCard } from "@/components/cards/SectionCard"
import { Skeleton } from "@/components/feedback/Skeleton"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ApiError, api } from "@/lib/api"
import type { ApiInterviewTemplate, ApiInterviewType } from "@/types"

const typeOptions: { value: ApiInterviewType; label: string }[] = [
  { value: "video", label: "Video Call" },
  { value: "phone", label: "Phone Call" },
  { value: "in_person", label: "In Person" },
  { value: "panel", label: "Panel Interview" },
  { value: "technical", label: "Technical Interview" },
  { value: "take_home", label: "Take-Home Assignment" },
]

export function AdminInterviewTemplateDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === "new"

  const [existing, setExisting] = useState<ApiInterviewTemplate | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState("")
  const [type, setType] = useState<ApiInterviewType>("video")
  const [duration, setDuration] = useState("30")
  const [questions, setQuestions] = useState<string[]>([""])

  useEffect(() => {
    if (isNew || !id) return
    api
      .get<ApiInterviewTemplate>(`/api/interview-templates/${id}`)
      .then((t) => {
        setExisting(t)
        setName(t.name)
        setType(t.type)
        setDuration(String(t.duration))
        setQuestions(t.questions.length > 0 ? t.questions : [""])
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [id, isNew])

  if (notFound) return <Navigate to="/admin/interview-templates" replace />
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  const updateQuestion = (i: number, value: string) => {
    setQuestions((prev) => prev.map((q, idx) => (idx === i ? value : q)))
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Template name is required")
      return
    }
    setSaving(true)
    const payload = {
      name: name.trim(),
      type,
      duration: Number(duration),
      questions: questions.map((q) => q.trim()).filter(Boolean),
    }
    try {
      if (isNew) {
        await api.post("/api/interview-templates", { ...payload, status: "draft" })
        toast.success("Template created")
      } else {
        await api.patch(`/api/interview-templates/${id}`, payload)
        toast.success("Template saved")
      }
      navigate("/admin/interview-templates")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save template")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref="/admin/interview-templates"
        backLabel="Back to templates"
        initials={isNew ? "NW" : name.slice(0, 2).toUpperCase()}
        name={isNew ? "New interview template" : name}
        meta={isNew ? "Draft" : `${existing?.status} · ${questions.filter(Boolean).length} questions · Updated ${existing ? new Date(existing.updatedAt).toLocaleDateString() : ""}`}
        actions={
          <Button variant="dark" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save template"}
          </Button>
        }
      />

      <SectionCard title="Template details" animate={false}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Template name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Frontend Technical Screen" />
          </div>
          <div className="space-y-2">
            <Label>Interview type</Label>
            <Select value={type} onValueChange={(v) => setType(v as ApiInterviewType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input id="duration" type="number" min={5} max={480} value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Questions"
        description="Shown to the interviewer in order."
        animate={false}
        actions={
          <Button variant="outline" size="sm" onClick={() => setQuestions((prev) => [...prev, ""])}>
            <Plus className="size-4" /> Add question
          </Button>
        }
      >
        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-2.5 w-5 shrink-0 text-sm font-semibold text-muted-foreground">{i + 1}.</span>
              <Input value={q} onChange={(e) => updateQuestion(i, e.target.value)} placeholder="Enter a question..." className="flex-1" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={questions.length === 1}
                onClick={() => setQuestions((prev) => prev.filter((_, idx) => idx !== i))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
