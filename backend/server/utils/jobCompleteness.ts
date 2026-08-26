/**
 * JD (job description) completeness scoring — mirror of
 * candidateCompleteness.ts for the client/job side.
 *
 * Deterministic, not AI-based. Per BRD business rule, an incomplete JD never
 * blocks publishing — it only routes the recruiter toward the AI JD
 * enhancement flow. Weights track what the Mutual Readiness Score actually
 * consumes (server/utils/matching.ts) so a low score correlates with
 * genuinely weaker match quality for this job.
 */

const MIN_MEANINGFUL_DESCRIPTION_LENGTH = 100

export interface JobCompletenessInput {
  description: string | null
  skills: string[]
  location: string | null
  remoteStatus: string | null
  salaryMin: number | null
  salaryMax: number | null
  salaryNegotiable: boolean
  experienceLevel: string | null
}

export interface JobCompletenessItem {
  key: string
  label: string
  met: boolean
  weight: number
  hint: string
}

export interface JobCompletenessResult {
  score: number
  isComplete: boolean
  items: JobCompletenessItem[]
  hints: string[]
}

const COMPLETE_THRESHOLD = 70

export function computeJobCompleteness(input: JobCompletenessInput): JobCompletenessResult {
  const hasSalarySignal = input.salaryNegotiable || input.salaryMin != null || input.salaryMax != null

  const items: JobCompletenessItem[] = [
    {
      key: 'description',
      label: 'Description is detailed',
      met: (input.description?.trim().length ?? 0) >= MIN_MEANINGFUL_DESCRIPTION_LENGTH,
      weight: 25,
      hint: 'Add a fuller description — a short or missing description makes matching and AI scoring less accurate.',
    },
    {
      key: 'skills',
      label: 'Required skills listed',
      met: input.skills.length > 0,
      weight: 25,
      hint: 'Add required skills so candidates can be matched and ranked accurately.',
    },
    {
      key: 'location',
      label: 'Location or work mode set',
      met: !!input.location || !!input.remoteStatus,
      weight: 20,
      hint: 'Set a location or remote/hybrid/on-site status to improve Location Preference matching.',
    },
    {
      key: 'salary',
      label: 'Salary range set',
      met: hasSalarySignal,
      weight: 15,
      hint: 'Add a salary range (or mark it negotiable) to improve Salary Fit matching.',
    },
    {
      key: 'experienceLevel',
      label: 'Experience level set',
      met: !!input.experienceLevel,
      weight: 15,
      hint: 'Set an experience level to improve Experience Match scoring.',
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
