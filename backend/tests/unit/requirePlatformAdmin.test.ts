import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'

// `auth` and `db` are Nitro server auto-imports (ambient globals in production);
// under plain Vitest we stub them explicitly before importing the unit under test.
const getSessionMock = vi.fn()
const findFirstMock = vi.fn()

vi.stubGlobal('auth', {
  api: { getSession: getSessionMock },
})
vi.stubGlobal('db', {
  query: {
    user: { findFirst: findFirstMock },
  },
})

const { requirePlatformAdmin } = await import('../../server/utils/requirePlatformAdmin')

function fakeEvent(): H3Event {
  return { headers: new Headers() } as unknown as H3Event
}

describe('requirePlatformAdmin', () => {
  beforeEach(() => {
    getSessionMock.mockReset()
    findFirstMock.mockReset()
  })

  it('throws 401 when there is no session', async () => {
    getSessionMock.mockResolvedValue(null)

    await expect(requirePlatformAdmin(fakeEvent())).rejects.toMatchObject({ statusCode: 401 })
    // Must reject before touching the database.
    expect(findFirstMock).not.toHaveBeenCalled()
  })

  it('throws 403 for an authenticated user without the flag', async () => {
    getSessionMock.mockResolvedValue({ user: { id: 'user-1' } })
    findFirstMock.mockResolvedValue({ id: 'user-1', isPlatformAdmin: false })

    await expect(requirePlatformAdmin(fakeEvent())).rejects.toMatchObject({ statusCode: 403 })
  })

  it('throws 403 when the user row is missing entirely', async () => {
    getSessionMock.mockResolvedValue({ user: { id: 'ghost' } })
    findFirstMock.mockResolvedValue(undefined)

    await expect(requirePlatformAdmin(fakeEvent())).rejects.toMatchObject({ statusCode: 403 })
  })

  it('throws 403 when isPlatformAdmin is null rather than false', async () => {
    getSessionMock.mockResolvedValue({ user: { id: 'user-1' } })
    findFirstMock.mockResolvedValue({ id: 'user-1', isPlatformAdmin: null })

    await expect(requirePlatformAdmin(fakeEvent())).rejects.toMatchObject({ statusCode: 403 })
  })

  it('resolves with the session for a real platform admin', async () => {
    const session = { user: { id: 'staff-1' } }
    getSessionMock.mockResolvedValue(session)
    findFirstMock.mockResolvedValue({ id: 'staff-1', isPlatformAdmin: true })

    await expect(requirePlatformAdmin(fakeEvent())).resolves.toBe(session)
  })

  it('reads the flag from the database, never from the session object', async () => {
    // A forged/stale session claiming platform-admin must not be trusted —
    // authority comes only from the user row.
    getSessionMock.mockResolvedValue({ user: { id: 'user-1', isPlatformAdmin: true } })
    findFirstMock.mockResolvedValue({ id: 'user-1', isPlatformAdmin: false })

    await expect(requirePlatformAdmin(fakeEvent())).rejects.toMatchObject({ statusCode: 403 })
    expect(findFirstMock).toHaveBeenCalled()
  })
})
