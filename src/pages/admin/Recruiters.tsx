import { AdminListPage, type AdminColumn } from "@/components/tables/AdminListPage"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { adminRecruiters } from "@/data/mockData"
import type { AdminRecruiter } from "@/types"

const columns: AdminColumn<AdminRecruiter>[] = [
  {
    header: "Recruiter",
    render: (r) => (
      <div className="flex items-center gap-3">
        <Avatar className="size-9">
          <AvatarFallback>{r.initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.email}</p>
        </div>
      </div>
    ),
  },
  { header: "Employer", render: (r) => r.employer },
  { header: "Active jobs", render: (r) => r.activeJobs },
  { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  { header: "Created", render: (r) => r.created },
]

export function AdminRecruiters() {
  return (
    <AdminListPage
      title="Recruiters"
      subtitle={`${adminRecruiters.length} recruiter seats across all employers`}
      tabs={["All", "Active", "Invited", "Suspended"]}
      getTab={(r) => r.status}
      columns={columns}
      rows={adminRecruiters}
      rowHref={(r) => `/admin/recruiters/${r.id}`}
      searchPlaceholder="Search recruiters..."
    />
  )
}
