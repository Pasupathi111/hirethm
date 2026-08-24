import { ArrowLeft } from "lucide-react"
import { Link, Navigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { jobs } from "@/data/mockData"

export function JobDetail({ basePath = "/jobs", candidateMode = false }: { basePath?: string; candidateMode?: boolean }) {
  const { id } = useParams()
  const job = jobs.find((j) => j.id === id)

  if (!job) return <Navigate to={basePath} replace />

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to={basePath} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to jobs
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <Avatar className="size-16">
              <AvatarFallback className={`${job.companyColor} text-lg text-white`}>{job.companyInitials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-extrabold">{job.title}</h1>
              <p className="mt-1 text-muted-foreground">
                {job.company} · {job.workMode} · Posted {job.postedAt}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Badge>{job.employmentType}</Badge>
            <Badge>{job.experience}</Badge>
          </div>
          <p className="mt-3 text-xl font-bold text-primary">
            ${(job.salaryMin / 1000).toFixed(0)}K – ${(job.salaryMax / 1000).toFixed(0)}K
          </p>

          <section className="mt-8">
            <h2 className="text-xl font-bold">About the role</h2>
            <p className="mt-3 text-muted-foreground">{job.about}</p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold">Responsibilities</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              {job.responsibilities.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold">Requirements</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              {job.requirements.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold">Benefits</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              {job.benefits.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold">Skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <Badge key={s} variant="outline">
                  {s}
                </Badge>
              ))}
            </div>
          </section>

          <hr className="my-8 border-border" />

          <section>
            <h2 className="text-xl font-bold">About {job.company}</h2>
            <p className="mt-3 text-muted-foreground">{job.companyBlurb}</p>
          </section>
        </div>

        <div className="space-y-4">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
            <p className="text-xl font-extrabold">
              ${(job.salaryMin / 1000).toFixed(0)}K – ${(job.salaryMax / 1000).toFixed(0)}K
            </p>
            <p className="text-sm text-muted-foreground">Base range · {job.employmentType}</p>
            <Button
              className="mt-4 w-full"
              size="lg"
              onClick={() => toast.success("Application submitted", { description: `You applied to ${job.title} at ${job.company}.` })}
            >
              Apply Now
            </Button>
            <div className="mt-2 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => toast("Job saved", { description: "Find it later under Applications." })}
              >
                Save Job
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href)
                  toast("Link copied to clipboard")
                }}
              >
                Share
              </Button>
            </div>
          </div>

          {candidateMode ? (
            <div className="rounded-2xl bg-secondary p-6 text-secondary-foreground">
              <p className="text-xs font-bold tracking-wide text-emerald-400 uppercase">Your match score</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="relative flex size-14 items-center justify-center rounded-full border-4 border-primary/30">
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary" />
                  <span className="text-sm font-extrabold">88%</span>
                </div>
                <p className="text-sm text-white/70">Strong alignment on skills and location preference.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-secondary p-6 text-secondary-foreground">
              <p className="text-xs font-bold tracking-wide text-emerald-400 uppercase">See your match score</p>
              <p className="mt-2 text-sm text-white/70">
                Sign in to see how your skills, experience and goals score against this role.
              </p>
              <Button asChild variant="outline" className="mt-4 w-full bg-white text-secondary hover:bg-white/90">
                <Link to="/sign-in">Sign in</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
