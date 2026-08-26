import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { organization, plan, organizationSubscription } from '../../../../database/schema'
import { requirePlatformAdmin } from '../../../../utils/requirePlatformAdmin'
import { assignSubscriptionSchema } from '../../../../utils/schemas/plan'

const paramsSchema = z.object({ id: z.string().min(1) })

/**
 * PATCH /api/platform/employers/:id/subscription — platform-admin only.
 * Assigns or changes an organization's plan. Upserts — creates the
 * subscription row if the org has none yet.
 */
export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)

  const { id } = await getValidatedRouterParams(event, paramsSchema.parse)
  const body = await readValidatedBody(event, assignSubscriptionSchema.parse)

  const [org, targetPlan] = await Promise.all([
    db.query.organization.findFirst({ where: eq(organization.id, id), columns: { id: true } }),
    db.query.plan.findFirst({ where: eq(plan.id, body.planId), columns: { id: true } }),
  ])

  if (!org) throw createError({ statusCode: 404, statusMessage: 'Organization not found' })
  if (!targetPlan) throw createError({ statusCode: 404, statusMessage: 'Plan not found' })

  const existing = await db.query.organizationSubscription.findFirst({
    where: eq(organizationSubscription.organizationId, id),
    columns: { id: true },
  })

  const [result] = existing
    ? await db.update(organizationSubscription)
        .set({ planId: body.planId, status: body.status ?? 'active', updatedAt: new Date() })
        .where(eq(organizationSubscription.organizationId, id))
        .returning()
    : await db.insert(organizationSubscription)
        .values({ organizationId: id, planId: body.planId, status: body.status ?? 'active' })
        .returning()

  return result
})
