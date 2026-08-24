import { AdminListPage, type AdminColumn } from "@/components/tables/AdminListPage"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { adminCandidates } from "@/data/mockData"
import type { AdminCandidate } from "@/types"

const columns: AdminColumn<AdminCandidate>[] = [
  {
    header: "Candidate",
    render: (c) => (
      <div className="flex items-center gap-3">
        <Avatar className="size-9">
          <AvatarFallback>{c.initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{c.name}</p>
          <p className="text-xs text-muted-foreground">{c.email}</p>
        </div>
      </div>
    ),
  },
  { header: "Location", render: (c) => c.location },
  { header: "Profile %", render: (c) => `${c.profilePercent}%` },
  { header: "CV Status", render: (c) => <StatusBadge status={c.cvStatus} /> },
  { header: "Applications", render: (c) => c.applications },
  { header: "Matches", render: (c) => c.matches },
  { header: "Status", render: (c) => <StatusBadge status={c.status} /> },
  { header: "Created", render: (c) => c.created },
]

export function AdminCandidates() {
  return (
    <AdminListPage
      title="Candidates"
      subtitle="12,842 platform-owned candidate profiles"
      tabs={["All", "Active", "CV processing", "CV failed", "Suspended"]}
      getTab={(c) =>
        c.cvStatus === "Processing" ? "CV processing" : c.cvStatus === "Failed" ? "CV failed" : c.status === "Suspended" ? "Suspended" : "Active"
      }
      columns={columns}
      rows={adminCandidates}
      rowHref={(c) => `/admin/candidates/${c.id}`}
      searchPlaceholder="Search candidates..."
    />
  )
}
