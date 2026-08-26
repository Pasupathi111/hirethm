import { and, ilike, isNull } from 'drizzle-orm'
import { candidate } from '../../database/schema'
import { createSelfCandidateSchema } from '../../utils/schemas/candidatePortal'

/**
 * POST /api/me/candidate
 *
 * Self-serve candidate profile creation (issue #46) — the missing step that
 * left signup dead-ending, since every other /api/me/* route requires a
 * candidate row to already exist.
 *
 * Creates a PLATFORM-LEVEL candidate (organizationId NULL): per BRD §2 a
 * candidate registers on HireThm, not into an employer's database. Recruiter
 * queries all filter `eq(organizationId, orgId)`, so this profile stays
 * invisible to employers until the candidate actually applies or accepts a
 * match — the consent-first behaviour the BRD requires.
 *
 * Deliberately NOT using requireCandidateSession: that throws 404 when no
 * profile exists, which is precisely the state this endpoint resolves.
 */
export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readValidatedBody(event, createSelfCandidateSchema.parse)

  // Email comes from the session, never the request body — a user must not be
  // able to create a profile under an address they don't control.
  const email = session.user.email.toLowerCase()

  // Idempotent: if this person already has a profile (self-serve, or created
  // by an employer when they applied somewhere), return it instead of creating
  // a duplicate. Mirrors requireCandidateSession's resolution order.
  const existing = await db.query.candidate.findFirst({
    where: and(ilike(candidate.email, email), isNull(candidate.quarantinedAt)),
    orderBy: (c, { asc, sql }) => [
      sql`CASE WHEN ${c.organizationId} IS NULL THEN 0 ELSE 1 END`,
      asc(c.createdAt),
    ],
    columns: { id: true },
  })

  if (existing) {
    setResponseStatus(event, 200)
    return db.query.candidate.findFirst({
      where: (c, { eq }) => eq(c.id, existing.id),
      columns: {
        id: true, firstName: true, lastName: true, displayName: true,
        email: true, phone: true, skills: true, organizationId: true,
        createdAt: true, updatedAt: true,
      },
    })
  }

  const [created] = await db.insert(candidate).values({
    organizationId: null,
    firstName: body.firstName,
    lastName: body.lastName,
    email,
    phone: body.phone ?? null,
    skills: body.skills,
  }).returning({
    id: candidate.id,
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    displayName: candidate.displayName,
    email: candidate.email,
    phone: candidate.phone,
    skills: candidate.skills,
    organizationId: candidate.organizationId,
    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt,
  })

  setResponseStatus(event, 201)
  return created
})
