# Project memory: HireThm candidate portal

This file records project context and decisions that aren't obvious from reading the code alone — kept up to date as the project evolves, not a one-time snapshot.

## Repo topology

- This repo (`HireThm`) contains **two apps**: the frontend at the repo root (`src/`, Vite + React + TypeScript) and a separate backend product vendored in at `backend/` (Nuxt/Nitro, Drizzle ORM on Postgres, S3-compatible storage via MinIO locally, better-auth for sessions).
- `backend/` was **not tracked in git until 2026-08-25** — it existed only on disk. It was vendored in via `git add backend` on a dedicated branch (`chore/track-backend`) and merged into `main`. If you find `backend/` untracked again in a fresh clone, that's expected only if someone re-added it to `.gitignore`; otherwise it should already be present.
- Local dev services run via `backend/docker-compose.yml`: `reqcore_db` (Postgres), `reqcore_minio` (S3), `reqcore_app` (the built backend, production-style). For active backend development, stop `reqcore_app` and run `npm run dev` inside `backend/` instead (it reuses the same Postgres/MinIO via the `.env`'s `localhost` URLs) — remember to `docker start reqcore_app` again afterward to restore the standing setup.
- New backend migrations apply automatically on boot (`backend/server/plugins/migrations.ts`), or manually via `npm run db:migrate` (drizzle-kit).

## Candidate self-service portal (`/app/*` routes)

As of 2026-08-25, all candidate-portal routes are wired to real backend data (previously all mock except `/app/applications`):

- `/app/jobs` → `GET /api/public/jobs` (now also selects `job.skills`)
- `/app/recommended` → `GET /api/me/recommended`
- `/app/matches` → `GET /api/me/matches`, `PATCH /api/me/matches/:id` (accept creates a real `application` + notification)
- `/app/interviews`, `/app/applications` → derived from `useMyCandidate()` (`GET /api/me/candidate`)
- `/app/profile` → `PATCH /api/me/candidate`
- `/app/resume` → `GET/POST /api/me/documents`, `DELETE /api/me/documents/:id`
- `/app/preferences` → `GET/PUT /api/me/preferences`
- `/app/notifications` → `GET/PATCH /api/me/notifications`, `POST /api/me/notifications/mark-all-read`
- `/app/settings` → preferences + better-auth password change + `POST /api/me/account/delete`

**Auth pattern**: candidate portal users are plain better-auth `user` rows with no org membership — there is no direct user→candidate foreign key. `backend/server/utils/requireCandidateSession.ts` matches the session's email (case-insensitive) against the `candidate` table across all orgs. This is the shared helper for every `/api/me/*` route; extend it rather than re-inlining the lookup.

**Matching**: `backend/server/utils/matching.ts` (`computeMatch`) is a v1 heuristic scoring 8 fixed criteria (Skills Match, Experience Match, Career Goals, Location Preference, Salary Fit, Availability, Culture & Role Fit, Potential & Growth). Only Skills Match, Location Preference, and Salary Fit have real signals today; the rest default to 75 until more signals exist. `candidateMatch` rows persist accept/decline state; `/api/me/recommended` is stateless (recomputed per request, not persisted).

**Frontend pattern**: `src/lib/api.ts` (`api.get/post/patch/put/upload`) + either the shared `useMyCandidate()` context (`src/lib/candidateSession.tsx`) or a per-page `useState`+`useEffect` fetch (see `src/pages/candidate/Recommended.tsx` for the simplest example). New candidate pages should follow one of these two patterns, not invent a third.

## Admin console data sources (as of 2026-08-26)

Every admin screen now reads real data. The last fabricated ones were converted
or removed; `src/data/mockData.ts` no longer exists. Non-obvious wiring:

- `/admin/system-health` → `GET /api/platform/health` (platform-admin only).
  Probes are taken at request time. There is deliberately **no queue-depth
  metric** — AI analysis runs inline in the request, there is no queue — and
  **no email delivery rate** — nothing logs sends, so Email reports which
  provider is configured instead. Services that aren't set up return
  `not_configured`, which is rendered differently from `down`.
- `/admin/updates` → `GET /api/platform/updates`, parsed from the deployed
  build's `backend/CHANGELOG.md` via `server/utils/changelog.ts`. That util is
  shared with the older `/api/updates/changelog` (the vendored Reqcore admin
  panel); `stripRefs` is opt-in so that consumer's output is unchanged.
- `/admin/roles-permissions` → `GET /api/platform/permissions`, generated from
  `backend/shared/permissions.ts` itself. Keep `ownerAtsGrants` /
  `adminAtsGrants` / `memberAtsGrants` as the single source — the endpoint and
  `ac.newRole()` both read them, so the screen cannot drift from enforcement.
  Note those constants are annotated `: AtsGrants`, **not** `as const`:
  `newRole()` needs mutable arrays of literal actions and rejects readonly
  tuples.
- `/admin/matching-rules` → `org_settings.match_weights` (jsonb, migration
  0041). `computeMatch()` takes the weights as its 4th argument and computes a
  weighted mean normalized by total weight, so weights need not sum to 100.
  Resolved per **job organization**, matching how `minReadinessScore` is
  resolved — the employer whose role produced the match owns the policy.
- `/admin/notifications` and `/admin/reports` were **deleted**, not wired. The
  real notification policy already lives on `/admin/platform-settings` (#27,
  #19); no report generation exists at all (#70). Don't recreate either page
  without a real backing feature.

## Candidate consent & data rights (as of 2026-08-26)

- **`candidate_preference.sourcing_visibility`** (`open` | `manual` | `hidden`,
  migration 0042) is the candidate's consent level for AI sourcing, and it is
  **enforced server-side, not just displayed**:
  - `manual` and `hidden` → `/api/me/matches` creates no new `candidate_match`
    rows. Rows the candidate already has are still returned; opting out stops
    future sourcing, it does not retract matches they were already notified of.
  - `hidden` → `/api/me/recommended` additionally returns
    `{ data: [], sourcingPaused: true, message }`, which the Recommended page
    renders as a distinct "paused" empty state rather than "no results".
  Any new endpoint that surfaces a candidate to an employer must check this.
- **`GET /api/me/export`** is the candidate's own GDPR Art. 15 download.
  It deliberately **omits recruiter-authored data** (comments, custom
  properties, `quickNotes`) — those stay behind `GET /api/candidates/:id/export`
  so the employer, as controller, mediates their disclosure. Don't "helpfully"
  add them here.
- `CareerPreferences.tsx` PUTs the whole preferences object, so it round-trips
  `sourcingVisibility` untouched. Any new screen writing preferences must load
  first and PUT the full object, or it will silently reset the consent level.

## Things that are deliberately absent

Do not re-add these; each was removed because nothing real backed it:

- **Two-factor auth** — better-auth's `twoFactor` plugin is not configured in
  `server/utils/auth.ts`, so a 2FA card is decoration.
- **Saved jobs**, **"manage data sharing"** — no schema, no endpoints.
- **`/admin/notifications`**, **`/admin/reports`** — see the note above.
- The `AdminListPage` **"Bulk actions"** stub and its 450ms fake loading delay.
  Pass a real `onDeleteSelected` for bulk work; `loading` is now required.

`AdminListPage`'s **Export CSV is real** and client-side: it flattens each
column's rendered JSX to text via `nodeToText`, so a new column exports
automatically. Override with `exportValue` only for icon-only cells or when the
export needs more precision than the display.

`AcceptInvitation.tsx` uses better-auth's `organization.getInvitation`, which
**requires a session whose email matches the invitation** — that is why the
page cannot show the inviting org's name before sign-in, and it should stay
that way (it stops an invitation ID leaking org names). Note the invitation
email in `auth.ts` currently links to the **Vue** app's
`/auth/accept-invitation/:id`, not this React route.

## Known gaps (as of 2026-08-25)

- **`job.skills` has no recruiter-facing input yet** — the column and matching logic exist, but nothing in the recruiter job-create/edit UI (Vue, `backend/app/components/ApplicationBuilder.vue` et al.) lets a recruiter populate it, so every match currently scores a neutral ~76%. This is the highest-value next step for making match scores actually differentiate between jobs.
- `src/pages/marketing/JobDetail.tsx` and `JobApply.tsx` still resolve jobs from the old mock array by mock IDs — they haven't been migrated to `ApiJob`/real job IDs yet, so "View Job"/"Apply" from the now-real `/app/jobs` list will 404 into these pages until they're migrated too.
- Interview slot-confirmation ("Confirm/Change Slot") and candidate consent-history/visibility persistence have no backing endpoint yet — removed from the UI rather than faked.

## Where things live

- Candidate/job/application/interview/document schema: `backend/server/database/schema/app.ts`.
- Candidate-portal API routes: `backend/server/api/me/**`.
- Frontend candidate pages: `src/pages/candidate/*.tsx`; shared session context: `src/lib/candidateSession.tsx`; API client: `src/lib/api.ts`.
