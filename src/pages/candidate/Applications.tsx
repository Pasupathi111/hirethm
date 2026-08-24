import { Check } from "lucide-react"
import { useState } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { applications } from "@/data/mockData"
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
  const [tab, setTab] = useState<(typeof tabs)[number]>("All")
  const filtered = tab === "All" ? applications : applications.filter((a) => a.status === tab)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My applications</h1>
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

      <div className="space-y-4">
        {filtered.map((app) => (
          <div key={app.id} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className={`${app.companyColor} text-white`}>{app.companyInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-bold">{app.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {app.company} · Applied {app.appliedAt}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <StageTracker current={app.stage} />
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No applications in "{tab}" yet.
          </div>
        )}
      </div>
    </div>
  )
}
