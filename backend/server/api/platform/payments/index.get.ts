import { desc, sql } from 'drizzle-orm'
import { z } from 'zod'
import { payment } from '../../../database/schema/platform'
import { requirePlatformAdmin } from '../../../utils/requirePlatformAdmin'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

/**
 * GET /api/platform/payments — platform-admin only.
 * Data-layer only — no live PayPal integration yet (see issue #17), so this
 * is initially empty. Rows appear once a real gateway or manual entry writes them.
 */
export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)

  const query = await getValidatedQuery(event, querySchema.parse)
  const offset = (query.page - 1) * query.limit

  const [rows, totalRows] = await Promise.all([
    db.query.payment.findMany({
      orderBy: [desc(payment.createdAt)],
      limit: query.limit,
      offset,
      with: {
        organization: { columns: { id: true, name: true, slug: true } },
        plan: { columns: { id: true, name: true } },
      },
    }),
    db.select({ total: sql<number>`count(*)::int` }).from(payment),
  ])

  return { data: rows, total: totalRows[0]?.total ?? 0, page: query.page, limit: query.limit }
})
