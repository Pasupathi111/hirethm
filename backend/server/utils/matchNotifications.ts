import { candidateNotification } from '../database/schema'
import { sendMatchNotificationEmail } from './email'
import { resolveChannels, type MatchNotificationChannel } from './notificationPolicy'

/**
 * Dispatch a "you have a new match" notification to a candidate (issue #27, part A).
 *
 * Deliberately candidate-facing only — per the BRD's candidate-first rule the
 * employer gains no visibility until the candidate accepts, so nothing is sent
 * to the employer here.
 *
 * Channel selection comes from the *job's* organization settings: the employer
 * whose role produced the match controls how their candidates are reached.
 *
 * Modular by design — adding a channel means extending `resolveChannels` and
 * adding one branch here, with no changes at the call sites.
 */
export async function dispatchMatchNotification(params: {
  channel: MatchNotificationChannel
  candidate: { id: string; firstName: string; email: string }
  job: { id: string; title: string }
  organizationName: string
  score: number
  /** Public origin used to build the deep link in emails. */
  baseUrl: string
}): Promise<{ inApp: boolean; email: boolean }> {
  const channels = resolveChannels(params.channel)
  const delivered = { inApp: false, email: false }

  if (channels.inApp) {
    try {
      await db.insert(candidateNotification).values({
        candidateId: params.candidate.id,
        category: 'matches',
        title: 'New match',
        description: `${params.job.title} — ${params.score}% Mutual Readiness`,
        actionLabel: 'Review match',
        actionHref: '/app/matches',
      })
      delivered.inApp = true
    }
    catch (err) {
      // Never let a notification failure roll back the match itself.
      logWarn('notification.match_in_app_failed', {
        candidate_id: params.candidate.id,
        job_id: params.job.id,
        error_message: err instanceof Error ? err.message : String(err),
      })
    }
  }

  if (channels.email) {
    try {
      await sendMatchNotificationEmail({
        to: params.candidate.email,
        candidateFirstName: params.candidate.firstName,
        jobTitle: params.job.title,
        organizationName: params.organizationName,
        score: params.score,
        matchesUrl: `${params.baseUrl.replace(/\/$/, '')}/app/matches`,
      })
      delivered.email = true
    }
    catch (err) {
      logWarn('notification.match_email_failed', {
        candidate_id: params.candidate.id,
        job_id: params.job.id,
        error_message: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return delivered
}
