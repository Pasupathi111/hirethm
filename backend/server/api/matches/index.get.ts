import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { candidateMatch, candidate, job } from '../../database/schema'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['new', 'waiting', 'accepted', 'rejected', 'in_progress']).optional(),
})

/**
 * GET /api/matches — org-scoped list of candidate-job matches, for recruiters
 * to review the AI matching pipeline's output across their jobs.
 */
export default defineEventHandler(async (event) => {
  const session = await requirePermission(event, { candidate: ['read'] })
  const orgId = session.session.activeOrganizationId

  const query = await getValidatedQuery(event, querySchema.parse)
  const offset = (query.page - 1) * query.limit

  const where = and(
    eq(job.organizationId, orgId),
    query.status ? eq(candidateMatch.status, query.status) : undefined,
  )

  const rows = await db
    .select({
      id: candidateMatch.id,
      score: candidateMatch.score,
      status: candidateMatch.status,
      matchedAt: candidateMatch.matchedAt,
      candidateId: candidate.id,
      candidateFirstName: candidate.firstName,
      candidateLastName: candidate.lastName,
      jobId: job.id,
      jobTitle: job.title,
    })
    .from(candidateMatch)
    .innerJoin(candidate, eq(candidate.id, candidateMatch.candidateId))
    .innerJoin(job, eq(job.id, candidateMatch.jobId))
    .where(where)
    .orderBy(desc(candidateMatch.matchedAt))
    .limit(query.limit)
    .offset(offset)

  return { data: rows, page: query.page, limit: query.limit }
})
