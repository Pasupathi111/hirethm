import { motion } from "framer-motion"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { EmptyState } from "@/components/feedback/EmptyState"
import { ErrorState } from "@/components/feedback/ErrorState"
import { Skeleton } from "@/components/feedback/Skeleton"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMyCandidate } from "@/lib/candidateSession"
import { fadeInUp, staggerContainer, useReducedMotion, withReducedMotion } from "@/lib/motion"
import { cn } from "@/lib/utils"
import type { ApiApplicationStatus } from "@/types"

const stages: ApiApplicationStatus[] = ["new", "screening", "interview", "offer", "hired"]
const stageLabel: Record<ApiApplicationStatus, string> = {
  new: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
}
const tabs: (ApiApplicationStatus | "All")[] = ["All", "new", "screening", "interview", "offer", "hired", "rejected"]

function StageTracker({ current }: { current: ApiApplicationStatus }) {
  if (current === "rejected") {
    return <p className="text-sm font-semibold text-destructive">This application was not moved forward.</p>
  }

  const currentIndex = stages.indexOf(current)

  return (
    <div className="flex items-center">
      {stages.map((stage, i) => (
        <div key={stage} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <div
              className={cn(
                "flex size-7 items-center justify-center rounded-full text-xs font-bold",
                i <= currentIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {i + 1}
            </div>
            <span className={cn("text-xs font-semibold", i <= currentIndex ? "text-foreground" : "text-muted-foreground")}>
              {stageLabel[stage]}
            </span>
          </div>
          {i < stages.length - 1 && <div className={cn("mx-2 h-px flex-1", i < currentIndex ? "bg-primary" : "bg-border")} />}
        </div>
      ))}
    </div>
  )
}

export function Applications() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<(typeof tabs)[number]>("All")
  const reduced = useReducedMotion()
  const { candidate, loading, error, refetch } = useMyCandidate()

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error) return <ErrorState description={error} onRetry={refetch} />
  if (!candidate) return null

  const applications = candidate.applications
  const filtered = tab === "All" ? applications : applications.filter((a) => a.status === tab)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">My applications</h1>
        <p className="mt-1 text-muted-foreground">Roles you've applied to, with live status from the hiring team.</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t} value={t}>
              {t === "All" ? "All" : stageLabel[t]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <motion.div
        className="space-y-4"
        variants={withReducedMotion(reduced, staggerContainer)}
        initial="hidden"
        animate="show"
      >
        {filtered.map((app) => (
          <motion.div
            key={app.id}
            variants={withReducedMotion(reduced, fadeInUp)}
            className="rounded-lg border border-border bg-card p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarFallback>{app.job.title.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h2>{app.job.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {app.job.location ?? "Location not set"} · Applied {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <StatusBadge status={stageLabel[app.status]} />
            </div>
            <div className="mt-4">
              <StageTracker current={app.status} />
            </div>
            {app.interviews.length > 0 && (
              <div className="mt-4 space-y-2 border-t border-hairline pt-4">
                {app.interviews.map((iv) => (
                  <div key={iv.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold">{iv.title}</p>
                      <p className="text-muted-foreground">
                        {new Date(iv.scheduledAt).toLocaleString()} · {iv.duration} min
                        {iv.location ? ` · ${iv.location}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={iv.status} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <EmptyState
            title={`No applications${tab === "All" ? "" : ` in "${stageLabel[tab as ApiApplicationStatus]}"`} yet.`}
            description="Start exploring opportunities that match your skills."
            action={{ label: "Find Jobs", onClick: () => navigate("/app/jobs") }}
          />
        )}
      </motion.div>
    </div>
  )
}
