import { Eye } from "lucide-react"
import { Link, Navigate, useParams } from "react-router-dom"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { jobs } from "@/data/mockData"

export function AdminJobPreview() {
  const { id } = useParams()
  const job = jobs.find((j) => j.id === id)

  if (!job) return <Navigate to="/admin/jobs" replace />

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Eye className="size-4" /> Preview mode — this is how candidates will see the job.
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to={`/admin/jobs/${job.id}`}>Back to editor</Link>
        </Button>
      </div>

      <div className="mx-auto max-w-4xl rounded-lg border border-border bg-card p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <Avatar className="size-16">
            <AvatarFallback className={`${job.companyColor} text-lg text-white`}>{job.companyInitials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl">{job.title}</h1>
            <p className="mt-1 text-muted-foreground">
              {job.company} · {job.workMode} · Posted {job.postedAt}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Badge>{job.employmentType}</Badge>
          <Badge>{job.experience}</Badge>
        </div>
        <p className="mt-3 text-xl font-display font-semibold tracking-[-0.02em] text-primary">
          ${(job.salaryMin / 1000).toFixed(0)}K – ${(job.salaryMax / 1000).toFixed(0)}K
        </p>

        <section className="mt-8">
          <h2 className="text-xl">About the role</h2>
          <p className="mt-3 text-muted-foreground">{job.about}</p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl">Responsibilities</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            {job.responsibilities.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl">Requirements</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            {job.requirements.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl">Skills</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {job.skills.map((s) => (
              <Badge key={s} variant="outline">
                {s}
              </Badge>
            ))}
          </div>
        </section>

        <Button className="mt-8 w-full" size="lg" disabled>
          Apply Now
        </Button>
      </div>
    </div>
  )
}
