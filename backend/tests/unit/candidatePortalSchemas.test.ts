import { describe, expect, it } from 'vitest'
import { createSelfCandidateSchema } from '../../server/utils/schemas/candidatePortal'

describe('createSelfCandidateSchema (#46)', () => {
  it('accepts a minimal valid profile', () => {
    const parsed = createSelfCandidateSchema.parse({ firstName: 'Ada', lastName: 'Lovelace' })
    expect(parsed.firstName).toBe('Ada')
    expect(parsed.skills).toEqual([])
  })

  it('trims surrounding whitespace', () => {
    const parsed = createSelfCandidateSchema.parse({ firstName: '  Ada  ', lastName: ' Lovelace ' })
    expect(parsed.firstName).toBe('Ada')
    expect(parsed.lastName).toBe('Lovelace')
  })

  it('rejects an empty or whitespace-only name', () => {
    expect(() => createSelfCandidateSchema.parse({ firstName: '', lastName: 'X' })).toThrow()
    expect(() => createSelfCandidateSchema.parse({ firstName: '   ', lastName: 'X' })).toThrow()
  })

  it('requires both names', () => {
    expect(() => createSelfCandidateSchema.parse({ firstName: 'Ada' })).toThrow()
  })

  it('strips an injected email so a profile can never be created under another address', () => {
    // Email must come from the authenticated session only.
    const parsed = createSelfCandidateSchema.parse({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'victim@example.com',
    } as Record<string, unknown>)
    expect(parsed).not.toHaveProperty('email')
  })

  it('strips an injected organizationId so a candidate cannot self-assign to an employer', () => {
    const parsed = createSelfCandidateSchema.parse({
      firstName: 'Ada',
      lastName: 'Lovelace',
      organizationId: 'some-org-id',
    } as Record<string, unknown>)
    expect(parsed).not.toHaveProperty('organizationId')
  })

  it('caps the skills array to prevent unbounded payloads', () => {
    const tooMany = Array.from({ length: 101 }, (_, i) => `skill-${i}`)
    expect(() => createSelfCandidateSchema.parse({
      firstName: 'Ada', lastName: 'Lovelace', skills: tooMany,
    })).toThrow()
  })

  it('accepts a null phone', () => {
    const parsed = createSelfCandidateSchema.parse({ firstName: 'Ada', lastName: 'Lovelace', phone: null })
    expect(parsed.phone).toBeNull()
  })
})
