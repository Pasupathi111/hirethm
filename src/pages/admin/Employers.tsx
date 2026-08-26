import { useCallback, useEffect, useState } from "react"

import { AdminListPage, type AdminColumn } from "@/components/tables/AdminListPage"
import { ErrorState } from "@/components/feedback/ErrorState"
import { api, type PaginatedResponse } from "@/lib/api"
import type { ApiPlatformEmployer } from "@/types"

const columns: AdminColumn<ApiPlatformEmployer>[] = [
  {
    header: "Company",
    sortValue: (e) => e.name,
    render: (e) => (
      <div>
        <p className="font-semibold">{e.name}</p>
        <p className="text-xs text-muted-foreground">{e.slug}</p>
      </div>
    ),
  },
  { header: "Members", sortValue: (e) => e.memberCount, render: (e) => e.memberCount },
  { header: "Active jobs", sortValue: (e) => e.activeJobCount, render: (e) => e.activeJobCount },
  { header: "Applications", sortValue: (e) => e.applicationCount, render: (e) => e.applicationCount },
  { header: "Created", sortValue: (e) => e.createdAt, render: (e) => new Date(e.createdAt).toLocaleDateString() },
]

export function AdminEmployers() {
  const [employers, setEmployers] = useState<ApiPlatformEmployer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(() => {
    setLoading(true)
    setError("")
    api
      .get<PaginatedResponse<ApiPlatformEmployer>>("/api/platform/employers?limit=100")
      .then((res) => setEmployers(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load employers"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  if (error) return <ErrorState description={error} onRetry={load} />

  return (
    <AdminListPage
      title="Employers"
      subtitle={`${employers.length} organization${employers.length === 1 ? "" : "s"} on the platform`}
      columns={columns}
      rows={employers}
      rowHref={(e) => `/admin/employers/${e.id}`}
      searchPlaceholder="Search employers..."
      loading={loading}
    />
  )
}
