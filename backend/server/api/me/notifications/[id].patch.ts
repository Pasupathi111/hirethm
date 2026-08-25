import { eq, and } from 'drizzle-orm'
import { candidateNotification } from '../../../database/schema'
import { candidatePortalIdParamSchema, updateNotificationSchema } from '../../../utils/schemas/candidatePortal'

/**
 * PATCH /api/me/notifications/:id
 * Body: { isRead: true }
 */
export default defineEventHandler(async (event) => {
  const { candidate } = await requireCandidateSession(event)

  const { id } = await getValidatedRouterParams(event, candidatePortalIdParamSchema.parse)
  const body = await readValidatedBody(event, updateNotificationSchema.parse)

  const [updated] = await db.update(candidateNotification)
    .set({ isRead: body.isRead })
    .where(and(eq(candidateNotification.id, id), eq(candidateNotification.candidateId, candidate.id)))
    .returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Notification not found' })
  }

  return updated
})
