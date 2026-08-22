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

## Phase 1 — Authentication & Authorization (DONE)
- **T1.1** ✅ — Sign-up API + form (`app/api/auth/sign-up/route.ts` & `components/forms/SignUpForm.tsx`, `app/(auth)/sign-up/page.tsx`). Rate-limited, validates corporate emails, hashes password (bcrypt cost 12), creates Employee record (`firstName`/`lastName`), generates verification token.
- **T1.2** ✅ — Password hashing + validation rules with live `PasswordStrengthMeter` UI component (`components/ui/password-strength-meter.tsx`).
- **T1.3** ✅ — Email verification flow (`app/api/auth/verify-email/route.ts`, `app/api/auth/resend-verification/route.ts`, `app/(auth)/verify-email/page.tsx`). Validates 24-hour token expiry, prevents reuse, handles resend requests.
- **T1.4** ✅ — Sign-in API + form + JWT issuance (`app/api/auth/sign-in/route.ts`, `app/api/auth/refresh/route.ts`, `app/api/auth/me/route.ts`, `app/(auth)/sign-in/page.tsx`). Issues HTTP-only access tokens (15m) & refresh tokens (7d).
- **T1.5** ✅ — RBAC middleware & route protection (`middleware.ts`, `lib/rbac/guards.ts`). Prevents unauthorized access and cross-role URL tampering, auto-redirects authenticated users to respective dashboard (`/admin/dashboard` vs `/employee/dashboard`).
- **T1.6** ✅ — Forgot password / reset password flow (`app/api/auth/forgot-password/route.ts`, `app/api/auth/reset-password/route.ts`, `app/(auth)/forgot-password/page.tsx`, `app/(auth)/reset-password/page.tsx`). Validates single-use 1-hour reset tokens, revokes refresh tokens upon password reset.
- **T1.7** ✅ — Logout endpoint (`app/api/auth/logout/route.ts`). Clears `dayflow_access_token` and `dayflow_refresh_token` HTTP-only cookies with `Max-Age=0` and invalidates DB refresh token record.

---

## Phase 2 — Dashboards & Notification System (DONE)
- **T2.1** ✅ — Employee Dashboard shell (`app/employee/dashboard/page.tsx` & `app/api/employee/dashboard/route.ts`).
  - Welcome greeting banner with live date and role badge
  - 4 quick-access painted gradient cards (Attendance, Leaves, Salary & Slips, Profile)
  - Weekly attendance streak tracker & 7-day status pills
  - Leave balance cards (Paid, Sick, Pending)
  - Real-time activity timeline feed
- **T2.2** ✅ — Admin/HR Dashboard shell (`app/admin/dashboard/page.tsx` & `app/api/admin/dashboard/route.ts`).
  - 4 KPI metric cards (Total Workforce, Present Today % turnout, Pending Approvals, On Leave Today)
  - 7-day attendance distribution bar chart powered by Recharts with design token palette
  - Pending leave approvals queue with supervisor action shortcuts
  - Searchable Employee Directory table with department filters (Engineering, Sales, Marketing, HR, Finance, Operations)
- **T2.3** ✅ — Notification bell & in-app notifications (`components/shared/NotificationBell.tsx`, `components/shared/AppHeader.tsx`, `app/api/notifications/route.ts`, `app/api/notifications/[id]/route.ts`).
  - Live unread counter badge with pulsing animation
  - Popover dropdown with categorized notification icons (Leave, Attendance, Payroll, General)
  - Auto-refresh polling (30s) and click-to-mark-read / bulk mark-all-as-read

---

## Phase 3 — Employee Profile Management (DONE)
- **T3.1** ✅ — View Profile (`app/employee/profile/page.tsx`, `app/api/profile/route.ts`).
  - Personal Information, Employment Details, Role-gated Salary breakdown (Base + Allowances - Deductions = Net Pay), Document list.
- **T3.2** ✅ — Edit Profile (Employee) (`app/api/profile/route.ts`).
  - Server-side field level validation: strictly limits employee edits to `phone`, `address`, and `profilePictureUrl`. Rejects attempts to alter role, department, salary, or employeeCode.
- **T3.3** ✅ — Edit Profile (Admin) & Directory (`app/admin/employees/page.tsx`, `app/admin/employees/[id]/page.tsx`, `app/api/admin/employees/route.ts`, `app/api/admin/employees/[id]/route.ts`).
  - Full staff directory with instant search, department filters, and "Add New Employee" modal dialog.
  - Complete employee inspector with editable personal, job, role, and compensation parameters.
  - Generates immutable `AuditLog` records for every administrative modification.
- **T3.4** ✅ — Document Upload & View (`app/api/documents/route.ts`, `app/api/documents/[id]/route.ts`).
  - Enforces 5MB max file size and strict MIME type whitelist (PDF, PNG, JPEG, WEBP).
  - Secure storage in `public/uploads/documents/` with unique namespaced filenames.
  - Role-gated access allowing only document owners and Admins to view or delete documents, with audit logging.

---

## Phase 4 — Attendance Management (DONE)
- **T4.1** ✅ — Check-in / Check-out action + status logic (`app/api/attendance/check-in/route.ts`, `app/api/attendance/check-out/route.ts`, `app/api/attendance/today/route.ts`).
  - Server-side single check-in/out policy per calendar day.
  - Automatic status computation (`PRESENT` vs `HALF_DAY` if check-in > 1:00 PM).
- **T4.2 & T4.3** ✅ — Daily/Weekly Views & Status Legend (`app/employee/attendance/page.tsx`, `components/attendance/AttendanceWidget.tsx`, `components/attendance/AttendanceTable.tsx`).
  - Live clock and interactive Check-in/Check-out widget.
  - Attendance Stats cards (Present, Half Days, Absent, Leave).
  - Status badges with Frontend Spec colors (`PRESENT`: Teal, `ABSENT`: Danger Red, `HALF_DAY`: Amber, `LEAVE`: Indigo).
- **T4.4** ✅ — Admin Filter & Master Attendance (`app/admin/attendance/page.tsx`, `app/api/admin/attendance/route.ts`).
  - Organization-wide daily attendance KPI metrics (Present, Half-Day, Absent, On Leave).
  - Multi-parameter filter bar (Employee selector, Status filter, Date Range picker).

---

## Phase 5 — Leave & Time-Off Management (DONE)
- **T5.1** ✅ — Apply for Leave form & validation (`lib/validators/leave.ts`, `app/api/leaves/route.ts`, `app/employee/leaves/page.tsx`).
  - Strict Zod validation on leave types (`PAID`, `SICK`, `UNPAID`), date ranges (`startDate <= endDate`), and remarks.
  - Active overlap prevention blocking concurrent pending/approved leave requests.
  - Dynamic duration computation in calendar days with live modal indicator.
- **T5.2** ✅ — Employee Leave Request List & Balance KPIs (`app/employee/leaves/page.tsx`, `app/api/leaves/route.ts`).
  - Real-time annual balance calculations (Paid remaining of 18d, Sick remaining of 12d, Unpaid taken, Pending count).
  - Status filter tabs (All, Pending, Approved, Rejected) with status color badges.
  - Allows employee to withdraw/cancel pending leave applications (`DELETE /api/leaves/[id]`).
- **T5.3** ✅ — Admin Leave Approvals Queue & Review Console (`app/admin/leaves/page.tsx`, `app/api/leaves/[id]/route.ts`).
  - KPI strip for HR (Requires Review, Approved This Month, Declined This Month).
  - Approvals queue with employee details, remarks, department filters, and search bar.
  - Review modal with supervisor comments for one-click Approval (Teal) or Rejection (Red).
  - Generates immutable `AuditLog` records for all review determinations (`LEAVE_REVIEW`).
- **T5.4** ✅ — Automated In-App Notifications & Attendance Sync (`app/api/leaves/route.ts`, `app/api/leaves/[id]/route.ts`).
  - Notifies all Admin users upon leave application submission.
  - Notifies employee upon leave approval or rejection with supervisor feedback.
  - Approved leaves automatically synchronize `status: "LEAVE"` across employee `Attendance` records for the approved date span.

## Phase 6 — Payroll / Salary Management (DONE)
- **T6.1** ✅ — Employee Read-Only Payroll & PDF Salary Slip (`app/employee/payroll/page.tsx`, `app/api/payroll/[employeeId]/slip/route.ts`, `lib/pdf/salary-slip.tsx`).
  - Read-only salary card with base, allowances, deductions, and net take-home breakdown.
  - Month navigator widget and server-side Dayflow-branded PDF salary slip generation (`@react-pdf/renderer`).
- **T6.2** ✅ — Admin Payroll Management & Quick-Edit Drawer (`app/admin/payroll/page.tsx`, `app/admin/payroll/[employeeId]/page.tsx`, `app/api/payroll/route.ts`, `app/api/payroll/[employeeId]/route.ts`).
  - Total monthly payroll KPI metrics, searchable table, and department filters.
  - Quick-edit side drawer and dedicated employee payroll console with live net pay calculation.
- **T6.3** ✅ — Payroll Change Audit Logging (`app/api/payroll/[employeeId]/route.ts`, `app/api/payroll/route.ts`).
  - Generates immutable `AuditLog` entries for every create, update, or delete action on payroll records.

## Phase 7 — Notifications, Analytics & Reports (DONE)
- **T7.1** ✅ — Automated Notifications & Background Emails (`lib/email/mailer.ts`).
- **T7.2 & T7.3** ✅ — Analytics Charts (`app/api/admin/dashboard/route.ts`).
- **T7.4** ✅ — Exportable Reports (`lib/utils/export.ts`).

---

## Migration History — Definitive Record

### What exists on disk
```
prisma/migrations/
  0_init/
    migration.sql   ← ONLY migration file. Created in Phase 0.
```

### Neon DB status
- `npx prisma migrate status` → **"Database schema is up to date!"** (1 migration applied: `0_init`)
- `prisma generate` updated client for `firstName` / `lastName` columns on `Employee`.

---

## Key decisions / assumptions:
- ASSUMPTION: Email provider not yet configured — stubbed via `console.warn` in dev until T7.1.
- ASSUMPTION: S3 not yet configured — local disk storage with authenticated streaming used for T3.4; S3 transport added in future release.
- ASSUMPTION: `docs/reference/Dayflow-HRMS-Requirements.pdf` is not committed (binary asset); developer adds it locally.
- DECISION: Annual leave quotas set to 18 Paid days and 12 Sick days per employee per calendar year.
- DECISION: Approved leaves automatically create `Attendance` records marked `status: "LEAVE"` for the entire date range.
- FIX: Upgraded/pinned Prisma to v6 to maintain standard Prisma ORM schema syntax for `DATABASE_URL`.
- FIX: Route group folders `/(admin)` and `/(employee)` resolved to explicit paths `/admin/payroll` and `/employee/payroll` to prevent Next.js parallel route name collision.
- FIX: `prisma generate` can fail with EPERM on Windows if `next dev` or `npx tsx` is running in background (locks DLL). Kill all Node processes first: `Get-Process -Name node | Stop-Process -Force`.
- FIX: Next.js PostCSS & Tailwind v4 configured with `@tailwindcss/postcss` and theme tokens declared in `@theme` block in `app/globals.css`.
- FIX: Wrapped all `useSearchParams()` calls in `<Suspense>` boundaries to ensure Next.js static prerendering compatibility.

## Current phase & next ticket:
- ✅ Phase 0 to Phase 7 complete & verified.
- 🔜 Next: **Phase 8 — Performance & Polish**.

---

_Format per Rules §7. Keep concise — bullet points only. Readable in < 2 min._
