import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { ChipGroup } from "@/components/forms/ChipGroup"
import { SectionCard } from "@/components/cards/SectionCard"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const skillOptions = ["React", "TypeScript", "Node.js", "GraphQL", "Python", "AWS", "SQL", "Kubernetes"]
const workModes = ["Remote", "Hybrid", "On-site"]
const employmentTypes = ["Full Time", "Contract", "Part Time"]

export function AdminJobNew() {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [company, setCompany] = useState("")
  const [location, setLocation] = useState("")
  const [workMode, setWorkMode] = useState(workModes[0])
  const [employmentType, setEmploymentType] = useState(employmentTypes[0])
  const [salaryMin, setSalaryMin] = useState("")
  const [salaryMax, setSalaryMax] = useState("")
  const [about, setAbout] = useState("")
  const [skills, setSkills] = useState<string[]>([])

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref="/admin/jobs"
        backLabel="Back to jobs"
        initials={company ? company.slice(0, 2).toUpperCase() : "NW"}
        name="New job posting"
        meta="Draft, not yet published"
        actions={
          <>
            <Button variant="outline" onClick={() => toast("Draft saved")}>
              Save draft
            </Button>
            <Button
              variant="dark"
              disabled={!title || !company}
              onClick={() => {
                toast.success("Job published", { description: `${title} is now live.` })
                navigate("/admin/jobs")
              }}
            >
              Publish job
            </Button>
          </>
        }
      />

      <SectionCard title="Role details" animate={false}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Job title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Senior React Developer" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="ABC Technologies" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Remote" />
          </div>
          <div className="space-y-2">
            <Label>Work mode</Label>
            <Select value={workMode} onValueChange={setWorkMode}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {workModes.map((w) => (
                  <SelectItem key={w} value={w}>
                    {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Employment type</Label>
            <Select value={employmentType} onValueChange={setEmploymentType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {employmentTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
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

      <SectionCard title="Job description" animate={false}>
        <div className="space-y-2">
          <Label htmlFor="about">About the role</Label>
          <Textarea id="about" value={about} onChange={(e) => setAbout(e.target.value)} rows={5} placeholder="Describe the role, team, and mission..." />
        </div>
      </SectionCard>

      <SectionCard title="Required skills" description="Used for AI matching." animate={false}>
        <ChipGroup
          options={skillOptions}
          selected={skills}
          onToggle={(v) => setSkills((prev) => (prev.includes(v) ? prev.filter((s) => s !== v) : [...prev, v]))}
        />
      </SectionCard>
    </div>
  )
}
