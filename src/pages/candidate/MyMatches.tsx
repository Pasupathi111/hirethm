import { motion } from "framer-motion"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { ReadinessRing } from "@/components/cards/ReadinessRing"
import { Callout } from "@/components/feedback/Callout"
import { EmptyState } from "@/components/feedback/EmptyState"
import { ErrorState } from "@/components/feedback/ErrorState"
import { Skeleton } from "@/components/feedback/Skeleton"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiError, api } from "@/lib/api"
import { fadeInUp, staggerContainer, useReducedMotion, withReducedMotion } from "@/lib/motion"
import type { ApiMatch, ApiMatchStatus } from "@/types"

const tabs: ApiMatchStatus[] = ["new", "waiting", "accepted", "rejected", "in_progress"]
const statusLabel: Record<ApiMatchStatus, string> = {
  new: "New",
  waiting: "Waiting for Decision",
  accepted: "Accepted",
  rejected: "Rejected",
  in_progress: "In Progress",
}

export function MyMatches() {
  const [tab, setTab] = useState<ApiMatchStatus>("new")
  const [matches, setMatches] = useState<ApiMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const reduced = useReducedMotion()

  const load = useCallback(() => {
    setLoading(true)
    setError("")
    api
      .get<{ data: ApiMatch[] }>("/api/me/matches")
      .then((res) => setMatches(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load matches"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const filtered = matches.filter((m) => m.status === tab)

  const decide = async (id: string, status: "accepted" | "rejected") => {
    const previous = matches
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)))
    try {
      await api.patch<ApiMatch>(`/api/me/matches/${id}`, { status })
      toast(status === "accepted" ? "Match accepted" : "Match declined", {
        description:
          status === "accepted"
            ? "The employer has been notified and can now view your profile."
            : "No data was shared with the employer.",
      })
    } catch (err) {
      setMatches(previous)
      toast.error(err instanceof ApiError ? err.message : "Failed to update match")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">My matches</h1>
        <p className="mt-1 text-muted-foreground">
          HireThm notified you before any employer saw your profile. Your decision controls what happens next.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as ApiMatchStatus)}>
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t} value={t}>
              {statusLabel[t]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : (
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
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <StatusBadge status={statusLabel[match.status]} />
                </div>
                <p className="text-sm text-muted-foreground">Matched {new Date(match.matchedAt).toLocaleDateString()}</p>
              </div>

              <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
                <div>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-slate-800 text-white">{match.job.title.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl">{match.job.title}</h2>
                      <p className="text-muted-foreground">{match.job.organizationName ?? "Employer"}</p>
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

                  {match.status === "new" && (
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <Button onClick={() => decide(match.id, "accepted")}>Accept Opportunity</Button>
                      <Button variant="outline" onClick={() => decide(match.id, "rejected")}>
                        Decline
                      </Button>
                      <button
                        className="text-sm font-semibold text-primary"
                        onClick={() => toast("Full breakdown", { description: "All criteria are listed on the right." })}
                      >
                        Full breakdown →
                      </button>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl bg-muted p-5">
                  <div className="flex items-center gap-3">
                    <ReadinessRing value={match.score} size={64} strokeWidth={6} />
                    <div>
                      <p className="font-bold">Mutual Readiness</p>
                      <p className="text-xs text-muted-foreground">{match.criteria.length} criteria scored</p>
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
            <EmptyState
              title={`No matches in "${statusLabel[tab]}" right now.`}
              description="Check back soon — HireThm scores new roles every night."
            />
          )}
        </motion.div>
      )}
    </div>
  )
}
