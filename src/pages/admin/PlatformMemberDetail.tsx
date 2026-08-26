import { useEffect, useState } from "react"
import { Navigate, useParams } from "react-router-dom"

import { MetricTile } from "@/components/cards/MetricTile"
import { Skeleton } from "@/components/feedback/Skeleton"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ApiError, api } from "@/lib/api"
import type { ApiPlatformMemberDetail } from "@/types"

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
}

/**
 * Shared detail view for the platform-admin Recruiter and Hiring Manager
 * detail pages — same underlying data (one org member).
 */
export function PlatformMemberDetail({ backHref, backLabel }: { backHref: string; backLabel: string }) {
  const { id } = useParams()
  const [member, setMember] = useState<ApiPlatformMemberDetail | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api
      .get<ApiPlatformMemberDetail>(`/api/platform/members/${id}`)
      .then(setMember)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (notFound) return <Navigate to={backHref} replace />
  if (loading || !member) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  const activeJobs = member.jobs.filter((j) => j.status === "open").length

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref={backHref}
        backLabel={backLabel}
        initials={member.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
        name={member.name}
        meta={`${member.email} · ${member.organizationName} · Joined ${new Date(member.createdAt).toLocaleDateString()}`}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <MetricTile label="Active jobs at employer" value={activeJobs} />
        <MetricTile label="Total jobs at employer" value={member.jobs.length} />
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg">Jobs at {member.organizationName}</h2>
        {member.jobs.length > 0 ? (
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {member.jobs.map((j) => (
                <TableRow key={j.id}>
                  <TableCell className="font-semibold">{j.title}</TableCell>
                  <TableCell>
                    <StatusBadge status={j.status} />
                  </TableCell>
                  <TableCell>{new Date(j.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No jobs posted by this employer.</p>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg">Recent activity</h2>
        {member.activity.length > 0 ? (
          <ul className="mt-4 space-y-4">
            {member.activity.map((log) => (
              <li key={log.id}>
                <p className="text-sm font-semibold">
                  {actionLabel[log.action] ?? log.action} {log.resourceType}
                </p>
                <p className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No recorded activity yet.</p>
        )}
      </div>
    </div>
  )
}
