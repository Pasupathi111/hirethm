import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Navigate, Outlet } from "react-router-dom"

import { useSession } from "@/lib/authClient"
import { api } from "@/lib/api"

/**
 * Guards the HireThm-internal cross-tenant platform-admin console.
 *
 * Deliberately independent of RequireAuth's org-membership check — a
 * platform admin is HireThm staff, not necessarily a member of any client
 * organization, so this only requires a valid session plus the
 * `isPlatformAdmin` flag from GET /api/platform/me.
 */
export function RequirePlatformAdmin() {
  const { data: session, isPending } = useSession()
  const [isPlatformAdmin, setIsPlatformAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    if (!session) return
    api
      .get<{ isPlatformAdmin: boolean }>("/api/platform/me")
      .then((res) => setIsPlatformAdmin(res.isPlatformAdmin))
      .catch(() => setIsPlatformAdmin(false))
  }, [session])

  if (isPending || (session && isPlatformAdmin === null)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!session) return <Navigate to="/sign-in" replace />
  if (!isPlatformAdmin) return <Navigate to="/" replace />

  return <Outlet />
}
