import { and, eq, sql, type SQL } from 'drizzle-orm'
import { candidate, orgSettings } from '../database/schema'
import { computeConsentState, consentCutoff, type ConsentExpiryPolicy } from './consentExpiry'

/**
 * Server-side enforcement of consent expiry (issue #27, part B).
 *
 * Every endpoint that exposes candidate data to a recruiter must go through
 * here, so an expired candidate cannot be reached via an alternate route.
 * Frontend filtering is never the enforcement boundary.
 */

/** Load an org's consent policy. Orgs with no settings row default to disabled. */
export async function loadConsentPolicy(organizationId: string): Promise<ConsentExpiryPolicy> {
  const row = await db.query.orgSettings.findFirst({
    where: eq(orgSettings.organizationId, organizationId),
    columns: { consentExpiryEnabled: true, consentExpiryDays: true },
  })
  return {
    enabled: row?.consentExpiryEnabled ?? false,
    expiryDays: row?.consentExpiryDays ?? 90,
  }
}

/**
 * A WHERE fragment restricting a candidate query to those whose consent is
 * still valid. Returns undefined when the policy is disabled, so callers can
 * spread it into an existing condition list with no effect.
 *
 * "Last activity" = the most recent application update for this candidate,
 * falling back to when the candidate record was created.
 *
 * Two non-obvious details, both found the hard way:
 *
 *  1. Identifiers are written literally instead of interpolated via
 *     `${table}` — Drizzle mis-renders table references inside a correlated
 *     subquery. Only the cutoff is parameterized, so this stays injection-safe.
 *
 *  2. The cutoff is passed as an ISO *string* with an explicit ::timestamp
 *     cast, not as a Date. Drizzle converts Date → string automatically for
 *     typed columns, but inside a raw `sql` fragment it hands the Date
 *     straight to postgres.js, which throws
 *     "The string argument must be of type string ... Received an instance
 *     of Date" and 500s the whole endpoint.
 */
export function consentVisibilityCondition(
  policy: ConsentExpiryPolicy,
  now: Date = new Date(),
): SQL | undefined {
  const cutoff = consentCutoff(policy, now)
  if (!cutoff) return undefined
  return sql`GREATEST(
    "candidate"."created_at",
    COALESCE((
      SELECT MAX("application"."updated_at")
      FROM "application"
      WHERE "application"."candidate_id" = "candidate"."id"
    ), "candidate"."created_at")
  ) >= ${cutoff.toISOString()}::timestamp`
}

/**
 * Assert a single candidate is still visible, for detail/export style
 * endpoints that fetch by id. Throws 404 rather than 403 so an expired
 * candidate is indistinguishable from a non-existent one — revealing
 * "this candidate exists but you may not see them" would leak their existence.
 */
export async function assertCandidateVisible(params: {
  organizationId: string
  candidateId: string
  policy?: ConsentExpiryPolicy
  now?: Date
}): Promise<void> {
  const policy = params.policy ?? await loadConsentPolicy(params.organizationId)
  if (!policy.enabled) return

  const row = await db.query.candidate.findFirst({
    where: and(eq(candidate.id, params.candidateId), eq(candidate.organizationId, params.organizationId)),
    columns: { id: true, createdAt: true },
    with: {
      applications: {
        columns: { updatedAt: true },
        orderBy: (a, { desc }) => [desc(a.updatedAt)],
        limit: 1,
      },
    },
  })

  // Missing rows are handled by the caller's own 404 — don't mask it here.
  if (!row) return

  const state = computeConsentState({
    policy,
    lastActivityAt: row.applications[0]?.updatedAt ?? null,
    createdAt: row.createdAt,
    now: params.now,
  })

  if (state.expired) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
}
