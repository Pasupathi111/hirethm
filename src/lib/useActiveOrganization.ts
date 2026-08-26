import { useEffect, useState } from "react"

import { api } from "@/lib/api"
import { useSession } from "@/lib/authClient"

export interface ActiveOrganization {
  id: string
  name: string
  slug: string
  logo: string | null
}

/**
 * The organization the current session is acting as.
 *
 * better-auth's session carries only `activeOrganizationId`, so the name has
 * to be resolved against the member's organization list. Platform admins have
 * no organization at all and get `null` here — callers must handle that rather
 * than assuming a company is always present.
 */
export function useActiveOrganization(): {
  organization: ActiveOrganization | null
  isPending: boolean
} {
  const { data: session, isPending: sessionPending } = useSession()
  const activeId = session?.session.activeOrganizationId ?? null
  // Keyed by org id so switching organizations can never briefly show the
  // previous company's name while the new list is in flight.
  const [result, setResult] = useState<{ id: string; org: ActiveOrganization | null } | null>(null)

  useEffect(() => {
    if (!activeId) return
    let cancelled = false

    api
      .get<ActiveOrganization[]>("/api/auth/organization/list")
      .then((orgs) => {
        if (cancelled) return
        setResult({ id: activeId, org: orgs.find((o) => o.id === activeId) ?? null })
      })
      .catch(() => { if (!cancelled) setResult({ id: activeId, org: null }) })

    return () => { cancelled = true }
  }, [activeId])

  if (sessionPending) return { organization: null, isPending: true }
  if (!activeId) return { organization: null, isPending: false }

  const isFresh = result?.id === activeId
  return { organization: isFresh ? result.org : null, isPending: !isFresh }
}
