import { eq, desc, inArray } from 'drizzle-orm'
import { job, candidatePreference, orgSettings } from '../../database/schema'
import { computeMatch, DEFAULT_MATCH_PREFERENCE, type MatchPreferenceInput } from '../../utils/matching'

/**
 * GET /api/me/recommended
 *
 * All open jobs, scored against the candidate's saved preferences (or a
 * sensible default if none saved yet), sorted by score descending.
 */
export default defineEventHandler(async (event) => {
  const { candidate } = await requireCandidateSession(event)

  // BRD business rule: matching can only occur once the candidate's resume/
  // profile has been analyzed. With zero skills there's no real signal to
  // score against, so recommending anything would be noise, not a match.
  if (candidate.skills.length === 0) {
    return {
      data: [],
      profileIncomplete: true,
      message: 'Add your skills or upload a resume to start getting matched with roles.',
    }
  }

  const [openJobs, savedPreference] = await Promise.all([
    db.query.job.findMany({
      where: eq(job.status, 'open'),
      orderBy: [desc(job.createdAt)],
      columns: {
        id: true,
        organizationId: true,
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

  // Same BRD precondition on the JD side: a job with no description and no
  // skills hasn't been through any real analysis, so it can't meaningfully
  // participate in matching either.
  const analyzedJobs = openJobs.filter(j => !!j.description?.trim() || j.skills.length > 0)

  // Criterion weighting belongs to the job's own organization (issue #69),
  // matching how the readiness threshold is resolved in /api/me/matches.
  const orgIds = Array.from(new Set(analyzedJobs.map(j => j.organizationId)))
  const weightRows = orgIds.length === 0
    ? []
    : await db
        .select({ organizationId: orgSettings.organizationId, matchWeights: orgSettings.matchWeights })
        .from(orgSettings)
        .where(inArray(orgSettings.organizationId, orgIds))
  const weightsByOrg = new Map(weightRows.map(r => [r.organizationId, r.matchWeights]))

  const scored = analyzedJobs.map(({ organization: org, skills, organizationId, ...j }) => {
    const match = computeMatch(
      { skills, remoteStatus: j.remoteStatus, location: j.location, salaryMin: j.salaryMin, salaryMax: j.salaryMax },
      { skills: candidate.skills },
      preference,
      weightsByOrg.get(organizationId) ?? null,
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
