import { eq, and } from 'drizzle-orm'
import { candidateNotification } from '../../../database/schema'

/**
 * POST /api/me/notifications/mark-all-read
 * Bulk-marks all of the candidate's unread notifications as read.
 */
export default defineEventHandler(async (event) => {
  const { candidate } = await requireCandidateSession(event)

  await db.update(candidateNotification)
    .set({ isRead: true })
    .where(and(eq(candidateNotification.candidateId, candidate.id), eq(candidateNotification.isRead, false)))

  return { success: true }
})
