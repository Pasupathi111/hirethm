import { eq } from 'drizzle-orm'
import { orgSettings } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = await requirePermission(event, { organization: ['read'] })
  const orgId = session.session.activeOrganizationId

  const settings = await db.query.orgSettings.findFirst({
    where: eq(orgSettings.organizationId, orgId),
    columns: {
      nameDisplayFormat: true,
      dateFormat: true,
      retentionEnabled: true,
      retentionMonths: true,
      quarantineDays: true,
      retentionActivatedAt: true,
      matchNotificationChannel: true,
      minReadinessScore: true,
      consentExpiryEnabled: true,
      consentExpiryDays: true,
      privacyPolicyUrl: true,
      privacyPolicyText: true,
      privacyContactEmail: true,
    },
  })

  // Return defaults if no settings row exists yet
  return {
    nameDisplayFormat: settings?.nameDisplayFormat ?? 'first_last',
    dateFormat: settings?.dateFormat ?? 'mdy',
    retentionEnabled: settings?.retentionEnabled ?? false,
    retentionMonths: settings?.retentionMonths ?? 24,
    quarantineDays: settings?.quarantineDays ?? 30,
    retentionActivatedAt: settings?.retentionActivatedAt ?? null,
    matchNotificationChannel: settings?.matchNotificationChannel ?? 'in_app',
    minReadinessScore: settings?.minReadinessScore ?? 70,
    consentExpiryEnabled: settings?.consentExpiryEnabled ?? false,
    consentExpiryDays: settings?.consentExpiryDays ?? 90,
    privacyPolicyUrl: settings?.privacyPolicyUrl ?? null,
    privacyPolicyText: settings?.privacyPolicyText ?? null,
    privacyContactEmail: settings?.privacyContactEmail ?? null,
  }
})
