import { Loader2 } from "lucide-react"
import { Navigate, Outlet } from "react-router-dom"

import { useSession } from "@/lib/authClient"
import { usePlatformAdmin } from "@/lib/usePlatformAdmin"

function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  )
}

export function RequireAuth() {
  const { data: session, isPending } = useSession()
  const { isPlatformAdmin, isPending: adminPending } = usePlatformAdmin()

  if (isPending) return <FullScreenSpinner />

  if (!session) return <Navigate to="/employer/sign-in" replace />

  if (!session.session.activeOrganizationId) {
    // Platform admins are HireThm staff, not members of any client org (see
    // RequirePlatformAdmin). Bouncing them into the employer org-creation
    // flow locked them out of the console entirely, so resolve the flag
    // before deciding — /api/platform/me lands a tick after the session.
    if (adminPending) return <FullScreenSpinner />
    if (isPlatformAdmin) return <Outlet />
    return <Navigate to="/onboarding/create-org" replace />
  }

  return <Outlet />
}
