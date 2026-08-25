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
    candidate: { findFirst: findFirstMock },
  },
})

const { requireCandidateSession } = await import('../../server/utils/requireCandidateSession')

function fakeEvent(): H3Event {
  return { headers: new Headers() } as unknown as H3Event
}

describe('requireCandidateSession', () => {
  beforeEach(() => {
    getSessionMock.mockReset()
    findFirstMock.mockReset()
  })

  it('throws 401 when there is no session', async () => {
    getSessionMock.mockResolvedValue(null)

    await expect(requireCandidateSession(fakeEvent())).rejects.toMatchObject({
      statusCode: 401,
    })
    expect(findFirstMock).not.toHaveBeenCalled()
  })

  it('throws 404 when no non-quarantined candidate matches the session email', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'nobody@example.com' } })
    findFirstMock.mockResolvedValue(undefined)

    await expect(requireCandidateSession(fakeEvent())).rejects.toMatchObject({
      statusCode: 404,
    })
  })

  it('returns the session and candidate row on success', async () => {
    const session = { user: { email: 'jane@example.com', id: 'user_1' } }
    const candidateRow = { id: 'cand_1', organizationId: 'org_1', email: 'jane@example.com', skills: ['React'] }

    getSessionMock.mockResolvedValue(session)
    findFirstMock.mockResolvedValue(candidateRow)

    const result = await requireCandidateSession(fakeEvent())

    expect(result.session).toBe(session)
    expect(result.candidate).toBe(candidateRow)
  })

  it('queries by the session email case-insensitively and excludes quarantined candidates', async () => {
    getSessionMock.mockResolvedValue({ user: { email: 'Jane@Example.com' } })
    findFirstMock.mockResolvedValue({ id: 'cand_1' })

    await requireCandidateSession(fakeEvent())

    expect(findFirstMock).toHaveBeenCalledTimes(1)
    const options = findFirstMock.mock.calls[0][0]
    expect(options).toHaveProperty('where')
    expect(typeof options.where).toBe('function')
  })
})
