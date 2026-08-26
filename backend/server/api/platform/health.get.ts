import { totalmem, freemem } from 'node:os'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { count, gte, lt, sql } from 'drizzle-orm'
import { HeadBucketCommand } from '@aws-sdk/client-s3'
import { analysisRun, aiConfig, calendarIntegration } from '../../database/schema/app'
import { payment } from '../../database/schema/platform'
import { requirePlatformAdmin } from '../../utils/requirePlatformAdmin'

/**
 * GET /api/platform/health — platform-admin only.
 *
 * Every field below is measured or counted at request time. Nothing is
 * sampled, smoothed or estimated, and there is deliberately no metric here
 * that the deployment cannot actually observe:
 *
 *  - There is no job queue in this architecture (AI analysis runs inline in
 *    the request), so no "queue depth" is reported. The previous mocked screen
 *    showed one; it never existed.
 *  - There is no email delivery log, so Email reports *configuration* state
 *    (which provider will be used) rather than a fabricated delivery rate.
 *  - PayPal is not wired up (see issue #17), so Payments reports the real
 *    record counts and says so, instead of showing webhook failures.
 *
 * A service that is simply not set up returns `not_configured`, which is a
 * different thing from `down` and is rendered differently.
 */

export type ServiceStatus = 'healthy' | 'degraded' | 'down' | 'not_configured'

interface ServiceHealth {
  key: string
  name: string
  status: ServiceStatus
  detail: string
}

/** Latency above which a dependency is called slow, then unhealthy. */
const LATENCY_DEGRADED_MS = 250
const LATENCY_DOWN_MS = 2_000

/** Share of AI analysis runs that may fail in 24h before the provider is called degraded. */
const AI_FAILURE_DEGRADED_RATIO = 0.1
const AI_FAILURE_DOWN_RATIO = 0.5

/** Google caps push channels at 7 days; renew well before that. */
const WEBHOOK_EXPIRY_WARNING_HOURS = 48

function latencyStatus(ms: number): ServiceStatus {
  if (ms >= LATENCY_DOWN_MS) return 'down'
  if (ms >= LATENCY_DEGRADED_MS) return 'degraded'
  return 'healthy'
}

async function timed<T>(fn: () => Promise<T>): Promise<{ ms: number; value: T | null; error: string | null }> {
  const start = Date.now()
  try {
    const value = await fn()
    return { ms: Date.now() - start, value, error: null }
  }
  catch (err) {
    return { ms: Date.now() - start, value: null, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86_400)
  const h = Math.floor((seconds % 86_400) / 3_600)
  const m = Math.floor((seconds % 3_600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event)

  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const webhookWarningAt = new Date(now.getTime() + WEBHOOK_EXPIRY_WARNING_HOURS * 60 * 60 * 1000)

  // ── Database round-trip ──
  const dbProbe = await timed(() => db.execute(sql`SELECT 1`))

  // Everything below needs the database. If the probe failed, don't issue more
  // queries that will just fail the same way and add seconds to the response.
  const dbUp = dbProbe.error === null

  const [
    storageProbe,
    aiConfigCount,
    analysis24h,
    calendarCount,
    calendarExpiring,
    payments30d,
    version,
  ] = await Promise.all([
    timed(() => getS3Client().send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }))),
    dbUp ? db.select({ n: count() }).from(aiConfig).then(r => r[0]?.n ?? 0) : Promise.resolve(0),
    dbUp
      ? db
          .select({ status: analysisRun.status, n: count() })
          .from(analysisRun)
          .where(gte(analysisRun.createdAt, last24h))
          .groupBy(analysisRun.status)
      : Promise.resolve([] as { status: string; n: number }[]),
    dbUp ? db.select({ n: count() }).from(calendarIntegration).then(r => r[0]?.n ?? 0) : Promise.resolve(0),
    dbUp
      ? db
          .select({ n: count() })
          .from(calendarIntegration)
          .where(lt(calendarIntegration.webhookExpiration, webhookWarningAt))
          .then(r => r[0]?.n ?? 0)
      : Promise.resolve(0),
    dbUp
      ? db
          .select({ status: payment.status, n: count() })
          .from(payment)
          .where(gte(payment.createdAt, last30d))
          .groupBy(payment.status)
      : Promise.resolve([] as { status: string; n: number }[]),
    readFile(resolve(process.cwd(), 'package.json'), 'utf-8')
      .then(raw => (JSON.parse(raw) as { version: string }).version)
      .catch(() => null),
  ])

  const analysisBy = new Map(analysis24h.map(r => [r.status, Number(r.n)]))
  const analysisFailed = analysisBy.get('failed') ?? 0
  const analysisPartial = analysisBy.get('partial') ?? 0
  const analysisCompleted = analysisBy.get('completed') ?? 0
  const analysisTotal = analysisFailed + analysisPartial + analysisCompleted

  const paymentsBy = new Map(payments30d.map(r => [r.status, Number(r.n)]))
  const paymentsFailed = paymentsBy.get('failed') ?? 0
  const paymentsTotal = [...paymentsBy.values()].reduce((a, b) => a + Number(b), 0)

  // ── Email provider (configuration state — there is no delivery log) ──
  const emailProvider = env.SMTP_HOST
    ? { status: 'healthy' as ServiceStatus, detail: `SMTP · ${env.SMTP_HOST}` }
    : env.RESEND_API_KEY
      ? { status: 'healthy' as ServiceStatus, detail: 'Resend API' }
      : { status: 'not_configured' as ServiceStatus, detail: 'No provider set — outbound mail is logged to the console only' }

  // ── AI provider ──
  const aiStatus: ServiceStatus = aiConfigCount === 0
    ? 'not_configured'
    : analysisTotal === 0
      ? 'healthy'
      : analysisFailed / analysisTotal >= AI_FAILURE_DOWN_RATIO
        ? 'down'
        : analysisFailed / analysisTotal >= AI_FAILURE_DEGRADED_RATIO
          ? 'degraded'
          : 'healthy'

  const aiDetail = aiConfigCount === 0
    ? 'No AI configuration on any organization'
    : analysisTotal === 0
      ? `${aiConfigCount} configuration${aiConfigCount === 1 ? '' : 's'} · no analysis runs in 24h`
      : `${aiConfigCount} configuration${aiConfigCount === 1 ? '' : 's'} · ${analysisFailed}/${analysisTotal} runs failed (24h)`

  // ── Calendar ──
  const calendarStatus: ServiceStatus = calendarCount === 0
    ? 'not_configured'
    : calendarExpiring > 0
      ? 'degraded'
      : 'healthy'

  const calendarDetail = calendarCount === 0
    ? 'No Google Calendar accounts connected'
    : calendarExpiring > 0
      ? `${calendarCount} connected · ${calendarExpiring} webhook${calendarExpiring === 1 ? '' : 's'} expiring within ${WEBHOOK_EXPIRY_WARNING_HOURS}h`
      : `${calendarCount} account${calendarCount === 1 ? '' : 's'} connected · webhooks current`

  const memTotal = totalmem()
  const memUsed = memTotal - freemem()

  const services: ServiceHealth[] = [
    {
      key: 'api',
      name: 'API',
      status: 'healthy',
      detail: `${process.version} on ${process.platform} · up ${formatUptime(process.uptime())}${version ? ` · v${version}` : ''}`,
    },
    {
      key: 'database',
      name: 'Database',
      status: dbUp ? latencyStatus(dbProbe.ms) : 'down',
      detail: dbUp ? `PostgreSQL · ${dbProbe.ms}ms round-trip` : (dbProbe.error ?? 'Unreachable'),
    },
    {
      key: 'storage',
      name: 'Object storage',
      status: storageProbe.error === null ? latencyStatus(storageProbe.ms) : 'down',
      detail: storageProbe.error === null
        ? `Bucket "${env.S3_BUCKET}" · ${storageProbe.ms}ms`
        : storageProbe.error,
    },
    { key: 'ai', name: 'AI provider', status: aiStatus, detail: aiDetail },
    {
      key: 'analysis',
      name: 'AI analysis',
      status: analysisPartial > 0 ? 'degraded' : 'healthy',
      detail: analysisTotal === 0
        ? 'No runs in the last 24h'
        : `${analysisCompleted} completed · ${analysisPartial} partial · ${analysisFailed} failed (24h)`,
    },
    { key: 'email', name: 'Email', status: emailProvider.status, detail: emailProvider.detail },
    { key: 'calendar', name: 'Calendar', status: calendarStatus, detail: calendarDetail },
    {
      key: 'payments',
      name: 'Payments',
      status: 'not_configured',
      detail: paymentsTotal === 0
        ? 'PayPal gateway not connected (issue #17) · no payment records'
        : `PayPal gateway not connected (issue #17) · ${paymentsTotal} record${paymentsTotal === 1 ? '' : 's'} in 30d`,
    },
  ]

  return {
    checkedAt: now.toISOString(),
    services,
    stats: [
      { key: 'ai_failed_24h', label: 'Failed AI analyses (24h)', value: analysisFailed, tone: analysisFailed > 0 ? 'negative' : 'neutral' },
      { key: 'ai_partial_24h', label: 'Partial AI analyses (24h)', value: analysisPartial, tone: analysisPartial > 0 ? 'warning' : 'neutral' },
      { key: 'calendar_expiring', label: `Calendar webhooks expiring (${WEBHOOK_EXPIRY_WARNING_HOURS}h)`, value: calendarExpiring, tone: calendarExpiring > 0 ? 'warning' : 'neutral' },
      { key: 'payments_failed_30d', label: 'Failed payments (30d)', value: paymentsFailed, tone: paymentsFailed > 0 ? 'negative' : 'neutral' },
    ],
    runtime: {
      version,
      nodeVersion: process.version,
      platform: process.platform,
      uptimeSeconds: Math.floor(process.uptime()),
      memory: {
        usedBytes: memUsed,
        totalBytes: memTotal,
        percent: Math.round((memUsed / memTotal) * 100),
      },
    },
  }
})
