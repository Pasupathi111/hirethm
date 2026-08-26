import type { H3Event } from 'h3'
import { eq } from 'drizzle-orm'
import { user } from '../database/schema/auth'

/**
 * ─────────────────────────────────────────────────────────────────────
 * requirePlatformAdmin — gates the HireThm-internal cross-tenant admin
 * console (all organizations, plans, payments, usage, etc).
 * ─────────────────────────────────────────────────────────────────────
 *
 * This is a COMPLETELY SEPARATE authorization boundary from
 * `requirePermission()`. `requirePermission` checks a user's role within
 * their *active organization* — it can never grant cross-tenant access.
 * `requirePlatformAdmin` checks a flag on the user row itself
 * (`user.isPlatformAdmin`), set only via the `grant-platform-admin` script,
 * never through any self-service flow.
 *
 * Never mix the two: a platform admin route must call this, never
 * `requirePermission`, and vice versa. Mixing them risks either leaking
 * cross-tenant data through an org-scoped check, or accidentally requiring
 * org membership for a platform-wide route.
 *
 * Usage:
 * ```ts
 * const { user: platformUser } = await requirePlatformAdmin(event)
 * ```
 */
export async function requirePlatformAdmin(event: H3Event) {
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const record = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
    columns: { id: true, isPlatformAdmin: true },
  })

  if (!record?.isPlatformAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: platform admin access required' })
  }

  return session
}
