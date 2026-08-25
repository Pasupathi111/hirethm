import { useEffect, useState } from "react"

import { AdminListPage, type AdminColumn } from "@/components/tables/AdminListPage"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { type PaginatedResponse, api } from "@/lib/api"
import type { ApiApplication } from "@/types"

const statusLabel: Record<string, string> = {
  new: "New",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
}

const columns: AdminColumn<ApiApplication>[] = [
  { header: "Application", render: (a) => <span className="font-mono text-xs font-semibold">{a.id.slice(0, 8)}</span> },
  { header: "Candidate", render: (a) => `${a.candidateFirstName} ${a.candidateLastName}` },
  { header: "Job", render: (a) => a.jobTitle },
  { header: "Status", render: (a) => <StatusBadge status={statusLabel[a.status] ?? a.status} /> },
  { header: "Applied", render: (a) => new Date(a.createdAt).toLocaleDateString() },
]

export function AdminApplications() {
  const [applications, setApplications] = useState<ApiApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    api
      .get<PaginatedResponse<ApiApplication>>("/api/applications?limit=100")
      .then((res) => setApplications(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load applications"))
      .finally(() => setLoading(false))
  }, [])

  if (error) return <p className="text-sm text-destructive">{error}</p>

  return (
    <AdminListPage
      title="Applications"
      subtitle={`${applications.length} application${applications.length === 1 ? "" : "s"} · use "Apply to Job" on a candidate to create one`}
      tabs={["All", "New", "Screening", "Interview", "Offer", "Hired", "Rejected"]}
      getTab={(a) => statusLabel[a.status] ?? a.status}
      columns={columns}
      rows={applications}
      searchPlaceholder="Search applications..."
      loading={loading}
    />
  )
}
