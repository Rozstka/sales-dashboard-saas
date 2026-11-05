# Sales Dashboard SaaS

Portfolio CRM demo by Rozstka: React, Express, PostgreSQL, JWT, lead CRUD, filters, analytics and safe CSV export.
This is a demonstration project, not a claim of paying customers or commercial delivery. Sample leads are fictional and opt-in.

## Run the full application (Docker Compose)
Requires Docker Compose and Node.js 22.12+ for secret generation.
```sh
node scripts/configure.mjs
docker compose up --build -d
```
Open http://localhost:8080 and create an account (password >=8 characters, <=72 UTF-8 bytes).
Use “Load demo data” to populate fictional records; new accounts start empty.
API and database wait for PostgreSQL health. `docker compose down` retains the named data volume.
Local database port is 5433 and is bound to loopback. The API is available through the web proxy at `/api`.

## Local development (Node.js 22.12+)
```sh
npm ci
node scripts/configure.mjs
docker compose up -d db
set -a
. ./.env
set +a
export DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5433/sales_dashboard"
npm run dev
```
Web: http://localhost:5173. API: http://localhost:4000/api. An existing local PostgreSQL installation may be used instead of the db container.
`JWT_SECRET` is mandatory and must be at least 32 characters; there is no known fallback key.
Do not rerun secret generation on an existing `.env`. Never commit secrets. See `.env.example` and `apps/api/.env.example`.

## Verify
```sh
# Use a disposable PostgreSQL database created for tests:
TEST_DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/sales_test npm test
npm run build
npm audit
```
Tests exercise actual PostgreSQL registration/login, owner isolation, CRUD, filters, validation and CSV injection prevention;
a browser-client regression test verifies that JSON and bearer-token headers are both retained.
CI runs those checks and builds both containers. The SQL schema initializes on API startup; versioned migrations are future work.

## API
`POST /api/auth/register`, `POST /api/auth/login`; use returned JWT as `Authorization: Bearer TOKEN`.
`GET/POST /api/leads`, `PUT/DELETE /api/leads/:id`, `PATCH /api/leads/:id/status`.
`GET /api/leads/stats/summary`, `/stats/charts`, `/export.csv`; `POST /api/leads/seed-demo` explicitly adds sample leads.
List/export filters: `search`, `status`, `minValue`, `maxValue`, `sort`.
All lead queries are scoped to the token's owner ID. CSV escapes text formulas for spreadsheet consumers.

## Improvements in this branch
Fixed authenticated JSON writes; removed unsafe JWT fallback; added auth rate limiting, strict IDs and bounded JSON;
made demo replacement transactional; handled duplicate registrations and invalid JSON;
upgraded vulnerable dependencies; added complete container setup and integration tests.
Portfolio page now lists verifiable repository capabilities without a fictitious identity, years of work or customer/product counts.

## MVP limits
JWT is held in browser localStorage in the original client; use short-lived tokens and an appropriate session design before deployment.
No password reset/email verification, refresh-token revocation, pagination, organization-level roles, managed migrations or production SLA.
Auth limiter is process-local and must be configured for a trusted proxy / shared store before scaling.
See [deployment notes](docs/DEPLOY_PRODUCTION.md). No public deployment was made in this task.
