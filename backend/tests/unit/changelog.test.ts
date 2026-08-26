import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { classifyHeading, parseChangelog, stripCommitRef } from '../../server/utils/changelog'

/**
 * Parsed against the repository's real CHANGELOG.md, not a fixture — the whole
 * point of this parser is that the Updates screen shows the actual release
 * history of the running build, so a fixture that drifts from the real file
 * would test nothing worth testing.
 */
const RAW = readFileSync(resolve(__dirname, '../../CHANGELOG.md'), 'utf-8')

describe('classifyHeading', () => {
  it('maps Keep a Changelog headings', () => {
    expect(classifyHeading('Added')).toBe('feature')
    expect(classifyHeading('Changed')).toBe('improvement')
    expect(classifyHeading('Fixed')).toBe('fix')
    expect(classifyHeading('Removed')).toBe('removal')
  })

  it('maps the emoji Conventional Commits headings release tooling generates', () => {
    expect(classifyHeading('✨ Features')).toBe('feature')
    expect(classifyHeading('🐛 Bug Fixes')).toBe('fix')
    expect(classifyHeading('♻️ Refactoring')).toBe('improvement')
    expect(classifyHeading('🧪 Testing')).toBe('improvement')
  })

  it('falls back to "other" rather than dropping an unrecognized heading', () => {
    expect(classifyHeading('Miscellaneous')).toBe('other')
  })
})

describe('stripCommitRef', () => {
  it('removes a trailing commit link', () => {
    expect(stripCommitRef('add pgDumpEnv utility ([6fe4900](https://github.com/x/y/commit/6fe4900))'))
      .toBe('add pgDumpEnv utility')
  })

  it('leaves a bullet with no commit reference untouched', () => {
    expect(stripCommitRef('**blog:** add Cluster 8 career page articles'))
      .toBe('**blog:** add Cluster 8 career page articles')
  })

  it('does not strip a parenthetical that is not a commit link', () => {
    const line = 'enhance rate limiting logic (and add tests)'
    expect(stripCommitRef(line)).toBe(line)
  })
})

describe('parseChangelog against the real CHANGELOG.md', () => {
  const entries = parseChangelog(RAW)

  it('finds versioned releases', () => {
    expect(entries.length).toBeGreaterThan(0)
    expect(entries.some(e => e.version !== null)).toBe(true)
  })

  it('keeps the Unreleased section', () => {
    expect(entries.some(e => e.title === 'Unreleased')).toBe(true)
  })

  it('captures the version, date and compare link of a release', () => {
    const versioned = entries.find(e => e.version !== null)!
    expect(versioned.title).toBe(`v${versioned.version}`)
    expect(versioned.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(versioned.link).toContain('http')
  })

  it('nests bullets under their section and classifies every section', () => {
    const withItems = entries.find(e => e.sections.some(s => s.items.length > 0))!
    for (const section of withItems.sections) {
      expect(section.heading.length).toBeGreaterThan(0)
      expect(['feature', 'improvement', 'fix', 'removal', 'other']).toContain(section.kind)
    }
  })

  it('drops bare-date working notes, keeping only releases and Unreleased', () => {
    for (const e of entries) {
      expect(e.version !== null || e.title === 'Unreleased').toBe(true)
    }
  })

  it('emits no duplicate title+date pairs', () => {
    const keys = entries.map(e => `${e.title}-${e.date}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('keeps commit references by default and strips them on request', () => {
    const kept = parseChangelog(RAW)
      .flatMap(e => e.sections.flatMap(s => s.items))
    const stripped = parseChangelog(RAW, { stripRefs: true })
      .flatMap(e => e.sections.flatMap(s => s.items))

    // The generated sections of this file do carry commit links, so the two
    // passes must actually differ — otherwise this test proves nothing.
    expect(kept.some(i => /\(\[[0-9a-f]{6,}]\(/.test(i))).toBe(true)
    expect(stripped.some(i => /\(\[[0-9a-f]{6,}]\(/.test(i))).toBe(false)
    expect(stripped.length).toBe(kept.length)
  })
})
