/**
 * Consent expiry (issue #27, part B).
 *
 * BRD consent model: a candidate's visibility to recruiters is not permanent.
 * After a configured period of inactivity their consent lapses and they must
 * stop appearing in recruiting workflows until activity renews it.
 *
 * Distinct from GDPR retention (server/utils/retention.ts), which *deletes*
 * data. This only revokes *visibility* — nothing is destroyed, and any new
 * activity restores it immediately.
 *
 * Pure functions only, so the policy is unit-testable and identical across
 * every endpoint that exposes candidates.
 */

export const DEFAULT_CONSENT_EXPIRY_DAYS = 90
export const MIN_CONSENT_EXPIRY_DAYS = 1
export const MAX_CONSENT_EXPIRY_DAYS = 3650 // 10 years

const MS_PER_DAY = 24 * 60 * 60 * 1000

export interface ConsentExpiryPolicy {
  enabled: boolean
  expiryDays: number
}

export interface ConsentState {
  /** True when consent has lapsed and the candidate must be hidden from recruiters. */
  expired: boolean
  /** When consent lapses (or lapsed). Null when the policy is disabled. */
  expiresAt: Date | null
  /** Whole days until expiry; 0 once expired. Null when the policy is disabled. */
  daysRemaining: number | null
}

/** Clamp a configured expiry window, falling back to the default for bad input. */
export function normalizeExpiryDays(days: number | null | undefined): number {
  if (days == null || Number.isNaN(days)) return DEFAULT_CONSENT_EXPIRY_DAYS
  return Math.min(MAX_CONSENT_EXPIRY_DAYS, Math.max(MIN_CONSENT_EXPIRY_DAYS, Math.trunc(days)))
}

/**
 * Resolve the moment a candidate was last "active".
 *
 * Falls back to creation time so a brand-new candidate who has done nothing
 * yet still gets a full window rather than being instantly expired.
 */
export function resolveLastActivity(input: {
  lastActivityAt?: Date | null
  createdAt: Date
}): Date {
  return input.lastActivityAt ?? input.createdAt
}

/**
 * Compute whether a candidate's consent has lapsed.
 *
 * Expiry is inclusive of the boundary: at exactly `expiryDays` of inactivity
 * consent is still valid, and it lapses once that instant has passed. This
 * matches how a user reads "visibility lasts 90 days".
 */
export function computeConsentState(input: {
  policy: ConsentExpiryPolicy
  lastActivityAt?: Date | null
  createdAt: Date
  now?: Date
}): ConsentState {
  if (!input.policy.enabled) {
    return { expired: false, expiresAt: null, daysRemaining: null }
  }

  const now = input.now ?? new Date()
  const days = normalizeExpiryDays(input.policy.expiryDays)
  const lastActivity = resolveLastActivity(input)
  const expiresAt = new Date(lastActivity.getTime() + days * MS_PER_DAY)

  const expired = now.getTime() > expiresAt.getTime()
  const daysRemaining = expired
    ? 0
    : Math.ceil((expiresAt.getTime() - now.getTime()) / MS_PER_DAY)

  return { expired, expiresAt, daysRemaining }
}

/**
 * The cutoff instant for SQL filtering: candidates whose last activity is
 * strictly older than this have lapsed. Returns null when the policy is off,
 * signalling callers to apply no filter at all.
 */
export function consentCutoff(policy: ConsentExpiryPolicy, now: Date = new Date()): Date | null {
  if (!policy.enabled) return null
  return new Date(now.getTime() - normalizeExpiryDays(policy.expiryDays) * MS_PER_DAY)
}
