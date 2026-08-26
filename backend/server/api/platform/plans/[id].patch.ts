import { eq } from 'drizzle-orm'
import { plan } from '../../../database/schema'
import { requirePlatformAdmin } from '../../../utils/requirePlatformAdmin'
import { updatePlanSchema, planIdParamSchema } from '../../../utils/schemas/plan'

/**
 * PATCH /api/platform/plans/:id — update a subscription plan (platform-admin only).
 */
export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)

  const { id } = await getValidatedRouterParams(event, planIdParamSchema.parse)
  const body = await readValidatedBody(event, updatePlanSchema.parse)

  const [updated] = await db.update(plan)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(plan.id, id))
    .returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Plan not found' })
  }

  return updated
})
