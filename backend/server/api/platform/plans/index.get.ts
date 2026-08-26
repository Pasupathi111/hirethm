import { asc, sql } from 'drizzle-orm'
import { plan, organizationSubscription } from '../../../database/schema'
import { requirePlatformAdmin } from '../../../utils/requirePlatformAdmin'

/**
 * GET /api/platform/plans
 *
 * Every subscription plan on the platform, with a count of organizations
 * currently subscribed to each — platform-admin only.
 */
export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)

  const plans = await db.query.plan.findMany({ orderBy: [asc(plan.createdAt)] })

  const subCounts = await db
    .select({ planId: organizationSubscription.planId, count: sql<number>`count(*)::int` })
    .from(organizationSubscription)
    .groupBy(organizationSubscription.planId)

  const countMap = new Map(subCounts.map(r => [r.planId, r.count]))

  return { data: plans.map(p => ({ ...p, subscriberCount: countMap.get(p.id) ?? 0 })) }
})
