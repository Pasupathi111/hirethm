import { AdminListPage, type AdminColumn } from "@/components/tables/AdminListPage"
import { sourceTrackingEntries } from "@/data/mockData"
import type { SourceTrackingEntry } from "@/types"

const columns: AdminColumn<SourceTrackingEntry>[] = [
  { header: "Source", render: (s) => s.source },
  { header: "Campaign", render: (s) => s.campaign },
  { header: "Candidates", render: (s) => s.candidates.toLocaleString() },
  { header: "Applications", render: (s) => s.applications.toLocaleString() },
  { header: "Hires", render: (s) => s.hires },
  { header: "Conversion", render: (s) => `${s.conversionRate}%` },
]

export function AdminSourceTracking() {
  return (
    <AdminListPage
      title="Source tracking"
      subtitle={`${sourceTrackingEntries.length} acquisition sources tracked across the platform`}
      columns={columns}
      rows={sourceTrackingEntries}
      rowHref={(s) => `/admin/source-tracking/${s.id}`}
      searchPlaceholder="Search sources..."
    />
  )
}
