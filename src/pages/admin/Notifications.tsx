import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

const templates = [
  { name: "New match notification", channel: "Email + In-app", enabled: true },
  { name: "Interview slot proposed", channel: "Email + In-app", enabled: true },
  { name: "Application status change", channel: "In-app", enabled: true },
  { name: "CV analysis complete", channel: "In-app", enabled: false },
  { name: "Weekly digest", channel: "Email", enabled: true },
]

export function AdminNotifications() {
  const [rows, setRows] = useState(templates)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Notification templates</h1>
          <p className="mt-1 text-muted-foreground">Platform-wide notification channels sent to candidates and employers.</p>
        </div>
        <Button onClick={() => toast.success("Templates saved")}>Save changes</Button>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="divide-y divide-border">
          {rows.map((row, i) => (
            <div key={row.name} className="flex items-center justify-between p-5">
              <div>
                <p className="font-semibold">{row.name}</p>
                <p className="text-sm text-muted-foreground">{row.channel}</p>
              </div>
              <Switch
                checked={row.enabled}
                onCheckedChange={(v) => setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, enabled: v } : r)))}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
