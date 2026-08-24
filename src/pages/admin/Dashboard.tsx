import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const stats = [
  { label: "Total candidates", value: "12,842", change: "+312 this week", positive: true },
  { label: "Active employers", value: "426", change: "+8 this week", positive: true },
  { label: "Active jobs", value: "1,284", change: "+64 this week", positive: true },
  { label: "Applications", value: "18,492", change: "+1,204 this week", positive: true },
  { label: "AI matches", value: "8,291", change: "+486 this week", positive: true },
  { label: "Interviews", value: "1,284", change: "-18 this week", positive: false },
]

const funnel = [
  { label: "Jobs published", value: "1,284", percent: 100, tone: "bg-secondary" },
  { label: "Applications", value: "18,492", percent: 92, tone: "bg-secondary" },
  { label: "AI matches created", value: "8,291", percent: 68, tone: "bg-secondary" },
  { label: "Candidate accepted", value: "5,104", percent: 48, tone: "bg-primary/60" },
  { label: "Employer shortlisted", value: "2,860", percent: 30, tone: "bg-primary/80" },
  { label: "Interviews scheduled", value: "1,284", percent: 16, tone: "bg-primary" },
]

const alerts = [
  { level: "Critical", title: "PayPal webhook signature", time: "23 Aug · 03:02 · 48 events" },
  { level: "Error", title: "AI execution failed: CV Enhancement", time: "23 Aug · 10:04 · 12 events" },
  { level: "Warning", title: "Notification retry exhausted", time: "18 Aug · 03:02 · 4 events" },
  { level: "Warning", title: "Queue backlog above threshold", time: "23 Aug · 09:50 · ongoing" },
]

export function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Platform overview</h1>
        <p className="mt-1 text-muted-foreground">Week of 17–23 August 2026 · all figures live</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-2xl font-extrabold">{s.value}</p>
            <p className={`mt-1 text-xs font-semibold ${s.positive ? "text-emerald-600" : "text-red-600"}`}>{s.change}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {["Candidate growth", "Employer growth", "Jobs published"].map((label, i) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <p className="font-bold">{label}</p>
              <p className="text-xl font-extrabold">{[12842, 426, 1284][i].toLocaleString()}</p>
            </div>
            <svg viewBox="0 0 200 60" className="mt-4 h-16 w-full">
              <polyline
                points="0,50 40,42 80,35 120,26 160,15 200,5"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2.5"
              />
            </svg>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Mar</span>
              <span>May</span>
              <span>Jul</span>
              <span>Aug</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold">Match and application funnel</h2>
          <p className="mt-1 text-sm text-muted-foreground">Candidate consent sits between match creation and employer visibility.</p>
          <div className="mt-5 space-y-4">
            {funnel.map((f) => (
              <div key={f.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted-foreground">{f.label}</span>
                  <span className="font-bold">{f.value}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full ${f.tone}`} style={{ width: `${f.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold">Needs attention</h2>
            <div className="mt-4 space-y-3">
              {alerts.map((a) => (
                <div key={a.title} className="flex items-start gap-3 border-b border-border pb-3 last:border-0">
                  <Badge
                    variant={a.level === "Critical" ? "destructive" : a.level === "Error" ? "destructive" : "warning"}
                  >
                    {a.level}
                  </Badge>
                  <div>
                    <p className="text-sm font-semibold">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link to="/admin/system-health">Open system health</Link>
            </Button>
          </div>

          <div className="rounded-2xl bg-secondary p-6 text-secondary-foreground">
            <p className="text-xs font-bold tracking-wide text-emerald-400 uppercase">Consent integrity</p>
            <p className="mt-2 text-3xl font-extrabold">0 breaches</p>
            <p className="mt-1 text-sm text-white/60">
              No employer accessed a candidate profile without consent in the last 90 days. 8,291 transitions audited.
            </p>
            <Button asChild variant="outline" className="mt-4 w-full bg-white text-secondary hover:bg-white/90">
              <Link to="/admin/audit-logs">Review audit log</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
