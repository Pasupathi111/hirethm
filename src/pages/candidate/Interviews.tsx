import { motion } from "framer-motion"
import { useMemo, useState } from "react"

import { EmptyState } from "@/components/feedback/EmptyState"
import { ErrorState } from "@/components/feedback/ErrorState"
import { Skeleton } from "@/components/feedback/Skeleton"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMyCandidate } from "@/lib/candidateSession"
import { fadeInUp, staggerContainer, useReducedMotion, withReducedMotion } from "@/lib/motion"
import type { ApiInterviewStatus } from "@/types"

const tabs: ApiInterviewStatus[] = ["scheduled", "completed", "cancelled", "no_show"]
const statusLabel: Record<ApiInterviewStatus, string> = {
  scheduled: "Upcoming",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
}

interface FlatInterview {
  id: string
  jobTitle: string
  type: string
  status: ApiInterviewStatus
  scheduledAt: string
  duration: number
  location: string | null
}

export function Interviews() {
  const [tab, setTab] = useState<ApiInterviewStatus>("scheduled")
  const reduced = useReducedMotion()
  const { candidate, loading, error, refetch } = useMyCandidate()

  const interviews = useMemo<FlatInterview[]>(() => {
    if (!candidate) return []
    return candidate.applications.flatMap((app) =>
      app.interviews.map((iv) => ({
        id: iv.id,
        jobTitle: app.job.title,
        type: iv.type,
        status: iv.status,
        scheduledAt: iv.scheduledAt,
        duration: iv.duration,
        location: iv.location,
      }))
    )
  }, [candidate])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (error) return <ErrorState description={error} onRetry={refetch} />

  const filtered = interviews.filter((i) => i.status === tab)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">My interviews</h1>
        <p className="mt-1 text-muted-foreground">Interviews scheduled by employers for roles you've applied to.</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as ApiInterviewStatus)}>
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t} value={t}>
              {statusLabel[t]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <motion.div
        className="space-y-3"
        variants={withReducedMotion(reduced, staggerContainer)}
        initial="hidden"
        animate="show"
      >
        {filtered.map((interview) => {
          const date = new Date(interview.scheduledAt)
          const day = date.toLocaleDateString(undefined, { day: "2-digit" })
          const month = date.toLocaleDateString(undefined, { month: "short" }).toUpperCase()
          return (
            <motion.div
              key={interview.id}
              variants={withReducedMotion(reduced, fadeInUp)}
              className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4"
            >
              <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <span className="font-display text-sm leading-none font-semibold tracking-[-0.02em]">{day}</span>
                <span className="text-[9px] font-bold tracking-wide uppercase">{month}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-bold text-primary">{interview.type}</p>
                  <StatusBadge status={statusLabel[interview.status]} />
                </div>
                <h2 className="text-lg">{interview.jobTitle}</h2>
                <p className="text-sm text-muted-foreground">
                  {date.toLocaleString()} · {interview.duration} min
                  {interview.location ? ` · ${interview.location}` : ""}
                </p>
              </div>
            </motion.div>
          )
        })}

        {filtered.length === 0 && (
          <EmptyState title={`No ${statusLabel[tab].toLowerCase()} interviews.`} description="Interviews you schedule will show up here." />
        )}
      </motion.div>
    </div>
  )
}
