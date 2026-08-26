import { useEffect, useState } from "react"

import { AdminListPage, type AdminColumn } from "@/components/tables/AdminListPage"
import { api } from "@/lib/api"
import type { ApiSourceStats } from "@/types"

interface ChannelRow {
  id: string
  channel: string
  applications: number
  hired: number
  conversionRate: number
}

const channelLabel: Record<string, string> = {
  linkedin: "LinkedIn", indeed: "Indeed", glassdoor: "Glassdoor", ziprecruiter: "ZipRecruiter",
  monster: "Monster", handshake: "Handshake", angellist: "AngelList", wellfound: "Wellfound",
  dice: "Dice", stackoverflow: "Stack Overflow", weworkremotely: "We Work Remotely", remoteok: "Remote OK",
  builtin: "Built In", hired: "Hired.com", lever: "Lever", greenhouse_board: "Greenhouse Job Board",
  google_jobs: "Google Jobs", facebook: "Facebook", twitter: "Twitter/X", instagram: "Instagram",
  tiktok: "TikTok", reddit: "Reddit", referral: "Referral", career_site: "Career Site", email: "Email",
  event: "Event", agency: "Agency", direct: "Direct", other: "Other", custom: "Custom",
}

const columns: AdminColumn<ChannelRow>[] = [
  { header: "Source", render: (s) => channelLabel[s.channel] ?? s.channel },
  { header: "Applications", render: (s) => s.applications.toLocaleString() },
  { header: "Hires", render: (s) => s.hired },
  { header: "Conversion", render: (s) => `${s.conversionRate}%` },
]

export function AdminSourceTracking() {
  const [rows, setRows] = useState<ChannelRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<ApiSourceStats>("/api/source-tracking/stats")
      .then((stats) => {
        const derived = stats.channelBreakdown.map((c) => {
          const funnelForChannel = stats.funnel[c.channel] ?? {}
          const hired = funnelForChannel.hired ?? 0
          return {
            id: c.channel,
            channel: c.channel,
            applications: c.count,
            hired,
            conversionRate: c.count > 0 ? Math.round((hired / c.count) * 100) : 0,
          }
        })
        setRows(derived)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <AdminListPage
      title="Source tracking"
      subtitle={loading ? "Loading…" : `${rows.length} acquisition source${rows.length === 1 ? "" : "s"} tracked`}
      columns={columns}
      rows={rows}
      loading={loading}
      rowHref={(s) => `/admin/source-tracking/${s.id}`}
      searchPlaceholder="Search sources..."
    />
  )
}
