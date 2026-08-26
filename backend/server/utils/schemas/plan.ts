import { z } from 'zod'

export const createPlanSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  tier: z.enum(['free', 'premium', 'enterprise']),
  priceMonthlyCents: z.number().int().min(0).nullable().optional(),
  currency: z.string().trim().length(3).default('USD'),
  activeJobLimit: z.number().int().min(0).nullable().optional(),
  profileViewQuota: z.number().int().min(0).nullable().optional(),
  features: z.array(z.string().trim().min(1).max(200)).max(20).default([]),
  isActive: z.boolean().default(true),
})

export const updatePlanSchema = createPlanSchema.partial()

export const assignSubscriptionSchema = z.object({
  planId: z.string().min(1),
  status: z.enum(['active', 'past_due', 'cancelled', 'trialing']).optional(),
})

export const planIdParamSchema = z.object({ id: z.string().min(1) })
