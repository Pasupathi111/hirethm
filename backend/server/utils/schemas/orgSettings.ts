import { z } from 'zod'

// ─────────────────────────────────────────────
// Org settings validation schemas
// ─────────────────────────────────────────────

const integerFormField = (schema: z.ZodNumber) => z.preprocess(
  value => typeof value === 'string' && value.trim() !== '' ? Number(value) : value,
  schema,
)

export const updateOrgSettingsSchema = z.object({
  nameDisplayFormat: z.enum(['first_last', 'last_first']).optional(),
  dateFormat: z.enum(['mdy', 'dmy', 'ymd']).optional(),
  // ── GDPR retention policy ──
  retentionEnabled: z.boolean().optional(),
  retentionMonths: integerFormField(z.number().int().min(1).max(120)).optional(),
  quarantineDays: integerFormField(z.number().int().min(0).max(365)).optional(),
  // ── Match notification policy (issue #27) ──
  matchNotificationChannel: z.enum(['in_app', 'email', 'both']).optional(),
  minReadinessScore: integerFormField(z.number().int().min(0).max(100)).optional(),
  // ── Consent expiry (issue #27) ──
  consentExpiryEnabled: z.boolean().optional(),
  consentExpiryDays: integerFormField(z.number().int().min(1).max(3650)).optional(),
  // ── Application-form privacy notice ──
  privacyPolicyUrl: z.string().url().max(2000).nullish().or(z.literal('')),
  privacyPolicyText: z.string().max(5000).nullish(),
  privacyContactEmail: z.string().email().max(255).nullish().or(z.literal('')),
})
