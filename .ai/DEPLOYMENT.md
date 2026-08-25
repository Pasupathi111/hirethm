# Deployment

- **Staging target:** local Docker (this machine) — no separate cloud staging yet
- **Production target:** local Docker (this machine) for now, per explicit
  instruction — `docker compose -f backend/docker-compose.production.yml`
- **CI/CD pipeline:** none confirmed yet — verify `.github/workflows/` if it
  exists before assuming
- **Deploy command / trigger:**
  ```bash
  cd backend
  docker compose up -d --build          # local/dev stack (db, minio, app, optional adminer)
  # production shape:
  docker compose -f docker-compose.production.yml up -d --build
  ```
- **Approval gate for production:** **manual, confirmed by user 2026-08-25.**
  Do not automate production deploys past this point without the user
  explicitly re-authorizing it. This applies even though the "production"
  target is local Docker on this machine, not a cloud environment — approval
  is still required before running the production compose file.
- **Rollback procedure:** not yet defined — `docker compose down` + previous
  image/tag if using tagged builds. Confirm before relying on this.
- **Health check endpoint(s):** TBD — check `backend/server` for a health route
- **Deployment window:** not yet scheduled — orchestrator scheduling is not
  wired up yet (see `ai-dev/orchestrator/README.md`)

## Local services (docker-compose.yml)
| Service | Purpose | Port (localhost only) |
|---|---|---|
| db | Postgres 16 | 5432 |
| minio | S3-compatible storage | 9000 (API), 9001 (console) |
| app | Reqcore (Nuxt) | 3000 |
| adminer (optional, `--profile tools`) | DB browser | 8080 |

Requires a `.env` file in `backend/` with `DB_USER`, `DB_PASSWORD`, `DB_NAME`,
`STORAGE_USER`, `STORAGE_PASSWORD` at minimum — check `backend/SELF-HOSTING.md`
for the full list before first run.
