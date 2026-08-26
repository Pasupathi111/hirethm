import { Loader2 } from "lucide-react"
import { Navigate, Outlet } from "react-router-dom"

import { useSession } from "@/lib/authClient"
import { usePlatformAdmin } from "@/lib/usePlatformAdmin"

/**
 * Guards the HireThm-internal cross-tenant platform-admin console.
 *
 * Deliberately independent of RequireAuth's org-membership check — a
 * platform admin is HireThm staff, not necessarily a member of any client
 * organization, so this only requires a valid session plus the
 * `isPlatformAdmin` flag from GET /api/platform/me.
 *
 * This is defence-in-depth, not the security boundary: every
 * /api/platform/* endpoint independently calls requirePlatformAdmin()
 * server-side, so bypassing this guard still yields no data.
 */
export function RequirePlatformAdmin() {
  const { data: session } = useSession()
  const { isPlatformAdmin, isPending } = usePlatformAdmin()

  if (isPending) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!session) return <Navigate to="/admin/login" replace />
  // Authenticated, just not HireThm staff — send them back to their own org
  // dashboard rather than the public marketing site.
  if (!isPlatformAdmin) return <Navigate to="/admin" replace />

  return <Outlet />
}
