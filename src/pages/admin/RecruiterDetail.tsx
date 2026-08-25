import { Navigate, useParams } from "react-router-dom"

import { MetricTile } from "@/components/cards/MetricTile"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminRecruiters, auditLogs, jobs } from "@/data/mockData"

export function AdminRecruiterDetail() {
  const { id } = useParams()
  const recruiter = adminRecruiters.find((r) => r.id === id)

  if (!recruiter) return <Navigate to="/admin/recruiters" replace />

  const employerJobs = jobs.filter((j) => j.company === recruiter.employer)
  const activity = auditLogs.filter((l) => l.actor === recruiter.email)

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref="/admin/recruiters"
        backLabel="Back to recruiters"
        initials={recruiter.initials}
        name={recruiter.name}
        meta={`${recruiter.id} · ${recruiter.email} · ${recruiter.employer} · Created ${recruiter.created}`}
        actions={
          <>
            <Button variant="outline">Message</Button>
            <Button variant="dark">Suspend</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="mt-1"><StatusBadge status={recruiter.status} className="text-base" /></p>
        </div>
        <MetricTile label="Active jobs" value={recruiter.activeJobs} />
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg">Jobs at {recruiter.employer}</h2>
        {employerJobs.length > 0 ? (
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead>Matches</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employerJobs.map((j) => (
                <TableRow key={j.id}>
                  <TableCell className="font-semibold">{j.title}</TableCell>
                  <TableCell>
                    <StatusBadge status={j.status} />
                  </TableCell>
                  <TableCell>{j.applications}</TableCell>
                  <TableCell>{j.matches}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No active jobs posted by this employer.</p>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg">Recent activity</h2>
        {activity.length > 0 ? (
          <ul className="mt-4 space-y-4">
            {activity.map((log) => (
              <li key={log.id}>
                <p className="text-sm font-semibold">{log.action.replace(/_/g, " ")}</p>
                <p className="text-xs text-muted-foreground">{log.timestamp}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No recorded activity for this recruiter yet.</p>
        )}
      </div>
    </div>
  )
}
