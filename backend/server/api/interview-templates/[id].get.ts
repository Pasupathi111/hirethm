import { and, eq } from 'drizzle-orm'
import { interviewTemplate } from '../../database/schema'
import { interviewTemplateIdParamSchema } from '../../utils/schemas/interviewTemplate'

export default defineEventHandler(async (event) => {
  const session = await requirePermission(event, { interview: ['read'] })
  const orgId = session.session.activeOrganizationId

  const { id } = await getValidatedRouterParams(event, interviewTemplateIdParamSchema.parse)

  const result = await db.query.interviewTemplate.findFirst({
    where: and(eq(interviewTemplate.id, id), eq(interviewTemplate.organizationId, orgId)),
  })

  if (!result) {
    throw createError({ statusCode: 404, statusMessage: 'Interview template not found' })
  }

  return result
})
