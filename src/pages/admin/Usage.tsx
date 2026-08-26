import { motion } from "framer-motion"
import { useEffect, useState } from "react"

import { StatCard } from "@/components/cards/StatCard"
import { ErrorState } from "@/components/feedback/ErrorState"
import { Skeleton } from "@/components/feedback/Skeleton"
import { Progress } from "@/components/ui/progress"
import { api } from "@/lib/api"
import { fadeInUp, staggerContainer, useReducedMotion, withReducedMotion } from "@/lib/motion"
import type { ApiPlatformOrgUsage } from "@/types"

export function AdminUsage() {
  const reduced = useReducedMotion()
  const [rows, setRows] = useState<ApiPlatformOrgUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = () => {
    setLoading(true)
    setError("")
    api
      .get<{ data: ApiPlatformOrgUsage[] }>("/api/platform/usage?limit=100")
      .then((res) => setRows(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load usage"))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const totalProfileViews = rows.reduce((sum, r) => sum + r.profileViews, 0)
  const totalActiveJobs = rows.reduce((sum, r) => sum + r.activeJobs, 0)
  const atRiskCount = rows.filter((r) => (r.profileViewPercent ?? 0) >= 90 || (r.activeJobPercent ?? 0) >= 90).length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Usage</h1>
        <p className="mt-1 text-muted-foreground">Per-employer resource consumption against plan quotas this billing cycle.</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : (
        <>
          <motion.div
            className="grid gap-4 sm:grid-cols-3"
            variants={withReducedMotion(reduced, staggerContainer)}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={withReducedMotion(reduced, fadeInUp)}>
              <StatCard value={totalProfileViews.toLocaleString()} label="Candidate profile views" hint="Across subscribed employers, this period" />
            </motion.div>
            <motion.div variants={withReducedMotion(reduced, fadeInUp)}>
              <StatCard value={totalActiveJobs.toLocaleString()} label="Active jobs" hint="Across subscribed employers" />
            </motion.div>
            <motion.div variants={withReducedMotion(reduced, fadeInUp)}>
              <StatCard value={atRiskCount.toLocaleString()} label="Employers near quota" hint="At or above 90% on any limit" />
            </motion.div>
          </motion.div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg">Plan usage by employer</h2>
            <p className="mt-1 text-sm text-muted-foreground">Profile-view and active-job consumption against each employer's plan.</p>
            <div className="mt-5 space-y-5">
              {rows.map((r) => (
                <div key={r.organization.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{r.organization.name}</span>
                    <span className="text-muted-foreground">{r.plan?.name ?? "No plan"}</span>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>Profile views</span>
                      <span>
                        {r.profileViews}
                        {r.profileViewQuota != null ? ` / ${r.profileViewQuota}` : " (unlimited)"}
                      </span>
                    </div>
                    <Progress
                      value={r.profileViewPercent ?? 0}
                      indicatorClassName={(r.profileViewPercent ?? 0) >= 90 ? "bg-destructive" : undefined}
                    />
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>Active jobs</span>
                      <span>
                        {r.activeJobs}
                        {r.activeJobLimit != null ? ` / ${r.activeJobLimit}` : " (unlimited)"}
                      </span>
                    </div>
                    <Progress
                      value={r.activeJobPercent ?? 0}
                      indicatorClassName={(r.activeJobPercent ?? 0) >= 90 ? "bg-destructive" : undefined}
                    />
                  </div>
                </div>
              ))}
              {rows.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">No employers have a plan assigned yet.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
