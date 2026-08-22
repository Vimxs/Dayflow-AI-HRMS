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

### Key decisions / assumptions:
- ASSUMPTION: Local PostgreSQL on `localhost:5432` used for dev DB. Update `.env` if using hosted DB (Neon/Supabase).
- ASSUMPTION: Email provider not yet configured — stubbed via `console.warn` in dev until T7.1.
- ASSUMPTION: S3 not yet configured — file uploads stubbed until T3.4.
- ASSUMPTION: `docs/reference/Dayflow-HRMS-Requirements.pdf` is not committed (binary asset); developer adds it locally.
- FIX: Upgraded/pinned Prisma to v6 to maintain standard Prisma ORM schema syntax for `DATABASE_URL`.
- FIX: Router groups `/admin` and `/employee` updated to `/admin-dashboard` and `/employee-dashboard` to eliminate Next.js duplicate route conflicts.

### Current phase & next ticket:
- 🔜 Next: **Phase 1 — Authentication & Authorization** starting with **T1.1** (Sign-up API + form).

---

_Format per Rules §7. Keep concise — bullet points only. Readable in < 2 min._
