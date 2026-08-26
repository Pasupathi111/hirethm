import { eq } from 'drizzle-orm'
import { orgSettings } from '../../database/schema'
import { DEFAULT_MATCH_WEIGHTS } from '../../utils/matching'

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
      matchWeights: true,
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
    // NULL means "never customized" — hand back the engine's defaults so the
    // Matching Rules screen shows the weights actually in force, not blanks.
    matchWeights: settings?.matchWeights ?? DEFAULT_MATCH_WEIGHTS,
    consentExpiryEnabled: settings?.consentExpiryEnabled ?? false,
    consentExpiryDays: settings?.consentExpiryDays ?? 90,
    privacyPolicyUrl: settings?.privacyPolicyUrl ?? null,
    privacyPolicyText: settings?.privacyPolicyText ?? null,
    privacyContactEmail: settings?.privacyContactEmail ?? null,
  }
})
