import { AdminListPage, type AdminColumn } from "@/components/tables/AdminListPage"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { adminMatches } from "@/data/mockData"
import type { AdminMatch } from "@/types"

const columns: AdminColumn<AdminMatch>[] = [
  { header: "Match", render: (m) => <span className="font-mono text-xs font-semibold">{m.id}</span> },
  { header: "Candidate", render: (m) => m.candidate },
  { header: "Job", render: (m) => m.job },
  { header: "Employer", render: (m) => m.employer },
  { header: "Readiness", render: (m) => `${m.readiness}%` },
  { header: "Status", render: (m) => <StatusBadge status={m.status} /> },
  { header: "Created", render: (m) => m.created },
]

export function AdminMatches() {
  return (
    <AdminListPage
      title="Matches"
      subtitle={`${adminMatches.length} AI-generated matches this week`}
      tabs={["All", "New", "Waiting for Decision", "Accepted", "Rejected"]}
      getTab={(m) => m.status}
      columns={columns}
      rows={adminMatches}
      searchPlaceholder="Search matches..."
    />
  )
}
