import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { AdminListPage, type AdminColumn } from "@/components/tables/AdminListPage"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { type PaginatedResponse, api } from "@/lib/api"
import type { ApiCandidate } from "@/types"

const columns: AdminColumn<ApiCandidate>[] = [
  {
    header: "Candidate",
    render: (c) => (
      <div className="flex items-center gap-3">
        <Avatar className="size-9">
          <AvatarFallback>
            {c.firstName[0]}
            {c.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">
            {c.displayName || `${c.firstName} ${c.lastName}`}
          </p>
          <p className="text-xs text-muted-foreground">{c.email}</p>
        </div>
      </div>
    ),
  },
  { header: "Phone", render: (c) => c.phone ?? "—" },
  { header: "Applications", render: (c) => c.applicationCount },
  { header: "Added", render: (c) => new Date(c.createdAt).toLocaleDateString() },
]

export function AdminCandidates() {
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState<ApiCandidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    api
      .get<PaginatedResponse<ApiCandidate>>("/api/candidates?limit=100")
      .then((res) => setCandidates(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load candidates"))
      .finally(() => setLoading(false))
  }, [])

  if (error) return <p className="text-sm text-destructive">{error}</p>

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="dark" onClick={() => navigate("/admin/candidates/new")}>
          <Plus className="size-4" /> Add Candidate
        </Button>
      </div>
      <AdminListPage
        title="Candidates"
        subtitle={`${candidates.length} candidate${candidates.length === 1 ? "" : "s"} in this organization`}
        columns={columns}
        rows={candidates}
        rowHref={(c) => `/admin/candidates/${c.id}`}
        searchPlaceholder="Search candidates..."
        loading={loading}
      />
    </div>
  )
}
