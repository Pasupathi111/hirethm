import { motion } from "framer-motion"
import { useState } from "react"
import { toast } from "sonner"

import { ReadinessRing } from "@/components/cards/ReadinessRing"
import { Callout } from "@/components/feedback/Callout"
import { EmptyState } from "@/components/feedback/EmptyState"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { matches as allMatches } from "@/data/mockData"
import { fadeInUp, staggerContainer, useReducedMotion, withReducedMotion } from "@/lib/motion"
import type { Match } from "@/types"

const tabs: Match["status"][] = ["New", "Waiting for Decision", "Accepted", "Rejected", "In Progress"]

export function MyMatches() {
  const [tab, setTab] = useState<Match["status"]>("New")
  const [matches, setMatches] = useState(allMatches)
  const reduced = useReducedMotion()

  const filtered = matches.filter((m) => m.status === tab)

  const decide = (id: string, status: Match["status"]) => {
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)))
    toast(status === "Accepted" ? "Match accepted" : "Match declined", {
      description: status === "Accepted" ? "The employer has been notified and can now view your profile." : "No data was shared with the employer.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My matches</h1>
        <p className="mt-1 text-muted-foreground">
          HireThm notified you before any employer saw your profile. Your decision controls what happens next.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Match["status"])}>
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t} value={t}>
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <motion.div
        className="space-y-5"
        variants={withReducedMotion(reduced, staggerContainer)}
        initial="hidden"
        animate="show"
      >
        {filtered.map((match) => (
          <motion.div
            key={match.id}
            variants={withReducedMotion(reduced, fadeInUp)}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <StatusBadge status={match.status} />
              </div>
              <p className="text-sm text-muted-foreground">Matched {match.matchedAt}</p>
            </div>

            <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
              <div>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className={`${match.companyColor} text-white`}>{match.companyInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">{match.title}</h2>
                    <p className="text-muted-foreground">{match.company}</p>
                  </div>
                </div>

                <p className="mt-5 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Why HireThm matched you
                </p>
                <ul className="mt-2 space-y-1.5">
                  {match.reasons.map((reason) => (
                    <li key={reason} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 text-primary">✓</span>
                      {reason}
                    </li>
                  ))}
                </ul>

                {match.gap && (
                  <Callout tone="warning" className="mt-4">
                    <span>
                      <span className="font-semibold">Potential gap:</span> {match.gap}
                    </span>
                  </Callout>
                )}

                {match.status === "New" && (
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Button onClick={() => decide(match.id, "Accepted")}>Accept Opportunity</Button>
                    <Button variant="outline" onClick={() => decide(match.id, "Rejected")}>
                      Decline
                    </Button>
                    <button
                      className="text-sm font-semibold text-primary"
                      onClick={() => toast("Full breakdown", { description: "All eight criteria are listed on the right." })}
                    >
                      Full breakdown →
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-muted p-5">
                <div className="flex items-center gap-3">
                  <ReadinessRing value={match.readiness} size={64} strokeWidth={6} />
                  <div>
                    <p className="font-bold">Mutual Readiness</p>
                    <p className="text-xs text-muted-foreground">8 criteria scored</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {match.criteria.map((c) => (
                    <div key={c.label}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-muted-foreground">{c.label}</span>
                        <span className="font-semibold">{c.value}%</span>
                      </div>
                      <Progress value={c.value} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <EmptyState title={`No matches in "${tab}" right now.`} description="Check back soon — HireThm scores new roles every night." />
        )}
      </motion.div>
    </div>
  )
}
