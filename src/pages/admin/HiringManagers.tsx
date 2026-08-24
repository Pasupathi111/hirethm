import { AdminListPage, type AdminColumn } from "@/components/tables/AdminListPage"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { adminHiringManagers } from "@/data/mockData"
import type { AdminHiringManager } from "@/types"

const columns: AdminColumn<AdminHiringManager>[] = [
  {
    header: "Hiring manager",
    render: (h) => (
      <div className="flex items-center gap-3">
        <Avatar className="size-9">
          <AvatarFallback>{h.initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{h.name}</p>
          <p className="text-xs text-muted-foreground">{h.email}</p>
        </div>
      </div>
    ),
  },
  { header: "Employer", render: (h) => h.employer },
  { header: "Department", render: (h) => h.department },
  { header: "Status", render: (h) => <StatusBadge status={h.status} /> },
  { header: "Created", render: (h) => h.created },
]

export function AdminHiringManagers() {
  return (
    <AdminListPage
      title="Hiring managers"
      subtitle={`${adminHiringManagers.length} hiring managers across all employers`}
      tabs={["All", "Active", "Invited", "Suspended"]}
      getTab={(h) => h.status}
      columns={columns}
      rows={adminHiringManagers}
      rowHref={(h) => `/admin/hiring-managers/${h.id}`}
      searchPlaceholder="Search hiring managers..."
    />
  )
}
