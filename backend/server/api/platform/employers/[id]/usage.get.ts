import { z } from 'zod'
import { computeOrgUsage } from '../../../../utils/orgUsage'
import { requirePlatformAdmin } from '../../../../utils/requirePlatformAdmin'

const paramsSchema = z.object({ id: z.string().min(1) })

/**
 * GET /api/platform/employers/:id/usage — platform-admin only.
 * Current-billing-period usage vs. the org's active plan limits (BRD §4.7).
 */
export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)

  const { id } = await getValidatedRouterParams(event, paramsSchema.parse)

  return computeOrgUsage(id)
})
