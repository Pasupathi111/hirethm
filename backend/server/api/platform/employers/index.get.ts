import { and, eq, sql, ilike, inArray, count, type SQL } from 'drizzle-orm'
import { z } from 'zod'
import { organization, member, job, application } from '../../../database/schema'
import { requirePlatformAdmin } from '../../../utils/requirePlatformAdmin'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().min(1).max(200).optional(),
})

/**
 * GET /api/platform/employers
 *
 * Cross-tenant list of every organization on the platform, for HireThm
 * staff — not to be confused with any org-scoped endpoint. Gated by
 * requirePlatformAdmin, never requirePermission.
 */
export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)

  const query = await getValidatedQuery(event, querySchema.parse)
  const offset = (query.page - 1) * query.limit

  let where: SQL | undefined
  if (query.search) {
    const escaped = query.search.replace(/[%_\\]/g, '\\$&')
    where = ilike(organization.name, `%${escaped}%`)
  }

  const [orgs, totalRows] = await Promise.all([
    db
      .select({ id: organization.id, name: organization.name, slug: organization.slug, logo: organization.logo, createdAt: organization.createdAt })
      .from(organization)
      .where(where)
      .orderBy(organization.createdAt)
      .limit(query.limit)
      .offset(offset),
    db.select({ total: sql<number>`count(*)::int` }).from(organization).where(where),
  ])

  const orgIds = orgs.map(o => o.id)

  // Three separate grouped-count queries — mirrors the proven pattern in
  // GET /api/jobs (pipeline counts) rather than correlated subqueries.
  const [memberCounts, jobCounts, applicationCounts] = orgIds.length === 0
    ? [[], [], []]
    : await Promise.all([
        db.select({ organizationId: member.organizationId, count: count() })
          .from(member)
          .where(inArray(member.organizationId, orgIds))
          .groupBy(member.organizationId),
        db.select({ organizationId: job.organizationId, count: count() })
          .from(job)
          .where(and(inArray(job.organizationId, orgIds), eq(job.status, 'open')))
          .groupBy(job.organizationId),
        db.select({ organizationId: application.organizationId, count: count() })
          .from(application)
          .where(inArray(application.organizationId, orgIds))
          .groupBy(application.organizationId),
      ])

  const memberMap = new Map(memberCounts.map(r => [r.organizationId, r.count]))
  const jobMap = new Map(jobCounts.map(r => [r.organizationId, r.count]))
  const applicationMap = new Map(applicationCounts.map(r => [r.organizationId, r.count]))

  const data = orgs.map(o => ({
    ...o,
    memberCount: memberMap.get(o.id) ?? 0,
    activeJobCount: jobMap.get(o.id) ?? 0,
    applicationCount: applicationMap.get(o.id) ?? 0,
  }))

  return { data, total: totalRows[0]?.total ?? 0, page: query.page, limit: query.limit }
})
