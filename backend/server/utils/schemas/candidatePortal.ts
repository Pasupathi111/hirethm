import { z } from 'zod'

// ─────────────────────────────────────────────
// Candidate self-service portal validation schemas
// ─────────────────────────────────────────────

const workModeValues = ['remote', 'hybrid', 'onsite', 'any'] as const

/** Schema for candidate-portal :id route params (matches, notifications, documents) */
export const candidatePortalIdParamSchema = z.object({
  id: z.string().min(1),
})

/** PATCH /api/me/matches/:id body */
export const updateMatchStatusSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
})

/** POST /api/me/interviews/:id/respond body */
export const respondToInterviewSchema = z.object({
  response: z.enum(['accepted', 'declined', 'tentative']),
})

/** PATCH /api/me/notifications/:id body */
export const updateNotificationSchema = z.object({
  isRead: z.literal(true),
})

/** PUT /api/me/preferences body */
export const updatePreferencesSchema = z.object({
  desiredTitles: z.array(z.string().trim().min(1).max(200)).max(20).default([]),
  locations: z.array(z.string().trim().min(1).max(200)).max(20).default([]),
  workMode: z.enum(workModeValues).default('any'),
  sourcingVisibility: z.enum(['open', 'manual', 'hidden']).default('open'),
  minSalary: z.coerce.number().int().min(0).nullable().optional(),
  maxSalary: z.coerce.number().int().min(0).nullable().optional(),
  employmentTypes: z.array(z.enum(['full_time', 'part_time', 'contract', 'internship'])).max(10).default([]),
  notifyMatches: z.boolean().default(true),
  notifyApplications: z.boolean().default(true),
  notifyInterviews: z.boolean().default(true),
})

/**
 * POST /api/me/candidate body — self-serve profile creation (issue #46).
 *
 * Email is NOT accepted: it is always taken from the authenticated session, so
 * a user can never create a profile under someone else's address.
 */
export const createSelfCandidateSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  phone: z.string().trim().max(50).nullish(),
  skills: z.array(z.string().trim().min(1).max(100)).max(100).default([]),
})

/** PATCH /api/me/candidate body — self-edit is restricted to a small field set */
export const updateSelfCandidateSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100).optional(),
  lastName: z.string().trim().min(1, 'Last name is required').max(100).optional(),
  displayName: z.string().trim().max(200).nullish(),
  phone: z.string().trim().max(50).nullish(),
  skills: z.array(z.string().trim().min(1).max(100)).max(100).optional(),
  // The portal's "About" section writes here. Omitting it meant Zod stripped
  // the key silently, so the edit dialog reported success while saving nothing.
  quickNotes: z.string().trim().max(5000).nullish(),
})
