import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { organization, member, user, job } from '../../../database/schema'
import { requirePlatformAdmin } from '../../../utils/requirePlatformAdmin'

const paramsSchema = z.object({ id: z.string().min(1) })

/**
 * GET /api/platform/employers/:id
 *
 * One organization's detail for the platform-admin console: org info,
 * its members (recruiters/hiring managers/owner), and a job summary.
 */
export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)

  const { id } = await getValidatedRouterParams(event, paramsSchema.parse)

  const org = await db.query.organization.findFirst({
    where: eq(organization.id, id),
  })

  if (!org) {
    throw createError({ statusCode: 404, statusMessage: 'Organization not found' })
  }

  const [members, jobs] = await Promise.all([
    db
      .select({
        id: member.id,
        userId: user.id,
        name: user.name,
        email: user.email,
        role: member.role,
        createdAt: member.createdAt,
      })
      .from(member)
      .innerJoin(user, eq(user.id, member.userId))
      .where(eq(member.organizationId, id))
      .orderBy(member.createdAt),
    db
      .select({
        id: job.id,
        title: job.title,
        status: job.status,
        createdAt: job.createdAt,
      })
      .from(job)
      .where(and(eq(job.organizationId, id)))
      .orderBy(job.createdAt),
  ])

  return { ...org, members, jobs }
})
