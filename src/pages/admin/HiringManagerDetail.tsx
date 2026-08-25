import { Navigate, useParams } from "react-router-dom"

import { MetricTile } from "@/components/cards/MetricTile"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminHiringManagers, jobs } from "@/data/mockData"

export function AdminHiringManagerDetail() {
  const { id } = useParams()
  const manager = adminHiringManagers.find((h) => h.id === id)

  if (!manager) return <Navigate to="/admin/hiring-managers" replace />

  const employerJobs = jobs.filter((j) => j.company === manager.employer)

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref="/admin/hiring-managers"
        backLabel="Back to hiring managers"
        initials={manager.initials}
        name={manager.name}
        meta={`${manager.id} · ${manager.email} · ${manager.employer} · Created ${manager.created}`}
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
          <p className="mt-1"><StatusBadge status={manager.status} className="text-base" /></p>
        </div>
        <MetricTile label="Department" value={manager.department} />
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2>Jobs at {manager.employer}</h2>
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
    </div>
  )
}
