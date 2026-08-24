import { AdminListPage, type AdminColumn } from "@/components/tables/AdminListPage"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { jobs } from "@/data/mockData"
import type { Job } from "@/types"

const columns: AdminColumn<Job>[] = [
  {
    header: "Job",
    render: (j) => (
      <div>
        <p className="font-semibold">{j.title}</p>
        <p className="text-xs text-muted-foreground">{j.reqId}</p>
      </div>
    ),
  },
  { header: "Company", render: (j) => j.company },
  { header: "Status", render: (j) => <StatusBadge status={j.status} /> },
  { header: "JD complete", render: (j) => `${j.jdComplete}%` },
  { header: "AI status", render: (j) => <StatusBadge status={j.aiStatus} /> },
  { header: "Applications", render: (j) => j.applications },
  { header: "Matches", render: (j) => j.matches },
  { header: "Created", render: (j) => j.postedAt },
]

export function AdminJobs() {
  return (
    <AdminListPage
      title="Jobs"
      subtitle="1,284 published roles · 96 in AI processing"
      tabs={["All", "Published", "Draft", "Closed", "Processing", "AI Failed"]}
      getTab={(j) => j.status}
      columns={columns}
      rows={jobs}
      rowHref={(j) => `/admin/jobs/${j.id}`}
      searchPlaceholder="Search jobs..."
    />
  )
}
