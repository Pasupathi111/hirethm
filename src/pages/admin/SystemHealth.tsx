import { useEffect, useState } from "react"

import { ErrorState } from "@/components/feedback/ErrorState"
import { Skeleton } from "@/components/feedback/Skeleton"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { ApiHealthStatTone, ApiPlatformHealth, ApiServiceStatus } from "@/types"

const dotTone: Record<ApiServiceStatus, string> = {
  healthy: "bg-primary",
  degraded: "bg-warning",
  down: "bg-destructive",
  not_configured: "bg-muted-foreground",
}

const statusLabel: Record<ApiServiceStatus, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  down: "Down",
  not_configured: "Not configured",
}

const statTone: Record<ApiHealthStatTone, string> = {
  neutral: "text-foreground",
  warning: "text-warning",
  negative: "text-destructive",
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86_400)
  const h = Math.floor((seconds % 86_400) / 3_600)
  const m = Math.floor((seconds % 3_600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function formatGb(bytes: number): string {
  return `${(bytes / 1_024 ** 3).toFixed(1)} GB`
}

export function AdminSystemHealth() {
  const [health, setHealth] = useState<ApiPlatformHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = () => {
    setLoading(true)
    setError("")
    api
      .get<ApiPlatformHealth>("/api/platform/health")
      .then(setHealth)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load system health"))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl">System health</h1>
          <p className="mt-1 text-muted-foreground">
            {health
              ? `Measured at ${new Date(health.checkedAt).toLocaleTimeString()} — every value is probed on request, not cached.`
              : "Live dependency probes for this deployment."}
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? "Checking…" : "Re-check"}
        </Button>
      </div>

      {loading && !health ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : health ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {health.services.map((s) => (
              <div key={s.key} className="rounded-lg border border-border bg-card p-5">
                <p className="flex items-center gap-2 font-bold">
                  <span className={cn("size-2 rounded-full", dotTone[s.status])} />
                  {s.name}
                </p>
                <span className="mt-2 inline-block">
                  <StatusBadge status={statusLabel[s.status]} />
                </span>
                <p className="mt-2 text-sm text-muted-foreground">{s.detail}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {health.stats.map((s) => (
              <div key={s.key} className="rounded-lg border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className={cn("font-display mt-1 text-3xl font-semibold tracking-[-0.02em]", statTone[s.tone])}>
                  {s.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-bold">Runtime</h2>
            <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">Version</dt>
                <dd className="font-semibold">{health.runtime.version ? `v${health.runtime.version}` : "Unknown"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Node</dt>
                <dd className="font-semibold">
                  {health.runtime.nodeVersion} · {health.runtime.platform}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Uptime</dt>
                <dd className="font-semibold">{formatUptime(health.runtime.uptimeSeconds)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Host memory</dt>
                <dd className="font-semibold">
                  {formatGb(health.runtime.memory.usedBytes)} / {formatGb(health.runtime.memory.totalBytes)} (
                  {health.runtime.memory.percent}%)
                </dd>
              </div>
            </dl>
          </div>
        </>
      ) : null}
    </div>
  )
}
