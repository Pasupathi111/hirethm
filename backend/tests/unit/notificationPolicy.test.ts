import { describe, expect, it } from 'vitest'
import {
  DEFAULT_MIN_READINESS,
  meetsReadinessThreshold,
  normalizeThreshold,
  resolveChannels,
} from '../../server/utils/notificationPolicy'

describe('resolveChannels', () => {
  it('maps in_app to in-app only', () => {
    expect(resolveChannels('in_app')).toEqual({ inApp: true, email: false })
  })

  it('maps email to email only', () => {
    expect(resolveChannels('email')).toEqual({ inApp: false, email: true })
  })

  it('maps both to in-app and email', () => {
    expect(resolveChannels('both')).toEqual({ inApp: true, email: true })
  })

  it('falls back to in-app for null/undefined rather than dropping the notification', () => {
    expect(resolveChannels(null)).toEqual({ inApp: true, email: false })
    expect(resolveChannels(undefined)).toEqual({ inApp: true, email: false })
  })
})

describe('meetsReadinessThreshold', () => {
  it('rejects a score below the threshold', () => {
    expect(meetsReadinessThreshold(69, 70)).toBe(false)
  })

  it('accepts a score exactly at the threshold (inclusive boundary)', () => {
    expect(meetsReadinessThreshold(70, 70)).toBe(true)
  })

  it('accepts a score above the threshold', () => {
    expect(meetsReadinessThreshold(71, 70)).toBe(true)
  })

  it('honours a raised threshold', () => {
    expect(meetsReadinessThreshold(80, 85)).toBe(false)
    expect(meetsReadinessThreshold(85, 85)).toBe(true)
  })

  it('lets everything through at a zero threshold', () => {
    expect(meetsReadinessThreshold(0, 0)).toBe(true)
  })
})

describe('normalizeThreshold', () => {
  it('defaults when unset', () => {
    expect(normalizeThreshold(null)).toBe(DEFAULT_MIN_READINESS)
    expect(normalizeThreshold(undefined)).toBe(DEFAULT_MIN_READINESS)
    expect(normalizeThreshold(Number.NaN)).toBe(DEFAULT_MIN_READINESS)
  })

  it('clamps out-of-range values instead of disabling or over-filtering matching', () => {
    expect(normalizeThreshold(-10)).toBe(0)
    expect(normalizeThreshold(150)).toBe(100)
  })

  it('truncates fractional thresholds', () => {
    expect(normalizeThreshold(72.9)).toBe(72)
  })
})
