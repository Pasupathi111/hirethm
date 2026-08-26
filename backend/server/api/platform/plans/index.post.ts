import { plan } from '../../../database/schema'
import { requirePlatformAdmin } from '../../../utils/requirePlatformAdmin'
import { createPlanSchema } from '../../../utils/schemas/plan'

/**
 * POST /api/platform/plans — create a new subscription plan (platform-admin only).
 */
export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)

  const body = await readValidatedBody(event, createPlanSchema.parse)

  const [created] = await db.insert(plan).values(body).returning()

  setResponseStatus(event, 201)
  return created
})
