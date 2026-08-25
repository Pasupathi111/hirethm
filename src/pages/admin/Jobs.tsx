import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { AdminListPage, type AdminColumn } from "@/components/tables/AdminListPage"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { Button } from "@/components/ui/button"
import { type PaginatedResponse, api } from "@/lib/api"
import type { ApiJob } from "@/types"

const statusLabel: Record<string, string> = {
  draft: "Draft",
  open: "Published",
  closed: "Closed",
  archived: "Archived",
}

const columns: AdminColumn<ApiJob>[] = [
  {
    header: "Job",
    render: (j) => (
      <div>
        <p className="font-semibold">{j.title}</p>
        <p className="text-xs text-muted-foreground">{j.location ?? "No location set"}</p>
      </div>
    ),
  },
  { header: "Type", render: (j) => j.type.replace("_", " ") },
  { header: "Status", render: (j) => <StatusBadge status={statusLabel[j.status] ?? j.status} /> },
  { header: "Applications", render: (j) => Object.values(j.pipeline).reduce((sum, n) => sum + n, 0) },
  { header: "Interviews", render: (j) => j.pipeline.interview },
  { header: "Hired", render: (j) => j.pipeline.hired },
  { header: "Created", render: (j) => new Date(j.createdAt).toLocaleDateString() },
]

export function AdminJobs() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<ApiJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    api
      .get<PaginatedResponse<ApiJob>>("/api/jobs?limit=100")
      .then((res) => setJobs(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load jobs"))
      .finally(() => setLoading(false))
  }, [])

  if (error) return <p className="text-sm text-destructive">{error}</p>

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="dark" onClick={() => navigate("/admin/jobs/new")}>
          <Plus className="size-4" /> New Job
        </Button>
      </div>
      <AdminListPage
        title="Jobs"
        subtitle={`${jobs.length} job posting${jobs.length === 1 ? "" : "s"} in this organization`}
        tabs={["All", "Draft", "Published", "Closed", "Archived"]}
        getTab={(j) => statusLabel[j.status] ?? j.status}
        columns={columns}
        rows={jobs}
        rowHref={(j) => `/admin/jobs/${j.id}`}
        searchPlaceholder="Search jobs..."
        loading={loading}
      />
    </div>
  )
}
