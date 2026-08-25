import { eq } from 'drizzle-orm'
import { interview } from '../../../../database/schema'
import { candidatePortalIdParamSchema, respondToInterviewSchema } from '../../../../utils/schemas/candidatePortal'

/**
 * POST /api/me/interviews/:id/respond
 *
 * Lets a signed-in candidate confirm, decline, or tentatively accept one of
 * their own scheduled interviews. Counterpart to the token-based public
 * respond flow (used for email links) — this is for the in-app portal.
 */
export default defineEventHandler(async (event) => {
  const { candidate } = await requireCandidateSession(event)

  const { id } = await getValidatedRouterParams(event, candidatePortalIdParamSchema.parse)
  const { response } = await readValidatedBody(event, respondToInterviewSchema.parse)

  const existing = await db.query.interview.findFirst({
    where: eq(interview.id, id),
    with: {
      application: {
        columns: { candidateId: true },
      },
    },
  })

  if (!existing || existing.application?.candidateId !== candidate.id) {
    throw createError({ statusCode: 404, statusMessage: 'Interview not found' })
  }

  if (existing.status !== 'scheduled') {
    throw createError({
      statusCode: 400,
      statusMessage: `This interview has been ${existing.status} and can no longer be responded to.`,
    })
  }

  const [updated] = await db.update(interview)
    .set({
      candidateResponse: response,
      candidateRespondedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(interview.id, id))
    .returning({
      id: interview.id,
      candidateResponse: interview.candidateResponse,
      candidateRespondedAt: interview.candidateRespondedAt,
    })

  return updated
})
