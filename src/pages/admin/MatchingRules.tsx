import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Callout } from "@/components/feedback/Callout"
import { ErrorState } from "@/components/feedback/ErrorState"
import { Skeleton } from "@/components/feedback/Skeleton"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { api } from "@/lib/api"
import { MATCH_CRITERIA_LABELS, type ApiMatchCriterionLabel, type ApiMatchWeights, type ApiOrgSettings } from "@/types"

type Weights = Record<ApiMatchCriterionLabel, number>

/**
 * Five of the eight BRD §3.3 criteria currently score a fixed neutral value
 * because no field in the schema supplies a real signal for them (see GitHub
 * issue #57). Weighting them still works, but it redistributes a constant —
 * saying so here is more honest than a slider that silently does nothing
 * useful.
 */
const NO_SIGNAL_CRITERIA: ReadonlySet<string> = new Set([
  "Experience Match",
  "Career Goals",
  "Availability",
  "Culture & Role Fit",
  "Potential & Growth",
])

function toWeights(stored: ApiMatchWeights | null | undefined): Weights {
  return Object.fromEntries(
    MATCH_CRITERIA_LABELS.map((label) => [label, stored?.[label] ?? 0]),
  ) as Weights
}

export function AdminMatchingRules() {
  const [weights, setWeights] = useState<Weights | null>(null)
  const [saved, setSaved] = useState<Weights | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const load = () => {
    setLoading(true)
    setError("")
    api
      .get<ApiOrgSettings>("/api/org-settings")
      .then((settings) => {
        const next = toWeights(settings.matchWeights)
        setWeights(next)
        setSaved(next)
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load matching rules"))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const total = weights ? Object.values(weights).reduce((sum, w) => sum + w, 0) : 0
  const dirty = weights !== null && saved !== null && MATCH_CRITERIA_LABELS.some((l) => weights[l] !== saved[l])
  const allZero = weights !== null && total === 0

  const save = async () => {
    if (!weights) return
    setSaving(true)
    try {
      const updated = await api.patch<ApiOrgSettings>("/api/org-settings", { matchWeights: weights })
      const next = toWeights(updated.matchWeights)
      setWeights(next)
      setSaved(next)
      toast.success("Matching rules saved", {
        description: "New scores use these weights. Existing matches keep the score they were created with.",
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save matching rules")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Matching rules</h1>
          <p className="mt-1 text-muted-foreground">
            Criteria weighting used to compute the Mutual Readiness Score for your organization's roles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <Button variant="outline" onClick={() => setWeights(saved)} disabled={saving}>
              Discard
            </Button>
          )}
          <Button onClick={save} disabled={!dirty || saving || allZero}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : weights ? (
        <>
          {allZero ? (
            <Callout tone="warning">
              <span className="font-semibold">Every weight is zero.</span> At least one criterion must carry weight
              before this can be saved.
            </Callout>
          ) : total === 100 ? (
            <div className="rounded-lg border border-border bg-muted p-4 text-sm font-semibold text-muted-foreground">
              Total weight: {total}%
            </div>
          ) : (
            <Callout tone="info">
              <span className="font-semibold">Total weight: {total}%</span> — scores are normalised by the total, so
              they stay on a 0–100 scale. 100% just makes the split easier to read.
            </Callout>
          )}

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="space-y-6">
              {MATCH_CRITERIA_LABELS.map((label) => (
                <div key={label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold">
                      {label}
                      {NO_SIGNAL_CRITERIA.has(label) && (
                        <span className="ml-2 font-normal text-muted-foreground">no data signal yet</span>
                      )}
                    </span>
                    <span className="font-bold">
                      {weights[label]}%
                      {total > 0 && total !== 100 && (
                        <span className="ml-2 font-normal text-muted-foreground">
                          {Math.round((weights[label] / total) * 100)}% effective
                        </span>
                      )}
                    </span>
                  </div>
                  <Slider
                    value={[weights[label]]}
                    min={0}
                    max={50}
                    step={1}
                    disabled={saving}
                    onValueChange={([v]) => setWeights((prev) => (prev ? { ...prev, [label]: v } : prev))}
                  />
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Five criteria are marked "no data signal yet": the scoring engine returns a fixed neutral value for them
            because nothing in the candidate profile supplies the underlying data. Weighting them redistributes a
            constant until that changes — tracked in issue #57.
          </p>
        </>
      ) : null}
    </div>
  )
}
