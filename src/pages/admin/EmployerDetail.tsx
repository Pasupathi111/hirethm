import { useEffect, useState } from "react"
import { Navigate, useParams } from "react-router-dom"

import { MetricTile } from "@/components/cards/MetricTile"
import { Skeleton } from "@/components/feedback/Skeleton"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiError, api } from "@/lib/api"
import type { ApiPlatformEmployerDetail } from "@/types"

const roleLabel: Record<string, string> = {
  owner: "Owner",
  admin: "Hiring Manager",
  member: "Recruiter",
}

export function AdminEmployerDetail() {
  const { id } = useParams()
  const [employer, setEmployer] = useState<ApiPlatformEmployerDetail | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api
      .get<ApiPlatformEmployerDetail>(`/api/platform/employers/${id}`)
      .then(setEmployer)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (notFound) return <Navigate to="/admin/employers" replace />
  if (loading || !employer) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  const activeJobs = employer.jobs.filter((j) => j.status === "open").length

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        backHref="/admin/employers"
        backLabel="Back to employers"
        initials={employer.name.slice(0, 2).toUpperCase()}
        name={employer.name}
        meta={`${employer.slug} · Created ${new Date(employer.createdAt).toLocaleDateString()}`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricTile label="Active jobs" value={activeJobs} />
        <MetricTile label="Total jobs" value={employer.jobs.length} />
        <MetricTile label="Members" value={employer.members.length} />
      </div>

      <Tabs defaultValue="jobs">
        <TabsList>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employer.jobs.map((j) => (
                <TableRow key={j.id}>
                  <TableCell className="font-semibold">{j.title}</TableCell>
                  <TableCell>
                    <StatusBadge status={j.status} />
                  </TableCell>
                  <TableCell>{new Date(j.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {employer.jobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No jobs posted yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="members">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employer.members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-semibold">{m.name}</TableCell>
                  <TableCell>{m.email}</TableCell>
                  <TableCell>
                    <StatusBadge status={roleLabel[m.role] ?? m.role} />
                  </TableCell>
                  <TableCell>{new Date(m.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  )
}
