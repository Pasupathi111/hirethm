/**
 * Vitest setup for server-side unit tests.
 *
 * The real app relies on Nitro's server auto-imports (unimport) to turn
 * exports like `db`, `auth`, `createError`, `defineEventHandler`, etc. from
 * `server/utils/*.ts` into ambient globals inside every server file — that
 * transform only runs inside the Nuxt/Nitro build pipeline, not under plain
 * Vitest. Individual test files stub the specific globals a unit under test
 * needs (`vi.stubGlobal('db', ...)`, `vi.stubGlobal('auth', ...)`), but a
 * couple of framework primitives are cheap and safe to install for real here
 * so every test gets identical behavior to production for them.
 */
import { createError as h3CreateError, defineEventHandler as h3DefineEventHandler } from 'h3'
import { afterEach, vi } from 'vitest'

vi.stubGlobal('createError', h3CreateError)
vi.stubGlobal('defineEventHandler', h3DefineEventHandler)

afterEach(() => {
  vi.restoreAllMocks()
})
