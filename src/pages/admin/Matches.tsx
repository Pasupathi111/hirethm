import { useEffect, useState } from "react"

import { AdminListPage, type AdminColumn } from "@/components/tables/AdminListPage"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { api } from "@/lib/api"
import type { ApiAdminMatch } from "@/types"

const statusLabel: Record<string, string> = {
  new: "New",
  waiting: "Waiting for Decision",
  accepted: "Accepted",
  rejected: "Rejected",
  in_progress: "In Progress",
}

const columns: AdminColumn<ApiAdminMatch>[] = [
  { header: "Candidate", render: (m) => `${m.candidateFirstName} ${m.candidateLastName}` },
  { header: "Job", render: (m) => m.jobTitle },
  { header: "Readiness", render: (m) => `${m.score}%` },
  { header: "Status", render: (m) => <StatusBadge status={statusLabel[m.status] ?? m.status} /> },
  { header: "Created", render: (m) => new Date(m.matchedAt).toLocaleDateString() },
]

export function AdminMatches() {
  const [matches, setMatches] = useState<ApiAdminMatch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ data: ApiAdminMatch[] }>("/api/matches?limit=100")
      .then((res) => setMatches(res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AdminListPage
      title="Matches"
      subtitle={loading ? "Loading…" : `${matches.length} AI-generated match${matches.length === 1 ? "" : "es"}`}
      tabs={["All", "New", "Waiting for Decision", "Accepted", "Rejected"]}
      getTab={(m) => statusLabel[m.status] ?? m.status}
      columns={columns}
      rows={matches}
      loading={loading}
      rowHref={(m) => `/admin/matches/${m.id}`}
      searchPlaceholder="Search matches..."
    />
  )
}
