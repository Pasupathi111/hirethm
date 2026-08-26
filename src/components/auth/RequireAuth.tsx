import { Loader2 } from "lucide-react"
import { Navigate, Outlet } from "react-router-dom"

import { useSession } from "@/lib/authClient"

export function RequireAuth() {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!session) return <Navigate to="/employer/sign-in" replace />

  if (!session.session.activeOrganizationId) {
    return <Navigate to="/onboarding/create-org" replace />
  }

  return <Outlet />
}
