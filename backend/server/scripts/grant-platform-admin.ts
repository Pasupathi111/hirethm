/**
 * Grants (or revokes with --revoke) HireThm-internal platform-admin access
 * for an existing user account, by email. Deliberately CLI-only — there is
 * no self-service way to become a platform admin.
 *
 * Usage:
 *   npx tsx server/scripts/grant-platform-admin.ts ops@hirethm.com
 *   npx tsx server/scripts/grant-platform-admin.ts ops@hirethm.com --revoke
 */
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq } from 'drizzle-orm'
import * as schema from '../database/schema'

const processWithLoadEnv = process as NodeJS.Process & { loadEnvFile?: (path?: string) => void }
if (!process.env.DATABASE_URL && typeof processWithLoadEnv.loadEnvFile === 'function') {
  try { processWithLoadEnv.loadEnvFile('.env') } catch {}
}

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required.')
  process.exit(1)
}

const args = process.argv.slice(2)
const email = args.find((a) => !a.startsWith('--'))
const revoke = args.includes('--revoke')

if (!email) {
  console.error('Usage: npx tsx server/scripts/grant-platform-admin.ts <email> [--revoke]')
  process.exit(1)
}

const client = postgres(DATABASE_URL, { max: 1 })
const db = drizzle(client, { schema })

async function main() {
  const [existing] = await db
    .select({ id: schema.user.id, name: schema.user.name, isPlatformAdmin: schema.user.isPlatformAdmin })
    .from(schema.user)
    .where(eq(schema.user.email, email!))
    .limit(1)

  if (!existing) {
    console.error(`❌ No user found with email "${email}". They must sign up first.`)
    await client.end()
    process.exit(1)
  }

  if (existing.isPlatformAdmin === !revoke) {
    console.log(`ℹ️  ${email} is already ${revoke ? 'not ' : ''}a platform admin — nothing to do.`)
    await client.end()
    return
  }

  await db.update(schema.user)
    .set({ isPlatformAdmin: !revoke, updatedAt: new Date() })
    .where(eq(schema.user.id, existing.id))

  console.log(`✅ ${revoke ? 'Revoked' : 'Granted'} platform-admin access for ${existing.name} <${email}>`)
  await client.end()
}

main().catch((err) => {
  console.error('❌ Failed:', err)
  client.end().then(() => process.exit(1))
})
