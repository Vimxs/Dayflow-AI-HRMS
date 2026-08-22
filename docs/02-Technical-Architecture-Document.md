# Dayflow — Technical Architecture Document

## 1. Recommended Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | **Next.js 14+ (App Router) + TypeScript** | SSR/SEO not critical but great DX, file-based routing, easy deployment |
| Styling | **Tailwind CSS + shadcn/ui** | Fast, consistent design system, matches "modern painted" theme via custom tokens |
| State Management | **React Query (server state) + Zustand (UI state)** | Clear separation of server cache vs local UI state |
| Backend | **Node.js + Express (or Next.js API routes / tRPC)** | Simple REST/JSON API, easy for an AI agent to scaffold incrementally |
| Database | **PostgreSQL** (via Prisma ORM) | Relational integrity for employees/leave/payroll, strong RBAC support |
| Auth | **JWT (access + refresh token) + bcrypt/argon2 password hashing** | Stateless, scalable, works well with role claims |
| File Storage | **S3-compatible bucket (documents, profile pictures)** | Decoupled from DB, scalable |
| Email | **Resend / SendGrid / Nodemailer + SMTP** | Verification emails, leave status alerts |
| Hosting | **Frontend: Vercel — Backend: Railway/Render — DB: Supabase/Neon/RDS** | Zero-DevOps friendly for MVP |
| Testing | **Vitest/Jest + Playwright** | Unit + E2E coverage |

> Note: If building fully inside Antigravity as a monolith, Next.js full-stack (App Router + API routes + Prisma) is the simplest single-repo path — recommended default.

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                   │
│   Next.js Frontend — Employee UI | Admin/HR UI            │
└───────────────────────────┬────────────────────────────-─┘
                             │ HTTPS (JWT in httpOnly cookie)
┌───────────────────────────▼───────────────────────────-──┐
│                     API LAYER (Next.js API / Express)      │
│  ┌───────────┐ ┌────────────┐ ┌───────────┐ ┌──────────┐  │
│  │   Auth    │ │  Employee  │ │ Attendance│ │  Leave   │  │
│  │  Module   │ │   Module   │ │  Module   │ │  Module  │  │
│  └───────────┘ └────────────┘ └───────────┘ └──────────┘  │
│  ┌───────────┐ ┌────────────┐ ┌────────────────────────┐  │
│  │  Payroll  │ │Notification│ │   RBAC Middleware /     │  │
│  │  Module   │ │   Module   │ │   Audit Logger          │  │
│  └───────────┘ └────────────┘ └────────────────────────┘  │
└───────────────────────────┬───────────────────────────-──┘
                             │
┌───────────────────────────▼───────────────────────────-──┐
│              PostgreSQL (via Prisma ORM)                   │
│  users | employees | attendance | leave_requests |         │
│  payroll | documents | audit_logs | notifications          │
└─────────────────────────────────────────────────────────-─┘
                             │
                   ┌─────────▼─────────┐
                   │  S3 Bucket (files) │
                   └────────────────────┘
```

## 3. Folder / File Structure (Next.js full-stack)

```
dayflow/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   └── verify-email/page.tsx
│   ├── (employee)/
│   │   ├── dashboard/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── attendance/page.tsx
│   │   └── leave/page.tsx
│   ├── (admin)/
│   │   ├── dashboard/page.tsx
│   │   ├── employees/page.tsx
│   │   ├── employees/[id]/page.tsx
│   │   ├── attendance/page.tsx
│   │   ├── leave-approvals/page.tsx
│   │   ├── payroll/page.tsx
│   │   └── reports/page.tsx
│   ├── api/
│   │   ├── auth/[...routes]/route.ts
│   │   ├── employees/route.ts
│   │   ├── attendance/route.ts
│   │   ├── leave/route.ts
│   │   ├── payroll/route.ts
│   │   └── reports/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                # shadcn primitives
│   ├── dashboard/
│   ├── forms/
│   └── shared/
├── lib/
│   ├── auth/               # jwt, session, password utils
│   ├── rbac/                # role guards, permission checks
│   ├── db/                  # prisma client
│   ├── validators/          # zod schemas
│   └── email/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── middleware.ts            # route protection
├── tests/
├── .env.example
└── package.json
```

## 4. Core Database Schema (Simplified)

```
User            (id, email, password_hash, role[ADMIN|EMPLOYEE], is_verified, created_at)
Employee        (id, user_id FK, employee_code, name, phone, address, job_title,
                 department, date_of_joining, profile_picture_url)
Attendance      (id, employee_id FK, date, check_in, check_out, status[PRESENT|ABSENT|HALF_DAY|LEAVE])
LeaveRequest    (id, employee_id FK, leave_type[PAID|SICK|UNPAID], start_date, end_date,
                 remarks, status[PENDING|APPROVED|REJECTED], reviewed_by FK, review_comment)
Payroll         (id, employee_id FK, base_salary, allowances, deductions, effective_from)
Document        (id, employee_id FK, file_url, doc_type, uploaded_at)
Notification    (id, user_id FK, message, type, is_read, created_at)
AuditLog        (id, actor_id FK, action, entity, entity_id, metadata, created_at)
```

## 5. API Design Principles
- RESTful resource-based routes (`/api/employees`, `/api/leave`, `/api/attendance`)
- Every mutating endpoint validated with **zod** schemas before hitting the DB
- Every endpoint wrapped by an **RBAC middleware** that checks role + resource ownership
- Consistent response envelope: `{ success, data, error }`
- Pagination on all list endpoints (`?page=&limit=`)
- All admin write actions logged to `AuditLog`

## 6. Data Flow Example — Leave Approval
1. Employee submits leave → `POST /api/leave` → validated → row created with `status=PENDING`
2. Notification created for all Admin/HR users
3. Admin opens Leave Approvals → `GET /api/leave?status=PENDING`
4. Admin approves/rejects → `PATCH /api/leave/:id` → RBAC checks `role=ADMIN` → status updated + audit log written
5. Notification pushed to employee; employee's dashboard reflects new status on next fetch (React Query invalidation)

## 7. Deployment Strategy
- **Environments:** `dev` → `staging` → `production`, each with isolated DB
- CI: lint → type-check → unit tests → build, on every PR
- CD: auto-deploy `main` branch to staging; manual promote to production
- Secrets managed via hosting provider's env var vault — never committed

## 8. Non-Functional Architecture Notes
- Stateless API servers (JWT-based) → horizontally scalable
- DB connection pooling via Prisma + PgBouncer for scale
- Rate limiting on `/api/auth/*` to prevent brute force
- All file uploads virus-scanned / type-restricted before storage
