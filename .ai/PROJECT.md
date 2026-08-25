# Project Overview

- **Name:** HireThm (backend service name: reqcore)
- **Repo URL:** https://github.com/Pasupathi111/hirethm.git (will change to a
  different repo next week — re-check this file when that happens)
- **Azure DevOps project/board:** **not used for HireThm right now.** The
  earlier "Golden Bridge" codenamed slice of the shared `TenderzAI` project
  (org `https://dev.azure.com/dbizsolution`) is **closed out / superseded**
  as of 2026-08-25 — HireThm is now the ongoing project name and the user
  confirmed there is no new title/area-path convention yet. Work items are
  **not tracked in Azure Boards for now**; work comes from direct chat
  instructions instead. Azure credentials remain saved in `ai-dev/.env` for
  when/if this is wired up later — re-ask the user before resuming any
  Azure-Boards-driven automation for this project.
- **Code source:** GitHub (`GITHUB_REPO_URL` in `ai-dev/.env`), no Azure Repos.
- **Language(s) / Framework(s):**
  - Root: Vite + React 19 + TypeScript (candidate portal / frontend shell)
  - `backend/`: Nuxt 3/4 (Reqcore) + Drizzle ORM + Postgres + MinIO (S3-compatible storage)
- **Package manager:** npm (both root and `backend/`)
- **Build command:**
  - Root: `npm run build` (`tsc -b && vite build`)
  - Backend: `npm run build` (`nuxt build`)
- **Lint command:**
  - Root: `npm run lint` (oxlint)
  - Backend: check `backend/package.json` (no explicit lint script seen yet — verify)
- **Type-check command:**
  - Backend: `npm run typecheck`
- **Test command(s):**
  - Backend: `npm run test` (vitest), `npm run test:e2e` (Playwright)
- **Local run command:**
  - Root: `npm run dev` (Vite dev server)
  - Backend: `npm run dev` (Nuxt dev server)
  - Full stack via Docker: `docker compose up` from `backend/` (Postgres + MinIO + app)
- **Base branch for feature work:** `main` (confirmed via `origin/HEAD`)
- **Protected branches:** `main`
- **Deployment target(s):** local machine via Docker (`backend/docker-compose.yml`
  for local, `backend/docker-compose.production.yml` for production shape).
  Production deploys require manual approval — see `.ai/DEPLOYMENT.md`.
- **Owning team / primary contact:** Pasupathi Shanmugam (pasupathis77777@gmail.com)

## Known sub-docs already in this repo (read these too)
- `backend/ARCHITECTURE.md`
- `backend/PRODUCT.md`
- `backend/ROADMAP.md`
- `backend/TESTING-SECURITY.md`
- `backend/SELF-HOSTING.md`
- `PROJECT-MEMORY.md` (root)
