# Dayflow — Human Resource Management System (HRMS)

> "Every workday, perfectly aligned."

Dayflow is a modern, full-stack Human Resource Management System designed for agile organizations to streamline core HR operations: digital onboarding, profile management, live attendance tracking, leave approval workflows, and transparent payroll visibility.

---

##  Design System — Modern Painted Theme
- **Primary Indigo-Violet:** `#5B4FE9`
- **Soft Accent Coral:** `#FF7A59`
- **Teal (Present/Approved):** `#12B8A6`
- **Amber (Half-Day/Warning):** `#F5A623`
- **Danger (Absent/Rejected):** `#E5484D`
- **Canvas Wash & Glassmorphism:** Soft multi-stop radial gradient canvas with crisp glass cards.
- **Typography:** `Sora` (Headings) & `Inter` (Body).

---

##  Tech Stack
- **Framework:** Next.js 14+ (App Router) + TypeScript
- **Styling:** Tailwind CSS + Custom Design System Tokens
- **Database & ORM:** PostgreSQL 16 + Prisma ORM
- **Authentication & Security:** JWT (Access + httpOnly Refresh) + bcryptjs password hashing + RBAC Middleware
- **Validation:** Zod schemas for all mutating endpoints
- **Icons & Charts:** Lucide React & Recharts

---

##  Getting Started

### 1. Prerequisites
- Node.js 18+ / 20+
- PostgreSQL database instance

### 2. Setup Environment
```bash
cp .env.example .env
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Migration & Seed
```bash
npx prisma db push
npm run prisma:seed
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

##  Seeded Demo Accounts
| Role | Email | Password | Details |
|---|---|---|---|
| **Admin / HR** | `admin@dayflow.com` | `Admin@123` | Anita Roy (HR Lead) |
| **Employee** | `rahul@dayflow.com` | `Rahul@123` | Rahul Sharma (Senior Engineer) |
| **Employee** | `priya@dayflow.com` | `Priya@123` | Priya Patel (Product Designer) |

---

## Repository Structure
```
dayflow/
├── docs/
│   ├── 01-Product-Requirements-Document.md
│   ├── 02-Technical-Architecture-Document.md
│   ├── 03-Security-And-Access-Document.md
│   ├── 04-Frontend-Specification-Document.md
│   ├── 05-Feature-Ticket-List.md
│   ├── 06-Rules.md
│   ├── memory.md
│   └── reference/
│       └── Dayflow-HRMS-Requirements.pdf
├── app/
├── components/
├── lib/
├── prisma/
├── tests/
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```
