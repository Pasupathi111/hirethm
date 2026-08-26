import { computeOrgUsage } from '../../utils/orgUsage'

/**
 * GET /api/org-usage — org-facing equivalent of the platform-admin usage
 * endpoint, so recruiters/hiring managers can see their own org's usage
 * against its plan limits (BRD §4.7).
 */
export default defineEventHandler(async (event) => {
  const session = await requirePermission(event, { organization: ['read'] })
  const orgId = session.session.activeOrganizationId

  return computeOrgUsage(orgId)
})
