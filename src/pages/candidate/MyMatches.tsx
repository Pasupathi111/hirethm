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

interface MatchHistoryEvent {
  type: string
  label: string
  at: string
  detail?: string
}

interface MatchHistory {
  matchId: string
  visible: boolean
  timeline: MatchHistoryEvent[]
}

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
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [history, setHistory] = useState<Record<string, MatchHistory>>({})
  const [historyLoading, setHistoryLoading] = useState<string | null>(null)

  const toggleHistory = async (matchId: string) => {
    if (expandedId === matchId) {
      setExpandedId(null)
      return
    }
    setExpandedId(matchId)
    if (history[matchId]) return
    setHistoryLoading(matchId)
    try {
      const data = await api.get<MatchHistory>(`/api/me/matches/${matchId}/history`)
      setHistory((prev) => ({ ...prev, [matchId]: data }))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load consent history")
    } finally {
      setHistoryLoading(null)
    }
  }

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
                    </div>
                  )}

                  <button
                    className="mt-4 text-sm font-semibold text-primary"
                    onClick={() => toggleHistory(match.id)}
                  >
                    {expandedId === match.id ? "Hide" : "View"} consent & visibility history →
                  </button>

                  {expandedId === match.id && (
                    <div className="mt-3 rounded-lg border border-border bg-muted/40 p-4">
                      {historyLoading === match.id ? (
                        <Skeleton className="h-16 w-full" />
                      ) : history[match.id] ? (
                        <>
                          <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                            Visible to employer: {history[match.id].visible ? "Yes" : "Not yet"}
                          </p>
                          <ul className="mt-3 space-y-2">
                            {history[match.id].timeline.map((ev, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <span className="mt-0.5 text-primary">•</span>
                                <span>
                                  <span className="font-medium">{ev.label}</span>
                                  {" — "}
                                  <span className="text-muted-foreground">{new Date(ev.at).toLocaleString()}</span>
                                  {ev.detail && <span className="text-muted-foreground"> ({ev.detail})</span>}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : null}
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
