import { eq, desc } from 'drizzle-orm'
import { application } from '../../database/schema'

/**
 * GET /api/me/interviews
 *
 * Flattens the candidate's applications -> interviews into a single list,
 * with job title/company attached to each interview.
 */
export default defineEventHandler(async (event) => {
  const { candidate } = await requireCandidateSession(event)

  const applications = await db.query.application.findMany({
    where: eq(application.candidateId, candidate.id),
    columns: { id: true },
    with: {
      job: {
        columns: { id: true, title: true, location: true },
        with: { organization: { columns: { name: true } } },
      },
      interviews: {
        orderBy: (interviewTable, { desc: descOrder }) => [descOrder(interviewTable.scheduledAt)],
      },
    },
  })

  const data = applications.flatMap((app) =>
    app.interviews.map((interview) => ({
      ...interview,
      applicationId: app.id,
      job: app.job
        ? {
            id: app.job.id,
            title: app.job.title,
            location: app.job.location,
            organizationName: app.job.organization?.name ?? null,
          }
        : null,
    })),
  )

  data.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())

  return { data }
})
