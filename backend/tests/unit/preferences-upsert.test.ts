import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'

// Route handlers rely on Nitro server auto-imports (`db`, `requireCandidateSession`,
// `readValidatedBody`, `createError`) which are ambient globals in production only —
// stub them explicitly here so the handler can be exercised directly under Vitest.
const requireCandidateSessionMock = vi.fn()
const returningMock = vi.fn()
const onConflictDoUpdateMock = vi.fn(() => ({ returning: returningMock }))
const valuesMock = vi.fn(() => ({ onConflictDoUpdate: onConflictDoUpdateMock }))
const insertMock = vi.fn(() => ({ values: valuesMock }))

vi.stubGlobal('requireCandidateSession', requireCandidateSessionMock)
vi.stubGlobal('db', { insert: insertMock })
vi.stubGlobal('readValidatedBody', async (_event: unknown, validate: (b: unknown) => unknown) => validate((_event as any).__body))

const preferencesHandler = (await import('../../server/api/me/preferences.put')).default

function fakeEvent(body: unknown): H3Event {
  return { __body: body } as unknown as H3Event
}

describe('PUT /api/me/preferences', () => {
  beforeEach(() => {
    requireCandidateSessionMock.mockReset()
    insertMock.mockClear()
    valuesMock.mockClear()
    onConflictDoUpdateMock.mockClear()
    returningMock.mockReset()
    requireCandidateSessionMock.mockResolvedValue({
      session: { user: { id: 'user_1' } },
      candidate: { id: 'cand_1', organizationId: 'org_1' },
    })
  })

  it('upserts preferences keyed by candidateId with the validated body', async () => {
    returningMock.mockResolvedValue([{
      candidateId: 'cand_1',
      desiredTitles: ['Engineer'],
      locations: ['Remote'],
      workMode: 'remote',
      minSalary: 100_000,
      maxSalary: 150_000,
      employmentTypes: ['full_time'],
      notifyMatches: true,
      notifyApplications: true,
      notifyInterviews: false,
      updatedAt: new Date(),
    }])

    const result = await preferencesHandler(fakeEvent({
      desiredTitles: ['Engineer'],
      locations: ['Remote'],
      workMode: 'remote',
      minSalary: 100_000,
      maxSalary: 150_000,
      employmentTypes: ['full_time'],
      notifyMatches: true,
      notifyApplications: true,
      notifyInterviews: false,
    }))

    expect(insertMock).toHaveBeenCalledTimes(1)
    const insertedValues = valuesMock.mock.calls[0][0]
    expect(insertedValues).toMatchObject({
      candidateId: 'cand_1',
      workMode: 'remote',
      minSalary: 100_000,
      maxSalary: 150_000,
    })

    const conflictArgs = onConflictDoUpdateMock.mock.calls[0][0]
    expect(conflictArgs.set).toMatchObject({ workMode: 'remote' })

    // candidateId is never leaked back out of the response.
    expect(result).not.toHaveProperty('candidateId')
    expect(result).toMatchObject({ workMode: 'remote', minSalary: 100_000 })
  })

  it('defaults optional fields (arrays empty, notify flags true, workMode any) when omitted', async () => {
    returningMock.mockResolvedValue([{ candidateId: 'cand_1', workMode: 'any' }])

    await preferencesHandler(fakeEvent({}))

    const insertedValues = valuesMock.mock.calls[0][0]
    expect(insertedValues).toMatchObject({
      desiredTitles: [],
      locations: [],
      workMode: 'any',
      minSalary: null,
      maxSalary: null,
      employmentTypes: [],
      notifyMatches: true,
      notifyApplications: true,
      notifyInterviews: true,
    })
  })

  it('rejects an invalid workMode value', async () => {
    await expect(preferencesHandler(fakeEvent({ workMode: 'from-space' }))).rejects.toBeTruthy()
    expect(insertMock).not.toHaveBeenCalled()
  })
})
