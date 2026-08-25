import { eq, desc } from 'drizzle-orm'
import { job, candidatePreference } from '../../database/schema'
import { computeMatch, DEFAULT_MATCH_PREFERENCE, type MatchPreferenceInput } from '../../utils/matching'

/**
 * GET /api/me/recommended
 *
 * All open jobs, scored against the candidate's saved preferences (or a
 * sensible default if none saved yet), sorted by score descending.
 */
export default defineEventHandler(async (event) => {
  const { candidate } = await requireCandidateSession(event)

  const [openJobs, savedPreference] = await Promise.all([
    db.query.job.findMany({
      where: eq(job.status, 'open'),
      orderBy: [desc(job.createdAt)],
      columns: {
        id: true,
        title: true,
        slug: true,
        description: true,
        location: true,
        type: true,
        salaryMin: true,
        salaryMax: true,
        salaryCurrency: true,
        salaryUnit: true,
        remoteStatus: true,
        skills: true,
        createdAt: true,
      },
      with: {
        organization: { columns: { name: true } },
      },
    }),
    db.query.candidatePreference.findFirst({
      where: eq(candidatePreference.candidateId, candidate.id),
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

  const scored = openJobs.map(({ organization: org, skills, ...j }) => {
    const match = computeMatch(
      { skills, remoteStatus: j.remoteStatus, location: j.location, salaryMin: j.salaryMin, salaryMax: j.salaryMax },
      { skills: candidate.skills },
      preference,
    )

    return {
      job: { ...j, organizationName: org?.name ?? null },
      score: match.score,
      criteria: match.criteria,
      reasons: match.reasons,
      gap: match.gap,
    }
  })

  scored.sort((a, b) => b.score - a.score)

  return { data: scored }
})
