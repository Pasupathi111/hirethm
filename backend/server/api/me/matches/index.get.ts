import { eq, desc } from 'drizzle-orm'
import { job, candidatePreference, candidateMatch } from '../../../database/schema'
import { computeMatch, DEFAULT_MATCH_PREFERENCE, type MatchPreferenceInput } from '../../../utils/matching'

/**
 * GET /api/me/matches
 *
 * Ensures a `candidateMatch` row exists (status 'new') for every open job
 * scoring >= 70 against the candidate's preferences, then returns all of the
 * candidate's match rows (regardless of current status), newest first.
 */
export default defineEventHandler(async (event) => {
  const { candidate } = await requireCandidateSession(event)

  const [openJobs, savedPreference, existingMatches] = await Promise.all([
    db.query.job.findMany({
      where: eq(job.status, 'open'),
      columns: {
        id: true, title: true, location: true, type: true, remoteStatus: true,
        salaryMin: true, salaryMax: true, skills: true,
      },
    }),
    db.query.candidatePreference.findFirst({
      where: eq(candidatePreference.candidateId, candidate.id),
    }),
    db.query.candidateMatch.findMany({
      where: eq(candidateMatch.candidateId, candidate.id),
      columns: { jobId: true },
    }),
  ])

  const preference: MatchPreferenceInput = savedPreference
    ? {
        workMode: savedPreference.workMode,
        locations: savedPreference.locations,
        minSalary: savedPreference.minSalary,
        maxSalary: savedPreference.maxSalary,
      }
    : DEFAULT_MATCH_PREFERENCE

  const existingJobIds = new Set(existingMatches.map((m) => m.jobId))

  // BRD business rule: matching can only occur once the candidate's resume/
  // profile has been analyzed. Skip generating NEW matches for a zero-signal
  // profile (existing matches, if any, are still returned below).
  const toInsert = candidate.skills.length === 0 ? [] : openJobs
    .map((j) => ({ j, match: computeMatch(j, { skills: candidate.skills }, preference) }))
    .filter(({ j, match }) => !existingJobIds.has(j.id) && match.score >= 70)
    .map(({ j, match }) => ({
      candidateId: candidate.id,
      jobId: j.id,
      score: match.score,
      criteria: match.criteria,
      reasons: match.reasons,
      gap: match.gap ?? null,
      status: 'new' as const,
    }))

  if (toInsert.length > 0) {
    await db.insert(candidateMatch).values(toInsert).onConflictDoNothing({
      target: [candidateMatch.candidateId, candidateMatch.jobId],
    })
  }

  const data = await db.query.candidateMatch.findMany({
    where: eq(candidateMatch.candidateId, candidate.id),
    orderBy: [desc(candidateMatch.matchedAt)],
    with: {
      job: {
        columns: { id: true, title: true, location: true, type: true, remoteStatus: true, status: true },
        with: { organization: { columns: { name: true } } },
      },
    },
  })

  const flattened = data.map(({ job: j, ...m }) => {
    if (!j) return { ...m, job: null }
    const { organization: org, ...jobFields } = j
    return { ...m, job: { ...jobFields, organizationName: org?.name ?? null } }
  })

  return { data: flattened }
})
