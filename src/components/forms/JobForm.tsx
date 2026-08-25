import { useState } from "react"

import { SectionCard } from "@/components/cards/SectionCard"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { ApiExperienceLevel, ApiJobType, ApiRemoteStatus } from "@/types"

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

export interface JobFormValues {
  title: string
  location: string
  type: ApiJobType
  remoteStatus: ApiRemoteStatus | ""
  experienceLevel: ApiExperienceLevel | ""
  salaryMin: string
  salaryMax: string
  closingDate: string
  description: string
}

export function useJobFormState(initial?: Partial<JobFormValues>) {
  const [title, setTitle] = useState(initial?.title ?? "")
  const [location, setLocation] = useState(initial?.location ?? "")
  const [type, setType] = useState<ApiJobType>(initial?.type ?? "full_time")
  const [remoteStatus, setRemoteStatus] = useState<ApiRemoteStatus | "">(initial?.remoteStatus ?? "")
  const [experienceLevel, setExperienceLevel] = useState<ApiExperienceLevel | "">(initial?.experienceLevel ?? "")
  const [salaryMin, setSalaryMin] = useState(initial?.salaryMin ?? "")
  const [salaryMax, setSalaryMax] = useState(initial?.salaryMax ?? "")
  const [closingDate, setClosingDate] = useState(initial?.closingDate ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")

  return {
    values: { title, location, type, remoteStatus, experienceLevel, salaryMin, salaryMax, closingDate, description },
    setTitle,
    setLocation,
    setType,
    setRemoteStatus,
    setExperienceLevel,
    setSalaryMin,
    setSalaryMax,
    setClosingDate,
    setDescription,
  }
}

export function JobForm({
  state,
}: {
  state: ReturnType<typeof useJobFormState>
}) {
  const {
    values,
    setTitle,
    setLocation,
    setType,
    setRemoteStatus,
    setExperienceLevel,
    setSalaryMin,
    setSalaryMax,
    setClosingDate,
    setDescription,
  } = state

  return (
    <>
      <SectionCard title="Role details" description="Only the job title is required." animate={false}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Job title *</Label>
            <Input id="title" value={values.title} onChange={(e) => setTitle(e.target.value)} placeholder="Senior React Developer" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={values.location} onChange={(e) => setLocation(e.target.value)} placeholder="Remote" />
          </div>
          <div className="space-y-2">
            <Label>Workplace</Label>
            <Select value={values.remoteStatus} onValueChange={(v) => setRemoteStatus(v as ApiRemoteStatus)}>
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
            <Select value={values.type} onValueChange={(v) => setType(v as ApiJobType)}>
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
            <Select value={values.experienceLevel} onValueChange={(v) => setExperienceLevel(v as ApiExperienceLevel)}>
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
              <Input id="salaryMin" type="number" value={values.salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="150000" />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="salaryMax">Salary max ($)</Label>
              <Input id="salaryMax" type="number" value={values.salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="185000" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="closingDate">Closing date</Label>
            <Input id="closingDate" type="date" value={values.closingDate} onChange={(e) => setClosingDate(e.target.value)} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Job description" description="A clear description improves AI scoring and attracts better candidates." animate={false}>
        <Textarea value={values.description} onChange={(e) => setDescription(e.target.value)} rows={12} placeholder="Describe the role, team, mission, responsibilities, qualifications, and nice-to-haves..." />
      </SectionCard>
    </>
  )
}
