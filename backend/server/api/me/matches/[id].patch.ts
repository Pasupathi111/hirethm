import { eq, and } from 'drizzle-orm'
import { candidateMatch, application, candidateNotification } from '../../../database/schema'
import { candidatePortalIdParamSchema, updateMatchStatusSchema } from '../../../utils/schemas/candidatePortal'

/**
 * PATCH /api/me/matches/:id
 *
 * Accept or reject a match. Accepting creates an application (if one doesn't
 * already exist for that job) and a notification; rejecting just updates status.
 */
export default defineEventHandler(async (event) => {
  const { candidate } = await requireCandidateSession(event)

  const { id } = await getValidatedRouterParams(event, candidatePortalIdParamSchema.parse)
  const body = await readValidatedBody(event, updateMatchStatusSchema.parse)

  const existingMatch = await db.query.candidateMatch.findFirst({
    where: and(eq(candidateMatch.id, id), eq(candidateMatch.candidateId, candidate.id)),
    with: {
      job: { columns: { id: true, title: true, organizationId: true } },
    },
  })

  if (!existingMatch) {
    throw createError({ statusCode: 404, statusMessage: 'Match not found' })
  }

  if (body.status === 'rejected') {
    const [updated] = await db.update(candidateMatch)
      .set({ status: 'rejected', updatedAt: new Date() })
      .where(eq(candidateMatch.id, id))
      .returning()

    return updated
  }

  // status === 'accepted'
  //
  // The application belongs to the JOB's organization — the employer being
  // applied to. This previously used candidate.organizationId, which was wrong
  // for any cross-org match: matches are generated against every open job
  // regardless of org, so accepting one filed the application under the
  // candidate's own org and the hiring employer never saw it.
  const employerOrgId = existingMatch.job?.organizationId
  if (!employerOrgId) {
    throw createError({ statusCode: 409, statusMessage: 'This job is no longer available' })
  }

  const updated = await db.transaction(async (tx) => {
    const [updatedMatch] = await tx.update(candidateMatch)
      .set({ status: 'accepted', updatedAt: new Date() })
      .where(eq(candidateMatch.id, id))
      .returning()

    const existingApplication = await tx.query.application.findFirst({
      where: and(
        eq(application.organizationId, employerOrgId),
        eq(application.candidateId, candidate.id),
        eq(application.jobId, existingMatch.jobId),
      ),
      columns: { id: true },
    })

    if (!existingApplication) {
      await tx.insert(application).values({
        organizationId: employerOrgId,
        candidateId: candidate.id,
        jobId: existingMatch.jobId,
        status: 'new',
      }).onConflictDoNothing()
    }

    await tx.insert(candidateNotification).values({
      candidateId: candidate.id,
      category: 'applications',
      title: 'Application submitted',
      description: existingMatch.job
        ? `Your application for ${existingMatch.job.title} has been submitted.`
        : 'Your application has been submitted.',
      actionHref: null,
      actionLabel: null,
    })

    return updatedMatch
  })

  return updated
})
