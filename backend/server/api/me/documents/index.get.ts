import { eq, desc } from 'drizzle-orm'
import { document } from '../../../database/schema'
import { normalizeParsedContent } from '../../../utils/resume-parser'

/**
 * GET /api/me/documents
 * Lists the candidate's own documents.
 */
export default defineEventHandler(async (event) => {
  const { candidate } = await requireCandidateSession(event)

  const data = await db.query.document.findMany({
    where: eq(document.candidateId, candidate.id),
    orderBy: [desc(document.createdAt)],
    columns: {
      id: true,
      type: true,
      originalFilename: true,
      mimeType: true,
      sizeBytes: true,
      parsedContent: true,
      createdAt: true,
    },
  })

  return { data: data.map(d => ({ ...d, parsedContent: normalizeParsedContent(d.parsedContent) })) }
})
