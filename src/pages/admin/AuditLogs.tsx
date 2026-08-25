import { AdminListPage, type AdminColumn } from "@/components/tables/AdminListPage"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { auditLogs } from "@/data/mockData"
import type { AuditLogEntry } from "@/types"

const columns: AdminColumn<AuditLogEntry>[] = [
  { header: "Timestamp", render: (l) => <span className="text-muted-foreground">{l.timestamp}</span> },
  { header: "Actor", render: (l) => l.actor },
  { header: "Role", render: (l) => <StatusBadge status={l.role} /> },
  { header: "Action", render: (l) => <span className="font-mono text-xs font-semibold">{l.action}</span> },
  { header: "Resource", render: (l) => `${l.resource} · ${l.resourceId}` },
  { header: "Previous state", render: (l) => <span className="text-muted-foreground">{l.previousState}</span> },
  { header: "New state", render: (l) => <span className="font-semibold text-primary">{l.newState}</span> },
]

export function AdminAuditLogs() {
  return (
    <AdminListPage
      title="Audit logs"
      subtitle="Every consent and visibility transition is recorded"
      tabs={["All", "Consent", "Visibility", "Admin action", "Auth", "Billing"]}
      getTab={(l) => l.category}
      columns={columns}
      rows={auditLogs}
      searchPlaceholder="Search audit logs..."
    />
  )
}
