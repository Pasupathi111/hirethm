import { and, count, eq, gte, lte } from 'drizzle-orm'
import { activityLog, job } from '../database/schema'
import { organizationSubscription } from '../database/schema/platform'

/**
 * Usage-vs-quota for one organization's current billing period, computed
 * against its active subscription plan (BRD §4.7 — profile-view quota;
 * active-job limit). Enforcement is out of scope — this only reports numbers.
 */
export async function computeOrgUsage(organizationId: string) {
  const subscription = await db.query.organizationSubscription.findFirst({
    where: eq(organizationSubscription.organizationId, organizationId),
    with: { plan: true },
  })

  const periodStart = subscription?.currentPeriodStart ?? null
  const periodEnd = subscription?.currentPeriodEnd ?? null

  const profileViewWhere = periodStart
    ? and(
        eq(activityLog.organizationId, organizationId),
        eq(activityLog.action, 'profile_viewed'),
        gte(activityLog.createdAt, periodStart),
        ...(periodEnd ? [lte(activityLog.createdAt, periodEnd)] : []),
      )
    : and(eq(activityLog.organizationId, organizationId), eq(activityLog.action, 'profile_viewed'))

  const [[profileViewRow], [activeJobRow]] = await Promise.all([
    db.select({ count: count() }).from(activityLog).where(profileViewWhere),
    db.select({ count: count() }).from(job).where(and(eq(job.organizationId, organizationId), eq(job.status, 'open'))),
  ])

  const profileViews = profileViewRow?.count ?? 0
  const activeJobs = activeJobRow?.count ?? 0
  const profileViewQuota = subscription?.plan.profileViewQuota ?? null
  const activeJobLimit = subscription?.plan.activeJobLimit ?? null

  return {
    plan: subscription?.plan ?? null,
    periodStart,
    periodEnd,
    profileViews,
    profileViewQuota,
    profileViewPercent: profileViewQuota != null ? Math.min(100, Math.round((profileViews / profileViewQuota) * 100)) : null,
    activeJobs,
    activeJobLimit,
    activeJobPercent: activeJobLimit != null ? Math.min(100, Math.round((activeJobs / activeJobLimit) * 100)) : null,
  }
}
