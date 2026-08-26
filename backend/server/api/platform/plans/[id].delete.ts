import { eq } from 'drizzle-orm'
import { plan, organizationSubscription } from '../../../database/schema'
import { requirePlatformAdmin } from '../../../utils/requirePlatformAdmin'
import { planIdParamSchema } from '../../../utils/schemas/plan'

/**
 * DELETE /api/platform/plans/:id — platform-admin only.
 *
 * Refuses to delete a plan that's currently assigned to any organization
 * (the FK's onDelete:'restrict' would reject it anyway; this returns a
 * clear 409 instead of a raw DB constraint error).
 */
export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)

  const { id } = await getValidatedRouterParams(event, planIdParamSchema.parse)

  const inUse = await db.query.organizationSubscription.findFirst({
    where: eq(organizationSubscription.planId, id),
    columns: { id: true },
  })

  if (inUse) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Cannot delete a plan with active subscribers. Deactivate it instead (isActive: false).',
    })
  }

  const [deleted] = await db.delete(plan).where(eq(plan.id, id)).returning({ id: plan.id })

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Plan not found' })
  }

  return { success: true }
})
