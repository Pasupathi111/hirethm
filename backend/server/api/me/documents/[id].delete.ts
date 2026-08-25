import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { document } from '../../../database/schema'

const paramsSchema = z.object({ id: z.string().min(1) })

/**
 * DELETE /api/me/documents/:id
 * Deletes a document the candidate owns. Removes the S3 object first, then
 * the DB row (mirror of the cleanup-on-failure pattern in the upload route,
 * run in reverse so a failed S3 delete never leaves an orphaned DB row
 * pointing at nothing).
 */
export default defineEventHandler(async (event) => {
  const { candidate } = await requireCandidateSession(event)

  const { id } = await getValidatedRouterParams(event, paramsSchema.parse)

  const existing = await db.query.document.findFirst({
    where: and(eq(document.id, id), eq(document.candidateId, candidate.id)),
    columns: { id: true, storageKey: true },
  })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Document not found' })
  }

  await deleteFromS3(existing.storageKey)

  await db.delete(document).where(eq(document.id, id))

  return { success: true }
})
