/**
 * Pushes the OpenAI credentials held in `.env` into the encrypted `ai_config`
 * table, so the AI assistant, job-description chat and candidate analysis all
 * have a working provider without an admin pasting the key into the UI.
 *
 * The key lives in `.env` (gitignored) and is stored AES-256-GCM encrypted with
 * a key derived from BETTER_AUTH_SECRET — the same path the Settings → AI
 * Management screen uses. The plaintext key is never logged or committed.
 *
 * Idempotent: re-running updates the existing config rather than adding rows.
 * By default every organization is updated; pass --org <id> to target one.
 *
 * Usage:
 *   npm run ai:set-key
 *   npx tsx server/scripts/set-ai-key.ts --org <organizationId>
 */
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { and, eq, ne } from 'drizzle-orm'
import * as schema from '../database/schema'
import { encrypt } from '../utils/encryption'
import { PROVIDER_REGISTRY } from '../utils/ai/provider'

const processWithLoadEnv = process as NodeJS.Process & { loadEnvFile?: (path?: string) => void }
if (!process.env.DATABASE_URL && typeof processWithLoadEnv.loadEnvFile === 'function') {
  try { processWithLoadEnv.loadEnvFile('.env') } catch {}
}

const DATABASE_URL = process.env.DATABASE_URL
const API_KEY = process.env.OPENAI_API_KEY
const SECRET = process.env.BETTER_AUTH_SECRET
const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'

const missing = [
  !DATABASE_URL && 'DATABASE_URL',
  !API_KEY && 'OPENAI_API_KEY',
  !SECRET && 'BETTER_AUTH_SECRET',
].filter(Boolean)

if (missing.length) {
  console.error(`❌ Missing required environment variable(s): ${missing.join(', ')}`)
  console.error('   Set them in backend/.env — see .env.example for the AI provider section.')
  process.exit(1)
}

const args = process.argv.slice(2)
const orgArgIndex = args.indexOf('--org')
const targetOrgId = orgArgIndex >= 0 ? args[orgArgIndex + 1] : undefined

if (orgArgIndex >= 0 && !targetOrgId) {
  console.error('Usage: npx tsx server/scripts/set-ai-key.ts [--org <organizationId>]')
  process.exit(1)
}

/** Suggested pricing for the chosen model, so the Usage dashboard shows real costs. */
const modelInfo = PROVIDER_REGISTRY.openai!.models.find(m => m.id === MODEL)

/** Show only enough of the key to confirm which one was applied. */
function maskKey(key: string): string {
  return key.length <= 12 ? '***' : `${key.slice(0, 7)}…${key.slice(-4)}`
}

const client = postgres(DATABASE_URL!, { max: 1 })
const db = drizzle(client, { schema })

async function main() {
  const orgs = targetOrgId
    ? await db.select({ id: schema.organization.id, name: schema.organization.name })
        .from(schema.organization)
        .where(eq(schema.organization.id, targetOrgId))
    : await db.select({ id: schema.organization.id, name: schema.organization.name })
        .from(schema.organization)

  if (orgs.length === 0) {
    console.error(targetOrgId
      ? `❌ No organization found with id "${targetOrgId}".`
      : '❌ No organizations exist yet. Run `npm run db:seed` or sign up first.')
    await client.end()
    process.exit(1)
  }

  for (const org of orgs) {
    // Re-encrypt on every run: the key is random-IV'd, so ciphertext differs
    // each time even for the same key. That is expected, not a change of value.
    const apiKeyEncrypted = encrypt(API_KEY!, SECRET!)

    // Prefer the row the chat already resolves to, so we update rather than
    // shadow it — loadAiConfig() picks the chatbot default, then any config.
    const existing = await db.query.aiConfig.findFirst({
      where: and(eq(schema.aiConfig.organizationId, org.id), eq(schema.aiConfig.isDefaultChatbot, true)),
    }) ?? await db.query.aiConfig.findFirst({
      where: eq(schema.aiConfig.organizationId, org.id),
    })

    if (existing) {
      await db.update(schema.aiConfig)
        .set({
          provider: 'openai',
          model: MODEL,
          apiKeyEncrypted,
          baseUrl: null,
          // Make this config unambiguously the one both purposes resolve to.
          isDefaultChatbot: true,
          isDefaultAnalysis: true,
          ...(modelInfo?.inputPricePer1m != null ? { inputPricePer1m: String(modelInfo.inputPricePer1m) } : {}),
          ...(modelInfo?.outputPricePer1m != null ? { outputPricePer1m: String(modelInfo.outputPricePer1m) } : {}),
          updatedAt: new Date(),
        })
        .where(eq(schema.aiConfig.id, existing.id))

      // Exactly one default per purpose — clear the flags on every sibling row.
      await db.update(schema.aiConfig)
        .set({ isDefaultChatbot: false, isDefaultAnalysis: false })
        .where(and(
          eq(schema.aiConfig.organizationId, org.id),
          ne(schema.aiConfig.id, existing.id),
        ))

      console.log(`✅ Updated AI config for "${org.name}" → openai / ${MODEL} (${maskKey(API_KEY!)})`)
    }
    else {
      await db.insert(schema.aiConfig).values({
        organizationId: org.id,
        name: 'OpenAI (from .env)',
        provider: 'openai',
        model: MODEL,
        apiKeyEncrypted,
        maxTokens: 4096,
        inputPricePer1m: modelInfo?.inputPricePer1m != null ? String(modelInfo.inputPricePer1m) : null,
        outputPricePer1m: modelInfo?.outputPricePer1m != null ? String(modelInfo.outputPricePer1m) : null,
        isDefaultChatbot: true,
        isDefaultAnalysis: true,
      })

      console.log(`✅ Created AI config for "${org.name}" → openai / ${MODEL} (${maskKey(API_KEY!)})`)
    }
  }

  await client.end()
}

main().catch((err) => {
  console.error('❌ Failed:', err)
  client.end().then(() => process.exit(1))
})
