import { count, desc } from 'drizzle-orm'
import { z } from 'zod'
import { organizationSubscription } from '../../database/schema/platform'
import { computeOrgUsage } from '../../utils/orgUsage'
import { requirePlatformAdmin } from '../../utils/requirePlatformAdmin'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

/**
 * GET /api/platform/usage — platform-admin only.
 * Current-period usage vs. plan limits for every subscribed organization,
 * for the "Usage" overview screen. Orgs with no plan assigned are omitted
 * (there is nothing to measure usage against).
 */
export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)

  const query = await getValidatedQuery(event, querySchema.parse)
  const offset = (query.page - 1) * query.limit

  const subscriptions = await db.query.organizationSubscription.findMany({
    orderBy: [desc(organizationSubscription.updatedAt)],
    limit: query.limit,
    offset,
    with: {
      organization: { columns: { id: true, name: true, slug: true } },
    },
  })

  const [data, [totalRow]] = await Promise.all([
    Promise.all(subscriptions.map(async (sub) => {
      const usage = await computeOrgUsage(sub.organizationId)
      return { organization: sub.organization, ...usage }
    })),
    db.select({ total: count() }).from(organizationSubscription),
  ])

  return { data, total: totalRow?.total ?? 0, page: query.page, limit: query.limit }
})
