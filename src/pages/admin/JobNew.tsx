import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { SectionCard } from "@/components/cards/SectionCard"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ApiError, api } from "@/lib/api"
import type { ApiExperienceLevel, ApiJob, ApiJobType, ApiRemoteStatus } from "@/types"

const typeOptions: { value: ApiJobType; label: string }[] = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
]

const remoteOptions: { value: ApiRemoteStatus; label: string }[] = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
]

const experienceOptions: { value: ApiExperienceLevel; label: string }[] = [
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
]

export function AdminJobNew() {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [type, setType] = useState<ApiJobType>("full_time")
  const [remoteStatus, setRemoteStatus] = useState<ApiRemoteStatus | "">("")
  const [experienceLevel, setExperienceLevel] = useState<ApiExperienceLevel | "">("")
  const [salaryMin, setSalaryMin] = useState("")
  const [salaryMax, setSalaryMax] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const submit = async (status: "draft" | "open") => {
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
            <Button variant="outline" disabled={isSaving || !title.trim()} onClick={() => submit("draft")}>
              Save draft
            </Button>
            <Button variant="dark" disabled={isSaving || !title.trim()} onClick={() => submit("open")}>
              Publish job
            </Button>
          </>
        }
      />

      {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      <SectionCard title="Role details" description="Only the job title is required." animate={false}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Job title *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Senior React Developer" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Remote" />
          </div>
          <div className="space-y-2">
            <Label>Workplace</Label>
            <Select value={remoteStatus} onValueChange={(v) => setRemoteStatus(v as ApiRemoteStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Not specified" />
              </SelectTrigger>
              <SelectContent>
                {remoteOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Employment type</Label>
            <Select value={type} onValueChange={(v) => setType(v as ApiJobType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Experience level</Label>
            <Select value={experienceLevel} onValueChange={(v) => setExperienceLevel(v as ApiExperienceLevel)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Not specified" />
              </SelectTrigger>
              <SelectContent>
                {experienceOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="salaryMin">Salary min ($)</Label>
              <Input id="salaryMin" type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="150000" />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="salaryMax">Salary max ($)</Label>
              <Input id="salaryMax" type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="185000" />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Job description" description="A clear description improves AI scoring and attracts better candidates." animate={false}>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Describe the role, team, and mission..." />
      </SectionCard>
    </div>
  )
}
