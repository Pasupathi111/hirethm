import { Link } from "react-router-dom"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

export function PublicJobCard({ job, viewHref }: { job: ApiJob; viewHref: string }) {
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

      {job.skills && job.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="outline" className="font-medium">
              {skill}
            </Badge>
          ))}
        </div>
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
