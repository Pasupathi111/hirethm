import { AdminListPage, type AdminColumn } from "@/components/tables/AdminListPage"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { adminInterviews } from "@/data/mockData"
import type { AdminInterview } from "@/types"

const columns: AdminColumn<AdminInterview>[] = [
  { header: "Candidate", render: (i) => i.candidate },
  { header: "Job", render: (i) => i.job },
  { header: "Employer", render: (i) => i.employer },
  { header: "Type", render: (i) => i.type },
  { header: "Date", render: (i) => i.date },
  { header: "Status", render: (i) => <StatusBadge status={i.status} /> },
]

export function AdminInterviews() {
  return (
    <AdminListPage
      title="Interviews"
      subtitle={`${adminInterviews.length} interviews scheduled across the platform`}
      tabs={["All", "Upcoming", "Completed", "Cancelled"]}
      getTab={(i) => i.status}
      columns={columns}
      rows={adminInterviews}
      rowHref={(i) => `/admin/interviews/${i.id}`}
      searchPlaceholder="Search interviews..."
    />
  )
}
