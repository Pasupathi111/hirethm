import { useCallback, useEffect, useState } from "react"

import { AdminListPage, type AdminColumn } from "@/components/tables/AdminListPage"
import { ErrorState } from "@/components/feedback/ErrorState"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { api, type PaginatedResponse } from "@/lib/api"
import type { ApiPlatformMember } from "@/types"

function initialsOf(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
}

const columns: AdminColumn<ApiPlatformMember>[] = [
  {
    header: "Name",
    sortValue: (m) => m.name,
    render: (m) => (
      <div className="flex items-center gap-3">
        <Avatar className="size-9">
          <AvatarFallback>{initialsOf(m.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{m.name}</p>
          <p className="text-xs text-muted-foreground">{m.email}</p>
        </div>
      </div>
    ),
  },
  { header: "Employer", sortValue: (m) => m.organizationName, render: (m) => m.organizationName },
  { header: "Active jobs", sortValue: (m) => m.activeJobCount, render: (m) => m.activeJobCount },
  { header: "Joined", sortValue: (m) => m.createdAt, render: (m) => new Date(m.createdAt).toLocaleDateString() },
]

/**
 * Shared list view for the platform-admin Recruiters and Hiring Managers
 * directories — same underlying data (org members), filtered by role.
 */
export function PlatformMembersList({
  role,
  title,
  subtitleNoun,
  rowBasePath,
}: {
  role: "member" | "admin"
  title: string
  subtitleNoun: string
  rowBasePath: string
}) {
  const [members, setMembers] = useState<ApiPlatformMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(() => {
    setLoading(true)
    setError("")
    api
      .get<PaginatedResponse<ApiPlatformMember>>(`/api/platform/members?role=${role}&limit=100`)
      .then((res) => setMembers(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : `Failed to load ${subtitleNoun}`))
      .finally(() => setLoading(false))
  }, [role, subtitleNoun])

  useEffect(load, [load])

  if (error) return <ErrorState description={error} onRetry={load} />

  return (
    <AdminListPage
      title={title}
      subtitle={`${members.length} ${subtitleNoun} across all employers`}
      columns={columns}
      rows={members}
      rowHref={(m) => `${rowBasePath}/${m.id}`}
      searchPlaceholder={`Search ${title.toLowerCase()}...`}
      loading={loading}
    />
  )
}
