/**
 * Candidate <-> Job match scoring.
 *
 * Computes a score across 8 fixed criteria. Only three of them currently have
 * a real underlying signal in the data model (Skills Match, Location
 * Preference, Salary Fit). The other five — Experience Match, Career Goals,
 * Availability, Culture & Role Fit, Potential & Growth — have no supporting
 * data anywhere in the schema yet (no candidate seniority/experience field,
 * no stated career goals, no availability/notice-period field, no culture
 * survey, no growth-trajectory signal). Rather than fabricate precision we
 * give them a fixed neutral default (75) until real signals exist for them.
 * This is called out inline below — do not quietly bump these without also
 * adding the underlying data.
 */

export interface MatchCriterion {
  label: string
  value: number
}

export interface MatchResult {
  score: number
  criteria: MatchCriterion[]
  reasons: string[]
  gap?: string
}

export interface MatchJobInput {
  skills: string[] | null | undefined
  remoteStatus: string | null | undefined
  location: string | null | undefined
  salaryMin: number | null | undefined
  salaryMax: number | null | undefined
}

export interface MatchCandidateInput {
  skills: string[] | null | undefined
}

export interface MatchPreferenceInput {
  workMode: 'remote' | 'hybrid' | 'onsite' | 'any'
  locations: string[] | null | undefined
  minSalary: number | null | undefined
  maxSalary: number | null | undefined
}

/** Neutral default used for criteria with no real underlying signal yet. */
const NO_SIGNAL_DEFAULT = 75

/** Default preference to use when a candidate hasn't saved one yet. */
export const DEFAULT_MATCH_PREFERENCE: MatchPreferenceInput = {
  workMode: 'any',
  locations: [],
  minSalary: null,
  maxSalary: null,
}

function skillsMatch(jobSkills: string[], candidateSkills: string[]): { value: number; overlap: string[] } {
  if (jobSkills.length === 0 || candidateSkills.length === 0) {
    return { value: 60, overlap: [] }
  }
  const candidateSet = new Set(candidateSkills.map((s) => s.toLowerCase()))
  const overlap = jobSkills.filter((s) => candidateSet.has(s.toLowerCase()))
  const pct = Math.round((overlap.length / jobSkills.length) * 100)
  return { value: Math.max(0, Math.min(100, pct)), overlap }
}

function locationMatch(job: MatchJobInput, preference: MatchPreferenceInput): { value: number; matched: boolean } {
  const jobRemote = job.remoteStatus?.toLowerCase() ?? null

  // "any" preference is always satisfied.
  if (preference.workMode === 'any') {
    return { value: 100, matched: true }
  }

  // Direct work-mode match (remote/hybrid/onsite) against the job's remoteStatus.
  if (jobRemote && jobRemote === preference.workMode) {
    return { value: 100, matched: true }
  }

  // Fall back to matching the job's location text against any of the
  // candidate's preferred locations.
  const jobLocation = job.location?.toLowerCase() ?? ''
  const locations = preference.locations ?? []
  if (jobLocation && locations.some((loc) => jobLocation.includes(loc.toLowerCase()))) {
    return { value: 100, matched: true }
  }

  return { value: 60, matched: false }
}

function salaryFit(job: MatchJobInput, preference: MatchPreferenceInput): number {
  const jobMin = job.salaryMin
  const jobMax = job.salaryMax
  const prefMin = preference.minSalary
  const prefMax = preference.maxSalary

  // If either side has no salary data at all, we can't compare — default.
  if (jobMin == null && jobMax == null) return NO_SIGNAL_DEFAULT
  if (prefMin == null && prefMax == null) return NO_SIGNAL_DEFAULT

  const jLow = jobMin ?? jobMax!
  const jHigh = jobMax ?? jobMin!
  const pLow = prefMin ?? prefMax!
  const pHigh = prefMax ?? prefMin!

  const overlapLow = Math.max(jLow, pLow)
  const overlapHigh = Math.min(jHigh, pHigh)

  if (overlapHigh >= overlapLow) {
    // Ranges overlap — full fit.
    return 100
  }

  return NO_SIGNAL_DEFAULT
}

/**
 * Compute a candidate <-> job match score across 8 fixed criteria.
 */
export function computeMatch(
  job: MatchJobInput,
  candidate: MatchCandidateInput,
  preference: MatchPreferenceInput = DEFAULT_MATCH_PREFERENCE,
): MatchResult {
  const jobSkills = job.skills ?? []
  const candidateSkills = candidate.skills ?? []

  const skills = skillsMatch(jobSkills, candidateSkills)
  const location = locationMatch(job, preference)
  const salary = salaryFit(job, preference)

  const criteria: MatchCriterion[] = [
    { label: 'Skills Match', value: skills.value },
    // No real signal yet — no candidate seniority/years-of-experience field exists.
    { label: 'Experience Match', value: NO_SIGNAL_DEFAULT },
    // No real signal yet — no stated career-goals field exists.
    { label: 'Career Goals', value: NO_SIGNAL_DEFAULT },
    { label: 'Location Preference', value: location.value },
    { label: 'Salary Fit', value: salary },
    // No real signal yet — no availability/notice-period field exists.
    { label: 'Availability', value: NO_SIGNAL_DEFAULT },
    // No real signal yet — no culture/role-fit survey data exists.
    { label: 'Culture & Role Fit', value: NO_SIGNAL_DEFAULT },
    // No real signal yet — no growth-trajectory signal exists.
    { label: 'Potential & Growth', value: NO_SIGNAL_DEFAULT },
  ]

  const score = Math.round(criteria.reduce((sum, c) => sum + c.value, 0) / criteria.length)

  const reasons = buildReasons(criteria, skills.overlap, preference)
  const gap = buildGap(criteria)

  return { score, criteria, reasons, gap: gap ?? undefined }
}

function buildReasons(
  criteria: MatchCriterion[],
  skillOverlap: string[],
  preference: MatchPreferenceInput,
): string[] {
  const reasons: string[] = []

  if (skillOverlap.length > 0) {
    reasons.push(`Strong skills alignment across ${skillOverlap.slice(0, 3).join(', ')}`)
  }

  const locationCriterion = criteria.find((c) => c.label === 'Location Preference')
  if (locationCriterion && locationCriterion.value >= 100 && preference.workMode !== 'any') {
    reasons.push(`${capitalize(preference.workMode)} matches your preference`)
  }

  const salaryCriterion = criteria.find((c) => c.label === 'Salary Fit')
  if (salaryCriterion && salaryCriterion.value >= 100) {
    reasons.push('Salary range fits your expectations')
  }

  // Fill up to 4 reasons total with the next-highest scoring criteria, so
  // there's always at least one or two reasons even with a thin skills match.
  const sorted = [...criteria].sort((a, b) => b.value - a.value)
  for (const c of sorted) {
    if (reasons.length >= 4) break
    if (c.label === 'Skills Match' || c.label === 'Location Preference' || c.label === 'Salary Fit') continue
    if (c.value >= 75) {
      reasons.push(`Good fit on ${c.label.toLowerCase()}`)
    }
  }

  return reasons.slice(0, 4).length > 0 ? reasons.slice(0, 4) : ['Overall profile fit looks reasonable']
}

function buildGap(criteria: MatchCriterion[]): string | null {
  const weakest = [...criteria].sort((a, b) => a.value - b.value)[0]
  if (weakest && weakest.value < 70) {
    return `${weakest.label} could be stronger`
  }
  return null
}

function capitalize(s: string): string {
  return s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s
}
