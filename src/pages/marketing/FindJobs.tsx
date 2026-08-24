import { Search } from "lucide-react"
import { useMemo, useState } from "react"

import { JobCard } from "@/components/cards/JobCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { jobs } from "@/data/mockData"

const workModes = ["Remote", "Hybrid", "On-site"]
const employmentTypes = ["Full Time", "Contract", "Part Time"]
const experienceLevels = ["0-2 yrs", "3-5 yrs", "5+ yrs", "8+ yrs"]
const skillsList = ["React", "TypeScript", "Node.js", "Python", "AWS"]
const datePosted = ["24 hours", "This week", "This month"]

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
        active ? "border-primary bg-accent text-accent-foreground" : "border-border bg-card hover:bg-muted"
      }`}
    >
      {label}
    </button>
  )
}

export function FindJobs({ basePath = "/jobs" }: { basePath?: string }) {
  const [query, setQuery] = useState("")
  const [selectedModes, setSelectedModes] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedExperience, setSelectedExperience] = useState<string[]>([])
  const [selectedDatePosted, setSelectedDatePosted] = useState<string[]>([])
  const [sort, setSort] = useState("relevant")

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  const filtered = useMemo(() => {
    let result = jobs.filter((job) => {
      const matchesQuery =
        query.trim() === "" ||
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.company.toLowerCase().includes(query.toLowerCase()) ||
        job.skills.some((s) => s.toLowerCase().includes(query.toLowerCase()))
      const matchesMode = selectedModes.length === 0 || selectedModes.includes(job.workMode)
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(job.employmentType)
      const matchesSkills = selectedSkills.length === 0 || selectedSkills.some((s) => job.skills.includes(s))
      return matchesQuery && matchesMode && matchesType && matchesSkills
    })

    if (sort === "salary") {
      result = [...result].sort((a, b) => b.salaryMax - a.salaryMax)
    } else if (sort === "recent") {
      result = [...result].sort((a, b) => a.postedAt.localeCompare(b.postedAt))
    }
    return result
  }, [query, selectedModes, selectedTypes, selectedSkills, sort])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold tracking-tight">Open roles on HireThm</h1>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs, skills, companies..."
            className="h-12 pl-11"
          />
        </div>
        <Button size="lg">Search</Button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Filters</h2>
            <button
              type="button"
              className="text-sm font-semibold text-primary"
              onClick={() => {
                setSelectedModes([])
                setSelectedTypes([])
                setSelectedSkills([])
                setSelectedExperience([])
                setSelectedDatePosted([])
              }}
            >
              Clear
            </button>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">Work mode</p>
            <div className="flex flex-wrap gap-2">
              {workModes.map((mode) => (
                <FilterPill
                  key={mode}
                  label={mode}
                  active={selectedModes.includes(mode)}
                  onClick={() => toggle(selectedModes, setSelectedModes, mode)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">Employment type</p>
            <div className="flex flex-wrap gap-2">
              {employmentTypes.map((type) => (
                <FilterPill
                  key={type}
                  label={type}
                  active={selectedTypes.includes(type)}
                  onClick={() => toggle(selectedTypes, setSelectedTypes, type)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">Experience</p>
            <div className="flex flex-wrap gap-2">
              {experienceLevels.map((level) => (
                <FilterPill
                  key={level}
                  label={level}
                  active={selectedExperience.includes(level)}
                  onClick={() => toggle(selectedExperience, setSelectedExperience, level)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">Skills</p>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill) => (
                <FilterPill
                  key={skill}
                  label={skill}
                  active={selectedSkills.includes(skill)}
                  onClick={() => toggle(selectedSkills, setSelectedSkills, skill)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">Date posted</p>
            <div className="flex flex-wrap gap-2">
              {datePosted.map((d) => (
                <FilterPill
                  key={d}
                  label={d}
                  active={selectedDatePosted.includes(d)}
                  onClick={() => toggle(selectedDatePosted, setSelectedDatePosted, d)}
                />
              ))}
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-muted-foreground">{filtered.length} roles</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort</span>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevant">Most relevant</SelectItem>
                  <SelectItem value="recent">Most recent</SelectItem>
                  <SelectItem value="salary">Highest salary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((job) => (
              <JobCard key={job.id} job={job} viewHref={`${basePath}/${job.id}`} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
              No roles match your filters yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
