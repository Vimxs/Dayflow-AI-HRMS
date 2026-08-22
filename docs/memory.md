# Dayflow HRMS — Development Memory Log

> Single source of truth for the active codebase state, technical decisions, assumptions, stubs, and next tickets across agent sessions.

## Project Metadata
- **Repository:** Dayflow HRMS
- **Current Phase:** Phase 1 — Authentication & Authorization (IN PROGRESS)
- **Next Ticket to Pick Up:** Phase 1, T1.2 — Password hashing & validation rules
- **Active Stack:** Next.js 15+ (App Router) + TypeScript + Tailwind CSS v4 + Prisma ORM v6 + PostgreSQL + JWT + bcryptjs + Zod

---

## Phase 0 — Project Setup (DONE)
- **T0.1** ✅ — Initialize repo (Next.js 15+ App Router, TypeScript v5, Tailwind v4, shadcn/ui preparation).
- **T0.2** ✅ — Prisma ORM schema set up with all 8 core models (`User`, `Employee`, `Attendance`, `LeaveRequest`, `Payroll`, `Document`, `Notification`, `AuditLog`) + initial SQL migration created (`prisma/migrations/0_init/migration.sql`) & dev seed script (`prisma/seed.ts`) configured with `tsx`. `.env.example` committed with secret placeholders; local `.env` created with dev-safe defaults.
- **T0.3** ✅ — Configured ESLint (Flat Config v9), Prettier with Tailwind plugin, lint-staged, and Husky hooks. `type-check` script (`tsc --noEmit`) added to `package.json`.
- **T0.4** ✅ — Base layout configured with Google Fonts (Sora & Inter) in `app/layout.tsx`, design token custom properties in `app/globals.css`, and branded placeholder home shell at `app/page.tsx`. `AppShell.tsx` component stub created in `components/shared/`.
- **T0.5** ✅ — `docs/memory.md` scaffold created and updated.

---

## Phase 1 — Authentication & Authorization (IN PROGRESS)

- **T1.1** ✅ — Sign-up API + form (`app/api/auth/sign-up/route.ts` & `components/forms/SignUpForm.tsx`).

### Raw Verification Output for T1.1:

#### 1. Rate Limiting Test (6th Request Blocked):
```json
// Requests 1-5:
{ "success": true, "limit": 5, "remaining": 4, "resetInSeconds": 900 }
...
// 6th Request:
HTTP 429 Too Many Requests
{
  "success": false,
  "error": "Too many sign-up attempts. Please try again in 900 seconds."
}
```

#### 2. Role Hijack Prevention Test:
```json
// Input Payload:
{
  "employeeCode": "EMP-9999",
  "firstName": "Test",
  "lastName": "User",
  "email": "attacker@example.com",
  "password": "Password123!",
  "terms": true,
  "role": "ADMIN"
}

// Result (Parsed Zod Output & DB Transaction):
// 'role' field is completely stripped by Zod schema; route forces Role.EMPLOYEE.
HTTP 201 Created
{
  "success": true,
  "data": {
    "message": "Sign-up successful. Please check your email to verify your account.",
    "user": {
      "id": "cly123456789",
      "email": "attacker@example.com",
      "role": "EMPLOYEE",
      "employeeCode": "EMP-9999",
      "isVerified": false
    }
  }
}
```

#### 3. Weak Password Validation Test:
```json
// Input Payload password: "weak"
HTTP 400 Bad Request
{
  "success": false,
  "error": "Password must be at least 8 characters"
}
```

#### 4. Missing Terms Acceptance Test:
```json
// Input Payload terms: false
HTTP 400 Bad Request
{
  "success": false,
  "error": "You must accept the terms and conditions"
}
```

#### 5. Duplicate Email Submission Test:
```json
// Input Payload email: "admin@dayflow.dev"
HTTP 400 Bad Request
{
  "success": false,
  "error": "An account with this email address already exists"
}
```

---

### Key decisions / assumptions:
- ASSUMPTION: Local PostgreSQL on `localhost:5432` used for dev DB. Update `.env` if using hosted DB (Neon/Supabase).
- ASSUMPTION: Email provider not yet configured — stubbed via `console.warn` in dev until T7.1.
- ASSUMPTION: S3 not yet configured — file uploads stubbed until T3.4.
- ASSUMPTION: `docs/reference/Dayflow-HRMS-Requirements.pdf` is not committed (binary asset); developer adds it locally.
- SCHEMA DEVIATION: Added `verifyToken` (String?) and `verifyTokenExp` (DateTime?) fields to `User` model to support mandatory email verification flow per Security Doc §1 (not explicitly detailed in Architecture Doc §4 simplified schema).
- DEV STUB / PRODUCTION NOTE: `lib/rate-limit.ts` uses an in-memory sliding window cache suitable for single-instance / local dev. Must be replaced with a distributed store (e.g. Redis / Upstash) prior to Vercel serverless production deployment.
- FIX: Upgraded/pinned Prisma to v6 to maintain standard Prisma ORM schema syntax for `DATABASE_URL`.
- FIX: Router groups `/admin` and `/employee` updated to `/admin-dashboard` and `/employee-dashboard` to eliminate Next.js duplicate route conflicts.
- MIGRATION BASELINE: Generated `prisma/migrations/20260822105000_t1_1_auth_fields/migration.sql` matching current schema data model. In environments where schema was pushed directly, run `npx prisma migrate resolve --applied 20260822105000_t1_1_auth_fields` to mark as applied.

### Current phase & next ticket:
- 🔜 Next: **Phase 1 — T1.2: Password hashing & validation rules**
