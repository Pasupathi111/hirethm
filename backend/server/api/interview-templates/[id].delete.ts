import { and, eq } from 'drizzle-orm'
import { interviewTemplate } from '../../database/schema'
import { interviewTemplateIdParamSchema } from '../../utils/schemas/interviewTemplate'

export default defineEventHandler(async (event) => {
  const session = await requirePermission(event, { interview: ['delete'] })
  const orgId = session.session.activeOrganizationId

  const { id } = await getValidatedRouterParams(event, interviewTemplateIdParamSchema.parse)

  const [deleted] = await db.delete(interviewTemplate)
    .where(and(eq(interviewTemplate.id, id), eq(interviewTemplate.organizationId, orgId)))
    .returning({ id: interviewTemplate.id })

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Interview template not found' })
  }

  recordActivity({
    organizationId: orgId,
    actorId: session.user.id,
    action: 'deleted',
    resourceType: 'interview_template',
    resourceId: id,
  })

  setResponseStatus(event, 204)
})
