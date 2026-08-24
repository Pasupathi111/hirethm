import { AdminListPage, type AdminColumn } from "@/components/tables/AdminListPage"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { adminApplications } from "@/data/mockData"
import type { AdminApplication } from "@/types"

const columns: AdminColumn<AdminApplication>[] = [
  { header: "Application", render: (a) => <span className="font-mono text-xs font-semibold">{a.id}</span> },
  { header: "Candidate", render: (a) => a.candidate },
  { header: "Job", render: (a) => a.job },
  { header: "Employer", render: (a) => a.employer },
  { header: "Status", render: (a) => <StatusBadge status={a.status} /> },
  { header: "Applied", render: (a) => a.applied },
]

export function AdminApplications() {
  return (
    <AdminListPage
      title="Applications"
      subtitle={`${adminApplications.length} direct applications across the platform`}
      tabs={["All", "Applied", "Under Review", "Shortlisted", "Interview", "Rejected"]}
      getTab={(a) => a.status}
      columns={columns}
      rows={adminApplications}
      searchPlaceholder="Search applications..."
    />
  )
}
