import { describe, expect, it } from 'vitest'
import {
  DEFAULT_CONSENT_EXPIRY_DAYS,
  computeConsentState,
  consentCutoff,
  normalizeExpiryDays,
  resolveLastActivity,
} from '../../server/utils/consentExpiry'

const MS_PER_DAY = 24 * 60 * 60 * 1000
const NOW = new Date('2026-08-26T12:00:00.000Z')
const daysAgo = (n: number) => new Date(NOW.getTime() - n * MS_PER_DAY)

const enabled = { enabled: true, expiryDays: 90 }
const disabled = { enabled: false, expiryDays: 90 }

describe('computeConsentState — active candidates', () => {
  it('treats a recently active candidate as consented', () => {
    const state = computeConsentState({
      policy: enabled, lastActivityAt: daysAgo(10), createdAt: daysAgo(200), now: NOW,
    })
    expect(state.expired).toBe(false)
    expect(state.daysRemaining).toBe(80)
  })

  it('never expires anyone while the policy is disabled', () => {
    const state = computeConsentState({
      policy: disabled, lastActivityAt: daysAgo(9999), createdAt: daysAgo(9999), now: NOW,
    })
    expect(state.expired).toBe(false)
    expect(state.expiresAt).toBeNull()
    expect(state.daysRemaining).toBeNull()
  })
})

describe('computeConsentState — expired candidates', () => {
  it('expires a candidate inactive beyond the window', () => {
    const state = computeConsentState({
      policy: enabled, lastActivityAt: daysAgo(120), createdAt: daysAgo(300), now: NOW,
    })
    expect(state.expired).toBe(true)
    expect(state.daysRemaining).toBe(0)
  })
})

describe('computeConsentState — boundary dates', () => {
  it('is still valid at exactly the expiry instant (inclusive)', () => {
    const state = computeConsentState({
      policy: enabled, lastActivityAt: daysAgo(90), createdAt: daysAgo(365), now: NOW,
    })
    expect(state.expired).toBe(false)
  })

  it('expires one millisecond past the window', () => {
    const state = computeConsentState({
      policy: enabled,
      lastActivityAt: new Date(daysAgo(90).getTime() - 1),
      createdAt: daysAgo(365),
      now: NOW,
    })
    expect(state.expired).toBe(true)
  })
})

describe('computeConsentState — renewal', () => {
  it('restores visibility as soon as activity is renewed', () => {
    const base = { policy: enabled, createdAt: daysAgo(400), now: NOW }
    expect(computeConsentState({ ...base, lastActivityAt: daysAgo(120) }).expired).toBe(true)
    // Same candidate, after any new activity today:
    expect(computeConsentState({ ...base, lastActivityAt: NOW }).expired).toBe(false)
  })
})

describe('resolveLastActivity', () => {
  it('falls back to creation time so brand-new candidates get a full window', () => {
    const createdAt = daysAgo(5)
    expect(resolveLastActivity({ lastActivityAt: null, createdAt })).toEqual(createdAt)
  })

  it('prefers real activity when present', () => {
    const lastActivityAt = daysAgo(1)
    expect(resolveLastActivity({ lastActivityAt, createdAt: daysAgo(50) })).toEqual(lastActivityAt)
  })

  it('does not expire a never-active candidate created inside the window', () => {
    const state = computeConsentState({
      policy: enabled, lastActivityAt: null, createdAt: daysAgo(3), now: NOW,
    })
    expect(state.expired).toBe(false)
  })
})

describe('normalizeExpiryDays', () => {
  it('defaults when unset', () => {
    expect(normalizeExpiryDays(null)).toBe(DEFAULT_CONSENT_EXPIRY_DAYS)
    expect(normalizeExpiryDays(Number.NaN)).toBe(DEFAULT_CONSENT_EXPIRY_DAYS)
  })

  it('clamps absurd values', () => {
    expect(normalizeExpiryDays(0)).toBe(1)
    expect(normalizeExpiryDays(-5)).toBe(1)
    expect(normalizeExpiryDays(99999)).toBe(3650)
  })
})

describe('consentCutoff', () => {
  it('returns null when disabled, signalling no SQL filter', () => {
    expect(consentCutoff(disabled, NOW)).toBeNull()
  })

  it('returns the instant before which candidates have lapsed', () => {
    expect(consentCutoff(enabled, NOW)).toEqual(daysAgo(90))
  })
})
