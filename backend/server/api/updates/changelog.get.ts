import { readChangelog } from '../../utils/changelog'

/**
 * GET /api/updates/changelog
 *
 * Parses CHANGELOG.md and returns structured changelog entries.
 * Requires authentication.
 *
 * Parsing lives in `server/utils/changelog.ts`, shared with
 * `GET /api/platform/updates`. Output here is unchanged: commit references are
 * kept intact for this consumer (`app/pages/dashboard/updates.vue`).
 */
export default defineEventHandler(async (event) => {
  await requireAuth(event)

  return readChangelog()
})
