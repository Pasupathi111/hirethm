import { interviewTemplate } from '../../database/schema'
import { createInterviewTemplateSchema } from '../../utils/schemas/interviewTemplate'

export default defineEventHandler(async (event) => {
  const session = await requirePermission(event, { interview: ['create'] })
  const orgId = session.session.activeOrganizationId

  const body = await readValidatedBody(event, createInterviewTemplateSchema.parse)

  const [created] = await db.insert(interviewTemplate).values({
    organizationId: orgId,
    name: body.name,
    type: body.type,
    duration: body.duration,
    questions: body.questions,
    status: body.status,
  }).returning()

  recordActivity({
    organizationId: orgId,
    actorId: session.user.id,
    action: 'created',
    resourceType: 'interview_template',
    resourceId: created!.id,
  })

  setResponseStatus(event, 201)
  return created
})
