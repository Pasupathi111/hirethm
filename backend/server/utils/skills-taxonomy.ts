/**
 * A small, fixed list of common tech/professional skill keywords used for
 * naive keyword extraction from resume text. This is intentionally simple —
 * a substring/word-boundary match against this list, not an NLP model — and
 * is meant to seed `candidate.skills` from an uploaded resume, not to be an
 * exhaustive or authoritative skills taxonomy.
 */
export const SKILLS_TAXONOMY: readonly string[] = [
  // Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
  'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala', 'SQL',
  // Frontend
  'React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt', 'HTML', 'CSS',
  'Tailwind CSS', 'Redux',
  // Backend / Runtime
  'Node.js', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring Boot',
  'Ruby on Rails', '.NET',
  // Data / Infra
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL', 'REST APIs',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Terraform', 'CI/CD',
  'Git', 'Linux',
  // Data science / AI
  'Machine Learning', 'Data Analysis', 'Pandas', 'TensorFlow', 'PyTorch',
  // Professional / soft skills
  'Project Management', 'Agile', 'Scrum', 'Product Management',
  'Leadership', 'Communication', 'Sales', 'Marketing', 'Customer Service',
  'Accounting', 'Finance', 'Recruiting', 'UX Design', 'UI Design',
  'Figma', 'Excel',
] as const

/**
 * Naively extract skill keywords from free-text resume content by matching
 * each taxonomy entry as a whole-word (case-insensitive) substring.
 * Returns the canonical (taxonomy) casing for each match.
 */
export function extractSkillsFromText(text: string): string[] {
  if (!text) return []
  const found = new Set<string>()

  for (const skill of SKILLS_TAXONOMY) {
    // Escape regex metacharacters (e.g. "C++", ".NET", "CI/CD") before matching.
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp(`(?<![a-zA-Z0-9])${escaped}(?![a-zA-Z0-9])`, 'i')
    if (pattern.test(text)) {
      found.add(skill)
    }
  }

  return [...found]
}
