import { eq, isNull } from 'drizzle-orm'
import { organization } from '../../database/schema'

/**
 * Self-service candidate profile lookup.
 *
 * Candidate portal users are `user` accounts with no organization
 * membership, so `requirePermission` (which requires an active org)
 * doesn't apply here — we just need a valid session, then we match
 * the session's email against `candidate` rows across all orgs.
 *
 * Matches by email since there's no direct user->candidate link in
 * the schema; candidate profiles are created by recruiters independently
 * of candidate portal accounts.
 */
export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const result = await db.query.candidate.findFirst({
    where: (candidateTable, { and, ilike }) =>
      and(ilike(candidateTable.email, session.user.email), isNull(candidateTable.quarantinedAt)),
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
