# Changelog

Append-only log of what the autonomous loop shipped. Newest first.

## 2026-08-25
- **Work item:** GitHub issue #2 — Let recruiters set job.skills in job create/edit UI
- **PR:** https://github.com/Pasupathi111/hirethm/pull/6 (merged to main)
- **Summary:** Added `SkillsInput.vue` tag input, wired into job create wizard and
  job settings/edit page, backed by existing `job.skills` column/matching logic.
  Fixed `GET /api/jobs/:id` to select `skills` (was missing). Verified end-to-end
  against a local Docker Postgres/MinIO stack with demo-seeded data.

## 2026-08-25 (2)
- **Work item:** GitHub issue #3 — Migrate JobDetail/JobApply off mock job data
- **PR:** https://github.com/Pasupathi111/hirethm/pull/7 (merged to main)
- **Summary:** JobDetail/JobApply/JobApplyConfirmation now use the real public
  jobs API instead of the mock array; JobApply submits through the real
  public apply endpoint with full dynamic custom-question rendering. Also
  fixed two other mock-data sites that would have broken as a side effect
  (Home.tsx featured jobs, candidate Dashboard's recommended widget).

## 2026-08-25 (3)
- **Work item:** GitHub issue #4 — Interview slot confirmation + candidate
  consent history/visibility endpoints
- **PR:** https://github.com/Pasupathi111/hirethm/pull/8 (merged to main)
- **Summary:** Added `POST /api/me/interviews/:id/respond` (candidate
  confirm/decline/tentative on their own interviews) and
  `GET /api/me/matches/:id/history` (consent/visibility timeline built from
  existing persisted data, not a new audit table). Re-added the
  corresponding UI in Interviews.tsx and MyMatches.tsx.

## 2026-08-25 (4)
- **Work item:** GitHub issue #5 — Milestone 9: Resume parsing
- **PR:** pending (branch `feature/5-resume-parsing-milestone9`)
- **Summary:** PDF/DOCX/DOC extraction, section detection, storage, and
  skill auto-fill already existed — turned out the roadmap checklist was
  stale. Fixed the two real gaps: display was silently broken (parsedContent
  interpolated as an object / column not even selected in two GET
  endpoints), and nothing displayed parsed resumes on the admin/recruiter
  side. Added `GET /api/documents/:id` for on-demand full content, a
  Documents section in admin CandidateDetail.tsx, structured
  email/phone/skills extraction reusing the existing taxonomy matcher, and
  fixed `GET /api/me/candidate` to actually select `skills` (silently never
  selected despite being read by Profile.tsx).
