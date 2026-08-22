# Dayflow HRMS — memory.md

> **AI coding agent working memory.** Updated after every ticket.
> A new session should read this file FIRST — it reflects the actual current state of the codebase.

---

## Phase 0 — Project Setup (DONE)

- **T0.1** ✅ — Initialize repo (Next.js 15+ App Router, TypeScript v5, Tailwind v4, shadcn/ui preparation).
- **T0.2** ✅ — Prisma ORM schema set up with all 8 core models (`User`, `Employee`, `Attendance`, `LeaveRequest`, `Payroll`, `Document`, `Notification`, `AuditLog`) + initial SQL migration created (`prisma/migrations/0_init/migration.sql`) & dev seed script (`prisma/seed.ts`) configured with `tsx`. `.env.example` committed with secret placeholders; local `.env` created with dev-safe defaults.
- **T0.3** ✅ — Configured ESLint (Flat Config v9), Prettier with Tailwind plugin, lint-staged, and Husky hooks. `type-check` script (`tsc --noEmit`) added to `package.json`.
- **T0.4** ✅ — Base layout configured with Google Fonts (Sora & Inter) in `app/layout.tsx`, design token custom properties in `app/globals.css`, and branded placeholder home shell at `app/page.tsx`. `AppShell.tsx` component stub created in `components/shared/`.
- **T0.5** ✅ — `docs/memory.md` scaffold created and updated.

### Pre-T0.1 steps completed:
- `AI rules and Documents/` renamed → `docs/` via PowerShell + `git add -A`.
- `.gitignore` created before `.env` to ensure secrets are never committed.
- `docs/reference/README.md` placeholder created for local PDF requirements reference.

---

## Phase 1 — Authentication & Authorization

- **T1.1** ✅ — Sign-up API + form complete and verified:
  - Rate limiting: `lib/rate-limit.ts` (sliding window, 5 req / 15 min per IP+email).
  - Zod schemas: `lib/validators/auth.ts` (strong password, terms required, NO client-submitted role).
  - Sign-up endpoint: `app/api/auth/sign-up/route.ts` (forces `Role.EMPLOYEE`, bcrypt cost 12, verification token, console email stub).
  - UI: `components/forms/SignUpForm.tsx` (password strength meter, terms checkbox, demo quick-verify link on success).
  - `migrate status` confirmed clean on Neon DB: "Database schema is up to date!" (1 migration: `0_init`).

---

## Migration History — Definitive Record

> **Read this carefully to avoid re-creating confusion in future sessions.**

### What exists on disk
```
prisma/migrations/
  0_init/
    migration.sql   ← ONLY migration file. Created in Phase 0.
```

### What `0_init` contains
- All 4 enums (`Role`, `AttendanceStatus`, `LeaveType`, `LeaveStatus`)
- All 8 tables: `users`, `employees`, `attendance`, `leave_requests`, `payroll`, `documents`, `notifications`, `audit_logs`
- Auth columns on `users`: `verify_token`, `verify_token_exp`, `reset_token`, `reset_token_exp`, `refresh_token_hash` — **already present in `0_init`**; T1.1 did NOT require a separate migration.
- `employees` table uses **`first_name` / `last_name`** columns (NOT `name`). The `name` column was briefly considered/attempted but **never applied to the DB**. Schema and seed both use `firstName`/`lastName`.

### What does NOT exist
- **`t1_1_auth_fields`** — This migration name (`20260822105000_t1_1_auth_fields`) was referenced in early T1.1 sessions but was **never created as a file**. It does not exist in `prisma/migrations/`. Do not attempt to create or resolve it again.
- `0_init` is **not** a rename of `t1_1_auth_fields`. They are unrelated. `0_init` is the original Phase 0 baseline.

### Neon DB status (as of 2026-08-22)
- `npx prisma migrate status` → **"Database schema is up to date!"** (1 migration applied: `0_init`)
- Seeded rows confirmed in Neon:
  - `admin@dayflow.dev` / `Admin@1234` — role: `ADMIN`, `isVerified: true`, Employee: Anita Sharma (EMP-0001)
  - `rahul@dayflow.dev` / `Employee@1234` — role: `EMPLOYEE`, `isVerified: true`, Employee: Rahul Mehta (EMP-0002)
- Direct (non-pooler) connection string works; pooler (`-pooler` host on port 5432) does **not** work from local machine. Always use direct host for CLI commands.

---

## Key decisions / assumptions:
- ASSUMPTION: Email provider not yet configured — stubbed via `console.warn` in dev until T7.1.
- ASSUMPTION: S3 not yet configured — file uploads stubbed until T3.4.
- ASSUMPTION: `docs/reference/Dayflow-HRMS-Requirements.pdf` is not committed (binary asset); developer adds it locally.
- FIX: Upgraded/pinned Prisma to v6 to maintain standard Prisma ORM schema syntax for `DATABASE_URL`.
- FIX: Router groups `/admin` and `/employee` updated to `/admin-dashboard` and `/employee-dashboard` to eliminate Next.js duplicate route conflicts.
- FIX: `prisma generate` can fail with EPERM on Windows if `next dev` or `npx tsx` is running in background (locks DLL). Kill all Node processes first: `Get-Process -Name node | Stop-Process -Force`.

## Current phase & next ticket:
- ✅ Neon DB: migrated + seeded + verified.
- 🔜 Next: **Vercel deployment** — set environment variables, deploy, run live smoke test.

---

_Format per Rules §7. Keep concise — bullet points only. Readable in < 2 min._
