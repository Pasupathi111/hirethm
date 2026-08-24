import { cn } from "@/lib/utils"
import { systemServices } from "@/data/mockData"

const dotTone: Record<string, string> = {
  Healthy: "bg-emerald-500",
  Degraded: "bg-amber-500",
  Down: "bg-red-500",
}

const badgeTone: Record<string, string> = {
  Healthy: "bg-emerald-50 text-emerald-700",
  Degraded: "bg-amber-50 text-amber-700",
  Down: "bg-red-50 text-red-700",
}

const bottomStats = [
  { label: "Failed AI jobs (24h)", value: "12", tone: "text-red-600" },
  { label: "Failed notifications", value: "4", tone: "text-amber-600" },
  { label: "Queue backlog", value: "1,204", tone: "text-foreground" },
  { label: "Consent breaches", value: "0", tone: "text-emerald-600" },
]

export function AdminSystemHealth() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">System health</h1>
        <p className="mt-1 text-muted-foreground">Live service state · updated 12 seconds ago</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {systemServices.map((s) => (
          <div key={s.name} className="rounded-2xl border border-border bg-card p-5">
            <p className="flex items-center gap-2 font-bold">
              <span className={cn("size-2 rounded-full", dotTone[s.status])} />
              {s.name}
            </p>
            <span className={cn("mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold", badgeTone[s.status])}>
              {s.status}
            </span>
            <p className="mt-2 text-sm text-muted-foreground">{s.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {bottomStats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={cn("mt-1 text-3xl font-extrabold", s.tone)}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
