# Dayflow — Security & Access Document

## 1. Authentication Security
- Passwords hashed with **bcrypt (cost 12)** or **argon2id** — never store plaintext, never log passwords
- Password policy: minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 special character
- Email verification **mandatory** before first login — unverified accounts cannot access any protected route
- Login uses **JWT access token (15 min expiry) + refresh token (7 days, httpOnly, Secure, SameSite=Strict cookie)**
- Refresh tokens rotated on every use; old token invalidated (rotation + reuse detection)
- Rate limiting on `/api/auth/sign-in` and `/api/auth/sign-up`: max 5 attempts / 15 min per IP+email
- Generic error messages on login failure (never reveal whether email exists)
- Forgot-password flow uses time-limited (15 min), single-use signed token sent via email

## 2. Authorization / Role-Based Access Control (RBAC)

| Role | Permissions |
|---|---|
| **Employee** | Read own profile, edit limited fields (phone, address, profile picture), read own attendance, create/read own leave requests, read own payroll (read-only) |
| **Admin / HR** | Full CRUD on all employees, all attendance, all leave requests (approve/reject), full payroll CRUD, view all reports/audit logs |

**Enforcement rules:**
- All authorization checks happen **server-side** on every request — never trust client-side role state
- Every resource-fetching endpoint verifies **ownership** (`employee_id === session.employee_id`) unless caller is Admin
- Role changes (Employee → Admin) require a Super Admin action and are always audit-logged
- No client-side-only route protection — `middleware.ts` + per-route server checks both required (defense in depth)

## 3. Data Protection
- All traffic over **HTTPS/TLS 1.2+** only; HTTP requests redirected
- Sensitive fields (salary, documents) never included in list/summary API responses — only in detail endpoints with explicit authorization
- PII (address, phone, documents) encrypted at rest where the hosting provider supports column-level or disk-level encryption
- File uploads restricted by MIME type + max size (e.g., 5MB, PDF/JPG/PNG only), stored in private (non-public) buckets with signed, time-limited URLs
- No sensitive data (tokens, passwords, salary figures) in client-side logs, console output, or error messages sent to the browser

## 4. Session Management
- Access token stored in memory (not localStorage) to reduce XSS token-theft risk; refresh token in httpOnly cookie
- Idle session timeout: auto-logout after 30 minutes of inactivity
- "Logout" invalidates the refresh token server-side immediately
- Concurrent session limit configurable (optional v2: force single active session)

## 5. Input Validation & Injection Prevention
- All inputs validated with **zod** (or equivalent) schema on the server, regardless of client-side validation
- Parameterized queries only (Prisma ORM handles this by default) — no raw SQL string concatenation
- Output encoding on all user-generated content rendered in the UI (React escapes by default — avoid `dangerouslySetInnerHTML`)
- CSRF protection via SameSite cookies + CSRF token on state-changing form submissions if cookies are used for auth

## 6. Audit Logging
Every sensitive/mutating action is logged with: **actor, action, entity, entity_id, timestamp, before/after diff (where applicable)**

Logged actions include:
- Login success/failure, password reset
- Employee profile edits (by Admin)
- Leave approval/rejection
- Payroll/salary changes
- Role changes
- Document uploads/deletions

Audit logs are **append-only** (no update/delete via the app layer) and visible only to Admin.

## 7. API Security
- CORS restricted to known frontend origin(s) only
- All endpoints require valid JWT except `sign-up`, `sign-in`, `verify-email`, `forgot-password`
- Sensitive endpoints (payroll edit, role change) require re-confirmation of password or step-up check for high-risk actions (v2 candidate: 2FA for Admin)
- Security headers: `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`

## 8. Compliance & Data Retention
- Employee data retained per organizational policy; deletion/anonymization workflow for offboarded employees (v2)
- Right-to-access: employees can request an export of their own data
- Document access strictly scoped: employees see only their own documents

## 9. AI-Agent Specific Security Boundaries
When an AI coding agent (e.g., Antigravity) is generating this codebase, it must:
- **Never** hardcode secrets, API keys, or DB credentials in source files — always use `.env` + `.env.example` with placeholders
- **Never** disable RBAC middleware "temporarily to test" and leave it disabled
- **Never** log full request bodies containing passwords or tokens
- Always add validation to any new mutating endpoint before marking a ticket complete
- Flag (in `memory.md`) any endpoint built without full auth/RBAC coverage so it is not forgotten
