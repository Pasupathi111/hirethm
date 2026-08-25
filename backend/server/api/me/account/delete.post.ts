import { eq, and, isNull } from 'drizzle-orm'
import { candidate, orgSettings } from '../../../database/schema'
import { recordRetentionAudit } from '../../../utils/erasure'

/**
 * POST /api/me/account/delete
 *
 * Self-service account deletion request. Mirrors the org-side "soft delete"
 * in `candidates/:id.delete.ts` (quarantine, not permanent erasure) — the
 * candidate is hidden and recoverable for the org's configured quarantine
 * window, then swept by the same automated retention job. Reuses the
 * existing GDPR retention fields rather than building new infrastructure.
 */
export default defineEventHandler(async (event) => {
  const { session, candidate: candidateSession } = await requireCandidateSession(event)

  const existing = await db.query.candidate.findFirst({
    where: eq(candidate.id, candidateSession.id),
    columns: { id: true, quarantinedAt: true, retentionExemptUntil: true },
  })

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Candidate profile not found' })
  }

  if (existing.retentionExemptUntil && existing.retentionExemptUntil > new Date()) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Your profile is under a legal hold and cannot be deleted right now',
    })
  }

  if (existing.quarantinedAt) {
    return { status: 'quarantined' as const }
  }

  const settings = await db.query.orgSettings.findFirst({
    where: eq(orgSettings.organizationId, candidateSession.organizationId),
    columns: { quarantineDays: true },
  })
  const quarantineDays = settings?.quarantineDays ?? 30
  const now = new Date()
  const purgeAt = new Date(now.getTime() + quarantineDays * 24 * 60 * 60 * 1000)

  const [updated] = await db.update(candidate)
    .set({ quarantinedAt: now, scheduledPurgeAt: purgeAt, updatedAt: now })
    .where(and(eq(candidate.id, candidateSession.id), isNull(candidate.quarantinedAt)))
    .returning({ id: candidate.id })

  if (!updated) {
    return { status: 'quarantined' as const }
  }

  const audited = await recordRetentionAudit(
    candidateSession.organizationId,
    candidateSession.id,
    'quarantined',
    'success',
    session.user.id,
    { source: 'self_service' },
  )
  if (!audited) {
    logError('retention.self_service_soft_delete_audit_failed', {
      org_id: candidateSession.organizationId,
      candidate_id: candidateSession.id,
    })
  }

  return { status: 'quarantined' as const }
})
