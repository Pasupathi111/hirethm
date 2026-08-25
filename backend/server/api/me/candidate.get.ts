import { eq } from 'drizzle-orm'
import { organization, candidate } from '../../database/schema'

/**
 * Self-service candidate profile lookup.
 *
 * Auth + candidate-by-email lookup is shared via `requireCandidateSession`;
 * this route additionally loads the applications/interviews relation that
 * the shared helper doesn't need for its other (lighter-weight) callers.
 */
export default defineEventHandler(async (event) => {
  const { candidate: candidateSession } = await requireCandidateSession(event)

  const result = await db.query.candidate.findFirst({
    where: eq(candidate.id, candidateSession.id),
    columns: {
      id: true,
      organizationId: true,
      firstName: true,
      lastName: true,
      displayName: true,
      email: true,
      phone: true,
      gender: true,
      dateOfBirth: true,
      quickNotes: true,
      createdAt: true,
      updatedAt: true,
    },
    with: {
      applications: {
        columns: { id: true, status: true, score: true, notes: true, createdAt: true, updatedAt: true },
        with: {
          job: {
            columns: { id: true, title: true, location: true, type: true, remoteStatus: true, status: true },
          },
          interviews: {
            columns: { id: true, title: true, type: true, status: true, scheduledAt: true, duration: true, location: true },
            orderBy: (interviewTable, { desc }) => [desc(interviewTable.scheduledAt)],
          },
        },
        orderBy: (applicationTable, { desc }) => [desc(applicationTable.createdAt)],
      },
    },
  })

  if (!result) {
    throw createError({ statusCode: 404, statusMessage: 'No candidate profile found for this account' })
  }

  const org = await db.query.organization.findFirst({
    where: eq(organization.id, result.organizationId),
    columns: { id: true, name: true },
  })

  const { organizationId, ...candidateFields } = result

  return {
    ...candidateFields,
    organization: org ?? null,
  }
})
