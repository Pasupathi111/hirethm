import { z } from 'zod'
import { jdChatMessageSchema, runJobDescriptionChat } from '../../utils/ai/jobDescriptionAssistant'
import type { SupportedProvider } from '../../utils/ai/provider'
import { loadAiConfig } from '../../utils/ai/loadConfig'
import { createRateLimiter } from '../../utils/rateLimit'

const bodySchema = z.object({
  messages: z.array(jdChatMessageSchema).min(1).max(30),
  /** Optional override — defaults to the org's default chatbot configuration. */
  aiConfigId: z.string().min(1).nullable().optional(),
})

const limiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 20,
  message: 'Too many AI job description requests. Please wait before retrying.',
})

/**
 * POST /api/jobs/ai-chat
 *
 * One turn of the "Create with AI" conversational job-description builder.
 * Takes the conversation so far and returns the assistant's reply plus,
 * once enough information has been gathered, a structured JD draft mapped
 * onto the same fields used by the manual job-creation wizard.
 */
export default defineEventHandler(async (event) => {
  await limiter(event)
  const session = await requirePermission(event, { job: ['create'] })
  const orgId = session.session.activeOrganizationId
  const body = await readValidatedBody(event, bodySchema.parse)

  const config = await loadAiConfig(orgId, { purpose: 'chatbot', preferId: body.aiConfigId })

  const turn = await runJobDescriptionChat(
    {
      provider: config.provider as SupportedProvider,
      model: config.model,
      apiKeyEncrypted: config.apiKeyEncrypted,
      baseUrl: config.baseUrl,
      maxTokens: config.maxTokens,
    },
    body.messages,
  )

  return turn
})
