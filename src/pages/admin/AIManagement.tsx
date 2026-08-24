import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

const models = [
  { name: "Resume extraction", model: "hirethm-extract-v3", status: true },
  { name: "Mutual Readiness scoring", model: "hirethm-match-v5", status: true },
  { name: "JD enhancement", model: "hirethm-enhance-v2", status: true },
  { name: "Skill inference", model: "hirethm-skills-v4", status: false },
]

export function AdminAIManagement() {
  const [enabled, setEnabled] = useState(models.map((m) => m.status))
  const [provider, setProvider] = useState("primary")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">AI management</h1>
        <p className="mt-1 text-muted-foreground">Control which AI pipelines are active and which provider serves them.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">AI provider</p>
            <p className="text-sm text-muted-foreground">Elevated latency reported on the primary provider.</p>
          </div>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Primary provider</SelectItem>
              <SelectItem value="fallback">Fallback provider</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-bold">Pipelines</h2>
        <div className="mt-4 divide-y divide-border">
          {models.map((m, i) => (
            <div key={m.name} className="flex items-center justify-between py-4">
              <div>
                <p className="font-semibold">{m.name}</p>
                <p className="font-mono text-xs text-muted-foreground">{m.model}</p>
              </div>
              <Switch
                checked={enabled[i]}
                onCheckedChange={(v) => {
                  setEnabled((prev) => prev.map((val, idx) => (idx === i ? v : val)))
                  toast(`${m.name} ${v ? "enabled" : "disabled"}`)
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <Button onClick={() => toast.success("AI configuration saved")}>Save configuration</Button>
    </div>
  )
}
