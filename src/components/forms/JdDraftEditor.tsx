import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { JdAiDraft } from "@/lib/useJdAiChat"
import type { ApiExperienceLevel, ApiJobType, ApiRemoteStatus } from "@/types"

const EMPLOYMENT_TYPE_OPTIONS: { value: ApiJobType; label: string }[] = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
]

/**
 * Editable review panel for an AI-generated job-description draft.
 * Every field maps onto the manual job-creation wizard, so a recruiter can
 * correct the AI before the job is created.
 */
export function JdDraftEditor({
  draft,
  onChange,
  descriptionRows = 10,
}: {
  draft: JdAiDraft
  onChange: (draft: JdAiDraft) => void
  descriptionRows?: number
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="jd-title">Job title</Label>
        <Input id="jd-title" value={draft.title} onChange={(e) => onChange({ ...draft, title: e.target.value })} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="jd-department">Department</Label>
          <Input id="jd-department" value={draft.department ?? ""} onChange={(e) => onChange({ ...draft, department: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jd-location">Location</Label>
          <Input id="jd-location" value={draft.location ?? ""} onChange={(e) => onChange({ ...draft, location: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="jd-employment-type">Employment type</Label>
          <Select value={draft.employmentType} onValueChange={(v) => onChange({ ...draft, employmentType: v as ApiJobType })}>
            <SelectTrigger id="jd-employment-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_TYPE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="jd-experience-level">Experience level</Label>
          <Select value={draft.experienceLevel} onValueChange={(v) => onChange({ ...draft, experienceLevel: v as ApiExperienceLevel })}>
            <SelectTrigger id="jd-experience-level" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="junior">Junior</SelectItem>
              <SelectItem value="mid">Mid-level</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="jd-workplace">Workplace</Label>
          <Select
            value={draft.remoteStatus ?? "unspecified"}
            onValueChange={(v) => onChange({ ...draft, remoteStatus: v === "unspecified" ? null : (v as ApiRemoteStatus) })}
          >
            <SelectTrigger id="jd-workplace" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unspecified">Not specified</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="onsite">On-site</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="jd-salary-min">Salary range</Label>
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              min={0}
              placeholder="Min"
              id="jd-salary-min"
              value={draft.salaryMin ?? ""}
              onChange={(e) => onChange({ ...draft, salaryMin: e.target.value ? Number(e.target.value) : null })}
            />
            <Input
              type="number"
              min={0}
              placeholder="Max"
              id="jd-salary-max"
              value={draft.salaryMax ?? ""}
              onChange={(e) => onChange({ ...draft, salaryMax: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="jd-skills">Required skills</Label>
        <Input
          id="jd-skills"
          value={draft.skills.join(", ")}
          onChange={(e) =>
            onChange({
              ...draft,
              skills: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          placeholder="React, TypeScript, SQL…"
        />
        <p className="text-xs text-muted-foreground">Comma-separated. Used for AI candidate matching.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="jd-description">Full description</Label>
        <Textarea id="jd-description" value={draft.description} onChange={(e) => onChange({ ...draft, description: e.target.value })} rows={descriptionRows} />
        <p className="text-xs text-muted-foreground">Includes responsibilities, qualifications, and preferred skills. Edit freely.</p>
      </div>
    </div>
  )
}
