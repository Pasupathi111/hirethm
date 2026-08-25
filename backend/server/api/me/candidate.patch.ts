import { eq } from 'drizzle-orm'
import { candidate } from '../../database/schema'
import { updateSelfCandidateSchema } from '../../utils/schemas/candidatePortal'

/**
 * PATCH /api/me/candidate
 *
 * Self-service profile edit. Deliberately restricted to a small field set —
 * organizationId, email, and GDPR/retention fields can NOT be self-edited.
 */
export default defineEventHandler(async (event) => {
  const { candidate: candidateSession } = await requireCandidateSession(event)

  const body = await readValidatedBody(event, updateSelfCandidateSchema.parse)

  const [updated] = await db.update(candidate)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(candidate.id, candidateSession.id))
    .returning({
      id: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      displayName: candidate.displayName,
      email: candidate.email,
      phone: candidate.phone,
      gender: candidate.gender,
      dateOfBirth: candidate.dateOfBirth,
      quickNotes: candidate.quickNotes,
      skills: candidate.skills,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
    })

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Candidate profile not found' })
  }

  return updated
})
