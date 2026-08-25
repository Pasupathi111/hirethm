import { SlidersHorizontal } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { SearchBar } from "@/components/common/SearchBar"
import { EmptyState } from "@/components/feedback/EmptyState"
import { ErrorState } from "@/components/feedback/ErrorState"
import { Skeleton } from "@/components/feedback/Skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { type PaginatedResponse, api } from "@/lib/api"
import type { ApiJob, ApiJobType, ApiRemoteStatus } from "@/types"

const remoteStatusLabel: Record<ApiRemoteStatus, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
}

const jobTypeLabel: Record<ApiJobType, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  internship: "Internship",
}

const workModes: ApiRemoteStatus[] = ["remote", "hybrid", "onsite"]
const employmentTypes: ApiJobType[] = ["full_time", "part_time", "contract", "internship"]

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

interface FilterState {
  selectedModes: ApiRemoteStatus[]
  setSelectedModes: (v: ApiRemoteStatus[]) => void
  selectedTypes: ApiJobType[]
  setSelectedTypes: (v: ApiJobType[]) => void
}

function FiltersContent({ selectedModes, setSelectedModes, selectedTypes, setSelectedTypes }: FilterState) {
  const toggle = <T,>(list: T[], setList: (v: T[]) => void, value: T) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg">Filters</h2>
        <button
          type="button"
          className="text-sm font-semibold text-primary"
          onClick={() => {
            setSelectedModes([])
            setSelectedTypes([])
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
              label={remoteStatusLabel[mode]}
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
              label={jobTypeLabel[type]}
              active={selectedTypes.includes(type)}
              onClick={() => toggle(selectedTypes, setSelectedTypes, type)}
            />
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Skill-based filtering isn't available yet — the job skills field is landing on the backend soon.
      </p>
    </div>
  )
}

function PublicJobCard({ job, viewHref }: { job: ApiJob; viewHref: string }) {
  const initials = job.title.slice(0, 2).toUpperCase()
  return (
    <div className="rounded-lg border border-border bg-card p-5 transition-shadow duration-200 hover:shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-3">
        <Avatar className="size-11">
          <AvatarFallback className="bg-slate-800 text-white">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold">{job.title}</h3>
          <p className="text-sm text-muted-foreground">
            {job.location ?? "Location not set"} · {new Date(job.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {job.remoteStatus && <Badge>{remoteStatusLabel[job.remoteStatus]}</Badge>}
        <Badge>{jobTypeLabel[job.type]}</Badge>
        {job.experienceLevel && <Badge>{job.experienceLevel}</Badge>}
      </div>

      {(job.salaryMin || job.salaryMax) && (
        <p className="font-display mt-3 text-lg font-semibold tracking-[-0.02em] text-primary">
          {job.salaryMin ? `$${(job.salaryMin / 1000).toFixed(0)}K` : ""}
          {job.salaryMin && job.salaryMax ? " – " : ""}
          {job.salaryMax ? `$${(job.salaryMax / 1000).toFixed(0)}K` : ""}
        </p>
      )}

      <div className="mt-4 flex items-center justify-end gap-2 border-t border-hairline pt-4">
        <Button asChild variant="outline" size="sm">
          <Link to={viewHref}>View Job</Link>
        </Button>
        <Button asChild size="sm">
          <Link to={`${viewHref}/apply`}>Apply</Link>
        </Button>
      </div>
    </div>
  )
}

export function FindJobs({ basePath = "/jobs" }: { basePath?: string }) {
  const [jobs, setJobs] = useState<ApiJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [selectedModes, setSelectedModes] = useState<ApiRemoteStatus[]>([])
  const [selectedTypes, setSelectedTypes] = useState<ApiJobType[]>([])
  const [sort, setSort] = useState("relevant")

  const load = useCallback(() => {
    setLoading(true)
    setError("")
    api
      .get<PaginatedResponse<ApiJob>>("/api/public/jobs?limit=100")
      .then((res) => setJobs(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load jobs"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const filterProps: FilterState = {
    selectedModes,
    setSelectedModes,
    selectedTypes,
    setSelectedTypes,
  }

  const activeFilterCount = selectedModes.length + selectedTypes.length

  const filtered = useMemo(() => {
    let result = jobs.filter((job) => {
      const matchesQuery = query.trim() === "" || job.title.toLowerCase().includes(query.toLowerCase())
      const matchesMode = selectedModes.length === 0 || (job.remoteStatus && selectedModes.includes(job.remoteStatus))
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(job.type)
      return matchesQuery && matchesMode && matchesType
    })

    if (sort === "salary") {
      result = [...result].sort((a, b) => (b.salaryMax ?? 0) - (a.salaryMax ?? 0))
    } else if (sort === "recent") {
      result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    return result
  }, [jobs, query, selectedModes, selectedTypes, sort])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl">Open roles on HireThm</h1>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden">
              <SlidersHorizontal className="size-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-6">
              <FiltersContent {...filterProps} />
            </div>
          </SheetContent>
        </Sheet>

        <SearchBar
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search jobs..."
          containerClassName="ml-auto w-full sm:max-w-sm"
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <FiltersContent {...filterProps} />
        </aside>

        <div>
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-56 w-full" />
              ))}
            </div>
          ) : error ? (
            <ErrorState description={error} onRetry={load} />
          ) : (
            <>
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
                  <PublicJobCard key={job.id} job={job} viewHref={`${basePath}/${job.id}`} />
                ))}
              </div>

              {filtered.length === 0 && (
                <EmptyState
                  title="No roles match your filters yet."
                  description="Try widening your search or clearing a filter."
                  action={{
                    label: "Clear filters",
                    onClick: () => {
                      setQuery("")
                      setSelectedModes([])
                      setSelectedTypes([])
                    },
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
