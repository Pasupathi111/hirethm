import { Navigate, useParams } from "react-router-dom"

import { MetricTile } from "@/components/cards/MetricTile"
import { SectionCard } from "@/components/cards/SectionCard"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { sourceTrackingEntries } from "@/data/mockData"

export function AdminSourceTrackingDetail() {
  const { id } = useParams()
  const entry = sourceTrackingEntries.find((s) => s.id === id)

  if (!entry) return <Navigate to="/admin/source-tracking" replace />

  const funnel = [
    { label: "Candidates reached", value: entry.candidates },
    { label: "Applications submitted", value: entry.applications },
    { label: "Advanced to interview", value: Math.round(entry.applications * 0.32) },
    { label: "Hired", value: entry.hires },
  ]

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref="/admin/source-tracking"
        backLabel="Back to source tracking"
        initials={entry.source.slice(0, 2).toUpperCase()}
        name={entry.source}
        meta={`${entry.campaign} · Updated ${entry.updated}`}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <MetricTile label="Candidates" value={entry.candidates.toLocaleString()} />
        <MetricTile label="Applications" value={entry.applications.toLocaleString()} />
        <MetricTile label="Hires" value={entry.hires} tone="positive" />
        <MetricTile label="Conversion rate" value={`${entry.conversionRate}%`} />
      </div>

      <SectionCard title="Funnel breakdown" animate={false}>
        <div className="space-y-3">
          {funnel.map((step, i) => (
            <div key={step.label} className="flex items-center gap-4">
              <span className="w-40 shrink-0 text-sm text-muted-foreground">{step.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.max(6, 100 - i * 26)}%` }}
                />
              </div>
              <span className="w-16 shrink-0 text-right text-sm font-semibold">{step.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
