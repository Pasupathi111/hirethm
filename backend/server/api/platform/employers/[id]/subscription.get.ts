import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { organizationSubscription } from '../../../../database/schema'
import { requirePlatformAdmin } from '../../../../utils/requirePlatformAdmin'

const paramsSchema = z.object({ id: z.string().min(1) })

/**
 * GET /api/platform/employers/:id/subscription — platform-admin only.
 * Returns null (not 404) when the org has no plan assigned yet.
 */
export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)

  const { id } = await getValidatedRouterParams(event, paramsSchema.parse)

  const subscription = await db.query.organizationSubscription.findFirst({
    where: eq(organizationSubscription.organizationId, id),
    with: { plan: true },
  })

  return subscription ?? null
})
