import { Link } from "react-router-dom"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Job } from "@/types"

export function JobCard({ job, viewHref }: { job: Job; viewHref: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 transition-shadow duration-200 hover:shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-3">
        <Avatar className="size-11">
          <AvatarFallback className={`${job.companyColor} text-white`}>{job.companyInitials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold">{job.title}</h3>
          <p className="text-sm text-muted-foreground">
            {job.company} · {job.postedAt}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge>{job.workMode}</Badge>
        <Badge>{job.employmentType}</Badge>
        {job.experience && <Badge>{job.experience}</Badge>}
      </div>

      <p className="font-display mt-3 text-lg font-semibold tracking-[-0.02em] text-primary">
        ${(job.salaryMin / 1000).toFixed(0)}K – ${(job.salaryMax / 1000).toFixed(0)}K
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-hairline pt-4">
        <div className="flex flex-wrap gap-1.5">
          {job.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="outline" className="font-medium">
              {skill}
            </Badge>
          ))}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to={viewHref}>View Job</Link>
          </Button>
          <Button size="sm">Apply</Button>
        </div>
      </div>
    </div>
  )
}
