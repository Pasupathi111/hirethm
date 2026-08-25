import { describe, expect, it } from 'vitest'
import { computeMatch, DEFAULT_MATCH_PREFERENCE } from '../../server/utils/matching'

describe('computeMatch', () => {
  it('scores full skills overlap as 100% and includes a skills-alignment reason', () => {
    const result = computeMatch(
      { skills: ['React', 'TypeScript'], remoteStatus: null, location: null, salaryMin: null, salaryMax: null },
      { skills: ['React', 'TypeScript', 'Node.js'] },
      DEFAULT_MATCH_PREFERENCE,
    )

    const skillsCriterion = result.criteria.find((c) => c.label === 'Skills Match')
    expect(skillsCriterion?.value).toBe(100)
    expect(result.reasons.some((r) => r.toLowerCase().includes('skills alignment'))).toBe(true)
  })

  it('defaults skills match to 60 when either side has no skills', () => {
    const resultNoJobSkills = computeMatch(
      { skills: [], remoteStatus: null, location: null, salaryMin: null, salaryMax: null },
      { skills: ['React'] },
      DEFAULT_MATCH_PREFERENCE,
    )
    expect(resultNoJobSkills.criteria.find((c) => c.label === 'Skills Match')?.value).toBe(60)

    const resultNoCandidateSkills = computeMatch(
      { skills: ['React'], remoteStatus: null, location: null, salaryMin: null, salaryMax: null },
      { skills: [] },
      DEFAULT_MATCH_PREFERENCE,
    )
    expect(resultNoCandidateSkills.criteria.find((c) => c.label === 'Skills Match')?.value).toBe(60)
  })

  it('scores partial skills overlap proportionally', () => {
    const result = computeMatch(
      { skills: ['React', 'TypeScript', 'GraphQL', 'Docker'], remoteStatus: null, location: null, salaryMin: null, salaryMax: null },
      { skills: ['React', 'TypeScript'] },
      DEFAULT_MATCH_PREFERENCE,
    )
    expect(result.criteria.find((c) => c.label === 'Skills Match')?.value).toBe(50)
  })

  it('gives location preference 100 when workMode is "any"', () => {
    const result = computeMatch(
      { skills: [], remoteStatus: 'onsite', location: 'Berlin', salaryMin: null, salaryMax: null },
      { skills: [] },
      { ...DEFAULT_MATCH_PREFERENCE, workMode: 'any' },
    )
    expect(result.criteria.find((c) => c.label === 'Location Preference')?.value).toBe(100)
  })

  it('matches location preference on remoteStatus and reasons include the work mode', () => {
    const result = computeMatch(
      { skills: [], remoteStatus: 'remote', location: null, salaryMin: null, salaryMax: null },
      { skills: [] },
      { ...DEFAULT_MATCH_PREFERENCE, workMode: 'remote' },
    )
    expect(result.criteria.find((c) => c.label === 'Location Preference')?.value).toBe(100)
    expect(result.reasons.some((r) => r.toLowerCase().includes('remote matches your preference'))).toBe(true)
  })

  it('falls back to matching a preferred location string against job.location', () => {
    const result = computeMatch(
      { skills: [], remoteStatus: 'onsite', location: 'Austin, TX', salaryMin: null, salaryMax: null },
      { skills: [] },
      { ...DEFAULT_MATCH_PREFERENCE, workMode: 'hybrid', locations: ['Austin'] },
    )
    expect(result.criteria.find((c) => c.label === 'Location Preference')?.value).toBe(100)
  })

  it('defaults location preference to 60 when nothing matches', () => {
    const result = computeMatch(
      { skills: [], remoteStatus: 'onsite', location: 'Berlin', salaryMin: null, salaryMax: null },
      { skills: [] },
      { ...DEFAULT_MATCH_PREFERENCE, workMode: 'remote', locations: ['Austin'] },
    )
    expect(result.criteria.find((c) => c.label === 'Location Preference')?.value).toBe(60)
  })

  it('scores salary fit as 100 when ranges overlap', () => {
    const result = computeMatch(
      { skills: [], remoteStatus: null, location: null, salaryMin: 90_000, salaryMax: 120_000 },
      { skills: [] },
      { ...DEFAULT_MATCH_PREFERENCE, minSalary: 100_000, maxSalary: 140_000 },
    )
    expect(result.criteria.find((c) => c.label === 'Salary Fit')?.value).toBe(100)
  })

  it('defaults salary fit to 75 when ranges do not overlap', () => {
    const result = computeMatch(
      { skills: [], remoteStatus: null, location: null, salaryMin: 50_000, salaryMax: 60_000 },
      { skills: [] },
      { ...DEFAULT_MATCH_PREFERENCE, minSalary: 100_000, maxSalary: 140_000 },
    )
    expect(result.criteria.find((c) => c.label === 'Salary Fit')?.value).toBe(75)
  })

  it('defaults salary fit to 75 when either side has no salary data', () => {
    const result = computeMatch(
      { skills: [], remoteStatus: null, location: null, salaryMin: null, salaryMax: null },
      { skills: [] },
      { ...DEFAULT_MATCH_PREFERENCE, minSalary: 100_000, maxSalary: 140_000 },
    )
    expect(result.criteria.find((c) => c.label === 'Salary Fit')?.value).toBe(75)
  })

  it('always emits exactly 8 criteria with the fixed labels', () => {
    const result = computeMatch(
      { skills: [], remoteStatus: null, location: null, salaryMin: null, salaryMax: null },
      { skills: [] },
      DEFAULT_MATCH_PREFERENCE,
    )
    expect(result.criteria).toHaveLength(8)
    expect(result.criteria.map((c) => c.label)).toEqual([
      'Skills Match', 'Experience Match', 'Career Goals', 'Location Preference',
      'Salary Fit', 'Availability', 'Culture & Role Fit', 'Potential & Growth',
    ])
  })

  it('reports a gap naming the weakest criterion when any score is below 70', () => {
    const result = computeMatch(
      { skills: ['Rust'], remoteStatus: 'onsite', location: 'Berlin', salaryMin: null, salaryMax: null },
      { skills: [] },
      { ...DEFAULT_MATCH_PREFERENCE, workMode: 'remote', locations: ['Austin'] },
    )
    // Skills Match (60) and Location Preference (60) both fall below 70.
    expect(result.gap).toBeDefined()
    expect(result.gap).toMatch(/could be stronger/)
  })

  it('omits the gap when every criterion scores 70 or above', () => {
    const result = computeMatch(
      { skills: ['React'], remoteStatus: null, location: null, salaryMin: null, salaryMax: null },
      { skills: ['React'] },
      DEFAULT_MATCH_PREFERENCE,
    )
    expect(result.gap).toBeUndefined()
  })

  it('computes the overall score as the rounded average of all 8 criteria', () => {
    const result = computeMatch(
      { skills: ['React'], remoteStatus: null, location: null, salaryMin: null, salaryMax: null },
      { skills: ['React'] },
      DEFAULT_MATCH_PREFERENCE,
    )
    const expected = Math.round(result.criteria.reduce((sum, c) => sum + c.value, 0) / result.criteria.length)
    expect(result.score).toBe(expected)
  })
})
