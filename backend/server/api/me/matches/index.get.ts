import { eq, desc, inArray } from 'drizzle-orm'
import { job, candidatePreference, candidateMatch, orgSettings, organization } from '../../../database/schema'
import { computeMatch, DEFAULT_MATCH_PREFERENCE, type MatchPreferenceInput } from '../../../utils/matching'
import { dispatchMatchNotification } from '../../../utils/matchNotifications'
import { DEFAULT_MIN_READINESS, meetsReadinessThreshold, normalizeThreshold, type MatchNotificationChannel } from '../../../utils/notificationPolicy'

/**
 * GET /api/me/matches
 *
 * Ensures a `candidateMatch` row exists (status 'new') for every open job
 * scoring at or above the *job organization's* configured minimum readiness
 * score, then returns all of the candidate's match rows (regardless of current
 * status), newest first.
 *
 * Newly created matches dispatch a candidate notification on the channel that
 * job's organization configured (issue #27, parts A + C).
 */
export default defineEventHandler(async (event) => {
  const { candidate } = await requireCandidateSession(event)

  const [openJobs, savedPreference, existingMatches] = await Promise.all([
    db.query.job.findMany({
      where: eq(job.status, 'open'),
      columns: {
        id: true, title: true, location: true, type: true, remoteStatus: true,
        salaryMin: true, salaryMax: true, skills: true, description: true,
        organizationId: true,
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

  // BRD business rule: matching can only occur once both the candidate's
  // resume and the job's JD have been analyzed. Skip generating NEW matches
  // for a zero-signal candidate profile, or against a job with no
  // description and no skills (existing matches, if any, are still
  // returned below).
  const analyzedJobs = openJobs.filter(j => !!j.description?.trim() || j.skills.length > 0)

  // Each job's own organization decides its readiness threshold and how its
  // candidates get notified — so settings are resolved per job, not globally.
  const orgIds = Array.from(new Set(analyzedJobs.map(j => j.organizationId)))
  const [settingsRows, orgRows] = orgIds.length === 0
    ? [[], []]
    : await Promise.all([
        db.select({
          organizationId: orgSettings.organizationId,
          minReadinessScore: orgSettings.minReadinessScore,
          matchNotificationChannel: orgSettings.matchNotificationChannel,
        }).from(orgSettings).where(inArray(orgSettings.organizationId, orgIds)),
        db.select({ id: organization.id, name: organization.name })
          .from(organization).where(inArray(organization.id, orgIds)),
      ])

  const settingsByOrg = new Map(settingsRows.map(r => [r.organizationId, r]))
  const orgNameById = new Map(orgRows.map(r => [r.id, r.name]))

  const candidates = candidate.skills.length === 0 ? [] : analyzedJobs
    .filter(j => !existingJobIds.has(j.id))
    .map(j => ({ j, match: computeMatch(j, { skills: candidate.skills }, preference) }))
    // Threshold gating (part C): a match below the org's configured minimum is
    // never created and therefore never notifies.
    .filter(({ j, match }) => {
      const threshold = normalizeThreshold(
        settingsByOrg.get(j.organizationId)?.minReadinessScore ?? DEFAULT_MIN_READINESS,
      )
      return meetsReadinessThreshold(match.score, threshold)
    })

  if (candidates.length > 0) {
    const inserted = await db.insert(candidateMatch).values(
      candidates.map(({ j, match }) => ({
        candidateId: candidate.id,
        jobId: j.id,
        score: match.score,
        criteria: match.criteria,
        reasons: match.reasons,
        gap: match.gap ?? null,
        status: 'new' as const,
      })),
    ).onConflictDoNothing({
      target: [candidateMatch.candidateId, candidateMatch.jobId],
    }).returning({ jobId: candidateMatch.jobId, score: candidateMatch.score })

    // Notify only for rows that were actually inserted — onConflictDoNothing
    // means a concurrent request may already have created some of them, and
    // the candidate must not be notified twice for the same match.
    const baseUrl = env.BETTER_AUTH_URL || 'http://localhost:3000'
    for (const row of inserted) {
      const j = candidates.find(c => c.j.id === row.jobId)?.j
      if (!j) continue
      await dispatchMatchNotification({
        channel: (settingsByOrg.get(j.organizationId)?.matchNotificationChannel
          ?? 'in_app') as MatchNotificationChannel,
        candidate: { id: candidate.id, firstName: candidate.firstName, email: candidate.email },
        job: { id: j.id, title: j.title },
        organizationName: orgNameById.get(j.organizationId) ?? 'An employer',
        score: row.score,
        baseUrl,
      })
    }
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
