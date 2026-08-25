import { useState } from "react"
import { toast } from "sonner"

import { SettingRow } from "@/components/forms/SettingRow"
import { Badge } from "@/components/ui/badge"
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
        <h1 className="text-3xl">AI management</h1>
        <p className="mt-1 text-muted-foreground">Control which AI pipelines are active and which provider serves them.</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <SettingRow
          label="AI provider"
          description="Elevated latency reported on the primary provider."
          control={
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary provider</SelectItem>
                <SelectItem value="fallback">Fallback provider</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2>Pipelines</h2>
        <div className="mt-2">
          {models.map((m, i) => (
            <SettingRow
              key={m.name}
              label={
                <span className="flex items-center gap-2">
                  {m.name}
                  <Badge variant="ai">AI</Badge>
                </span>
              }
              description={<span className="font-mono text-xs">{m.model}</span>}
              control={
                <Switch
                  checked={enabled[i]}
                  onCheckedChange={(v) => {
                    setEnabled((prev) => prev.map((val, idx) => (idx === i ? v : val)))
                    toast(`${m.name} ${v ? "enabled" : "disabled"}`)
                  }}
                />
              }
            />
          ))}
        </div>
      </div>

      <Button onClick={() => toast.success("AI configuration saved")}>Save configuration</Button>
    </div>
  )
}
