import { AdminListPage, type AdminColumn } from "@/components/tables/AdminListPage"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { adminEmployers } from "@/data/mockData"
import type { AdminEmployer } from "@/types"

const columns: AdminColumn<AdminEmployer>[] = [
  {
    header: "Company",
    render: (e) => (
      <div>
        <p className="font-semibold">{e.company}</p>
        <p className="text-xs text-muted-foreground">{e.domain}</p>
      </div>
    ),
  },
  { header: "Recruiters", render: (e) => e.recruiters },
  { header: "Active jobs", render: (e) => e.activeJobs },
  { header: "Applications", render: (e) => e.applications },
  { header: "Plan", render: (e) => <StatusBadge status={e.plan} /> },
  { header: "Usage", render: (e) => `${e.usage}%` },
  { header: "Status", render: (e) => <StatusBadge status={e.status} /> },
  { header: "Created", render: (e) => e.created },
]

export function AdminEmployers() {
  return (
    <AdminListPage
      title="Employers"
      subtitle="426 active employer organizations"
      tabs={["All", "Active", "Trial", "Past due", "Suspended"]}
      getTab={(e) => e.status}
      columns={columns}
      rows={adminEmployers}
      rowHref={(e) => `/admin/employers/${e.id}`}
      searchPlaceholder="Search employers..."
    />
  )
}
