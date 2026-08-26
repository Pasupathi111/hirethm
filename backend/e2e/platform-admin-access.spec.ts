import { test, expect, request as pwRequest } from '@playwright/test'

/**
 * Issue #43 — proves a signed-in org user (recruiter) cannot reach the
 * cross-tenant platform-admin console, through the UI or the API.
 *
 * Run against the deployed stack:
 *   PLAYWRIGHT_BASE_URL=http://localhost:3002 npx playwright test platform-admin-access
 *
 * Requires a non-platform-admin account. Defaults to the seeded demo
 * recruiter; override with E2E_ORG_EMAIL / E2E_ORG_PASSWORD.
 */

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002'
const EMAIL = process.env.E2E_ORG_EMAIL || 'demo@reqcore.com'
const PASSWORD = process.env.E2E_ORG_PASSWORD || 'demo1234'

/** Every cross-tenant route that must be denied to a non-platform-admin. */
const PLATFORM_ROUTES = [
  '/admin/employers',
  '/admin/recruiters',
  '/admin/hiring-managers',
  '/admin/plans',
  '/admin/payments',
  '/admin/usage',
]

/** Every cross-tenant endpoint that must 403 for a non-platform-admin. */
const PLATFORM_ENDPOINTS = [
  '/api/platform/employers',
  '/api/platform/members',
  '/api/platform/plans',
  '/api/platform/payments',
  '/api/platform/usage',
]

async function signIn(page: import('@playwright/test').Page) {
  await page.goto(`${BASE}/employer/sign-in`)
  await page.fill('#email', EMAIL)
  await page.fill('#password', PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/admin/, { timeout: 20_000 })
}

test.describe('platform-admin access control (#43)', () => {
  test('API: every /api/platform/* endpoint 403s for an org user', async () => {
    const ctx = await pwRequest.newContext({ baseURL: BASE })
    const signin = await ctx.post('/api/auth/sign-in/email', {
      data: { email: EMAIL, password: PASSWORD },
      headers: { Origin: BASE },
    })
    expect(signin.status(), 'org user should sign in').toBe(200)

    // Confirm this account really is NOT a platform admin, so a pass here
    // means the guard worked rather than the fixture being wrong.
    const me = await ctx.get('/api/platform/me', { headers: { Origin: BASE } })
    expect(me.status()).toBe(200)
    expect((await me.json()).isPlatformAdmin, 'fixture must be a non-platform-admin').toBe(false)

    for (const endpoint of PLATFORM_ENDPOINTS) {
      const res = await ctx.get(endpoint, { headers: { Origin: BASE } })
      expect(res.status(), `${endpoint} must be forbidden`).toBe(403)
    }
    await ctx.dispose()
  })

  test('API: platform endpoints reject anonymous callers outright', async () => {
    const ctx = await pwRequest.newContext({ baseURL: BASE })
    for (const endpoint of PLATFORM_ENDPOINTS) {
      const res = await ctx.get(endpoint, { headers: { Origin: BASE } })
      expect([401, 403], `${endpoint} must not be public`).toContain(res.status())
    }
    await ctx.dispose()
  })

  test('UI: platform routes redirect an org user away', async ({ page }) => {
    await signIn(page)

    for (const route of PLATFORM_ROUTES) {
      await page.goto(`${BASE}${route}`)
      // The guard redirects back to the org dashboard rather than rendering.
      await expect(page, `${route} must not render for an org user`).not.toHaveURL(
        new RegExp(`${route}$`),
        { timeout: 15_000 },
      )
    }
  })

  test('UI: sidebar hides cross-tenant destinations from an org user', async ({ page }) => {
    await signIn(page)
    const nav = page.locator('nav')

    for (const label of ['Employers', 'Recruiters', 'Hiring Managers', 'Plans', 'Payments', 'Usage']) {
      await expect(
        nav.getByRole('link', { name: label, exact: true }),
        `"${label}" must be hidden from an org user`,
      ).toHaveCount(0)
    }

    // Sanity check: org-scoped nav is still present, so we're not just
    // asserting against an empty/broken sidebar.
    await expect(nav.getByRole('link', { name: 'Candidates', exact: true })).toHaveCount(1)
  })
})
