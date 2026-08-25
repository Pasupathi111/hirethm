import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { Skeleton } from "@/components/feedback/Skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type PaginatedResponse, api } from "@/lib/api"
import { fadeInUp, useReducedMotion, withReducedMotion } from "@/lib/motion"
import type { ApiJob, ApiJobType, ApiRemoteStatus } from "@/types"

const remoteStatusLabel: Record<ApiRemoteStatus, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
}

const jobTypeLabel: Record<ApiJobType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
}

function formatSalaryRange(job: Pick<ApiJob, "salaryMin" | "salaryMax">) {
  if (!job.salaryMin && !job.salaryMax) return null
  const min = job.salaryMin ? `$${(job.salaryMin / 1000).toFixed(0)}K` : ""
  const max = job.salaryMax ? `$${(job.salaryMax / 1000).toFixed(0)}K` : ""
  const sep = job.salaryMin && job.salaryMax ? " – " : ""
  return `${min}${sep}${max}`
}

export function JobDetail({ basePath = "/jobs", candidateMode = false }: { basePath?: string; candidateMode?: boolean }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const [job, setJob] = useState<ApiJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setNotFound(false)
    // Public job board has no single-job-by-id endpoint — resolve from the open-jobs list,
    // same source FindJobs uses, so "View Job" always lands on data that's actually open.
    api
      .get<PaginatedResponse<ApiJob>>("/api/public/jobs?limit=100")
      .then((res) => {
        const found = res.data.find((j) => j.id === id)
        if (found) setJob(found)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (notFound) return <Navigate to={basePath} replace />

  if (loading || !job) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-40" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      </div>
    )
  }

  const salaryRange = formatSalaryRange(job)
  const initials = job.title.slice(0, 2).toUpperCase()

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to={basePath} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to jobs
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <motion.div
          className="rounded-lg border border-border bg-card p-6 sm:p-8"
          variants={withReducedMotion(reduced, fadeInUp)}
          initial="hidden"
          animate="show"
        >
          <div className="flex items-start gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="bg-slate-800 text-lg text-white">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl">{job.title}</h1>
              <p className="mt-1 text-muted-foreground">
                {job.location ? `${job.location} · ` : ""}
                Posted {new Date(job.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Badge>{jobTypeLabel[job.type]}</Badge>
            {job.remoteStatus && <Badge>{remoteStatusLabel[job.remoteStatus]}</Badge>}
            {job.experienceLevel && <Badge>{job.experienceLevel}</Badge>}
          </div>
          {salaryRange && (
            <p className="mt-3 text-xl font-display font-semibold tracking-[-0.02em] text-primary">{salaryRange}</p>
          )}

          {job.description && (
            <section className="mt-8">
              <h2 className="text-xl">About the role</h2>
              <p className="mt-3 whitespace-pre-line text-muted-foreground">{job.description}</p>
            </section>
          )}

          {job.skills && job.skills.length > 0 && (
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
          )}
        </motion.div>

        <motion.div
          className="space-y-4"
          variants={withReducedMotion(reduced, fadeInUp)}
          initial="hidden"
          animate="show"
        >
          <div className="sticky top-24 rounded-lg border border-border bg-card p-6">
            {salaryRange && <p className="text-xl font-display font-semibold tracking-[-0.02em]">{salaryRange}</p>}
            <p className="text-sm text-muted-foreground">{jobTypeLabel[job.type]}</p>
            <Button className="mt-4 w-full" size="lg" onClick={() => navigate(`${basePath}/${job.id}/apply`)}>
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
            <div className="rounded-xl bg-secondary p-6 text-secondary-foreground">
              <p className="text-xs font-bold tracking-wide text-mint uppercase">Your match score</p>
              <p className="mt-2 text-sm text-white/70">
                See your personalized AI match score for this and every open role in your Matches list.
              </p>
              <Button asChild variant="outline" className="mt-4 w-full bg-white text-secondary hover:bg-white/90">
                <Link to="/app/matches">View my matches</Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-xl bg-secondary p-6 text-secondary-foreground">
              <p className="text-xs font-bold tracking-wide text-mint uppercase">See your match score</p>
              <p className="mt-2 text-sm text-white/70">
                Sign in to see how your skills, experience and goals score against this role.
              </p>
              <Button asChild variant="outline" className="mt-4 w-full bg-white text-secondary hover:bg-white/90">
                <Link to="/sign-in">Sign in</Link>
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
