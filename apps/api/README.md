# apps/api — Tiemen API

Lightweight Express API using Prisma for DB access.

Structure

- `src/index.ts` — app entry, mounts routes
- `src/services/` — thin service layer (DB, auth helpers)
  - `services/db.ts` — Prisma client
  - `services/auth.ts` — sign/verify token helpers
- `src/controllers/` — HTTP handlers
  - `controllers/authController.ts` — `login` and `me` handlers
- `src/routes/` — Express routers (e.g. `routes/auth.ts`)
- `prisma/` — Prisma schema and seed script

Quickstart (local, using Supabase/Neon/Postgres)

1. Copy example env:

```bash
cp apps/api/.env.example apps/api/.env
# Fill DATABASE_URL with your Supabase/Neon connection string
```

2. Install deps and generate prisma client

```bash
cd apps/api
npm install
npx prisma generate
```

3. Create dev migration (requires reachable DB)

```bash
npm run prisma:migrate:dev
npm run seed
npm run dev
```

Notes

- In CI/production run migrations once from pipeline: `npm run prisma:migrate:deploy`.
- Do NOT run migrations from multiple replicas; run from a single deploy job.
- Seed script is idempotent (checks existing user).

Migrations & Supabase

- If you start on Supabase you can use its connection string as `DATABASE_URL`. When migrating to Cloud SQL later, use `pg_dump` / `pg_restore` or follow the dual-write/backfill strategy.

