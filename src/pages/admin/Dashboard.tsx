import { motion } from "framer-motion"
import { Briefcase, Building2, Inbox } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { EmptyState } from "@/components/feedback/EmptyState"
import { ErrorState } from "@/components/feedback/ErrorState"
import { Skeleton } from "@/components/feedback/Skeleton"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { Button } from "@/components/ui/button"
import { ApiError, api } from "@/lib/api"
import { useSession } from "@/lib/authClient"
import { fadeInUp, staggerContainer, useReducedMotion, withReducedMotion } from "@/lib/motion"
import { useActiveOrganization } from "@/lib/useActiveOrganization"
import type { ApiDashboardStats } from "@/types"

/** Pipeline stages in funnel order — candidates only ever move down this list. */
const PIPELINE_STAGES = [
  { key: "new", label: "New" },
  { key: "screening", label: "Screening" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
  { key: "hired", label: "Hired" },
] as const

function StatCard({ label, value, hint, to }: { label: string; value: number; hint?: string; to?: string }) {
  const body = (
    <>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tracking-[-0.02em]">{value.toLocaleString()}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </>
  )
  const className = "block rounded-lg border border-border bg-card p-5"
  return to ? (
    <Link to={to} className={`${className} transition-colors hover:border-primary/40`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  )
}

export function AdminDashboard() {
  const reduced = useReducedMotion()
  const { organization } = useActiveOrganization()
  const { data: session, isPending: sessionPending } = useSession()
  // Platform admins (HireThm staff) belong to no organization, so the
  // org-scoped stats endpoint would only ever 403 for them.
  const hasOrg = Boolean(session?.session.activeOrganizationId)

  const [stats, setStats] = useState<ApiDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = () => {
    setLoading(true)
    setError("")
    api
      .get<ApiDashboardStats>("/api/dashboard/stats")
      .then(setStats)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load dashboard"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (sessionPending) return
    if (!hasOrg) { setLoading(false); return }
    load()
  }, [sessionPending, hasOrg])

  if (!sessionPending && !hasOrg) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl">Platform overview</h1>
          <p className="mt-1 text-muted-foreground">
            You're signed in as HireThm staff, which isn't scoped to any single organization.
          </p>
        </div>
        <EmptyState
          icon={Building2}
          title="No organization selected"
          description="Hiring figures are per-organization. Open the platform console to browse employers across the whole platform."
        />
        <Button asChild>
          <Link to="/admin/employers">Go to Employers</Link>
        </Button>
      </div>
    )
  }

  if (loading || sessionPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) return <ErrorState description={error} onRetry={load} />
  if (!stats) return null

  const { counts, pipeline, jobsByStatus, recentApplications, topJobs } = stats
  // Scale bars against the widest stage rather than the total, so a small
  // pipeline still renders readable bars instead of slivers.
  const pipelineMax = Math.max(...PIPELINE_STAGES.map((s) => pipeline[s.key]), 1)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">{organization?.name ?? "Dashboard"}</h1>
        <p className="mt-1 text-muted-foreground">
          Hiring overview for your organization · figures update on every load
        </p>
      </div>

      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={withReducedMotion(reduced, staggerContainer)}
        initial="hidden"
        animate="show"
      >
        {[
          { label: "Open jobs", value: counts.openJobs, hint: `${jobsByStatus.draft ?? 0} draft`, to: "/admin/jobs" },
          { label: "Candidates", value: counts.totalCandidates, to: "/admin/candidates" },
          { label: "Applications", value: counts.totalApplications, to: "/admin/applications" },
          { label: "Awaiting review", value: counts.newApplications, hint: "Status: new", to: "/admin/applications" },
        ].map((s) => (
          <motion.div key={s.label} variants={withReducedMotion(reduced, fadeInUp)}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg">Application pipeline</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {counts.totalApplications.toLocaleString()} application{counts.totalApplications === 1 ? "" : "s"} by
            current stage. Rejected: {pipeline.rejected.toLocaleString()}.
          </p>

          {counts.totalApplications === 0 ? (
            <EmptyState
              className="mt-6"
              title="No applications yet"
              description="Publish a job and applications will appear here as candidates apply."
            />
          ) : (
            <div className="mt-5 space-y-4">
              {PIPELINE_STAGES.map((stage) => (
                <div key={stage.key}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-muted-foreground">{stage.label}</span>
                    <span className="font-bold">{pipeline[stage.key].toLocaleString()}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(pipeline[stage.key] / pipelineMax) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg">Recent applications</h2>
          <p className="mt-1 text-sm text-muted-foreground">Latest {recentApplications.length} received.</p>

          {recentApplications.length === 0 ? (
            <EmptyState className="mt-6" title="Nothing yet" description="New applications will show up here." />
          ) : (
            <div className="mt-4 space-y-3">
              {recentApplications.map((a) => (
                <Link
                  key={a.id}
                  to={`/admin/applications`}
                  className="flex items-start justify-between gap-3 border-b border-hairline pb-3 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {a.candidateFirstName} {a.candidateLastName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {a.jobTitle} · {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg">Most active jobs</h2>
            <p className="mt-1 text-sm text-muted-foreground">Open roles ranked by applications received.</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/admin/jobs">All jobs</Link>
          </Button>
        </div>

        {topJobs.length === 0 ? (
          <EmptyState
            className="mt-6"
            icon={counts.openJobs === 0 ? Briefcase : Inbox}
            title={counts.openJobs === 0 ? "No open jobs" : "No applications yet"}
            description={
              counts.openJobs === 0
                ? "Publish a job to start receiving applications."
                : "Your open jobs haven't received applications yet."
            }
          />
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline text-left text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  <th className="pb-2">Job</th>
                  <th className="pb-2 text-right">Applications</th>
                  <th className="pb-2 text-right">New</th>
                  <th className="pb-2 text-right">Interview</th>
                  <th className="pb-2 text-right">Hired</th>
                </tr>
              </thead>
              <tbody>
                {topJobs.map((j) => (
                  <tr key={j.id} className="border-b border-hairline last:border-0">
                    <td className="py-3">
                      <Link to={`/admin/jobs/${j.id}`} className="font-semibold hover:text-primary">
                        {j.title}
                      </Link>
                    </td>
                    <td className="py-3 text-right font-semibold">{j.applicationCount}</td>
                    <td className="py-3 text-right text-muted-foreground">{j.newCount}</td>
                    <td className="py-3 text-right text-muted-foreground">{j.interviewCount}</td>
                    <td className="py-3 text-right text-muted-foreground">{j.hiredCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
