/**
 * AI Job Description Assistant
 *
 * Drives a conversational flow that collects the information needed for a
 * job posting, then produces a structured draft mapped onto the same fields
 * used by the manual job-creation wizard (see server/utils/schemas/job.ts).
 */
import { z } from 'zod'
import { generateStructuredOutput, type ProviderConfig } from './provider'

export const jdChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(4000),
})

export type JdChatMessage = z.infer<typeof jdChatMessageSchema>

/** Structured job-description draft, mapped onto the existing job creation fields. */
const jdDraftSchema = z.object({
  title: z.string().trim().min(1).max(200),
  department: z.string().trim().max(200).nullable().describe('Team or department, e.g. "Engineering". Null if not mentioned.'),
  location: z.string().trim().max(500).nullable(),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'internship']),
  experienceLevel: z.enum(['junior', 'mid', 'senior', 'lead']),
  remoteStatus: z.enum(['remote', 'hybrid', 'onsite']).nullable(),
  skills: z.array(z.string().trim().min(1).max(100)).max(50).describe('Required skills, short keywords (e.g. "React", "SQL")'),
  responsibilities: z.array(z.string().trim().min(1).max(300)).max(20),
  qualifications: z.array(z.string().trim().min(1).max(300)).max(20),
  preferredSkills: z.array(z.string().trim().min(1).max(300)).max(20),
  salaryMin: z.number().int().min(0).nullable(),
  salaryMax: z.number().int().min(0).nullable(),
  salaryCurrency: z.string().length(3).nullable(),
  salaryNegotiable: z.boolean(),
  summary: z.string().trim().max(2000).describe('2-4 sentence overview of the role, used as the opening of the description'),
  description: z.string().trim().max(20000).describe(
    'The full job description as clean Markdown, ready to publish. Include an overview, then '
    + '"## Responsibilities", "## Qualifications", "## Preferred Skills" and (if a department or '
    + 'salary was mentioned) a short line noting them. Use bullet lists for each section.',
  ),
})

export type JdDraft = z.infer<typeof jdDraftSchema>

const jdChatResponseSchema = z.object({
  reply: z.string().trim().min(1).max(2000).describe('Your conversational reply to the recruiter, shown in the chat.'),
  readyToGenerate: z.boolean().describe('True once you have enough information to produce a complete, useful job description.'),
  missingMandatoryFields: z.array(z.string().max(100)).max(10).describe('Mandatory fields still missing (title and employment type are the only hard requirements). Empty once readyToGenerate is true.'),
  jd: jdDraftSchema.nullable().describe('The generated job description draft. Populate this whenever readyToGenerate is true, and again whenever you regenerate after user feedback.'),
})

export type JdChatResponse = z.infer<typeof jdChatResponseSchema>

const SYSTEM_PROMPT = `You are a professional recruiting assistant embedded in an applicant tracking system (Reqcore). You help recruiters create job descriptions through natural conversation instead of filling out a long form.

How to behave:
- Be warm, concise, and professional — like an experienced recruiting partner, not a generic chatbot.
- Ask about a few related things at once (e.g. "What's the role title, and is it remote, hybrid, or on-site?") rather than one field per message, so the conversation feels efficient.
- The ONLY hard requirements are: job title and employment type (full_time, part_time, contract, or internship). Everything else (department, location, experience level, skills, responsibilities, qualifications, preferred skills, salary) is optional — infer sensible defaults from context and general knowledge of the role when the recruiter hasn't specified them, rather than interrogating them field by field.
- As soon as you have the title and employment type, set readyToGenerate to true and populate "jd" with a complete, polished draft. Do NOT ask the recruiter for responsibilities, qualifications or skills before generating — you already know what a role like this normally involves, so infer them and let the recruiter correct the draft. Fill any gaps with reasonable, clearly-generic content rather than leaving sections empty.
- "skills" must never be empty in a draft: infer the 8-12 keyword skills the role normally requires (e.g. "Node.js", "PostgreSQL", "REST APIs"). These drive AI candidate matching, so an empty list makes the posting much less useful.
- When you return a draft, your reply should briefly say what you assumed and invite corrections ("I've assumed a senior-level remote role — tell me what to change"), rather than asking for details you could reasonably infer.
- After the first draft, if the recruiter asks for changes ("make it more senior", "add Kubernetes", "remove the salary"), apply the changes and return an updated "jd" with readyToGenerate still true.
- Keep "reply" short (1-3 sentences) — the generated draft is reviewed in a separate preview panel, so don't repeat the whole JD back in the chat.
- Never fabricate a specific salary figure or a specific company name; only include salary if the recruiter mentioned one, and refer to the employer generically (e.g. "our team") if no company name was given.
- experienceLevel must be one of: junior, mid, senior, lead — pick the closest match.
- remoteStatus must be one of: remote, hybrid, onsite, or null if genuinely unspecified and not inferable.`

export async function runJobDescriptionChat(
  config: ProviderConfig,
  messages: JdChatMessage[],
): Promise<JdChatResponse> {
  const transcript = messages
    .map(m => `${m.role === 'user' ? 'Recruiter' : 'Assistant'}: ${m.content}`)
    .join('\n\n')

  const result = await generateStructuredOutput(config, {
    system: SYSTEM_PROMPT,
    prompt: `Conversation so far:\n\n${transcript}\n\nRespond as the assistant's next turn.`,
    schema: jdChatResponseSchema,
    schemaName: 'JobDescriptionChatTurn',
    schemaDescription: 'One conversational turn of the job-description-building assistant',
  })

  return result.object
}
