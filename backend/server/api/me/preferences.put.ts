import { candidatePreference } from '../../database/schema'
import { updatePreferencesSchema } from '../../utils/schemas/candidatePortal'

/**
 * PUT /api/me/preferences
 * Upserts the candidate's job-search preferences.
 */
export default defineEventHandler(async (event) => {
  const { candidate } = await requireCandidateSession(event)

  const body = await readValidatedBody(event, updatePreferencesSchema.parse)

  const [result] = await db.insert(candidatePreference)
    .values({
      candidateId: candidate.id,
      desiredTitles: body.desiredTitles,
      locations: body.locations,
      workMode: body.workMode,
      sourcingVisibility: body.sourcingVisibility,
      minSalary: body.minSalary ?? null,
      maxSalary: body.maxSalary ?? null,
      employmentTypes: body.employmentTypes,
      notifyMatches: body.notifyMatches,
      notifyApplications: body.notifyApplications,
      notifyInterviews: body.notifyInterviews,
    })
    .onConflictDoUpdate({
      target: candidatePreference.candidateId,
      set: {
        desiredTitles: body.desiredTitles,
        locations: body.locations,
        workMode: body.workMode,
        sourcingVisibility: body.sourcingVisibility,
        minSalary: body.minSalary ?? null,
        maxSalary: body.maxSalary ?? null,
        employmentTypes: body.employmentTypes,
        notifyMatches: body.notifyMatches,
        notifyApplications: body.notifyApplications,
        notifyInterviews: body.notifyInterviews,
        updatedAt: new Date(),
      },
    })
    .returning()

  if (!result) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to save preferences' })
  }

  const { candidateId, ...fields } = result
  return fields
})
