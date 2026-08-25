import { GripVertical, Plus, Trash2 } from "lucide-react"
import { useRef, useState } from "react"
import { Navigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { SectionCard } from "@/components/cards/SectionCard"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { jobs } from "@/data/mockData"

const fieldTypes = ["Short answer", "Long answer", "Multiple choice", "Yes / No", "File upload"]

interface FormField {
  id: number
  label: string
  type: string
  required: boolean
}

const defaultFields: FormField[] = [
  { id: 1, label: "Why are you interested in this role?", type: "Long answer", required: true },
  { id: 2, label: "Years of relevant experience", type: "Short answer", required: true },
  { id: 3, label: "Are you authorized to work in this location?", type: "Yes / No", required: true },
]

export function AdminJobApplicationForm() {
  const { id } = useParams()
  const job = jobs.find((j) => j.id === id)
  const [fields, setFields] = useState<FormField[]>(defaultFields)
  const nextId = useRef(defaultFields.length + 1)

  if (!job) return <Navigate to="/admin/jobs" replace />

  const update = (fieldId: number, patch: Partial<FormField>) => {
    setFields((prev) => prev.map((f) => (f.id === fieldId ? { ...f, ...patch } : f)))
  }

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref={`/admin/jobs/${job.id}`}
        backLabel="Back to job"
        initials={job.companyInitials}
        name="Application form"
        meta={`${job.title} · ${job.company}`}
        actions={
          <Button variant="dark" onClick={() => toast.success("Application form saved")}>
            Save form
          </Button>
        }
      />

      <SectionCard
        title="Screening questions"
        description="Candidates answer these when applying to this job, in addition to their profile."
        animate={false}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const id = nextId.current++
              setFields((prev) => [...prev, { id, label: "", type: "Short answer", required: false }])
            }}
          >
            <Plus className="size-4" /> Add question
          </Button>
        }
      >
        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
              <GripVertical className="size-4 shrink-0 text-muted-foreground" />
              <Input
                value={field.label}
                onChange={(e) => update(field.id, { label: e.target.value })}
                placeholder="Question label"
                className="min-w-48 flex-1"
              />
              <Select value={field.type} onValueChange={(v) => update(field.id, { type: v })}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch checked={field.required} onCheckedChange={(v) => update(field.id, { required: v })} />
                Required
              </label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setFields((prev) => prev.filter((f) => f.id !== field.id))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          {fields.length === 0 && <p className="text-sm text-muted-foreground">No screening questions yet — add one above.</p>}
        </div>
      </SectionCard>
    </div>
  )
}
