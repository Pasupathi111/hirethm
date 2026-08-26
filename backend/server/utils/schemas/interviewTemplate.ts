import { z } from 'zod'

const interviewTypes = ['phone', 'video', 'in_person', 'panel', 'technical', 'take_home'] as const
const templateStatuses = ['active', 'draft', 'archived'] as const

export const createInterviewTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  type: z.enum(interviewTypes).default('video'),
  duration: z.number().int().min(5).max(480).default(60),
  questions: z.array(z.string().min(1).max(1000)).max(50).default([]),
  status: z.enum(templateStatuses).default('draft'),
})

export const updateInterviewTemplateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.enum(interviewTypes).optional(),
  duration: z.number().int().min(5).max(480).optional(),
  questions: z.array(z.string().min(1).max(1000)).max(50).optional(),
  status: z.enum(templateStatuses).optional(),
})

export const interviewTemplateIdParamSchema = z.object({
  id: z.string().uuid('Invalid template ID'),
})
