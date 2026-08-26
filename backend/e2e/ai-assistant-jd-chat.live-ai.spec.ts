import { test, expect, type Page } from '@playwright/test'

/**
 * Issue #34 — proves the admin AI Assistant is a real AI-backed job-description
 * builder, not the scripted mock it replaced, and that the pre-existing
 * "Create with AI" dialog on the job wizard behaves identically (both drive the
 * same `useJdAiChat` hook and the same `/api/jobs/ai-chat` endpoint).
 *
 * ⚠ LIVE PROVIDER — every run makes a real, billed call to the org's configured
 * AI provider. That is deliberate: asserting the reply is genuinely generated is
 * the whole point, and a stub could not satisfy it. Because of the cost this
 * file is EXCLUDED from the default `npm run test:e2e` (see the `testIgnore`
 * entry in playwright.config.ts) and must be run explicitly:
 *
 *   npm run test:e2e:live-ai
 *   npm run test:e2e:live-ai -- --headed        # watch it in a real browser
 *
 * Requires a working `ai_config` row for the org — see `npm run ai:set-key`.
 * Jobs created here are deleted again on the way out.
 *
 * Targets the dockerized stack on :3002, whose port is already in better-auth's
 * trusted origins, so sign-in works without any Origin rewriting.
 * Defaults to the seeded demo recruiter; override with E2E_ORG_EMAIL /
 * E2E_ORG_PASSWORD.
 */

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002'
const EMAIL = process.env.E2E_ORG_EMAIL || 'demo@reqcore.com'
const PASSWORD = process.env.E2E_ORG_PASSWORD || 'demo1234'

/** Canned lines from the removed mock — their absence proves the fake is gone. */
const MOCK_PHRASES = [
  "Hi, I'm the HireThm AI assistant",
  'Which open roles have the weakest match pipeline this week?',
  'Data Platform Lead at Nova Systems',
]

/** Plain English, as a recruiter would actually type it — not a canned starter. */
const NL_REQUEST = 'I need to hire a senior backend engineer for my remote team, full time'

/** A live model round-trip is far slower than a normal UI interaction. */
const AI_TIMEOUT = 90_000

async function signIn(page: Page) {
  await page.goto(`${BASE}/employer/sign-in`)
  await page.fill('#email', EMAIL)
  await page.fill('#password', PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/admin/, { timeout: 20_000 })
}

/**
 * Types a natural-language request into whichever chat composer is on screen
 * and returns the parsed `/api/jobs/ai-chat` turn. Shared by both surfaces so
 * they are held to exactly the same bar.
 */
async function sendAndCaptureTurn(page: Page, message: string) {
  const call = page.waitForResponse(
    r => r.url().includes('/api/jobs/ai-chat') && r.request().method() === 'POST',
    { timeout: AI_TIMEOUT },
  )
  await page.getByPlaceholder('Type a message').fill(message)
  await page.keyboard.press('Enter')

  const response = await call
  expect(response.status(), 'ai-chat must succeed — 422 means no ai_config for this org').toBe(200)
  return await response.json()
}

/**
 * The acceptance criterion from the issue: "the AI should generate the complete
 * job description automatically without requiring me to manually enter all the
 * details." Asserted identically for both surfaces.
 */
function assertGeneratedWithoutInterrogation(turn: {
  reply: string
  readyToGenerate: boolean
  jd: { title: string, skills: string[], description: string } | null
}) {
  expect(turn.reply, 'assistant must return a reply').toBeTruthy()
  for (const phrase of MOCK_PHRASES) {
    expect(turn.reply, 'reply must not be a retired canned line').not.toContain(phrase)
  }

  expect(turn.readyToGenerate, 'a plain-English request must be enough to generate').toBe(true)
  expect(turn.jd, 'a draft must be returned on the first turn').toBeTruthy()
  expect(turn.jd!.title.length, 'AI should have filled in a job title').toBeGreaterThan(0)
  expect(
    turn.jd!.skills.length,
    'skills drive AI candidate matching and must be inferred, not left empty',
  ).toBeGreaterThan(0)
  expect(turn.jd!.description.length, 'generated description should be substantial').toBeGreaterThan(200)
}

/** Removes a job created by a test, so repeat runs don't pile up demo data. */
async function deleteJob(page: Page, jobId: string) {
  const deleted = await page.request.delete(`${BASE}/api/jobs/${jobId}`)
  expect([200, 204], 'cleanup delete should succeed').toContain(deleted.status())
}

test.describe('AI Assistant — JD creation chat (#34)', () => {
  test.slow()

  test('AI Assistant page: natural-language request → draft → publish → job created', async ({ page }) => {
    test.setTimeout(240_000)

    await signIn(page)
    await page.goto(`${BASE}/admin/ai-chat`)
    await expect(page.getByRole('heading', { name: 'AI Assistant' })).toBeVisible()

    // The mock seeded three messages on mount; a real chat starts empty.
    for (const phrase of MOCK_PHRASES) {
      await expect(page.getByText(phrase, { exact: false })).toHaveCount(0)
    }

    const turn = await sendAndCaptureTurn(page, NL_REQUEST)
    assertGeneratedWithoutInterrogation(turn)

    await expect(page.getByText('Generated draft', { exact: false })).toBeVisible({ timeout: AI_TIMEOUT })

    // The generated values must reach the form, not just the API payload.
    const titleField = page.locator('#jd-title')
    await expect(titleField).toBeVisible()
    expect((await titleField.inputValue()).length).toBeGreaterThan(0)
    expect((await page.locator('#jd-skills').inputValue()).trim().length,
      'skills field should be pre-filled').toBeGreaterThan(0)
    expect((await page.locator('#jd-description').inputValue()).length).toBeGreaterThan(200)

    // Edit before publishing, and tag the title so the row is identifiable.
    const uniqueTitle = `E2E AI Page ${Date.now()}`
    await titleField.fill(uniqueTitle)

    const createCall = page.waitForResponse(
      r => r.url().includes('/api/jobs') && !r.url().includes('ai-chat') && r.request().method() === 'POST',
      { timeout: 30_000 },
    )
    await page.getByRole('button', { name: 'Publish job' }).click()

    const createResponse = await createCall
    expect([200, 201], 'POST /api/jobs must succeed').toContain(createResponse.status())

    const job = await createResponse.json()
    expect(job.id, 'created job must have an id').toBeTruthy()
    expect(job.title, 'the edited title must win over the AI original').toBe(uniqueTitle)
    expect(job.status, 'Publish job should open the posting, not save a draft').toBe('open')

    await expect(page).toHaveURL(new RegExp(`/admin/jobs/${job.id}$`), { timeout: 20_000 })
    await expect(page.getByText(uniqueTitle, { exact: false }).first()).toBeVisible()

    // Confirm it really persisted, rather than trusting the POST response alone.
    const fetched = await page.request.get(`${BASE}/api/jobs/${job.id}`)
    expect(fetched.status(), 'created job must be readable back').toBe(200)
    expect((await fetched.json()).title).toBe(uniqueTitle)

    await deleteJob(page, job.id)
  })

  test('Create with AI dialog on the job wizard behaves the same way', async ({ page }) => {
    test.setTimeout(240_000)

    await signIn(page)
    await page.goto(`${BASE}/admin/jobs/new`)

    await page.getByRole('button', { name: 'Create with AI' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    const turn = await sendAndCaptureTurn(page, NL_REQUEST)
    // Identical bar to the full-page assistant — same hook, same endpoint.
    assertGeneratedWithoutInterrogation(turn)

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Draft', { exact: false }).first()).toBeVisible({ timeout: AI_TIMEOUT })
    await expect(dialog.locator('#jd-title')).toBeVisible()
    expect((await dialog.locator('#jd-skills').inputValue()).trim().length,
      'dialog skills field should be pre-filled too').toBeGreaterThan(0)

    const uniqueTitle = `E2E AI Dialog ${Date.now()}`
    await dialog.locator('#jd-title').fill(uniqueTitle)

    const createCall = page.waitForResponse(
      r => r.url().includes('/api/jobs') && !r.url().includes('ai-chat') && r.request().method() === 'POST',
      { timeout: 30_000 },
    )
    // The dialog hands the draft back to the wizard, which does the creating.
    await dialog.getByRole('button', { name: 'Create JD' }).click()

    const createResponse = await createCall
    expect([200, 201], 'POST /api/jobs must succeed from the dialog too').toContain(createResponse.status())

    const job = await createResponse.json()
    expect(job.title, 'edited title must survive the wizard hand-off').toBe(uniqueTitle)

    await expect(page).toHaveURL(/\/admin\/jobs$/, { timeout: 20_000 })

    const fetched = await page.request.get(`${BASE}/api/jobs/${job.id}`)
    expect(fetched.status(), 'dialog-created job must be readable back').toBe(200)

    await deleteJob(page, job.id)
  })

  test('surfaces a clear error instead of a canned reply when the AI call fails', async ({ page }) => {
    await signIn(page)
    await page.goto(`${BASE}/admin/ai-chat`)

    // Force the failure the old mock could never have: a real backend error.
    await page.route('**/api/jobs/ai-chat', route =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ statusMessage: 'boom' }) }),
    )

    await page.getByPlaceholder('Type a message').fill(NL_REQUEST)
    await page.keyboard.press('Enter')

    await expect(page.getByText('something went wrong generating a response', { exact: false })).toBeVisible({
      timeout: 20_000,
    })
    // No draft panel should appear on a failed turn.
    await expect(page.getByText('Generated draft', { exact: false })).toHaveCount(0)
  })
})
