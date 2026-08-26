import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

/**
 * Changelog parsing, shared by `GET /api/updates/changelog` (org-scoped, the
 * vendored Reqcore admin panel) and `GET /api/platform/updates` (the HireThm
 * admin console's "Updates" screen, which must also work for platform-admin
 * staff who belong to no organization).
 *
 * Extracted rather than duplicated so the two screens can never drift into
 * showing different release histories for the same running build.
 */

export type ChangeKind = 'feature' | 'improvement' | 'fix' | 'removal' | 'other'

export interface ChangelogSection {
  heading: string
  /** Normalized category, so the UI doesn't have to pattern-match headings. */
  kind: ChangeKind
  items: string[]
}

export interface ChangelogEntry {
  title: string
  date: string | null
  version: string | null
  link: string | null
  sections: ChangelogSection[]
}

/**
 * Map a `###` heading onto a stable category.
 *
 * The file mixes two conventions — Keep a Changelog ("Added"/"Changed"/
 * "Fixed"/"Removed") for hand-written entries and Conventional Commits
 * ("✨ Features"/"🐛 Bug Fixes"/"♻️ Refactoring"/"🧪 Testing") for
 * release-please generated ones — so both are matched here. Anything
 * unrecognized falls back to 'other' and is still displayed; it is never
 * silently dropped.
 */
export function classifyHeading(heading: string): ChangeKind {
  const h = heading.toLowerCase()
  if (h.includes('added') || h.includes('feature')) return 'feature'
  if (h.includes('fixed') || h.includes('fix')) return 'fix'
  if (h.includes('removed')) return 'removal'
  if (
    h.includes('changed')
    || h.includes('refactor')
    || h.includes('performance')
    || h.includes('testing')
    || h.includes('documentation')
  ) {
    return 'improvement'
  }
  return 'other'
}

/**
 * Strip the trailing `([abc1234](https://…/commit/abc1234))` reference that
 * release-please appends to every generated bullet. The hash is noise in a
 * product-facing "what's new" list; the prose before it is the useful part.
 */
export function stripCommitRef(item: string): string {
  return item.replace(/\s*\(\[[0-9a-f]{6,}]\([^)]*\)\)\s*$/i, '').trim()
}

export interface ParseChangelogOptions {
  /**
   * Drop the trailing commit reference from each bullet. Off by default so the
   * pre-existing `/api/updates/changelog` consumer keeps byte-identical output;
   * the product-facing HireThm screen turns it on.
   */
  stripRefs?: boolean
}

/** Parse raw CHANGELOG.md text into structured entries, newest first. */
export function parseChangelog(raw: string, options: ParseChangelogOptions = {}): ChangelogEntry[] {
  const entries: ChangelogEntry[] = []
  let current: ChangelogEntry | null = null
  let currentSection: ChangelogSection | null = null

  for (const line of raw.split('\n')) {
    const h2 = line.match(/^## \[(.+?)]\((.+?)\)\s*\((.+?)\)/)
    const h2Unreleased = line.match(/^## Unreleased/)
    const h2Date = line.match(/^## (\d{4}-\d{2}-\d{2})/)

    if (h2 || h2Unreleased || h2Date) {
      if (current) entries.push(current)

      if (h2) {
        current = {
          title: `v${h2[1]}`,
          version: h2[1] ?? null,
          date: h2[3] ?? null,
          link: h2[2] ?? null,
          sections: [],
        }
      }
      else if (h2Unreleased) {
        current = { title: 'Unreleased', version: null, date: null, link: null, sections: [] }
      }
      else if (h2Date) {
        current = { title: h2Date[1] ?? '', version: null, date: h2Date[1] ?? null, link: null, sections: [] }
      }
      currentSection = null
      continue
    }

    const h3 = line.match(/^### (.+)/)
    if (h3 && current) {
      const heading = (h3[1] ?? '').trim()
      currentSection = { heading, kind: classifyHeading(heading), items: [] }
      current.sections.push(currentSection)
      continue
    }

    const item = line.match(/^\s*[*-]\s+(.+)/)
    if (item && currentSection) {
      const raw = item[1] ?? ''
      const text = options.stripRefs ? stripCommitRef(raw) : raw
      if (text) currentSection.items.push(text)
    }
  }

  if (current) entries.push(current)

  // Keep versioned releases + Unreleased; drop bare-date entries, which in
  // this file are pre-1.0 working notes rather than releases.
  const releases = entries.filter(e => e.version !== null || e.title === 'Unreleased')

  const seen = new Set<string>()
  return releases.filter((e) => {
    const key = `${e.title}-${e.date}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Read and parse the running build's CHANGELOG.md alongside its package
 * version. Returns an empty entry list (never throws) when the file is absent
 * — a deployment without a bundled changelog is a missing-data case for the
 * UI to render, not a server error.
 */
export async function readChangelog(
  options: ParseChangelogOptions = {},
): Promise<{ entries: ChangelogEntry[]; currentVersion: string | null }> {
  const { version: currentVersion } = await readFile(
    resolve(process.cwd(), 'package.json'),
    'utf-8',
  ).then(JSON.parse) as { version: string }

  let raw: string
  try {
    raw = await readFile(resolve(process.cwd(), 'CHANGELOG.md'), 'utf-8')
  }
  catch {
    return { entries: [], currentVersion }
  }

  return { entries: parseChangelog(raw, options), currentVersion }
}
