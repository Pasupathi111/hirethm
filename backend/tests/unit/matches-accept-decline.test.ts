import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'
import { application, candidateNotification } from '../../server/database/schema'

// Route handlers rely on Nitro server auto-imports (`db`, `requireCandidateSession`,
// `getValidatedRouterParams`, `readValidatedBody`, `createError`) which are ambient
// globals in production only — stub them explicitly so the handler can be
// exercised directly under Vitest.
const requireCandidateSessionMock = vi.fn()
const findFirstMatchMock = vi.fn()
const findFirstApplicationMock = vi.fn()

const matchReturningMock = vi.fn()
const matchWhereMock = vi.fn(() => ({ returning: matchReturningMock }))
const matchSetMock = vi.fn(() => ({ where: matchWhereMock }))
const matchUpdateMock = vi.fn(() => ({ set: matchSetMock }))

const applicationOnConflictMock = vi.fn(() => Promise.resolve())
const applicationValuesMock = vi.fn(() => ({ onConflictDoNothing: applicationOnConflictMock }))
const notificationValuesMock = vi.fn(() => Promise.resolve())

const insertMock = vi.fn((table: unknown) => {
  if (table === application) return { values: applicationValuesMock }
  if (table === candidateNotification) return { values: notificationValuesMock }
  throw new Error('Unexpected insert target in test')
})

const txMock = {
  update: matchUpdateMock,
  query: { application: { findFirst: findFirstApplicationMock } },
  insert: insertMock,
}

const transactionMock = vi.fn(async (cb: (tx: typeof txMock) => unknown) => cb(txMock))

vi.stubGlobal('requireCandidateSession', requireCandidateSessionMock)
vi.stubGlobal('getValidatedRouterParams', async (_event: unknown, validate: (p: unknown) => unknown) => validate((_event as any).__params))
vi.stubGlobal('readValidatedBody', async (_event: unknown, validate: (b: unknown) => unknown) => validate((_event as any).__body))
vi.stubGlobal('db', {
  query: { candidateMatch: { findFirst: findFirstMatchMock } },
  update: matchUpdateMock,
  transaction: transactionMock,
})

const matchPatchHandler = (await import('../../server/api/me/matches/[id].patch')).default

function fakeEvent(params: unknown, body: unknown): H3Event {
  return { __params: params, __body: body } as unknown as H3Event
}

const CANDIDATE = { id: 'cand_1', organizationId: 'org_1' }

describe('PATCH /api/me/matches/:id', () => {
  beforeEach(() => {
    requireCandidateSessionMock.mockReset()
    findFirstMatchMock.mockReset()
    findFirstApplicationMock.mockReset()
    matchReturningMock.mockReset()
    matchWhereMock.mockClear()
    matchSetMock.mockClear()
    matchUpdateMock.mockClear()
    applicationOnConflictMock.mockClear()
    applicationValuesMock.mockClear()
    notificationValuesMock.mockClear()
    insertMock.mockClear()
    transactionMock.mockClear()

    requireCandidateSessionMock.mockResolvedValue({
      session: { user: { id: 'user_1' } },
      candidate: CANDIDATE,
    })
  })

  it('404s when the match does not belong to this candidate', async () => {
    findFirstMatchMock.mockResolvedValue(undefined)

    await expect(
      matchPatchHandler(fakeEvent({ id: 'match_1' }, { status: 'accepted' })),
    ).rejects.toMatchObject({ statusCode: 404 })

    expect(transactionMock).not.toHaveBeenCalled()
  })

  it('rejecting a match only updates its status — no application or notification created', async () => {
    findFirstMatchMock.mockResolvedValue({ id: 'match_1', jobId: 'job_1', job: { id: 'job_1', title: 'Engineer' } })
    matchReturningMock.mockResolvedValue([{ id: 'match_1', status: 'rejected' }])

    const result = await matchPatchHandler(fakeEvent({ id: 'match_1' }, { status: 'rejected' }))

    expect(matchSetMock).toHaveBeenCalledWith(expect.objectContaining({ status: 'rejected' }))
    expect(transactionMock).not.toHaveBeenCalled()
    expect(result).toEqual({ id: 'match_1', status: 'rejected' })
  })

  it('accepting a match updates status, creates an application, and a notification, inside a transaction', async () => {
    findFirstMatchMock.mockResolvedValue({ id: 'match_1', jobId: 'job_1', job: { id: 'job_1', title: 'Engineer' } })
    findFirstApplicationMock.mockResolvedValue(undefined) // no existing application
    matchReturningMock.mockResolvedValue([{ id: 'match_1', status: 'accepted' }])

    const result = await matchPatchHandler(fakeEvent({ id: 'match_1' }, { status: 'accepted' }))

    expect(transactionMock).toHaveBeenCalledTimes(1)
    expect(matchSetMock).toHaveBeenCalledWith(expect.objectContaining({ status: 'accepted' }))
    expect(applicationValuesMock).toHaveBeenCalledWith(expect.objectContaining({
      candidateId: CANDIDATE.id,
      jobId: 'job_1',
      organizationId: CANDIDATE.organizationId,
    }))
    expect(notificationValuesMock).toHaveBeenCalledWith(expect.objectContaining({
      candidateId: CANDIDATE.id,
      category: 'applications',
    }))
    expect(result).toEqual({ id: 'match_1', status: 'accepted' })
  })

  it('accepting a match with an existing application does not create a duplicate', async () => {
    findFirstMatchMock.mockResolvedValue({ id: 'match_1', jobId: 'job_1', job: { id: 'job_1', title: 'Engineer' } })
    findFirstApplicationMock.mockResolvedValue({ id: 'existing_app' })
    matchReturningMock.mockResolvedValue([{ id: 'match_1', status: 'accepted' }])

    await matchPatchHandler(fakeEvent({ id: 'match_1' }, { status: 'accepted' }))

    // Only the notification insert should have happened — no application insert.
    expect(insertMock).toHaveBeenCalledTimes(1)
    expect(notificationValuesMock).toHaveBeenCalledTimes(1)
  })

  it('rejects an invalid status value', async () => {
    findFirstMatchMock.mockResolvedValue({ id: 'match_1', jobId: 'job_1', job: null })

    await expect(
      matchPatchHandler(fakeEvent({ id: 'match_1' }, { status: 'maybe' })),
    ).rejects.toBeTruthy()
  })
})
