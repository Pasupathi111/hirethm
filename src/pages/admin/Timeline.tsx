import { StatusBadge } from "@/components/feedback/StatusBadge"
import { timelineEvents } from "@/data/mockData"

function groupByDay(events: typeof timelineEvents) {
  const groups = new Map<string, typeof timelineEvents>()
  for (const event of events) {
    const day = event.timestamp.split(",")[0]
    const list = groups.get(day) ?? []
    list.push(event)
    groups.set(day, list)
  }
  return Array.from(groups.entries())
}

export function AdminTimeline() {
  const grouped = groupByDay(timelineEvents)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Timeline</h1>
        <p className="mt-1 text-muted-foreground">Chronological feed of activity across the platform.</p>
      </div>

      <div className="space-y-8">
        {grouped.map(([day, events]) => (
          <div key={day}>
            <p className="mb-3 text-sm font-bold tracking-wide text-muted-foreground uppercase">{day}</p>
            <div className="space-y-0 rounded-lg border border-border bg-card">
              {events.map((event, i) => (
                <div key={event.id} className={`flex items-start gap-4 p-4 ${i > 0 ? "border-t border-hairline" : ""}`}>
                  <div className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1">
                    <p>
                      <span className="font-semibold">{event.actor}</span> {event.action}
                    </p>
                    <p className="text-sm text-muted-foreground">{event.resource}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-muted-foreground">{event.timestamp.split(", ")[1]}</span>
                    <StatusBadge status={event.category} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
