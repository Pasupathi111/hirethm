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
      job: { columns: { id: true, title: true } },
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
  const updated = await db.transaction(async (tx) => {
    const [updatedMatch] = await tx.update(candidateMatch)
      .set({ status: 'accepted', updatedAt: new Date() })
      .where(eq(candidateMatch.id, id))
      .returning()

    const existingApplication = await tx.query.application.findFirst({
      where: and(
        eq(application.organizationId, candidate.organizationId),
        eq(application.candidateId, candidate.id),
        eq(application.jobId, existingMatch.jobId),
      ),
      columns: { id: true },
    })

    if (!existingApplication) {
      await tx.insert(application).values({
        organizationId: candidate.organizationId,
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
