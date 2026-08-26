import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { payment } from '../../../database/schema/platform'
import { requirePlatformAdmin } from '../../../utils/requirePlatformAdmin'

const paramsSchema = z.object({ id: z.string().min(1) })

/**
 * GET /api/platform/payments/:id — platform-admin only.
 */
export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)

  const { id } = await getValidatedRouterParams(event, paramsSchema.parse)

  const result = await db.query.payment.findFirst({
    where: eq(payment.id, id),
    with: {
      organization: { columns: { id: true, name: true, slug: true } },
      plan: { columns: { id: true, name: true } },
    },
  })

  if (!result) {
    throw createError({ statusCode: 404, statusMessage: 'Payment not found' })
  }

  return result
})
