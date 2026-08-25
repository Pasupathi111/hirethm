import { Check } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { EmptyState } from "@/components/feedback/EmptyState"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { applications } from "@/data/mockData"
import { fadeInUp, staggerContainer, useReducedMotion, withReducedMotion } from "@/lib/motion"
import { cn } from "@/lib/utils"
import type { Application, ApplicationStage } from "@/types"

const stages: ApplicationStage[] = ["Applied", "Viewed", "Employer Review", "Shortlisted", "Interview"]
const tabs: (Application["status"] | "All")[] = ["All", "Applied", "Under Review", "Shortlisted", "Interview"]

function StageTracker({ current }: { current: ApplicationStage }) {
  const currentIndex = stages.indexOf(current)

  return (
    <div className="flex items-center">
      {stages.map((stage, i) => (
        <div key={stage} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <div
              className={cn(
                "flex size-7 items-center justify-center rounded-full",
                i <= currentIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {i <= currentIndex ? <Check className="size-3.5" /> : <span className="text-xs font-bold">{i + 1}</span>}
            </div>
            <span className={cn("text-xs font-semibold", i <= currentIndex ? "text-foreground" : "text-muted-foreground")}>
              {stage}
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
  const filtered = tab === "All" ? applications : applications.filter((a) => a.status === tab)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">My applications</h1>
        <p className="mt-1 text-muted-foreground">Roles you applied to directly. AI matches are tracked separately under My Matches.</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t} value={t}>
              {t}
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
                  <AvatarFallback className={`${app.companyColor} text-white`}>{app.companyInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <h2>{app.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {app.company} · Applied {app.appliedAt}
                  </p>
                </div>
              </div>
              <StatusBadge status={app.status} />
            </div>
            <div className="mt-4">
              <StageTracker current={app.stage} />
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <EmptyState
            title={`No applications in "${tab}" yet.`}
            description="Start exploring opportunities that match your skills."
            action={{ label: "Find Jobs", onClick: () => navigate("/app/jobs") }}
          />
        )}
      </motion.div>
    </div>
  )
}
