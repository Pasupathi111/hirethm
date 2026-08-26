import { readChangelog } from '../../utils/changelog'

/**
 * GET /api/platform/updates
 *
 * Release notes for the running build, for the HireThm admin console's
 * "Updates" screen. Read-only and identical for every viewer, so it needs a
 * session but nothing more.
 *
 * Deliberately NOT `requireAuth()`: that helper also demands an active
 * organization, and platform-admin staff belong to none (see
 * `server/utils/requirePlatformAdmin.ts`), so it would 403 exactly the people
 * most likely to read this page.
 *
 * The data source is the deployed build's own CHANGELOG.md — no editorial
 * layer, no CMS. If a release is not in the changelog it does not appear here.
 */
export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { entries, currentVersion } = await readChangelog({ stripRefs: true })

  return { entries, currentVersion }
})
