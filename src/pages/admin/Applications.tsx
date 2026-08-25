import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { AdminListPage, type AdminColumn } from "@/components/tables/AdminListPage"
import { ErrorState } from "@/components/feedback/ErrorState"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { ApiError, type PaginatedResponse, api } from "@/lib/api"
import type { ApiApplication, ApiApplicationStatus } from "@/types"

const statusLabel: Record<string, string> = {
  new: "New",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
}

// Mirrors the backend's single source of truth: shared/status-transitions.ts (APPLICATION_STATUS_TRANSITIONS)
const APPLICATION_STATUS_TRANSITIONS: Record<ApiApplicationStatus, ApiApplicationStatus[]> = {
  new: ["screening", "interview", "rejected"],
  screening: ["interview", "offer", "rejected"],
  interview: ["offer", "rejected"],
  offer: ["hired", "rejected"],
  hired: [],
  rejected: ["new"],
}

export function AdminApplications() {
  const [applications, setApplications] = useState<ApiApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError("")
    api
      .get<PaginatedResponse<ApiApplication>>("/api/applications?limit=100")
      .then((res) => setApplications(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load applications"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const handleStatusChange = async (application: ApiApplication, status: ApiApplicationStatus) => {
    setUpdatingId(application.id)
    const previous = applications
    setApplications((prev) => prev.map((a) => (a.id === application.id ? { ...a, status } : a)))
    try {
      await api.patch<ApiApplication>(`/api/applications/${application.id}`, { status })
      toast.success(`Status updated to ${statusLabel[status]}`)
    } catch (err) {
      setApplications(previous)
      toast.error(err instanceof ApiError ? err.message : "Failed to update status")
    } finally {
      setUpdatingId(null)
    }
  }

  const columns: AdminColumn<ApiApplication>[] = [
    { header: "Application", render: (a) => <span className="font-mono text-xs font-semibold">{a.id.slice(0, 8)}</span> },
    { header: "Candidate", sortValue: (a) => `${a.candidateFirstName} ${a.candidateLastName}`, render: (a) => `${a.candidateFirstName} ${a.candidateLastName}` },
    { header: "Job", sortValue: (a) => a.jobTitle, render: (a) => a.jobTitle },
    {
      header: "Status",
      sortValue: (a) => a.status,
      render: (a) => {
        const allowed = APPLICATION_STATUS_TRANSITIONS[a.status] ?? []
        if (allowed.length === 0) {
          return <StatusBadge status={statusLabel[a.status] ?? a.status} />
        }
        return (
          <Select
            value={a.status}
            disabled={updatingId === a.id}
            onValueChange={(v) => handleStatusChange(a, v as ApiApplicationStatus)}
          >
            <SelectTrigger className="h-8 w-36" onClick={(e) => e.stopPropagation()}>
              <SelectValue>
                <StatusBadge status={statusLabel[a.status] ?? a.status} />
              </SelectValue>
            </SelectTrigger>
            <SelectContent onClick={(e) => e.stopPropagation()}>
              <SelectItem value={a.status}>{statusLabel[a.status]}</SelectItem>
              {allowed.map((s) => (
                <SelectItem key={s} value={s}>
                  {statusLabel[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      },
    },
    { header: "Applied", sortValue: (a) => a.createdAt, render: (a) => new Date(a.createdAt).toLocaleDateString() },
  ]

  if (error) return <ErrorState description={error} onRetry={load} />

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
