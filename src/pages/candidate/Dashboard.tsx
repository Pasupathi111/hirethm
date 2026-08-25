import { motion } from "framer-motion"
import { CalendarCheck2, ListChecks, Sparkles, UserCircle2 } from "lucide-react"
import { Link } from "react-router-dom"

import { StatCard } from "@/components/cards/StatCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { applications, candidateProfile, interviews, jobs, matches } from "@/data/mockData"
import { fadeInUp, staggerContainer, useReducedMotion, withReducedMotion } from "@/lib/motion"

export function Dashboard() {
  const reduced = useReducedMotion()
  const newMatches = matches.filter((m) => m.status === "New")
  const featured = matches[0]
  const recommended = jobs.slice(0, 4)
  const nextInterview = interviews.find((i) => i.status === "Upcoming")

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Good morning, Alex</h1>
          <p className="mt-1 text-muted-foreground">
            Your HireThm profile is {candidateProfile.completeness}% complete. Two skills away from a stronger match rate.
          </p>
        </div>
        <Button asChild>
          <Link to="/app/profile">Complete Profile</Link>
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
            value={`${candidateProfile.completeness}%`}
            label="Profile completion"
            hint="Add 2 skills to reach 95%"
          />
        </motion.div>
        <motion.div variants={withReducedMotion(reduced, fadeInUp)}>
          <StatCard icon={Sparkles} value={newMatches.length} label="New AI matches" hint="Awaiting your decision" />
        </motion.div>
        <motion.div variants={withReducedMotion(reduced, fadeInUp)}>
          <StatCard icon={ListChecks} value={applications.length} label="Active applications" hint="1 shortlisted" />
        </motion.div>
        <motion.div variants={withReducedMotion(reduced, fadeInUp)}>
          <StatCard
            icon={CalendarCheck2}
            value={nextInterview?.date ?? "—"}
            label="Upcoming interview"
            hint={nextInterview ? `${nextInterview.type} · ${nextInterview.company}` : "None scheduled"}
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
            <h2 className="mt-4 text-2xl text-white">{featured.title}</h2>
            <p className="text-white/60">
              {featured.company} · {jobs.find((j) => j.id === featured.jobId)?.workMode} ·{" "}
              {jobs.find((j) => j.id === featured.jobId)?.employmentType}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="flex items-center gap-1 font-semibold text-mint">Strong skills alignment</p>
                <p className="text-white/60">across React, TypeScript</p>
              </div>
              <div>
                <p className="font-semibold text-mint">Experience alignment</p>
                <p className="text-white/60">at 5+ years in product</p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button asChild>
                <Link to="/app/matches">Review Match</Link>
              </Button>
              <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                Decline
              </Button>
            </div>
          </motion.div>
        )}

        <motion.div variants={withReducedMotion(reduced, fadeInUp)} className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3>Profile completion</h3>
            <span className="text-lg font-display font-semibold tracking-[-0.02em]">{candidateProfile.completeness}%</span>
          </div>
          <Progress value={candidateProfile.completeness} className="mt-3" />
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2 text-primary">✓ Experience and education</li>
            <li className="flex items-center gap-2 text-primary">✓ CV analysed</li>
            <li className="flex items-center gap-2 text-warning">! Add 2 more skills</li>
            <li className="flex items-center gap-2 text-warning">! Add project details</li>
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
            {recommended.map((job) => (
              <motion.div key={job.id} variants={withReducedMotion(reduced, fadeInUp)}>
                <Link
                  to={`/app/jobs/${job.id}`}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-[var(--shadow-card)]"
                >
                  <div>
                    <p className="font-bold">{job.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {job.company} · {job.workMode} · ${(job.salaryMin / 1000).toFixed(0)}K – ${(job.salaryMax / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div className="relative flex size-12 shrink-0 items-center justify-center rounded-full border-4 border-primary/20">
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary" />
                    <span className="text-xs font-display font-semibold tracking-[-0.02em]">{88 - recommended.indexOf(job) * 4}%</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3>Recent activity</h3>
          <ul className="mt-4 space-y-4">
            {applications.slice(0, 4).map((app) => (
              <li key={app.id} className="text-sm">
                <p className="font-semibold">{app.title}</p>
                <p className="text-muted-foreground">{app.company}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
