import { useEffect, useState } from "react"

import { AdminListPage, type AdminColumn } from "@/components/tables/AdminListPage"
import { ErrorState } from "@/components/feedback/ErrorState"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { ApiError, api } from "@/lib/api"
import type { ApiActivityLogItem, ApiActivityResourceType, ApiActivityTimelineResponse } from "@/types"

const actionLabel: Record<string, string> = {
  created: "Created",
  updated: "Updated",
  deleted: "Deleted",
  status_changed: "Status changed",
  comment_added: "Comment added",
  member_invited: "Member invited",
  member_removed: "Member removed",
  member_role_changed: "Role changed",
  scored: "Scored",
  scheduled: "Scheduled",
  profile_viewed: "Profile viewed",
}

const resourceTypeLabel: Record<ApiActivityResourceType, string> = {
  job: "Job",
  candidate: "Candidate",
  application: "Application",
  interview: "Interview",
  member: "Member",
}

function formatDetails(item: ApiActivityLogItem): string {
  const meta = item.metadata
  if (!meta) return "—"
  if (typeof meta.from === "string" && typeof meta.to === "string") {
    return `${meta.from} → ${meta.to}`
  }
  const entries = Object.entries(meta).filter(([, v]) => v !== null && v !== undefined)
  if (entries.length === 0) return "—"
  return entries.map(([k, v]) => `${k}: ${String(v)}`).join(", ")
}

const columns: AdminColumn<ApiActivityLogItem>[] = [
  {
    header: "Timestamp",
    render: (l) => <span className="text-muted-foreground">{new Date(l.createdAt).toLocaleString()}</span>,
    sortValue: (l) => new Date(l.createdAt).getTime(),
  },
  { header: "Actor", render: (l) => l.actorName ?? l.actorEmail ?? "System" },
  { header: "Action", render: (l) => <span className="font-mono text-xs font-semibold">{actionLabel[l.action] ?? l.action}</span> },
  {
    header: "Resource",
    render: (l) => (
      <StatusBadge status={resourceTypeLabel[l.resourceType] ?? l.resourceType} />
    ),
  },
  { header: "Details", render: (l) => <span className="text-muted-foreground">{l.resourceName ? `${l.resourceName} — ` : ""}{formatDetails(l)}</span> },
]

export function AdminAuditLogs() {
  const [logs, setLogs] = useState<ApiActivityLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    setLoading(true)
    setError("")
    api
      .get<ApiActivityTimelineResponse>("/api/activity-log/timeline?limit=200")
      .then((res) => setLogs(res.items))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load audit logs"))
      .finally(() => setLoading(false))
  }, [])

  if (error) return <ErrorState description={error} onRetry={() => window.location.reload()} />

  return (
    <AdminListPage
      title="Audit logs"
      subtitle="Every job, candidate, application, and interview change in your organization"
      tabs={["All", "Job", "Candidate", "Application", "Interview", "Member"]}
      getTab={(l) => resourceTypeLabel[l.resourceType] ?? l.resourceType}
      columns={columns}
      rows={logs}
      loading={loading}
      searchPlaceholder="Search audit logs..."
    />
  )
}
