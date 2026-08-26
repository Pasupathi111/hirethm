import { useEffect, useState } from "react"

import { EmptyState } from "@/components/feedback/EmptyState"
import { ErrorState } from "@/components/feedback/ErrorState"
import { Skeleton } from "@/components/feedback/Skeleton"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import type { ApiChangeKind, ApiPlatformUpdates } from "@/types"

const kindLabel: Record<ApiChangeKind, string> = {
  feature: "Feature",
  improvement: "Improvement",
  fix: "Fix",
  removal: "Removed",
  other: "Other",
}

const kindVariant: Record<ApiChangeKind, "success" | "info" | "warning" | "default"> = {
  feature: "success",
  improvement: "info",
  fix: "warning",
  removal: "default",
  other: "default",
}

function formatDate(date: string | null): string | null {
  if (!date) return null
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
}

export function AdminUpdates() {
  const [data, setData] = useState<ApiPlatformUpdates | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = () => {
    setLoading(true)
    setError("")
    api
      .get<ApiPlatformUpdates>("/api/platform/updates")
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load release notes"))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Updates</h1>
        <p className="mt-1 text-muted-foreground">
          Release notes for the running build
          {data?.currentVersion ? ` — currently v${data.currentVersion}` : ""}.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : !data || data.entries.length === 0 ? (
        <EmptyState
          title="No release notes"
          description="This deployment has no CHANGELOG.md bundled with it, so there is nothing to show."
        />
      ) : (
        <div className="space-y-4">
          {data.entries.map((entry) => {
            const date = formatDate(entry.date)
            const isCurrent = entry.version !== null && entry.version === data.currentVersion
            return (
              <div key={`${entry.title}-${entry.date}`} className="rounded-lg border border-border bg-card p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-bold">
                    {entry.link ? (
                      <a href={entry.link} target="_blank" rel="noreferrer" className="hover:underline">
                        {entry.title}
                      </a>
                    ) : (
                      entry.title
                    )}
                  </h2>
                  {isCurrent && <Badge variant="success">Running</Badge>}
                  {date && <span className="text-sm text-muted-foreground">{date}</span>}
                </div>

                {entry.sections.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">No itemised changes recorded for this release.</p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {entry.sections.map((section) => (
                      <div key={section.heading}>
                        <Badge variant={kindVariant[section.kind]}>{kindLabel[section.kind]}</Badge>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                          {section.items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
