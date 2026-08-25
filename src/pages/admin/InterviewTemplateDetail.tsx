import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { SectionCard } from "@/components/cards/SectionCard"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { interviewTemplates } from "@/data/mockData"

const typeOptions = ["Technical Interview", "Hiring Manager Interview", "Portfolio Review", "Culture Interview"]

export function AdminInterviewTemplateDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === "new"
  const existing = isNew ? undefined : interviewTemplates.find((t) => t.id === id)

  const [name, setName] = useState(existing?.name ?? "")
  const [type, setType] = useState(existing?.type ?? typeOptions[0])
  const [duration, setDuration] = useState(existing?.duration ?? "30 min")
  const [questions, setQuestions] = useState<string[]>(existing?.questions ?? [""])

  if (!isNew && !existing) return <Navigate to="/admin/interview-templates" replace />

  const updateQuestion = (i: number, value: string) => {
    setQuestions((prev) => prev.map((q, idx) => (idx === i ? value : q)))
  }

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref="/admin/interview-templates"
        backLabel="Back to templates"
        initials={isNew ? "NW" : (existing?.name ?? "").slice(0, 2).toUpperCase()}
        name={isNew ? "New interview template" : (existing?.name ?? "")}
        meta={isNew ? "Draft" : `${existing?.type} · ${existing?.questionCount} questions · Updated ${existing?.updated}`}
        actions={
          <Button
            variant="dark"
            onClick={() => {
              toast.success(isNew ? "Template created" : "Template saved")
              navigate("/admin/interview-templates")
            }}
          >
            Save template
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
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Input id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="45 min" />
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
