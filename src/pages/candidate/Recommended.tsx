import { motion } from "framer-motion"
import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { ReadinessRing } from "@/components/cards/ReadinessRing"
import { EmptyState } from "@/components/feedback/EmptyState"
import { ErrorState } from "@/components/feedback/ErrorState"
import { Skeleton } from "@/components/feedback/Skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { fadeInUp, staggerContainer, useReducedMotion, withReducedMotion } from "@/lib/motion"
import type { ApiRecommendedJob, ApiRemoteStatus } from "@/types"

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

export function Recommended() {
  const reduced = useReducedMotion()
  const [items, setItems] = useState<ApiRecommendedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(() => {
    setLoading(true)
    setError("")
    api
      .get<{ data: ApiRecommendedJob[] }>("/api/me/recommended")
      .then((res) => setItems(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load recommendations"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Recommended for you</h1>
        <p className="mt-1 text-muted-foreground">Ranked by Mutual Readiness against your profile and preferences.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : (
        <motion.div
          className="space-y-3"
          variants={withReducedMotion(reduced, staggerContainer)}
          initial="hidden"
          animate="show"
        >
          {items.map(({ job, score, reasons, gap }) => {
            const range = salaryRange(job.salaryMin, job.salaryMax)
            return (
              <motion.div
                key={job.id}
                variants={withReducedMotion(reduced, fadeInUp)}
                className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4"
              >
                <Avatar className="size-11 shrink-0">
                  <AvatarFallback className="bg-slate-800 text-white">{job.title.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h2>{job.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {job.organizationName ?? "Employer"}
                    {job.remoteStatus ? ` · ${remoteStatusLabel[job.remoteStatus]}` : ""}
                    {range ? ` · ${range}` : ""}
                  </p>
                  {reasons.length > 0 && <p className="mt-1 text-sm text-muted-foreground">{reasons[0]}</p>}
                  {gap && <p className="mt-0.5 text-xs text-warning">Gap: {gap}</p>}
                </div>
                <ReadinessRing value={score} size={60} strokeWidth={5} />
                <Button asChild variant="outline" size="sm">
                  <Link to={`/app/jobs/${job.id}`}>View Job</Link>
                </Button>
              </motion.div>
            )
          })}

          {items.length === 0 && (
            <EmptyState
              title="No recommendations yet."
              description="Complete your profile and preferences so HireThm can find your best-fit roles."
            />
          )}
        </motion.div>
      )}
    </div>
  )
}
