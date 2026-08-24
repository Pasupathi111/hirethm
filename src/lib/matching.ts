import { candidateProfile, matches } from "@/data/mockData"
import type { Job } from "@/types"

/** Prefer the real computed readiness score when a match exists; otherwise estimate from skill overlap. */
export function estimateReadiness(job: Job) {
  const match = matches.find((m) => m.jobId === job.id)
  if (match) return match.readiness
  const overlap = job.skills.filter((skill) => candidateProfile.skills.includes(skill)).length
  return Math.min(96, 52 + overlap * 9)
}

/** Short, human-readable reasons behind a job's match score, for AI-transparency surfaces. */
export function matchReasonsFor(job: Job) {
  const match = matches.find((m) => m.jobId === job.id)
  if (match) return match.reasons.slice(0, 2)
  const overlap = job.skills.filter((skill) => candidateProfile.skills.includes(skill))
  const reasons: string[] = []
  if (overlap.length > 0) reasons.push(`Skills alignment across ${overlap.join(", ")}`)
  reasons.push(`${job.workMode} matches your preference`)
  return reasons
}
