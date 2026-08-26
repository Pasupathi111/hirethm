import { useEffect, useState } from "react"

import { ErrorState } from "@/components/feedback/ErrorState"
import { Skeleton } from "@/components/feedback/Skeleton"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { ApiPermissionResource, ApiPlatformPermissions } from "@/types"

const ACTION_INITIAL: Record<string, string> = {
  create: "C",
  read: "R",
  update: "U",
  delete: "D",
}

/**
 * Summarise a role's grants on one resource. "Full" only when the role holds
 * every action the access controller defines for that resource — anything
 * less is spelled out, because "Full" on a partial grant is exactly the kind
 * of overstatement this screen used to make.
 */
function summarise(resource: ApiPermissionResource, role: string) {
  const granted = resource.grants[role] ?? []
  if (granted.length === 0) return { label: "None", tone: "text-muted-foreground", detail: "" }
  if (granted.length === resource.allActions.length) {
    return { label: "Full", tone: "text-primary font-bold", detail: granted.map((a) => ACTION_INITIAL[a] ?? a).join("") }
  }
  if (granted.length === 1 && granted[0] === "read") {
    return { label: "Read", tone: "text-info font-semibold", detail: "R" }
  }
  return {
    label: "Partial",
    tone: "text-warning-foreground font-semibold",
    detail: granted.map((a) => ACTION_INITIAL[a] ?? a).join(""),
  }
}

export function AdminRolesPermissions() {
  const [data, setData] = useState<ApiPlatformPermissions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = () => {
    setLoading(true)
    setError("")
    api
      .get<ApiPlatformPermissions>("/api/platform/permissions")
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load the permission model"))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Roles and permissions</h1>
        <p className="mt-1 text-muted-foreground">
          The live access-control model, read from the same definitions the server enforces with.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : data ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            {data.orgRoles.map((role) => (
              <div key={role.name} className="rounded-lg border border-border bg-card p-5">
                <p className="font-bold">{role.label}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{role.name}</p>
                <p className="mt-2 text-sm text-muted-foreground">{role.description}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-hairline p-6">
              <h2 className="text-lg font-bold">Organization roles</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Scoped to a single organization. No organization role grants access to another tenant's data, whatever
                it says below. Letters show the exact actions: C reate · R ead · U pdate · D elete.
              </p>
            </div>
            <div className="overflow-x-auto">
              <Table className="min-w-[560px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource</TableHead>
                    {data.orgRoles.map((role) => (
                      <TableHead key={role.name}>{role.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.resources.map((resource) => (
                    <TableRow key={resource.key}>
                      <TableCell className="font-semibold">{resource.label}</TableCell>
                      {data.orgRoles.map((role) => {
                        const cell = summarise(resource, role.name)
                        return (
                          <TableCell key={role.name} className={cn(cell.tone)}>
                            {cell.label}
                            {cell.detail && (
                              <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                                {cell.detail}
                              </span>
                            )}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-bold">{data.platformAdmin.label}</h2>
              <Badge variant="dark">Separate boundary</Badge>
              {!data.platformAdmin.selfService && <Badge variant="outline">Not self-service</Badge>}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{data.platformAdmin.description}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Granted by: <span className="font-mono">{data.platformAdmin.grantedBy}</span>
            </p>
          </div>

          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {data.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  )
}
