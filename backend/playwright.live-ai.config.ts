import { defineConfig, devices } from '@playwright/test'

/**
 * Opt-in Playwright config for the live-AI E2E specs.
 *
 * These specs make REAL, BILLED calls to the organization's configured AI
 * provider, so they are excluded from the default config (`playwright.config.ts`
 * ignores `*.live-ai.spec.ts`) and never run in CI by accident. Run them
 * deliberately, when you want to prove the AI path genuinely works:
 *
 *   npm run test:e2e:live-ai
 *   npm run test:e2e:live-ai -- --headed
 *
 * Prerequisites:
 * - The dockerized stack is up and reachable at PLAYWRIGHT_BASE_URL
 *   (default http://localhost:3002 — a port better-auth already trusts).
 * - The org has a working AI configuration: `npm run ai:set-key`.
 *
 * A separate config file, rather than an env-var toggle, keeps the npm script
 * free of POSIX `VAR=value` prefixes — those are silently broken on Windows,
 * where npm runs scripts through cmd.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/*.live-ai.spec.ts'],
  fullyParallel: false,
  workers: 1,
  // No retries: a retry means paying for another round of model calls.
  retries: 0,
  // Live model round-trips are far slower than ordinary UI interactions.
  timeout: 240_000,
  expect: { timeout: 15_000 },
  reporter: [['list']],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002',
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  projects: [
    // Real Chrome rather than bundled Chromium — this is the manual
    // "does it actually work for a user" check.
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
  ],
})
