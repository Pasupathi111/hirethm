import { and, eq } from 'drizzle-orm'
import { interviewTemplate } from '../../database/schema'
import { interviewTemplateIdParamSchema, updateInterviewTemplateSchema } from '../../utils/schemas/interviewTemplate'

export default defineEventHandler(async (event) => {
  const session = await requirePermission(event, { interview: ['update'] })
  const orgId = session.session.activeOrganizationId

  const { id } = await getValidatedRouterParams(event, interviewTemplateIdParamSchema.parse)
  const body = await readValidatedBody(event, updateInterviewTemplateSchema.parse)

  const [updated] = await db.update(interviewTemplate)
    .set({ ...body, updatedAt: new Date() })
    .where(and(eq(interviewTemplate.id, id), eq(interviewTemplate.organizationId, orgId)))
    .returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Interview template not found' })
  }

  recordActivity({
    organizationId: orgId,
    actorId: session.user.id,
    action: 'updated',
    resourceType: 'interview_template',
    resourceId: id,
  })

  return updated
})
