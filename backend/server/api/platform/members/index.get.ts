import { eq, sql, and, ilike, or, inArray, count, type SQL } from 'drizzle-orm'
import { z } from 'zod'
import { member, user, organization, job } from '../../../database/schema'
import { requirePlatformAdmin } from '../../../utils/requirePlatformAdmin'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().min(1).max(200).optional(),
  /** 'member' = recruiters, 'admin' = hiring managers, omitted = everyone */
  role: z.enum(['owner', 'admin', 'member']).optional(),
})

/**
 * GET /api/platform/members
 *
 * Cross-tenant list of every org member on the platform — backs both the
 * Recruiters (?role=member) and Hiring Managers (?role=admin) platform-admin
 * directories with one endpoint, since they're structurally the same data
 * filtered by the org role better-auth already tracks (see
 * shared/permissions.ts: owner/admin=hiring managers/member=recruiters).
 */
export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)

  const query = await getValidatedQuery(event, querySchema.parse)
  const offset = (query.page - 1) * query.limit

  const conditions: SQL[] = []
  if (query.role) conditions.push(eq(member.role, query.role))
  if (query.search) {
    const escaped = query.search.replace(/[%_\\]/g, '\\$&')
    const pattern = `%${escaped}%`
    conditions.push(or(ilike(user.name, pattern), ilike(user.email, pattern))!)
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: member.id,
        userId: user.id,
        name: user.name,
        email: user.email,
        role: member.role,
        createdAt: member.createdAt,
        organizationId: organization.id,
        organizationName: organization.name,
      })
      .from(member)
      .innerJoin(user, eq(user.id, member.userId))
      .innerJoin(organization, eq(organization.id, member.organizationId))
      .where(where)
      .orderBy(member.createdAt)
      .limit(query.limit)
      .offset(offset),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(member)
      .innerJoin(user, eq(user.id, member.userId))
      .where(where),
  ])

  const orgIds = [...new Set(rows.map(r => r.organizationId))]
  const jobCounts = orgIds.length === 0 ? [] : await db
    .select({ organizationId: job.organizationId, count: count() })
    .from(job)
    .where(and(inArray(job.organizationId, orgIds), eq(job.status, 'open')))
    .groupBy(job.organizationId)
  const jobMap = new Map(jobCounts.map(r => [r.organizationId, r.count]))

  const data = rows.map(r => ({ ...r, activeJobCount: jobMap.get(r.organizationId) ?? 0 }))

  return { data, total: totalRows[0]?.total ?? 0, page: query.page, limit: query.limit }
})
