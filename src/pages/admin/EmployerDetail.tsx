import { useCallback, useEffect, useState } from "react"
import { Navigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { MetricTile } from "@/components/cards/MetricTile"
import { Skeleton } from "@/components/feedback/Skeleton"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { AdminDetailHeader } from "@/components/tables/AdminDetailHeader"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiError, api } from "@/lib/api"
import type { ApiOrganizationSubscription, ApiPlan, ApiPlatformEmployerDetail } from "@/types"

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
  const [subscription, setSubscription] = useState<ApiOrganizationSubscription | null>(null)
  const [plans, setPlans] = useState<ApiPlan[]>([])
  const [changingPlan, setChangingPlan] = useState(false)

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

  const loadSubscription = useCallback(() => {
    if (!id) return
    api.get<ApiOrganizationSubscription | null>(`/api/platform/employers/${id}/subscription`).then(setSubscription)
  }, [id])

  useEffect(() => {
    loadSubscription()
    api.get<{ data: ApiPlan[] }>("/api/platform/plans").then((res) => setPlans(res.data.filter((p) => p.isActive)))
  }, [loadSubscription])

  const handlePlanChange = async (planId: string) => {
    if (!id) return
    setChangingPlan(true)
    try {
      await api.patch(`/api/platform/employers/${id}/subscription`, { planId })
      toast.success("Plan updated")
      loadSubscription()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to change plan")
    } finally {
      setChangingPlan(false)
    }
  }

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

      <div className="grid gap-4 sm:grid-cols-4">
        <MetricTile label="Active jobs" value={activeJobs} />
        <MetricTile label="Total jobs" value={employer.jobs.length} />
        <MetricTile label="Members" value={employer.members.length} />
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Plan</p>
          <Select value={subscription?.planId ?? ""} onValueChange={handlePlanChange} disabled={changingPlan}>
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="No plan assigned" />
            </SelectTrigger>
            <SelectContent>
              {plans.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {subscription && <p className="mt-1 text-xs text-muted-foreground capitalize">{subscription.status}</p>}
        </div>
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
