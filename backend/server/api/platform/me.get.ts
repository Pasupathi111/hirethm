/**
 * GET /api/platform/me
 *
 * Lets the frontend check whether the signed-in user has HireThm-internal
 * platform-admin access, to decide whether to show/guard the cross-tenant
 * admin console routes. Returns 401 if not signed in, 200 with
 * `{ isPlatformAdmin: false }` (not 403) if signed in but not a platform
 * admin — this is a status check, not a gated action.
 */
export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const record = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.id, session.user.id),
    columns: { isPlatformAdmin: true },
  })

  return { isPlatformAdmin: record?.isPlatformAdmin ?? false }
})
