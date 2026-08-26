import { useEffect, useState } from "react"
import { Navigate, useParams } from "react-router-dom"

import { MetricTile } from "@/components/cards/MetricTile"
import { SectionCard } from "@/components/cards/SectionCard"
import { Skeleton } from "@/components/feedback/Skeleton"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { api } from "@/lib/api"
import type { ApiSourceStats } from "@/types"

const channelLabel: Record<string, string> = {
  linkedin: "LinkedIn", indeed: "Indeed", glassdoor: "Glassdoor", ziprecruiter: "ZipRecruiter",
  monster: "Monster", handshake: "Handshake", angellist: "AngelList", wellfound: "Wellfound",
  dice: "Dice", stackoverflow: "Stack Overflow", weworkremotely: "We Work Remotely", remoteok: "Remote OK",
  builtin: "Built In", hired: "Hired.com", lever: "Lever", greenhouse_board: "Greenhouse Job Board",
  google_jobs: "Google Jobs", facebook: "Facebook", twitter: "Twitter/X", instagram: "Instagram",
  tiktok: "TikTok", reddit: "Reddit", referral: "Referral", career_site: "Career Site", email: "Email",
  event: "Event", agency: "Agency", direct: "Direct", other: "Other", custom: "Custom",
}

const funnelSteps: { key: string; label: string }[] = [
  { key: "new", label: "Applied" },
  { key: "screening", label: "Screening" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
  { key: "hired", label: "Hired" },
]

export function AdminSourceTrackingDetail() {
  const { id: channel } = useParams()
  const [stats, setStats] = useState<ApiSourceStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<ApiSourceStats>("/api/source-tracking/stats").then(setStats).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  const applications = stats?.channelBreakdown.find((c) => c.channel === channel)?.count
  if (!stats || applications === undefined) return <Navigate to="/admin/source-tracking" replace />

  const channelFunnel = stats.funnel[channel!] ?? {}
  const hired = channelFunnel.hired ?? 0
  const conversionRate = applications > 0 ? Math.round((hired / applications) * 100) : 0
  const links = stats.topLinks.filter((l) => l.channel === channel)
  const label = channelLabel[channel!] ?? channel

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref="/admin/source-tracking"
        backLabel="Back to source tracking"
        initials={(label ?? "").slice(0, 2).toUpperCase()}
        name={label ?? ""}
        meta={`${links.length} tracking link${links.length === 1 ? "" : "s"}`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricTile label="Applications" value={applications.toLocaleString()} />
        <MetricTile label="Hires" value={hired} tone="positive" />
        <MetricTile label="Conversion rate" value={`${conversionRate}%`} />
      </div>

      <SectionCard title="Funnel breakdown" animate={false}>
        <div className="space-y-3">
          {funnelSteps.map((step) => {
            const value = channelFunnel[step.key] ?? 0
            const max = Math.max(...funnelSteps.map((s) => channelFunnel[s.key] ?? 0), 1)
            return (
              <div key={step.key} className="flex items-center gap-4">
                <span className="w-32 shrink-0 text-sm text-muted-foreground">{step.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(4, (value / max) * 100)}%` }} />
                </div>
                <span className="w-16 shrink-0 text-right text-sm font-semibold">{value.toLocaleString()}</span>
              </div>
            )
          })}
        </div>
      </SectionCard>

      {links.length > 0 && (
        <SectionCard title="Tracking links" animate={false}>
          <div className="space-y-2">
            {links.map((l) => (
              <div key={l.id} className="flex items-center justify-between border-b border-hairline py-2 text-sm last:border-0">
                <span className="font-semibold">{l.name}{l.jobTitle ? ` · ${l.jobTitle}` : ""}</span>
                <span className="text-muted-foreground">
                  {l.clickCount} clicks · {l.applicationCount} applications {!l.isActive && "· Inactive"}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  )
}
