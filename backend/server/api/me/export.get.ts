import { eq } from 'drizzle-orm'
import {
  candidate,
  candidateMatch,
  candidateNotification,
  candidatePreference,
} from '../../database/schema'

/**
 * GET /api/me/export
 *
 * Data-subject access export (GDPR Art. 15 / 20) for the signed-in candidate,
 * downloaded directly as JSON.
 *
 * The recruiter-facing equivalent is `GET /api/candidates/:id/export`, which
 * lets an org answer a request on a candidate's behalf. This one is the
 * candidate exercising the right themselves, so the two differ in what they
 * can safely include:
 *
 *  - **No identity check is needed here** — the session *is* the proof of
 *    identity, which is why this route needs no `recordRetentionAudit` entry
 *    for controller accountability the way the recruiter route does.
 *  - **Recruiter-authored data is excluded.** Internal comments, custom
 *    properties and `quickNotes` are the employer's assessment notes. They are
 *    still personal data, but releasing them through a self-service endpoint
 *    would route around the controller's obligation to review a subject
 *    access request before disclosure. A candidate who wants those asks the
 *    employer, who uses the recruiter export.
 *
 * Everything the candidate themselves created or that the platform generated
 * about them on the HireThm side is included.
 */
export default defineEventHandler(async (event) => {
  const { session, candidate: me } = await requireCandidateSession(event)

  const record = await db.query.candidate.findFirst({
    where: eq(candidate.id, me.id),
    columns: {
      id: true,
      firstName: true,
      lastName: true,
      displayName: true,
      email: true,
      phone: true,
      gender: true,
      dateOfBirth: true,
      skills: true,
      createdAt: true,
      updatedAt: true,
    },
    with: {
      documents: {
        columns: {
          id: true,
          type: true,
          originalFilename: true,
          mimeType: true,
          sizeBytes: true,
          parsedContent: true,
          createdAt: true,
        },
      },
      applications: {
        with: {
          job: { columns: { id: true, title: true, slug: true } },
          responses: true,
          interviews: {
            columns: {
              id: true,
              title: true,
              type: true,
              status: true,
              scheduledAt: true,
              duration: true,
              location: true,
              timezone: true,
              candidateResponse: true,
              createdAt: true,
            },
          },
        },
      },
    },
  })

  if (!record) {
    throw createError({ statusCode: 404, statusMessage: 'No candidate profile found for this account' })
  }

  const [matches, preferences, notifications] = await Promise.all([
    db.query.candidateMatch.findMany({
      where: eq(candidateMatch.candidateId, me.id),
      with: { job: { columns: { id: true, title: true } } },
    }),
    db.query.candidatePreference.findFirst({
      where: eq(candidatePreference.candidateId, me.id),
    }),
    db.query.candidateNotification.findMany({
      where: eq(candidateNotification.candidateId, me.id),
    }),
  ])

  const filename = `hirethm-my-data-${new Date().toISOString().slice(0, 10)}.json`
  setHeader(event, 'Content-Type', 'application/json')
  setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)

  return {
    exportedAt: new Date().toISOString(),
    account: {
      email: session.user.email,
      name: session.user.name,
      createdAt: session.user.createdAt,
    },
    profile: record,
    // `criteria` on each match is the per-criterion Mutual Readiness breakdown.
    // Art. 15(1)(h) covers the logic behind automated decisions, so the score
    // and its reasoning are included rather than just the final number.
    matches,
    preferences: preferences ?? null,
    notifications,
    notice:
      'Uploaded file contents (CVs, cover letters) are not embedded here — download them individually from the Resume page. '
      + 'Notes and assessments written about you by an employer are not included; request those from the employer directly.',
  }
})
