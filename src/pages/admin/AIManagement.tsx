import { ExternalLink } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { EmptyState } from "@/components/feedback/EmptyState"
import { ErrorState } from "@/components/feedback/ErrorState"
import { Skeleton } from "@/components/feedback/Skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import type { ApiAiAnalysisStats, ApiAiConfig, ApiAiProvider } from "@/types"

type ProviderRegistry = Record<string, ApiAiProvider>

interface TestState {
  status: "testing" | "ok" | "failed"
  message?: string
}

function providerLabel(registry: ProviderRegistry, provider: string): string {
  return registry[provider]?.name ?? provider
}

function modelLabel(registry: ProviderRegistry, provider: string, model: string): string {
  return registry[provider]?.models.find((m) => m.id === model)?.label ?? model
}

export function AdminAIManagement() {
  const [configs, setConfigs] = useState<ApiAiConfig[]>([])
  const [registry, setRegistry] = useState<ProviderRegistry>({})
  const [stats, setStats] = useState<ApiAiAnalysisStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [tests, setTests] = useState<Record<string, TestState>>({})
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError("")
    Promise.all([
      api.get<ApiAiConfig[]>("/api/ai-config"),
      api.get<ProviderRegistry>("/api/ai-config/providers"),
      // Usage stats are supplementary — a failure here must not blank the page.
      api.get<ApiAiAnalysisStats>("/api/ai-analysis/stats").catch(() => null),
    ])
      .then(([configRows, providerRows, statsRow]) => {
        setConfigs(configRows)
        setRegistry(providerRows)
        setStats(statsRow)
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load AI configuration"))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const setDefaultAnalysis = async (config: ApiAiConfig) => {
    setBusyId(config.id)
    try {
      await api.post(`/api/ai-config/${config.id}/set-default`, { purposes: ["analysis"] })
      toast.success(`${config.name} is now the default for analysis`)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not set default")
    } finally {
      setBusyId(null)
    }
  }

  const testConnection = async (config: ApiAiConfig) => {
    setTests((prev) => ({ ...prev, [config.id]: { status: "testing" } }))
    try {
      // The endpoint throws (422) on any failure and returns { success: true }
      // otherwise, so reaching this line already means the probe passed.
      await api.post<{ success: boolean }>(`/api/ai-config/${config.id}/test-connection`)
      setTests((prev) => ({ ...prev, [config.id]: { status: "ok" } }))
    } catch (err) {
      setTests((prev) => ({
        ...prev,
        [config.id]: { status: "failed", message: err instanceof Error ? err.message : "Connection failed" },
      }))
    }
  }

  const summary = stats?.summary
  const failureRate =
    summary && summary.totalRuns > 0 ? Math.round((summary.failedRuns / summary.totalRuns) * 100) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">AI management</h1>
        <p className="mt-1 text-muted-foreground">
          The AI providers configured for this organization, and how the analysis pipeline is performing.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : (
        <>
          {summary && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Analysis runs</p>
                <p className="font-display mt-1 text-3xl font-semibold tracking-[-0.02em]">
                  {summary.totalRuns.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="font-display mt-1 text-3xl font-semibold tracking-[-0.02em]">
                  {summary.completedRuns.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Failed</p>
                <p
                  className={`font-display mt-1 text-3xl font-semibold tracking-[-0.02em] ${
                    summary.failedRuns > 0 ? "text-destructive" : ""
                  }`}
                >
                  {summary.failedRuns.toLocaleString()}
                  {failureRate !== null && failureRate > 0 && (
                    <span className="ml-2 text-base font-normal text-muted-foreground">{failureRate}%</span>
                  )}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground">Tokens used</p>
                <p className="font-display mt-1 text-3xl font-semibold tracking-[-0.02em]">
                  {summary.totalTokens.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-hairline p-6">
              <h2 className="text-lg font-bold">Configurations</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Provider credentials are managed in the Reqcore settings panel; this screen shows what is active and
                lets you re-point the analysis pipeline.
              </p>
            </div>

            {configs.length === 0 ? (
              <EmptyState
                className="m-6 border-0"
                title="No AI provider configured"
                description="Until a provider is configured, resume parsing, JD analysis and applicant scoring will not run."
              />
            ) : (
              <div className="divide-y divide-hairline">
                {configs.map((config) => {
                  const test = tests[config.id]
                  const meta = registry[config.provider]
                  return (
                    <div key={config.id} className="flex flex-wrap items-start justify-between gap-4 p-5">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{config.name}</p>
                          {config.isDefaultAnalysis && <Badge variant="success">Default · analysis</Badge>}
                          {config.isDefaultChatbot && <Badge variant="info">Default · assistant</Badge>}
                          {!config.hasApiKey && <Badge variant="destructive">No API key</Badge>}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {providerLabel(registry, config.provider)} ·{" "}
                          {modelLabel(registry, config.provider, config.model)} · max {config.maxTokens.toLocaleString()}{" "}
                          tokens
                          {config.baseUrl ? ` · ${config.baseUrl}` : ""}
                        </p>
                        {test?.status === "ok" && (
                          <p className="mt-1 text-sm text-primary">Connection OK</p>
                        )}
                        {test?.status === "failed" && (
                          <p className="mt-1 text-sm text-destructive">{test.message ?? "Connection failed"}</p>
                        )}
                        {meta && (
                          <a
                            href={meta.modelsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline"
                          >
                            {meta.name} model reference <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testConnection(config)}
                          disabled={test?.status === "testing"}
                        >
                          {test?.status === "testing" ? "Testing…" : "Test connection"}
                        </Button>
                        {!config.isDefaultAnalysis && (
                          <Button size="sm" onClick={() => setDefaultAnalysis(config)} disabled={busyId === config.id}>
                            {busyId === config.id ? "Saving…" : "Use for analysis"}
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {stats && stats.modelBreakdown.length > 0 && (
            <div className="rounded-lg border border-border bg-card">
              <div className="border-b border-hairline p-6">
                <h2 className="text-lg font-bold">Usage by model</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Actual analysis runs recorded against each provider/model pair.
                </p>
              </div>
              <div className="divide-y divide-hairline">
                {stats.modelBreakdown.map((m) => (
                  <div key={`${m.provider}-${m.model}`} className="flex flex-wrap items-center justify-between gap-3 p-5">
                    <div>
                      <p className="font-semibold">{modelLabel(registry, m.provider, m.model)}</p>
                      <p className="text-sm text-muted-foreground">{providerLabel(registry, m.provider)}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {m.runCount.toLocaleString()} run{m.runCount === 1 ? "" : "s"} ·{" "}
                      {m.totalTokens.toLocaleString()} tokens
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
