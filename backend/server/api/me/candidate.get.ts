import { eq } from 'drizzle-orm'
import { organization, candidate, document, candidatePreference } from '../../database/schema'
import { computeCandidateCompleteness } from '../../utils/candidateCompleteness'

/**
 * Self-service candidate profile lookup.
 *
 * Auth + candidate-by-email lookup is shared via `requireCandidateSession`;
 * this route additionally loads the applications/interviews relation that
 * the shared helper doesn't need for its other (lighter-weight) callers.
 */
export default defineEventHandler(async (event) => {
  const { candidate: candidateSession } = await requireCandidateSession(event)

  const result = await db.query.candidate.findFirst({
    where: eq(candidate.id, candidateSession.id),
    columns: {
      id: true,
      organizationId: true,
      firstName: true,
      lastName: true,
      displayName: true,
      email: true,
      phone: true,
      gender: true,
      dateOfBirth: true,
      quickNotes: true,
      skills: true,
      createdAt: true,
      updatedAt: true,
    },
    with: {
      applications: {
        columns: { id: true, status: true, score: true, notes: true, createdAt: true, updatedAt: true },
        with: {
          job: {
            columns: { id: true, title: true, location: true, type: true, remoteStatus: true, status: true },
          },
          interviews: {
            columns: {
              id: true,
              title: true,
              type: true,
              status: true,
              scheduledAt: true,
              duration: true,
              location: true,
              candidateResponse: true,
              candidateRespondedAt: true,
            },
            orderBy: (interviewTable, { desc }) => [desc(interviewTable.scheduledAt)],
          },
        },
        orderBy: (applicationTable, { desc }) => [desc(applicationTable.createdAt)],
      },
    },
  })

  if (!result) {
    throw createError({ statusCode: 404, statusMessage: 'No candidate profile found for this account' })
  }

  const [org, documents, preference] = await Promise.all([
    // Platform-level self-serve candidates have no owning org (issue #46).
    result.organizationId
      ? db.query.organization.findFirst({
          where: eq(organization.id, result.organizationId),
          columns: { id: true, name: true },
        })
      : Promise.resolve(undefined),
    db.query.document.findMany({
      where: eq(document.candidateId, result.id),
      columns: { type: true, parsedContent: true },
    }),
    db.query.candidatePreference.findFirst({
      where: eq(candidatePreference.candidateId, result.id),
      columns: { desiredTitles: true, locations: true, minSalary: true, maxSalary: true, employmentTypes: true },
    }),
  ])

  const resumeDocs = documents.filter(d => d.type === 'resume')
  const completeness = computeCandidateCompleteness({
    phone: result.phone,
    skills: result.skills,
    quickNotes: result.quickNotes,
    hasResumeDocument: resumeDocs.length > 0,
    hasParsedResume: resumeDocs.some(d => d.parsedContent != null),
    preference: preference ?? null,
  })

  const { organizationId, ...candidateFields } = result

  return {
    ...candidateFields,
    organization: org ?? null,
    completeness,
  }
})
