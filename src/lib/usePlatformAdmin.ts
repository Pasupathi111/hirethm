import { useEffect, useState } from "react"

import { api } from "@/lib/api"
import { useSession } from "@/lib/authClient"

/**
 * Whether the signed-in user has the HireThm-internal platform-admin flag
 * (issue #43).
 *
 * Shared by RequirePlatformAdmin (route guard) and AdminSidebar (nav
 * filtering) so both agree on a single source of truth.
 *
 * This is a UX convenience only — the real boundary is server-side
 * `requirePlatformAdmin()` on every /api/platform/* endpoint. Never rely on
 * this alone to protect data.
 */
export function usePlatformAdmin(): { isPlatformAdmin: boolean; isPending: boolean } {
  const { data: session, isPending: sessionPending } = useSession()
  // Keyed by user id so a sign-out/sign-in as a different account can never
  // reuse the previous user's answer while the new fetch is in flight.
  const [result, setResult] = useState<{ userId: string; isPlatformAdmin: boolean } | null>(null)

  useEffect(() => {
    if (!session) return
    const userId = session.user.id
    let cancelled = false

    api
      .get<{ isPlatformAdmin: boolean }>("/api/platform/me")
      .then((res) => { if (!cancelled) setResult({ userId, isPlatformAdmin: res.isPlatformAdmin }) })
      // Fail closed: an unreachable endpoint must never imply admin access.
      .catch(() => { if (!cancelled) setResult({ userId, isPlatformAdmin: false }) })

    return () => { cancelled = true }
  }, [session])

  // Derived during render rather than via setState-in-effect, so the
  // signed-out case resolves immediately with no extra render pass.
  if (sessionPending) return { isPlatformAdmin: false, isPending: true }
  if (!session) return { isPlatformAdmin: false, isPending: false }

  const isFresh = result?.userId === session.user.id
  return {
    isPlatformAdmin: isFresh ? result.isPlatformAdmin : false,
    isPending: !isFresh,
  }
}
