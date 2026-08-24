import { StatCard } from "@/components/cards/StatCard"
import { Progress } from "@/components/ui/progress"
import { adminEmployers } from "@/data/mockData"

export function AdminUsage() {
  const totalApiCalls = 482910
  const aiJobsRun = 18492

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Usage</h1>
        <p className="mt-1 text-muted-foreground">Platform and per-employer resource consumption this billing cycle.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard value={totalApiCalls.toLocaleString()} label="API calls this month" hint="+12% vs last month" />
        <StatCard value={aiJobsRun.toLocaleString()} label="AI matching runs" hint="Nightly batch + on-demand" />
        <StatCard value="2.4 TB" label="Resume storage used" hint="of 5 TB allocated" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-bold">Plan usage by employer</h2>
        <p className="mt-1 text-sm text-muted-foreground">Percentage of monthly job posting quota consumed.</p>
        <div className="mt-5 space-y-4">
          {adminEmployers.map((e) => (
            <div key={e.id}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-semibold">{e.company}</span>
                <span className="text-muted-foreground">{e.usage}%</span>
              </div>
              <Progress value={e.usage} indicatorClassName={e.usage >= 90 ? "bg-destructive" : undefined} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
