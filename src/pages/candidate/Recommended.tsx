import { motion } from "framer-motion"
import { Link } from "react-router-dom"

import { ReadinessRing } from "@/components/cards/ReadinessRing"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { candidateProfile, jobs, matches } from "@/data/mockData"
import { fadeInUp, staggerContainer, useReducedMotion, withReducedMotion } from "@/lib/motion"
import type { Job } from "@/types"

/** Prefer the real computed readiness score when a match exists; otherwise estimate from skill overlap. */
function estimateReadiness(job: Job) {
  const match = matches.find((m) => m.jobId === job.id)
  if (match) return match.readiness
  const overlap = job.skills.filter((skill) => candidateProfile.skills.includes(skill)).length
  return Math.min(96, 52 + overlap * 9)
}

export function Recommended() {
  const reduced = useReducedMotion()
  const ranked = [...jobs].sort((a, b) => estimateReadiness(b) - estimateReadiness(a))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Recommended for you</h1>
        <p className="mt-1 text-muted-foreground">Ranked by Mutual Readiness against your profile and preferences.</p>
      </div>

      <motion.div
        className="space-y-4"
        variants={withReducedMotion(reduced, staggerContainer)}
        initial="hidden"
        animate="show"
      >
        {ranked.map((job) => (
          <motion.div
            key={job.id}
            variants={withReducedMotion(reduced, fadeInUp)}
            className="flex flex-wrap items-center gap-5 rounded-2xl border border-border bg-card p-6"
          >
            <Avatar className="size-12 shrink-0">
              <AvatarFallback className={`${job.companyColor} text-white`}>{job.companyInitials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold">{job.title}</h2>
              <p className="text-sm text-muted-foreground">
                {job.company} · {job.workMode} · ${(job.salaryMin / 1000).toFixed(0)}K – ${(job.salaryMax / 1000).toFixed(0)}K
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {job.skills.slice(0, 3).map((s) => (
                  <Badge key={s} variant="outline">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <ReadinessRing value={estimateReadiness(job)} size={72} strokeWidth={6} />
            <Button asChild variant="outline">
              <Link to={`/app/jobs/${job.id}`}>View Job</Link>
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
