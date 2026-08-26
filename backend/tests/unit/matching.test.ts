import { describe, expect, it } from 'vitest'
import {
  computeMatch,
  DEFAULT_MATCH_PREFERENCE,
  DEFAULT_MATCH_WEIGHTS,
  MATCH_CRITERIA_LABELS,
  resolveWeights,
} from '../../server/utils/matching'

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

  it('computes the overall score as the weighted mean under the default weights', () => {
    const result = computeMatch(
      { skills: ['React'], remoteStatus: null, location: null, salaryMin: null, salaryMax: null },
      { skills: ['React'] },
      DEFAULT_MATCH_PREFERENCE,
    )
    const weighted = result.criteria.reduce(
      (sum, c) => sum + c.value * DEFAULT_MATCH_WEIGHTS[c.label as keyof typeof DEFAULT_MATCH_WEIGHTS],
      0,
    )
    const totalWeight = Object.values(DEFAULT_MATCH_WEIGHTS).reduce((a, b) => a + b, 0)
    expect(result.score).toBe(Math.round(weighted / totalWeight))
  })
})

describe('criterion weighting (issue #69)', () => {
  const job = { skills: ['React'], remoteStatus: null, location: null, salaryMin: null, salaryMax: null }
  const perfectSkills = { skills: ['React'] }
  const noSkills = { skills: [] }

  /**
   * `resolveWeights` intentionally substitutes the default weight for any
   * criterion the caller omits (so a stored config predating a new criterion
   * still weights it sensibly). Tests that want a criterion excluded must
   * therefore pass an explicit 0 rather than leaving the key out.
   */
  const only = (overrides: Record<string, number>) =>
    Object.fromEntries(MATCH_CRITERIA_LABELS.map(l => [l, overrides[l] ?? 0]))

  it('exposes exactly the eight BRD criteria, in scoring order', () => {
    const result = computeMatch(job, perfectSkills, DEFAULT_MATCH_PREFERENCE)
    expect(result.criteria.map(c => c.label)).toEqual([...MATCH_CRITERIA_LABELS])
  })

  it('gives every criterion a default weight', () => {
    for (const label of MATCH_CRITERIA_LABELS) {
      expect(DEFAULT_MATCH_WEIGHTS[label]).toBeGreaterThan(0)
    }
  })

  it('lets a single criterion dominate the score when it carries all the weight', () => {
    const skillsOnly = computeMatch(job, perfectSkills, DEFAULT_MATCH_PREFERENCE, only({ 'Skills Match': 100 }))
    const skills = skillsOnly.criteria.find(c => c.label === 'Skills Match')!
    expect(skillsOnly.score).toBe(skills.value)
  })

  it('produces a lower score than the default weighting when the weighted criterion is weak', () => {
    const weighted = computeMatch(job, noSkills, DEFAULT_MATCH_PREFERENCE, only({ 'Skills Match': 100 }))
    const balanced = computeMatch(job, noSkills, DEFAULT_MATCH_PREFERENCE)
    expect(weighted.score).toBeLessThan(balanced.score)
  })

  it('normalizes by total weight, so weights need not sum to 100', () => {
    const asHundred = computeMatch(job, perfectSkills, DEFAULT_MATCH_PREFERENCE, only({ 'Skills Match': 50, 'Salary Fit': 50 }))
    const asTwo = computeMatch(job, perfectSkills, DEFAULT_MATCH_PREFERENCE, only({ 'Skills Match': 1, 'Salary Fit': 1 }))
    expect(asTwo.score).toBe(asHundred.score)
  })

  it('falls back to a flat mean rather than scoring zero when every weight is zero', () => {
    const allZero = computeMatch(
      job,
      perfectSkills,
      DEFAULT_MATCH_PREFERENCE,
      Object.fromEntries(MATCH_CRITERIA_LABELS.map(l => [l, 0])),
    )
    const flat = Math.round(
      allZero.criteria.reduce((sum, c) => sum + c.value, 0) / allZero.criteria.length,
    )
    expect(allZero.score).toBe(flat)
  })

  it('keeps default weights for criteria the caller omits', () => {
    const resolved = resolveWeights({ 'Skills Match': 42 })
    expect(resolved['Skills Match']).toBe(42)
    expect(resolved['Salary Fit']).toBe(DEFAULT_MATCH_WEIGHTS['Salary Fit'])
  })

  it('ignores negative and non-finite weights instead of corrupting the score', () => {
    const resolved = resolveWeights({ 'Skills Match': -10, 'Salary Fit': Number.NaN } as Record<string, number>)
    expect(resolved['Skills Match']).toBe(DEFAULT_MATCH_WEIGHTS['Skills Match'])
    expect(resolved['Salary Fit']).toBe(DEFAULT_MATCH_WEIGHTS['Salary Fit'])
  })

  it('treats null weights as "use the defaults"', () => {
    const explicit = computeMatch(job, perfectSkills, DEFAULT_MATCH_PREFERENCE, DEFAULT_MATCH_WEIGHTS)
    const implicit = computeMatch(job, perfectSkills, DEFAULT_MATCH_PREFERENCE, null)
    expect(implicit.score).toBe(explicit.score)
  })
})
