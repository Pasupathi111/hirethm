import type { H3Event } from 'h3'
import { isNull } from 'drizzle-orm'

/**
 * Self-service candidate session lookup.
 *
 * Candidate portal users are `user` accounts with no organization
 * membership, so `requirePermission` (which requires an active org)
 * doesn't apply here — we just need a valid session, then we match
 * the session's email against `candidate` rows across all orgs.
 *
 * Matches by email since there's no direct user->candidate link in
 * the schema; candidate profiles are created by recruiters independently
 * of candidate portal accounts.
 *
 * Throws 401 if there's no session, 404 if there's no matching
 * non-quarantined candidate row.
 *
 * Usage:
 * ```ts
 * const { session, candidate } = await requireCandidateSession(event)
 * ```
 */
export async function requireCandidateSession(event: H3Event) {
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const candidateRow = await db.query.candidate.findFirst({
    where: (candidateTable, { and, ilike }) =>
      and(ilike(candidateTable.email, session.user.email), isNull(candidateTable.quarantinedAt)),
    /**
     * Candidates are deduplicated *per org*, so one person who applied to
     * three employers has three rows. Without an explicit order this picked an
     * arbitrary one, meaning the portal could show a different profile between
     * requests.
     *
     * Order deterministically: the platform-level row (organizationId NULL,
     * created via self-serve signup) is the person's own profile and always
     * wins; otherwise fall back to the oldest employer-sourced row so the
     * answer is at least stable.
     */
    orderBy: (candidateTable, { asc, sql }) => [
      sql`CASE WHEN ${candidateTable.organizationId} IS NULL THEN 0 ELSE 1 END`,
      asc(candidateTable.createdAt),
    ],
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
      skills: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!candidateRow) {
    throw createError({ statusCode: 404, statusMessage: 'No candidate profile found for this account' })
  }

  return { session, candidate: candidateRow }
}
