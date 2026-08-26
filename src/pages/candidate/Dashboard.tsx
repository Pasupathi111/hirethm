import { motion } from "framer-motion"
import { CalendarCheck2, ListChecks, Sparkles, UserCircle2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { StatCard } from "@/components/cards/StatCard"
import { ErrorState } from "@/components/feedback/ErrorState"
import { Skeleton } from "@/components/feedback/Skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { api } from "@/lib/api"
import { useMyCandidate } from "@/lib/candidateSession"
import { fadeInUp, staggerContainer, useReducedMotion, withReducedMotion } from "@/lib/motion"
import type { ApiMatch, ApiRecommendedJob, ApiRemoteStatus } from "@/types"

const remoteStatusLabel: Record<ApiRemoteStatus, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
}

function salaryRange(min?: number | null, max?: number | null) {
  if (!min && !max) return null
  if (min && max) return `$${(min / 1000).toFixed(0)}K – $${(max / 1000).toFixed(0)}K`
  return `$${((min ?? max)! / 1000).toFixed(0)}K`
}

export function Dashboard() {
  const reduced = useReducedMotion()
  const { candidate, loading, error, refetch } = useMyCandidate()
  const [recommended, setRecommended] = useState<ApiRecommendedJob[]>([])
  const [matches, setMatches] = useState<ApiMatch[]>([])

  useEffect(() => {
    api
      .get<{ data: ApiRecommendedJob[] }>("/api/me/recommended")
      .then((res) => setRecommended(res.data.slice(0, 4)))
      .catch(() => setRecommended([]))
    api
      .get<{ data: ApiMatch[] }>("/api/me/matches")
      .then((res) => setMatches(res.data))
      .catch(() => setMatches([]))
  }, [])

  const newMatches = matches.filter((m) => m.status === "new")
  const featured = newMatches[0]

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error) return <ErrorState description={error} onRetry={refetch} />
  if (!candidate) return null

  const firstName = candidate.firstName
  const activeApplications = candidate.applications.filter((a) => a.status !== "rejected" && a.status !== "hired")
  const nextInterview = candidate.applications
    .flatMap((a) => a.interviews.map((iv) => ({ ...iv, jobTitle: a.job.title })))
    .filter((iv) => iv.status === "scheduled")
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0]
  const recentApplications = [...candidate.applications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Welcome back, {firstName}</h1>
          <p className="mt-1 text-muted-foreground">
            {candidate.applications.length} application{candidate.applications.length === 1 ? "" : "s"} on file
            {candidate.organization ? ` with ${candidate.organization.name}` : ""}.
          </p>
        </div>
        <Button asChild>
          <Link to="/app/profile">View Profile</Link>
        </Button>
      </div>

      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={withReducedMotion(reduced, staggerContainer)}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={withReducedMotion(reduced, fadeInUp)}>
          <StatCard
            icon={UserCircle2}
            value={`${candidate.completeness.score}%`}
            label="Profile completion"
            hint={candidate.completeness.hints[0] ?? "Your profile is complete"}
          />
        </motion.div>
        <motion.div variants={withReducedMotion(reduced, fadeInUp)}>
          <StatCard icon={Sparkles} value={newMatches.length} label="New AI matches" hint="Awaiting your decision" />
        </motion.div>
        <motion.div variants={withReducedMotion(reduced, fadeInUp)}>
          <StatCard
            icon={ListChecks}
            value={activeApplications.length}
            label="Active applications"
            hint={`${candidate.applications.length} total`}
          />
        </motion.div>
        <motion.div variants={withReducedMotion(reduced, fadeInUp)}>
          <StatCard
            icon={CalendarCheck2}
            value={nextInterview ? new Date(nextInterview.scheduledAt).toLocaleDateString() : "—"}
            label="Upcoming interview"
            hint={nextInterview ? `${nextInterview.type} · ${nextInterview.jobTitle}` : "None scheduled"}
          />
        </motion.div>
      </motion.div>

      <motion.div
        className="grid gap-6 lg:grid-cols-[1fr_320px]"
        variants={withReducedMotion(reduced, staggerContainer)}
        initial="hidden"
        animate="show"
      >
        {featured && (
          <motion.div
            variants={withReducedMotion(reduced, fadeInUp)}
            className="rounded-xl bg-secondary p-6 text-secondary-foreground"
          >
            <div className="flex items-center justify-between">
              <Badge variant="dark" className="border border-white/20 bg-white/10 text-mint">
                New opportunity
              </Badge>
              <span className="text-xs text-white/50">You are notified first</span>
            </div>
            <h2 className="mt-4 text-2xl text-white">{featured.job.title}</h2>
            <p className="text-white/60">
              {featured.job.organizationName ?? "Employer"}
              {featured.job.remoteStatus ? ` · ${remoteStatusLabel[featured.job.remoteStatus]}` : ""}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
              {featured.reasons.slice(0, 2).map((reason) => (
                <div key={reason}>
                  <p className="font-semibold text-mint">{reason}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <Button asChild>
                <Link to="/app/matches">Review Match</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                <Link to="/app/matches">Decline</Link>
              </Button>
            </div>
          </motion.div>
        )}

        <motion.div variants={withReducedMotion(reduced, fadeInUp)} className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3>Profile completion</h3>
            <span className="text-lg font-display font-semibold tracking-[-0.02em]">{candidate.completeness.score}%</span>
          </div>
          <Progress value={candidate.completeness.score} className="mt-3" />
          <ul className="mt-4 space-y-2 text-sm">
            {candidate.completeness.items.map((item) => (
              <li key={item.key} className={`flex items-center gap-2 ${item.met ? "text-primary" : "text-warning"}`}>
                {item.met ? "✓" : "!"} {item.met ? item.label : item.hint}
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" className="mt-4 w-full">
            <Link to="/app/profile">Improve my profile</Link>
          </Button>
        </motion.div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl">Recommended for you</h2>
            <Link to="/app/recommended" className="text-sm font-semibold text-primary">
              See all →
            </Link>
          </div>
          <motion.div
            className="mt-4 space-y-3"
            variants={withReducedMotion(reduced, staggerContainer)}
            initial="hidden"
            animate="show"
          >
            {recommended.map(({ job, score }) => {
              const range = salaryRange(job.salaryMin, job.salaryMax)
              return (
                <motion.div key={job.id} variants={withReducedMotion(reduced, fadeInUp)}>
                  <Link
                    to={`/app/jobs/${job.id}`}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-[var(--shadow-card)]"
                  >
                    <div>
                      <p className="font-bold">{job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.organizationName ?? "Employer"}
                        {job.remoteStatus ? ` · ${remoteStatusLabel[job.remoteStatus]}` : ""}
                        {range ? ` · ${range}` : ""}
                      </p>
                    </div>
                    <div className="relative flex size-12 shrink-0 items-center justify-center rounded-full border-4 border-primary/20">
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary" />
                      <span className="text-xs font-display font-semibold tracking-[-0.02em]">{score}%</span>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
            {recommended.length === 0 && (
              <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                No recommendations yet — complete your profile to get matched.
              </p>
            )}
          </motion.div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3>Recent applications</h3>
          <ul className="mt-4 space-y-4">
            {recentApplications.map((app) => (
              <li key={app.id} className="text-sm">
                <p className="font-semibold">{app.job.title}</p>
                <p className="text-muted-foreground capitalize">{app.status} · {new Date(app.createdAt).toLocaleDateString()}</p>
              </li>
            ))}
            {recentApplications.length === 0 && <li className="text-sm text-muted-foreground">No applications yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}
