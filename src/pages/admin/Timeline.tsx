import { useEffect, useState } from "react"

import { ErrorState } from "@/components/feedback/ErrorState"
import { Skeleton } from "@/components/feedback/Skeleton"
import { StatusBadge } from "@/components/feedback/StatusBadge"
import { ApiError, api } from "@/lib/api"
import type { ApiActivityLogItem, ApiActivityResourceType, ApiActivityTimelineResponse } from "@/types"

const actionLabel: Record<string, string> = {
  created: "created",
  updated: "updated",
  deleted: "deleted",
  status_changed: "changed the status of",
  comment_added: "commented on",
  member_invited: "invited a member to",
  member_removed: "removed a member from",
  member_role_changed: "changed the role on",
  scored: "scored",
  scheduled: "scheduled",
}

const resourceTypeLabel: Record<ApiActivityResourceType, string> = {
  job: "job",
  candidate: "candidate",
  application: "application",
  interview: "interview",
  member: "member",
}

function groupByDay(events: ApiActivityLogItem[]) {
  const groups = new Map<string, ApiActivityLogItem[]>()
  for (const event of events) {
    const day = new Date(event.createdAt).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
    const list = groups.get(day) ?? []
    list.push(event)
    groups.set(day, list)
  }
  return Array.from(groups.entries())
}

export function AdminTimeline() {
  const [events, setEvents] = useState<ApiActivityLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    setLoading(true)
    setError("")
    api
      .get<ApiActivityTimelineResponse>("/api/activity-log/timeline?limit=200")
      .then((res) => setEvents([...res.upcoming, ...res.items]))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load timeline"))
      .finally(() => setLoading(false))
  }, [])

  const grouped = groupByDay(events)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Timeline</h1>
        <p className="mt-1 text-muted-foreground">Chronological feed of activity in your organization.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : error ? (
        <ErrorState description={error} onRetry={() => window.location.reload()} />
      ) : (
        <div className="space-y-8">
          {grouped.map(([day, dayEvents]) => (
            <div key={day}>
              <p className="mb-3 text-sm font-bold tracking-wide text-muted-foreground uppercase">{day}</p>
              <div className="space-y-0 rounded-lg border border-border bg-card">
                {dayEvents.map((event, i) => (
                  <div key={event.id} className={`flex items-start gap-4 p-4 ${i > 0 ? "border-t border-hairline" : ""}`}>
                    <div className={`mt-1 size-2 shrink-0 rounded-full ${event.isUpcoming ? "bg-info" : "bg-primary"}`} />
                    <div className="min-w-0 flex-1">
                      <p>
                        <span className="font-semibold">{event.actorName ?? event.actorEmail ?? "System"}</span>{" "}
                        {event.isUpcoming ? "has an upcoming" : actionLabel[event.action] ?? event.action}{" "}
                        {resourceTypeLabel[event.resourceType] ?? event.resourceType}
                        {event.resourceName ? `: ${event.resourceName}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-muted-foreground">{new Date(event.createdAt).toLocaleTimeString()}</span>
                      <StatusBadge status={event.isUpcoming ? "Upcoming" : (resourceTypeLabel[event.resourceType] ?? event.resourceType)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {grouped.length === 0 && (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No activity recorded yet.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
