import { StatusBadge } from "@/components/feedback/StatusBadge"
import { systemServices } from "@/data/mockData"
import { cn } from "@/lib/utils"

const dotTone: Record<string, string> = {
  Healthy: "bg-primary",
  Degraded: "bg-warning",
  Down: "bg-destructive",
}

const bottomStats = [
  { label: "Failed AI jobs (24h)", value: "12", tone: "text-destructive" },
  { label: "Failed notifications", value: "4", tone: "text-warning" },
  { label: "Queue backlog", value: "1,204", tone: "text-foreground" },
  { label: "Consent breaches", value: "0", tone: "text-primary" },
]

export function AdminSystemHealth() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">System health</h1>
        <p className="mt-1 text-muted-foreground">Live service state · updated 12 seconds ago</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {systemServices.map((s) => (
          <div key={s.name} className="rounded-lg border border-border bg-card p-5">
            <p className="flex items-center gap-2 font-bold">
              <span className={cn("size-2 rounded-full", dotTone[s.status])} />
              {s.name}
            </p>
            <span className="mt-2 inline-block">
              <StatusBadge status={s.status} />
            </span>
            <p className="mt-2 text-sm text-muted-foreground">{s.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {bottomStats.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={cn("font-display mt-1 text-3xl font-semibold tracking-[-0.02em]", s.tone)}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
