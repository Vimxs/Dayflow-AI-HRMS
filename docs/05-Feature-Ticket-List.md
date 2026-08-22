# Dayflow — Feature Ticket List (Phased Build Plan)

> Build strictly phase by phase. Do not start a phase until the previous phase's tickets are all marked DONE and manually verified. After finishing each phase, update `memory.md` (see Rules.md §7) before moving on.

## Phase 0 — Project Setup
- [x] T0.1 Initialize repo (Next.js + TypeScript + Tailwind + shadcn/ui)
- [x] T0.2 Set up Prisma + PostgreSQL connection, `.env.example`
- [x] T0.3 Configure ESLint, Prettier, Husky pre-commit hooks
- [x] T0.4 Set up base layout, design tokens (colors/fonts) from Frontend Spec
- [x] T0.5 Create `memory.md` scaffold (empty, ready for updates)

**Acceptance:** App boots locally, empty themed shell renders, DB connects, migrations run.

## Phase 1 — Authentication & Authorization
- [x] T1.1 Sign-up API + form (Employee ID, Email, Password, Role)
- [x] T1.2 Password hashing (bcrypt/argon2) + validation rules
- [x] T1.3 Email verification flow (token generation + verify endpoint + email send)
- [x] T1.4 Sign-in API + form + JWT issuance (access + refresh)
- [x] T1.5 RBAC middleware (route protection by role)
- [x] T1.6 Forgot password / reset password flow
- [x] T1.7 Logout (refresh token invalidation)

**Acceptance:** A user can sign up, verify email, sign in, get redirected by role, and cannot access another role's routes. Covered by Security & Access Document §1–2.

## Phase 2 — Dashboards
- [x] T2.1 Employee Dashboard shell (quick-access cards, activity feed)
- [x] T2.2 Admin/HR Dashboard shell (KPI strip, employee list, switcher)
- [x] T2.3 Notification bell + basic in-app notification list

**Acceptance:** Both dashboards render real (seeded) data, role-gated correctly.

## Phase 3 — Employee Profile Management
- [x] T3.1 View Profile (personal, job, salary [gated], documents, picture)
- [x] T3.2 Edit Profile — Employee (limited fields)
- [x] T3.3 Edit Profile — Admin (all fields)
- [x] T3.4 Document upload/view (type + size validated, private storage)

**Acceptance:** Employees can only edit allowed fields; Admin edits are audit-logged.

## Phase 4 — Attendance Management
- [x] T4.1 Check-in / Check-out action + status logic
- [x] T4.2 Daily view (self, and Admin all-employee view)
- [x] T4.3 Weekly view + status legend (Present/Absent/Half-day/Leave)
- [x] T4.4 Admin filter by employee/date range

**Acceptance:** Attendance scoping enforced per Security doc §2; correct status colors per Frontend Spec.

## Phase 5 — Leave & Time-Off Management
- [x] T5.1 Apply for Leave form (type, date range, remarks)
- [x] T5.2 Leave request list + status (Pending/Approved/Rejected) — employee view
- [x] T5.3 Admin Leave Approvals queue — approve/reject with comment
- [x] T5.4 Notification on status change (employee side)

**Acceptance:** Status changes reflect immediately; all approvals audit-logged.

## Phase 6 — Payroll/Salary Management
- [x] T6.1 Employee read-only payroll view + salary slip download (PDF)
- [x] T6.2 Admin payroll CRUD (view all, update structure)
- [x] T6.3 Payroll change audit logging

**Acceptance:** Salary data never exposed in list endpoints; only detail view, role-gated.

## Phase 7 — Notifications, Analytics & Reports
- [x] T7.1 Email notification integration (leave status, approvals pending)
- [x] T7.2 Attendance analytics chart (weekly/monthly trend)
- [x] T7.3 Leave-type distribution chart
- [x] T7.4 Exportable reports (attendance report, salary slip — PDF/CSV)

**Acceptance:** Reports match underlying DB data exactly; exports role-gated.

## Phase 8 — Hardening & Polish
- [x] T8.1 Full RBAC audit pass across every endpoint
- [x] T8.2 Rate limiting on auth routes
- [x] T8.3 Accessibility pass (contrast, keyboard nav, labels)
- [x] T8.4 Responsive QA pass (mobile/tablet/desktop)
- [x] T8.5 E2E test suite (Playwright) for critical flows: sign-up→verify→login, apply leave→approve, check-in/out

**Acceptance:** All Security & Access Document requirements verified; Lighthouse accessibility score ≥ 90.

## Future Enhancements (Backlog — Not in v1)
- Multi-tenant/multi-company support
- 2FA for Admin accounts
- Biometric/GPS attendance
- Performance review module
- Recruitment/ATS module
- Native mobile apps
