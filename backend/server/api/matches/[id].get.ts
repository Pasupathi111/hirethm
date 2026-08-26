import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { candidateMatch, candidate, job, organization } from '../../database/schema'

const paramsSchema = z.object({ id: z.string().uuid('Invalid match ID') })

/**
 * GET /api/matches/:id — org-scoped match detail with full criteria breakdown.
 */
export default defineEventHandler(async (event) => {
  const session = await requirePermission(event, { candidate: ['read'] })
  const orgId = session.session.activeOrganizationId

  const { id } = await getValidatedRouterParams(event, paramsSchema.parse)

  const [result] = await db
    .select({
      id: candidateMatch.id,
      score: candidateMatch.score,
      criteria: candidateMatch.criteria,
      reasons: candidateMatch.reasons,
      gap: candidateMatch.gap,
      status: candidateMatch.status,
      matchedAt: candidateMatch.matchedAt,
      updatedAt: candidateMatch.updatedAt,
      candidateId: candidate.id,
      candidateFirstName: candidate.firstName,
      candidateLastName: candidate.lastName,
      candidateEmail: candidate.email,
      jobId: job.id,
      jobTitle: job.title,
      jobLocation: job.location,
      jobType: job.type,
      organizationName: organization.name,
    })
    .from(candidateMatch)
    .innerJoin(candidate, eq(candidate.id, candidateMatch.candidateId))
    .innerJoin(job, eq(job.id, candidateMatch.jobId))
    .innerJoin(organization, eq(organization.id, job.organizationId))
    .where(and(eq(candidateMatch.id, id), eq(job.organizationId, orgId)))

  if (!result) {
    throw createError({ statusCode: 404, statusMessage: 'Match not found' })
  }

  return result
})
