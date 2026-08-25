# Changelog

Append-only log of what the autonomous loop shipped. Newest first.

## 2026-08-25
- **Work item:** GitHub issue #2 — Let recruiters set job.skills in job create/edit UI
- **PR:** https://github.com/Pasupathi111/hirethm/pull/6 (open, not yet merged)
- **Summary:** Added `SkillsInput.vue` tag input, wired into job create wizard and
  job settings/edit page, backed by existing `job.skills` column/matching logic.
  Fixed `GET /api/jobs/:id` to select `skills` (was missing). Verified end-to-end
  against a local Docker Postgres/MinIO stack with demo-seeded data.
