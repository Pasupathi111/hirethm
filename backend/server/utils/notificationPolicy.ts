/**
 * Match-notification policy (issue #27, parts A + C).
 *
 * Pure functions only — no DB, no I/O — so the policy is unit-testable and
 * enforced identically wherever it's applied. Callers resolve the org's
 * settings and pass them in.
 */

export type MatchNotificationChannel = 'in_app' | 'email' | 'both'

/** Lowest allowed configured threshold. Below this, matching is effectively unfiltered. */
export const MIN_READINESS_FLOOR = 0
/** Highest allowed configured threshold. 100 would mean "only perfect matches". */
export const MIN_READINESS_CEILING = 100
/** Used when an org has no settings row yet — matches the historical hardcoded value. */
export const DEFAULT_MIN_READINESS = 70

export interface ResolvedChannels {
  inApp: boolean
  email: boolean
}

/**
 * Expand a stored channel preference into the concrete channels to dispatch on.
 * Unknown values fall back to in-app: a notification the candidate can still
 * see in the portal is strictly safer than silently dropping it.
 */
export function resolveChannels(channel: MatchNotificationChannel | null | undefined): ResolvedChannels {
  switch (channel) {
    case 'email':
      return { inApp: false, email: true }
    case 'both':
      return { inApp: true, email: true }
    case 'in_app':
      return { inApp: true, email: false }
    default:
      return { inApp: true, email: false }
  }
}

/**
 * Whether a match scores highly enough to be created and to notify the candidate.
 * Boundary is inclusive: a score exactly at the threshold qualifies.
 */
export function meetsReadinessThreshold(score: number, threshold: number): boolean {
  return score >= normalizeThreshold(threshold)
}

/**
 * Clamp a configured threshold into the allowed range, falling back to the
 * default for null/undefined/NaN. Guards against a bad value disabling
 * matching entirely or letting every match through.
 */
export function normalizeThreshold(threshold: number | null | undefined): number {
  if (threshold == null || Number.isNaN(threshold)) return DEFAULT_MIN_READINESS
  return Math.min(MIN_READINESS_CEILING, Math.max(MIN_READINESS_FLOOR, Math.trunc(threshold)))
}
