import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { document } from '../../../database/schema'
import { normalizeParsedContent } from '../../../utils/resume-parser'

const paramsSchema = z.object({ id: z.string().min(1) })

/**
 * GET /api/documents/:id
 *
 * Returns a single document with its full parsedContent. The candidate
 * detail list endpoint deliberately strips parsedContent (can be large) and
 * only sends a `parsed` boolean — this is the lazy-load target for viewing
 * the extracted resume content on demand.
 *
 * Security: auth required, org-scoped (prevents IDOR).
 */
export default defineEventHandler(async (event) => {
  const session = await requirePermission(event, { document: ['read'] })
  const orgId = session.session.activeOrganizationId
  const { id: documentId } = await getValidatedRouterParams(event, paramsSchema.parse)

  const doc = await db.query.document.findFirst({
    where: and(
      eq(document.id, documentId),
      eq(document.organizationId, orgId),
    ),
    columns: {
      id: true,
      candidateId: true,
      type: true,
      originalFilename: true,
      mimeType: true,
      sizeBytes: true,
      parsedContent: true,
      createdAt: true,
    },
  })

  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: 'Document not found' })
  }

  return { ...doc, parsedContent: normalizeParsedContent(doc.parsedContent) }
})
