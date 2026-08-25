import { eq } from 'drizzle-orm'
import { candidatePreference } from '../../database/schema'

const DEFAULT_PREFERENCE = {
  desiredTitles: [] as string[],
  locations: [] as string[],
  workMode: 'any' as const,
  minSalary: null as number | null,
  maxSalary: null as number | null,
  employmentTypes: [] as string[],
  notifyMatches: true,
  notifyApplications: true,
  notifyInterviews: true,
}

/**
 * GET /api/me/preferences
 * Returns the candidate's saved preferences, or a sensible default object
 * if none has been saved yet (never 404s).
 */
export default defineEventHandler(async (event) => {
  const { candidate } = await requireCandidateSession(event)

  const existing = await db.query.candidatePreference.findFirst({
    where: eq(candidatePreference.candidateId, candidate.id),
  })

  if (!existing) {
    return DEFAULT_PREFERENCE
  }

  const { candidateId, ...fields } = existing
  return fields
})
