import { eq, desc } from 'drizzle-orm'
import { candidateNotification } from '../../../database/schema'

/**
 * GET /api/me/notifications
 * Lists the candidate's notifications, newest first.
 */
export default defineEventHandler(async (event) => {
  const { candidate } = await requireCandidateSession(event)

  const data = await db.query.candidateNotification.findMany({
    where: eq(candidateNotification.candidateId, candidate.id),
    orderBy: [desc(candidateNotification.createdAt)],
  })

  return { data }
})
