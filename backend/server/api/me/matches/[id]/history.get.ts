import { eq, and } from 'drizzle-orm'
import { candidateMatch, application } from '../../../../database/schema'
import { candidatePortalIdParamSchema } from '../../../../utils/schemas/candidatePortal'

type HistoryEventType = 'matched' | 'accepted' | 'rejected' | 'application_created' | 'interview'

interface HistoryEvent {
  type: HistoryEventType
  label: string
  at: string
  detail?: string
}

/**
 * GET /api/me/matches/:id/history
 *
 * Builds a consent/visibility timeline for one match from data already
 * persisted elsewhere (match status, application, interviews) — this is a
 * read model, not a separate audit log, so it never drifts from reality.
 *
 * `visible` reflects whether this candidate's application is currently
 * visible to the employer for this job — true once the match is accepted
 * (which is also what creates the application recruiters see).
 */
export default defineEventHandler(async (event) => {
  const { candidate } = await requireCandidateSession(event)

  const { id } = await getValidatedRouterParams(event, candidatePortalIdParamSchema.parse)

  const match = await db.query.candidateMatch.findFirst({
    where: and(eq(candidateMatch.id, id), eq(candidateMatch.candidateId, candidate.id)),
    with: {
      job: { columns: { id: true, title: true } },
    },
  })

  if (!match) {
    throw createError({ statusCode: 404, statusMessage: 'Match not found' })
  }

  const timeline: HistoryEvent[] = [
    {
      type: 'matched',
      label: 'Match created',
      at: match.matchedAt.toISOString(),
      detail: match.job ? `Matched against ${match.job.title}` : undefined,
    },
  ]

  if (match.status === 'accepted' || match.status === 'rejected') {
    timeline.push({
      type: match.status,
      label: match.status === 'accepted' ? 'You accepted this match' : 'You declined this match',
      at: match.updatedAt.toISOString(),
    })
  }

  const relatedApplication = await db.query.application.findFirst({
    where: and(
      eq(application.candidateId, candidate.id),
      eq(application.jobId, match.jobId),
    ),
    columns: { id: true, status: true, createdAt: true },
    with: {
      interviews: {
        columns: { id: true, title: true, status: true, scheduledAt: true },
        orderBy: (t, { asc }) => [asc(t.scheduledAt)],
      },
    },
  })

  let visible = false

  if (relatedApplication) {
    visible = true
    timeline.push({
      type: 'application_created',
      label: 'Your profile became visible to the employer',
      at: relatedApplication.createdAt.toISOString(),
      detail: `Application status: ${relatedApplication.status}`,
    })

    for (const iv of relatedApplication.interviews) {
      timeline.push({
        type: 'interview',
        label: `Interview scheduled: ${iv.title}`,
        at: iv.scheduledAt.toISOString(),
        detail: iv.status,
      })
    }
  }

  timeline.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())

  return { matchId: match.id, visible, timeline }
})
