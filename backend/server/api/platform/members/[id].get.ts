import { eq, and, desc } from 'drizzle-orm'
import { z } from 'zod'
import { member, user, organization, job, activityLog } from '../../../database/schema'
import { requirePlatformAdmin } from '../../../utils/requirePlatformAdmin'

const paramsSchema = z.object({ id: z.string().min(1) })

/**
 * GET /api/platform/members/:id
 *
 * One org member's detail (recruiter or hiring manager) for the
 * platform-admin console — the member row `id`, not the user id.
 */
export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)

  const { id } = await getValidatedRouterParams(event, paramsSchema.parse)

  const row = await db
    .select({
      id: member.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      role: member.role,
      createdAt: member.createdAt,
      organizationId: organization.id,
      organizationName: organization.name,
    })
    .from(member)
    .innerJoin(user, eq(user.id, member.userId))
    .innerJoin(organization, eq(organization.id, member.organizationId))
    .where(eq(member.id, id))
    .limit(1)
    .then(rows => rows[0])

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Member not found' })
  }

  const [jobs, activity] = await Promise.all([
    db
      .select({ id: job.id, title: job.title, status: job.status, createdAt: job.createdAt })
      .from(job)
      .where(eq(job.organizationId, row.organizationId))
      .orderBy(desc(job.createdAt))
      .limit(20),
    db
      .select({
        id: activityLog.id,
        action: activityLog.action,
        resourceType: activityLog.resourceType,
        resourceId: activityLog.resourceId,
        createdAt: activityLog.createdAt,
      })
      .from(activityLog)
      .where(and(eq(activityLog.organizationId, row.organizationId), eq(activityLog.actorId, row.userId)))
      .orderBy(desc(activityLog.createdAt))
      .limit(20),
  ])

  return { ...row, jobs, activity }
})
