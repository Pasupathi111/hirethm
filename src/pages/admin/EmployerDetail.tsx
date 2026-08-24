import { Navigate, useParams } from "react-router-dom"

import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { adminEmployers, jobs } from "@/data/mockData"

export function AdminEmployerDetail() {
  const { id } = useParams()
  const employer = adminEmployers.find((e) => e.id === id)

  if (!employer) return <Navigate to="/admin/employers" replace />

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref="/admin/employers"
        backLabel="Back to employers"
        initials={employer.company.slice(0, 2).toUpperCase()}
        name={employer.company}
        meta={`${employer.id} · ${employer.domain} · Created ${employer.created}`}
        actions={
          <>
            <Button variant="outline">Impersonate admin</Button>
            <Button variant="dark">Suspend</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Plan</p>
          <p className="mt-1"><StatusBadge status={employer.plan} className="text-base" /></p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Active jobs</p>
          <p className="mt-1 text-2xl font-extrabold">{employer.activeJobs}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Applications</p>
          <p className="mt-1 text-2xl font-extrabold">{employer.applications}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Plan usage</p>
          <p className="mt-1 text-2xl font-extrabold">{employer.usage}%</p>
        </div>
      </div>

      <Tabs defaultValue="jobs">
        <TabsList>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="recruiters">Recruiters</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead>Matches</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs
                .filter((j) => j.company === employer.company)
                .map((j) => (
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
        </TabsContent>

        <TabsContent value="recruiters">
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            {employer.recruiters} recruiter seats provisioned for {employer.company}.
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Current plan: {employer.plan} · {employer.usage}% of monthly quota used · Renews on the 1st of each month.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
