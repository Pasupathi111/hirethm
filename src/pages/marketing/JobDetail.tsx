import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { ReadinessRing } from "@/components/cards/ReadinessRing"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { jobs } from "@/data/mockData"
import { estimateReadiness, matchReasonsFor } from "@/lib/matching"
import { fadeInUp, useReducedMotion, withReducedMotion } from "@/lib/motion"

export function JobDetail({ basePath = "/jobs", candidateMode = false }: { basePath?: string; candidateMode?: boolean }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const job = jobs.find((j) => j.id === id)
  const reduced = useReducedMotion()

  if (!job) return <Navigate to={basePath} replace />

  const readiness = estimateReadiness(job)
  const reasons = matchReasonsFor(job)

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
            <h2 className="text-xl">Benefits</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              {job.benefits.map((b) => (
                <li key={b}>{b}</li>
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

          <hr className="my-8 border-border" />

          <section>
            <h2 className="text-xl">About {job.company}</h2>
            <p className="mt-3 text-muted-foreground">{job.companyBlurb}</p>
          </section>
        </motion.div>

        <motion.div
          className="space-y-4"
          variants={withReducedMotion(reduced, fadeInUp)}
          initial="hidden"
          animate="show"
        >
          <div className="sticky top-24 rounded-lg border border-border bg-card p-6">
            <p className="text-xl font-display font-semibold tracking-[-0.02em]">
              ${(job.salaryMin / 1000).toFixed(0)}K – ${(job.salaryMax / 1000).toFixed(0)}K
            </p>
            <p className="text-sm text-muted-foreground">Base range · {job.employmentType}</p>
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
              <div className="mt-3 flex items-center gap-3">
                <ReadinessRing value={readiness} size={64} strokeWidth={6} />
                <p className="text-sm text-white/70">
                  {readiness >= 80 ? "Strong alignment" : readiness >= 60 ? "Good alignment" : "Partial alignment"} because:
                </p>
              </div>
              <ul className="mt-2 space-y-1">
                {reasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-1.5 text-sm text-white/70">
                    <span className="mt-0.5 text-mint">✓</span>
                    {reason}
                  </li>
                ))}
              </ul>
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
