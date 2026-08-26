import { desc, eq } from 'drizzle-orm'
import { interviewTemplate } from '../../database/schema'

/**
 * GET /api/interview-templates — reusable interview question sets for this org.
 */
export default defineEventHandler(async (event) => {
  const session = await requirePermission(event, { interview: ['read'] })
  const orgId = session.session.activeOrganizationId

  const data = await db.query.interviewTemplate.findMany({
    where: eq(interviewTemplate.organizationId, orgId),
    orderBy: [desc(interviewTemplate.updatedAt)],
  })

  return { data }
})
