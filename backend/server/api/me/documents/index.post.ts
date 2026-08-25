import { eq } from 'drizzle-orm'
import { fileTypeFromBuffer } from 'file-type'
import { document, candidate } from '../../../database/schema'
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  MAX_DOCUMENTS_PER_CANDIDATE,
  MIME_TO_EXTENSION,
  documentTypeSchema,
  sanitizeFilename,
} from '../../../utils/schemas/document'
import { parseDocument, extractResumeText } from '../../../utils/resume-parser'
import { extractSkillsFromText } from '../../../utils/skills-taxonomy'

/**
 * POST /api/me/documents
 *
 * Candidate self-service document upload (resume, cover letter, etc.).
 * Mirrors the org-side upload flow in `candidates/:id/documents`, but:
 *   - storage key has no orgId prefix (candidate-initiated, not org-scoped)
 *   - best-effort merges naive skill-keyword extraction into candidate.skills
 */
export default defineEventHandler(async (event) => {
  const { candidate: candidateSession } = await requireCandidateSession(event)

  const formData = await readMultipartFormData(event)
  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'No form data received' })
  }

  const filePart = formData.find((part) => part.name === 'file')
  const typePart = formData.find((part) => part.name === 'type')

  if (!filePart || !filePart.data || !filePart.filename) {
    throw createError({ statusCode: 400, statusMessage: 'No file provided' })
  }

  const typeValue = typePart?.data?.toString() ?? 'resume'
  const typeResult = documentTypeSchema.safeParse(typeValue)
  if (!typeResult.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid document type. Must be: resume, cover_letter, or other' })
  }
  const documentType = typeResult.data

  const fileBuffer = filePart.data
  if (fileBuffer.length > MAX_FILE_SIZE) {
    throw createError({
      statusCode: 413,
      statusMessage: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024} MB`,
    })
  }

  const detectedType = await fileTypeFromBuffer(fileBuffer)
  let mimeType = detectedType?.mime

  // file-type can't detect legacy .doc (OLE2 compound documents) — validate magic bytes manually
  if (!mimeType) {
    const OLE2_MAGIC = Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1])
    if (fileBuffer.length >= 8 && Buffer.compare(fileBuffer.subarray(0, 8), OLE2_MAGIC) === 0) {
      mimeType = 'application/msword'
    }
  }

  if (!mimeType || !ALLOWED_MIME_TYPES.includes(mimeType as typeof ALLOWED_MIME_TYPES[number])) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid file type. Allowed: PDF, DOC, DOCX',
    })
  }

  const existingDocCount = await db.$count(
    document,
    eq(document.candidateId, candidateSession.id),
  )

  if (existingDocCount >= MAX_DOCUMENTS_PER_CANDIDATE) {
    throw createError({
      statusCode: 409,
      statusMessage: `Document limit reached. Maximum ${MAX_DOCUMENTS_PER_CANDIDATE} documents per candidate`,
    })
  }

  const documentId = crypto.randomUUID()
  const extension = MIME_TO_EXTENSION[mimeType] ?? 'bin'
  const storageKey = `${candidateSession.id}/${documentId}.${extension}`

  await uploadToS3(storageKey, fileBuffer, mimeType)

  const parsedContent = await parseDocument(fileBuffer, mimeType)

  try {
    const [created] = await db.insert(document).values({
      id: documentId,
      organizationId: candidateSession.organizationId,
      candidateId: candidateSession.id,
      type: documentType,
      storageKey,
      originalFilename: sanitizeFilename(filePart.filename),
      mimeType,
      sizeBytes: fileBuffer.length,
      parsedContent: parsedContent as any,
    }).returning({
      id: document.id,
      type: document.type,
      originalFilename: document.originalFilename,
      mimeType: document.mimeType,
      sizeBytes: document.sizeBytes,
      createdAt: document.createdAt,
    })

    if (!created) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to create document' })
    }

    // Best-effort: extract naive skill keywords from the parsed resume text
    // and union them into candidate.skills (never overwrite self-reported skills).
    try {
      const text = extractResumeText(parsedContent)
      if (text) {
        const extracted = extractSkillsFromText(text)
        if (extracted.length > 0) {
          const currentSkills = candidateSession.skills ?? []
          const currentLower = new Set(currentSkills.map((s) => s.toLowerCase()))
          const newSkills = extracted.filter((s) => !currentLower.has(s.toLowerCase()))
          if (newSkills.length > 0) {
            await db.update(candidate)
              .set({ skills: [...currentSkills, ...newSkills], updatedAt: new Date() })
              .where(eq(candidate.id, candidateSession.id))
          }
        }
      }
    } catch (skillError) {
      logWarn('me.documents.skill_extraction_failed', {
        candidate_id: candidateSession.id,
        error_message: skillError instanceof Error ? skillError.message : String(skillError),
      })
    }

    setResponseStatus(event, 201)
    return created
  } catch (dbError) {
    try {
      await deleteFromS3(storageKey)
    } catch (cleanupError) {
      logWarn('me.documents.s3_orphan_cleanup_failed', {
        storage_key: storageKey,
        error_message: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
      })
    }
    throw dbError
  }
})
