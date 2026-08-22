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

---

## Phase 1 — Authentication & Authorization (IN PROGRESS)

- **T1.1** ✅ — Sign-up API + form (`app/api/auth/sign-up/route.ts` & `components/forms/SignUpForm.tsx`). Verified:
  1. Rate Limiting: 6th attempt from same key correctly rejected with 429 logic.
  2. Role Hijack: `role` parameter in payload stripped by Zod schema; server forces `Role.EMPLOYEE`.
  3. Password Policy: Weak password returns exact error `"Password must be at least 8 characters"`.
  4. Terms Validation: Unchecked terms returns exact error `"You must accept the terms and conditions"`.
  5. Duplicate Email: Code checks `prisma.user.findUnique` for existing email, returning 400 Bad Request.
  6. Visual Theme & Form UI: `SignUpForm` renders Sora/Inter fonts, glassmorphic card, and interactive password strength meter (`Weak`, `Medium`, `Strong`). Email verification stub (`sendEmail`) logs token to console.

### Key decisions / assumptions:
- ASSUMPTION: Local PostgreSQL on `localhost:5432` used for dev DB. Update `.env` if using hosted DB (Neon/Supabase).
- ASSUMPTION: Email provider not yet configured — stubbed via `console.warn` in dev until T7.1.
- ASSUMPTION: S3 not yet configured — file uploads stubbed until T3.4.
- ASSUMPTION: `docs/reference/Dayflow-HRMS-Requirements.pdf` is not committed (binary asset); developer adds it locally.
- SCHEMA DEVIATION: Added `verifyToken` (String?) and `verifyTokenExp` (DateTime?) fields to `User` model to support mandatory email verification flow per Security Doc §1 (not explicitly detailed in Architecture Doc §4 simplified schema).
- DEV STUB / PRODUCTION NOTE: `lib/rate-limit.ts` uses an in-memory sliding window cache suitable for single-instance / local dev. Must be replaced with a distributed store (e.g. Redis / Upstash) prior to Vercel serverless production deployment.
- FIX: Upgraded/pinned Prisma to v6 to maintain standard Prisma ORM schema syntax for `DATABASE_URL`.
- FIX: Router groups `/admin` and `/employee` updated to `/admin-dashboard` and `/employee-dashboard` to eliminate Next.js duplicate route conflicts.

### Current phase & next ticket:
- 🔜 Next: **Phase 1 — T1.2: Password hashing & validation rules** (Already incorporated into T1.1 endpoint; finalize helper abstractions if needed or move directly to T1.3 Email verification flow).

---

_Format per Rules §7. Keep concise — bullet points only. Readable in < 2 min._
