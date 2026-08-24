import { useState } from "react"
import { toast } from "sonner"

import { StatusBadge } from "@/components/feedback/StatusBadge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { matches as allMatches } from "@/data/mockData"
import type { Match } from "@/types"

const tabs: Match["status"][] = ["New", "Waiting for Decision", "Accepted", "Rejected", "In Progress"]

export function MyMatches() {
  const [tab, setTab] = useState<Match["status"]>("New")
  const [matches, setMatches] = useState(allMatches)

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

      <div className="space-y-5">
        {filtered.map((match) => (
          <div key={match.id} className="rounded-2xl border border-border bg-card p-6">
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
                  <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm dark:bg-amber-500/10">
                    <p className="font-semibold text-amber-700 dark:text-amber-400">! Potential gap</p>
                    <p className="text-amber-700/80 dark:text-amber-400/80">{match.gap}</p>
                  </div>
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
                  <div className="relative flex size-16 shrink-0 items-center justify-center rounded-full border-[6px] border-primary/20">
                    <div className="absolute inset-0 rounded-full border-[6px] border-transparent border-t-primary border-r-primary" />
                    <span className="text-lg font-extrabold">{match.readiness}%</span>
                  </div>
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
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No matches in "{tab}" right now.
          </div>
        )}
      </div>
    </div>
  )
}
