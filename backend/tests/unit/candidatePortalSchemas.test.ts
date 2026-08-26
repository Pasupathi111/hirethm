import { describe, expect, it } from 'vitest'
import { createSelfCandidateSchema, updateSelfCandidateSchema } from '../../server/utils/schemas/candidatePortal'

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

describe('updateSelfCandidateSchema', () => {
  it('keeps quickNotes so the portal "About" edit actually persists', () => {
    // Regression: the field was missing, so Zod stripped it and the PATCH
    // silently saved nothing while the UI still reported success.
    const parsed = updateSelfCandidateSchema.parse({ quickNotes: 'Backend engineer, 6 years.' })
    expect(parsed.quickNotes).toBe('Backend engineer, 6 years.')
  })

  it('allows clearing quickNotes', () => {
    expect(updateSelfCandidateSchema.parse({ quickNotes: null }).quickNotes).toBeNull()
  })

  it('trims quickNotes and rejects an over-long value', () => {
    expect(updateSelfCandidateSchema.parse({ quickNotes: '  hi  ' }).quickNotes).toBe('hi')
    expect(() => updateSelfCandidateSchema.parse({ quickNotes: 'x'.repeat(5001) })).toThrow()
  })

  it('still refuses to self-edit organization or email', () => {
    const parsed = updateSelfCandidateSchema.parse({
      quickNotes: 'ok',
      email: 'attacker@example.com',
      organizationId: 'someone-elses-org',
    } as Record<string, unknown>)
    expect(parsed).not.toHaveProperty('email')
    expect(parsed).not.toHaveProperty('organizationId')
  })
})
