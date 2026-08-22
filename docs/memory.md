# Dayflow HRMS — Development Memory Log

> Single source of truth for the active codebase state, technical decisions, assumptions, stubs, and next tickets across agent sessions.

## Project Metadata
- **Repository:** Dayflow HRMS
- **Current Phase:** Phase 1 — Authentication & Authorization (DONE)
- **Next Ticket to Pick Up:** Phase 2, T2.1 — Employee Dashboard Shell
- **Active Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Prisma ORM + PostgreSQL 16 (Port 5432) + JWT + bcryptjs + Zod

---

## Phase Log

<<<<<<< HEAD
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
=======
### Phase 0 — Project Setup (DONE)
- **T0.1 Repo Initialization:** Initialized Next.js 14 project structure with TypeScript, Tailwind CSS, App Router, Lucide icons, Zustand, TanStack Query, and PostCSS.
- **T0.2 Database & Environment:** Set up Prisma schema with PostgreSQL 16 connection. Configured all 9 core models (`User`, `Employee`, `Attendance`, `LeaveRequest`, `Payroll`, `Document`, `Notification`, `AuditLog`, `Tokens`). Initialized local PostgreSQL instance on port 5432 with database `dayflow_db`. Created `.env.example` with full placeholder secrets and dev-safe `.env`. Seeded database with Admin (`admin@dayflow.com`) and Employee (`rahul@dayflow.com`, `priya@dayflow.com`) accounts.
- **T0.3 Tooling & Git Configuration:** Configured `.eslintrc.json`, `.prettierrc`, and `.gitignore` (ignoring `.env`, `.next/`, `node_modules/`, while keeping `docs/` and `memory.md`).
- **T0.4 Base Layout & Design Tokens:** Configured `tailwind.config.ts` and `app/globals.css` with the "Modern Painted" design tokens from `docs/04-Frontend-Specification-Document.md` (`#5B4FE9` primary, `#FF7A59` coral, `#12B8A6` teal, `#F5A623` amber, `#E5484D` danger, canvas wash, glassmorphism utilities, Sora + Inter typography). Created responsive entry landing shell at `app/page.tsx`.
- **T0.5 Memory Log Scaffold:** Created `docs/memory.md` scaffold per `docs/06-Rules.md` §7.
- **DECISION:** Portable PostgreSQL 16 cluster configured locally to ensure full native relational integrity and migration support without external cloud dependency during development.
>>>>>>> e4fb065fc1b45a9d7b6af152787dedc2e41f4873

---

### Phase 1 — Authentication & Authorization (DONE)
- **T1.1 Sign-up API + Form:** Implemented `POST /api/auth/sign-up` with Zod validation, duplicate checks, transaction safety, and role selection (`EMPLOYEE` / `ADMIN`). Built client page at `app/(auth)/sign-up/page.tsx` with instant verification feedback.
- **T1.2 Password Security:** Implemented bcrypt hashing (cost 10) in `lib/auth/password.ts`. Built real-time `PasswordStrengthMeter` enforcing policy (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character).
- **T1.3 Email Verification:** Implemented 24-hour verification token generation and `POST /api/auth/verify-email` + `POST /api/auth/resend-verification`. Sign-in is strictly blocked with HTTP 403 until email is verified. Built client page at `app/(auth)/verify-email/page.tsx`.
- **T1.4 Sign-in API + JWT Issuance:** Implemented `POST /api/auth/sign-in` with timing-safe comparisons, generic error messaging, JWT access token (15m expiry), and rotating refresh tokens (7 days expiry in httpOnly cookie). Implemented `GET /api/auth/me` and `POST /api/auth/refresh`. Built client page at `app/(auth)/sign-in/page.tsx` with quick demo account fill.
- **T1.5 RBAC Middleware & Server Guards:** Configured `middleware.ts` for route protection and role-based redirection (`ADMIN` vs `EMPLOYEE`). Implemented `lib/rbac/guards.ts` for per-route server verification.
- **T1.6 Forgot & Reset Password:** Implemented `POST /api/auth/forgot-password` (15m single-use token, enumeration-safe) and `POST /api/auth/reset-password` (password policy check, active session revocation). Built client pages at `app/(auth)/forgot-password/page.tsx` and `app/(auth)/reset-password/page.tsx`.
- **T1.7 Logout:** Implemented `POST /api/auth/logout` invalidating refresh tokens in database and clearing authentication cookies.
- **AUDIT LOGGING:** All sign-up, sign-in, login failure, verification, password reset, and logout actions write to `AuditLog` table per Security doc §6.
- **TESTING:** 32/32 automated tests in `tests/phase1-auth.test.ts` passed; zero ESLint errors.
- **Next Ticket:** Phase 2 — Dashboards (T2.1 Employee Dashboard shell & widgets).
