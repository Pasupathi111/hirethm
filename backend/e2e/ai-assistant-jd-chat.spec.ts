import { test, expect } from '@playwright/test'

/**
 * Issue #34 — proves the admin AI Assistant is a real AI-backed job-description
 * builder, not the scripted mock it replaced.
 *
 * This test makes a LIVE call to the org's configured AI provider (it asserts
 * the reply is genuinely generated, which a stub cannot satisfy), so it costs a
 * few cents per run and needs a working `ai_config` row — see
 * `npm run ai:set-key`. It creates a job and deletes it again on the way out.
 *
 * Run against the dockerized stack (port 3002 is in better-auth's trusted
 * origins, so sign-in works without any Origin rewriting):
 *   PLAYWRIGHT_BASE_URL=http://localhost:3002 npx playwright test ai-assistant-jd-chat
 *
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

/** A live model round-trip is far slower than a normal UI interaction. */
const AI_TIMEOUT = 90_000

async function signIn(page: import('@playwright/test').Page) {
  await page.goto(`${BASE}/employer/sign-in`)
  await page.fill('#email', EMAIL)
  await page.fill('#password', PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/admin/, { timeout: 20_000 })
}

test.describe('AI Assistant — JD creation chat (#34)', () => {
  test.slow()

  test('chat reaches a real AI backend and publishes the generated job', async ({ page }) => {
    test.setTimeout(240_000)

    await signIn(page)
    await page.goto(`${BASE}/admin/ai-chat`)

    await expect(page.getByRole('heading', { name: 'AI Assistant' })).toBeVisible()

    // The mock seeded three messages on mount; a real chat starts empty.
    for (const phrase of MOCK_PHRASES) {
      await expect(page.getByText(phrase, { exact: false })).toHaveCount(0)
    }

    // Capture the network call itself, so a rendered reply can't come from anywhere else.
    const chatCall = page.waitForResponse(
      (r) => r.url().includes('/api/jobs/ai-chat') && r.request().method() === 'POST',
      { timeout: AI_TIMEOUT },
    )

    await page.getByRole('button', { name: 'Senior Backend Engineer, remote, full-time' }).click()

    const chatResponse = await chatCall
    expect(chatResponse.status(), 'ai-chat must succeed — 422 means no ai_config for this org').toBe(200)

    const turn = await chatResponse.json()
    expect(turn.reply, 'assistant must return a reply').toBeTruthy()

    // The issue's acceptance criterion: the AI generates the complete JD by
    // itself. A starter naming the title and employment type must be enough —
    // it must not come back asking for responsibilities/qualifications first.
    expect(turn.readyToGenerate, 'title + employment type must be enough to generate').toBe(true)
    expect(turn.jd, 'a draft must be returned on the first turn').toBeTruthy()
    expect(
      turn.jd.skills.length,
      'skills drive candidate matching and must be inferred, not left empty',
    ).toBeGreaterThan(0)

    // A scripted fake would return one of a fixed set of strings; assert the
    // reply is not any of the retired canned lines.
    for (const phrase of MOCK_PHRASES) {
      expect(turn.reply).not.toContain(phrase)
    }

    // The starter names a title and employment type — the only mandatory
    // fields — so the assistant should produce a draft on this first turn.
    await expect(page.getByText('Generated draft', { exact: false })).toBeVisible({ timeout: AI_TIMEOUT })

    const titleField = page.locator('#jd-title')
    await expect(titleField).toBeVisible()
    const generatedTitle = await titleField.inputValue()
    expect(generatedTitle.length, 'AI should have filled in a job title').toBeGreaterThan(0)

    // The description is the substance of the JD — a stub would leave it thin.
    const description = await page.locator('#jd-description').inputValue()
    expect(description.length, 'generated description should be substantial').toBeGreaterThan(200)

    // Skills must reach the form too, not just the API payload.
    const skills = await page.locator('#jd-skills').inputValue()
    expect(skills.trim().length, 'skills field should be pre-filled').toBeGreaterThan(0)

    // Edit before publishing, and tag the title so cleanup can find this row.
    const uniqueTitle = `E2E AI Draft ${Date.now()}`
    await titleField.fill(uniqueTitle)

    const createCall = page.waitForResponse(
      (r) => r.url().includes('/api/jobs') && !r.url().includes('ai-chat') && r.request().method() === 'POST',
      { timeout: 30_000 },
    )
    await page.getByRole('button', { name: 'Publish job' }).click()

    const createResponse = await createCall
    expect([200, 201], 'POST /api/jobs must succeed').toContain(createResponse.status())

    const job = await createResponse.json()
    expect(job.id, 'created job must have an id').toBeTruthy()
    expect(job.title, 'the edited title must win over the AI original').toBe(uniqueTitle)

    // The page navigates to the new job on success.
    await expect(page).toHaveURL(new RegExp(`/admin/jobs/${job.id}$`), { timeout: 20_000 })
    await expect(page.getByText(uniqueTitle, { exact: false }).first()).toBeVisible()

    // Clean up so repeat runs don't pile jobs into the demo org.
    const deleted = await page.request.delete(`${BASE}/api/jobs/${job.id}`)
    expect([200, 204], 'cleanup delete should succeed').toContain(deleted.status())
  })

  test('surfaces a clear error instead of a canned reply when the AI call fails', async ({ page }) => {
    await signIn(page)
    await page.goto(`${BASE}/admin/ai-chat`)

    // Force the failure the old mock could never have: a real backend error.
    await page.route('**/api/jobs/ai-chat', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ statusMessage: 'boom' }) }),
    )

    await page.getByPlaceholder('Type a message').fill('Senior Backend Engineer, full-time')
    await page.keyboard.press('Enter')

    await expect(page.getByText('something went wrong generating a response', { exact: false })).toBeVisible({
      timeout: 20_000,
    })
    // No draft panel should appear on a failed turn.
    await expect(page.getByText('Generated draft', { exact: false })).toHaveCount(0)
  })
})
