import { describe, expect, it } from 'vitest'
import { extractSkillsFromText, SKILLS_TAXONOMY } from '../../server/utils/skills-taxonomy'

describe('extractSkillsFromText', () => {
  it('returns an empty array for empty or non-matching text', () => {
    expect(extractSkillsFromText('')).toEqual([])
    expect(extractSkillsFromText('A resume with no recognizable skills at all here.')).toEqual([])
  })

  it('extracts multiple skills mentioned in free text, case-insensitively', () => {
    const text = 'Experienced with react, TypeScript and Node.js, deployed via docker on AWS.'
    const found = extractSkillsFromText(text)
    expect(found).toEqual(expect.arrayContaining(['React', 'TypeScript', 'Node.js', 'Docker', 'AWS']))
  })

  it('does not match substrings inside unrelated words', () => {
    // "Go" is in the taxonomy — "Google" and "going" should not trigger a match.
    const found = extractSkillsFromText('Went to Google and kept going about our roadmap.')
    expect(found).not.toContain('Go')
  })

  it('handles taxonomy entries containing regex metacharacters (C++, .NET, CI/CD)', () => {
    const text = 'Built services in C++ and .NET, with CI/CD pipelines.'
    const found = extractSkillsFromText(text)
    expect(found).toEqual(expect.arrayContaining(['C++', '.NET', 'CI/CD']))
  })

  it('never returns duplicate entries', () => {
    const found = extractSkillsFromText('React React react REACT')
    expect(found.filter((s) => s === 'React')).toHaveLength(1)
  })

  it('only returns entries from the fixed taxonomy list', () => {
    const found = extractSkillsFromText('React TypeScript Kubernetes Blockchain Quantum Computing')
    for (const skill of found) {
      expect(SKILLS_TAXONOMY).toContain(skill)
    }
  })
})
