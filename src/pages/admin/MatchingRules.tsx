import { useState } from "react"
import { toast } from "sonner"

import { Callout } from "@/components/feedback/Callout"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

const initialWeights = [
  { key: "Skills Match", value: 25 },
  { key: "Experience Match", value: 20 },
  { key: "Career Goals", value: 15 },
  { key: "Location Preference", value: 15 },
  { key: "Salary Fit", value: 10 },
  { key: "Availability", value: 5 },
  { key: "Culture & Role Fit", value: 5 },
  { key: "Potential & Growth", value: 5 },
]

export function AdminMatchingRules() {
  const [weights, setWeights] = useState(initialWeights)

  const total = weights.reduce((sum, w) => sum + w.value, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Matching rules</h1>
          <p className="mt-1 text-muted-foreground">Criteria weighting used to compute the Mutual Readiness Score.</p>
        </div>
        <Button onClick={() => toast.success("Matching rules saved")}>Save changes</Button>
      </div>

      {total === 100 ? (
        <div className="rounded-2xl border border-border bg-muted p-4 text-sm font-semibold text-muted-foreground">
          Total weight: {total}%
        </div>
      ) : (
        <Callout tone="warning">
          <span className="font-semibold">Total weight: {total}%</span> — weights should sum to 100%
        </Callout>
      )}

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="space-y-6">
          {weights.map((w, i) => (
            <div key={w.key}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold">{w.key}</span>
                <span className="font-bold">{w.value}%</span>
              </div>
              <Slider
                value={[w.value]}
                min={0}
                max={50}
                step={1}
                onValueChange={([v]) => setWeights((prev) => prev.map((item, idx) => (idx === i ? { ...item, value: v } : item)))}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
