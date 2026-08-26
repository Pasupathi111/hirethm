/**
 * CV/profile completeness scoring.
 *
 * Deterministic, not AI-based — mirrors how resume-parser.ts's structured
 * extraction works. Per BRD business rule: an incomplete profile never
 * blocks the candidate, it only routes them toward an enhancement prompt.
 *
 * Weights are chosen to track what the Mutual Readiness Score actually
 * consumes (server/utils/matching.ts) — skills and preferences directly
 * feed Skills Match / Location Preference / Salary Fit, so a candidate
 * missing those gets a lower score and a specific hint to fix it.
 */

export interface CandidateCompletenessInput {
  phone: string | null
  skills: string[]
  quickNotes: string | null
  hasResumeDocument: boolean
  hasParsedResume: boolean
  preference: {
    desiredTitles: string[]
    locations: string[]
    minSalary: number | null
    maxSalary: number | null
    employmentTypes: string[]
  } | null
}

export interface CandidateCompletenessItem {
  key: string
  label: string
  met: boolean
  weight: number
  hint: string
}

export interface CandidateCompletenessResult {
  score: number
  isComplete: boolean
  items: CandidateCompletenessItem[]
  /** Hints for unmet items, ordered by weight descending — highest-impact first. */
  hints: string[]
}

const COMPLETE_THRESHOLD = 70

export function computeCandidateCompleteness(input: CandidateCompletenessInput): CandidateCompletenessResult {
  const hasPreferenceSignal = !!input.preference && (
    input.preference.desiredTitles.length > 0
    || input.preference.locations.length > 0
    || input.preference.employmentTypes.length > 0
  )
  const hasSalarySignal = !!input.preference && (input.preference.minSalary != null || input.preference.maxSalary != null)

  const items: CandidateCompletenessItem[] = [
    {
      key: 'resume',
      label: 'Resume uploaded',
      met: input.hasResumeDocument,
      weight: 25,
      hint: 'Upload your resume so HireThm can extract your experience and skills.',
    },
    {
      key: 'resumeParsed',
      label: 'Resume analyzed',
      met: input.hasParsedResume,
      weight: 10,
      hint: 'Your resume is uploaded but hasn\'t been analyzed yet — try re-uploading it.',
    },
    {
      key: 'skills',
      label: 'Skills listed',
      met: input.skills.length > 0,
      weight: 25,
      hint: `Add ${input.skills.length === 0 ? 'a few' : '2 more'} skills to improve your match quality.`,
    },
    {
      key: 'phone',
      label: 'Phone number',
      met: !!input.phone,
      weight: 10,
      hint: 'Add a phone number so employers can reach you.',
    },
    {
      key: 'preferences',
      label: 'Job preferences set',
      met: hasPreferenceSignal,
      weight: 20,
      hint: 'Set your desired roles and locations so HireThm can find better matches.',
    },
    {
      key: 'salary',
      label: 'Salary expectations set',
      met: hasSalarySignal,
      weight: 5,
      hint: 'Add a salary range to improve Salary Fit scoring on your matches.',
    },
    {
      key: 'notes',
      label: 'Profile summary added',
      met: !!input.quickNotes?.trim(),
      weight: 5,
      hint: 'Add a short summary to help employers understand your background.',
    },
  ]

  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0)
  const earnedWeight = items.filter(i => i.met).reduce((sum, i) => sum + i.weight, 0)
  const score = Math.round((earnedWeight / totalWeight) * 100)

  const hints = items
    .filter(i => !i.met)
    .sort((a, b) => b.weight - a.weight)
    .map(i => i.hint)

  return { score, isComplete: score >= COMPLETE_THRESHOLD, items, hints }
}
