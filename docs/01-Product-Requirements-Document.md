# Dayflow — Product Requirements Document (PRD)

> "Every workday, perfectly aligned."

## 1. Purpose
Dayflow is a Human Resource Management System (HRMS) that digitizes and streamlines core HR operations: onboarding, employee profile management, attendance tracking, leave/time-off management, payroll visibility, and approval workflows for Admins/HR and Employees.

## 2. Vision
Give small-to-mid-sized organizations a single, secure, visually modern dashboard where HR runs day-to-day operations without spreadsheets, email threads, or paper forms — and employees get full self-service visibility into their own work life.

## 3. Target Users / Personas

| Persona | Role | Goals | Pain Points Today |
|---|---|---|---|
| **Anita – HR Officer/Admin** | Admin | Approve leave fast, keep payroll accurate, see attendance at a glance | Excel sheets, manual approvals over email/WhatsApp |
| **Rahul – Employee** | Employee | Apply for leave, check salary slip, mark attendance | No visibility into leave balance or approval status |
| **Founder/Owner** | Super Admin (future) | Oversight of company-wide HR health | No single source of truth |

## 4. Scope

### 4.1 In Scope (v1)
- Secure authentication (Sign Up / Sign In) with email verification
- Role-based access control: **Admin/HR** vs **Employee**
- Employee profile management (view + limited/full edit)
- Attendance tracking — daily & weekly views, check-in/check-out
- Leave & time-off management with approval workflow
- Payroll/salary visibility (read-only for employees, editable for admin)
- Notifications & alerts (email + in-app)
- Analytics & reports dashboard (attendance reports, salary slips)

### 4.2 Out of Scope (v1 — Future Enhancements)
- Multi-company / multi-tenant support
- Biometric/GPS-based attendance
- Payroll tax computation engine / statutory compliance automation
- Mobile native apps (v1 is responsive web)
- Performance review / appraisal module
- Recruitment/ATS module

## 5. User Classes and Characteristics

| User Type | Description | Access Level |
|---|---|---|
| **Admin / HR Officer** | Manages employees, approves leave & attendance, views/edits payroll details | Full access |
| **Employee** | Views personal profile, attendance, applies for leave, views salary details | Restricted, self-scoped access |

## 6. Functional Requirements (Summary)

### 6.1 Authentication & Authorization
- Sign up with Employee ID, Email, Password, Role (Employee/HR)
- Enforced password policy (min length, upper/lower/number/special char)
- Mandatory email verification before first login
- Sign in with email + password; clear error messaging on invalid credentials
- Successful login redirects to role-based dashboard
- Forgot password / reset password flow
- Session expiry & secure logout

### 6.2 Dashboards
- **Employee Dashboard:** Profile, Attendance, Leave Requests, Logout — quick-access cards + recent activity/alerts
- **Admin/HR Dashboard:** Employee list, attendance records, leave approvals, ability to switch between employee views, summary KPIs (headcount, present today, pending approvals)

### 6.3 Employee Profile Management
- View: personal details, job details, salary structure, documents, profile picture
- Edit: Employee can edit limited fields (address, phone, profile picture); Admin can edit all fields

### 6.4 Attendance Management
- Daily & weekly attendance views
- Check-in / check-out for employees
- Status types: Present, Absent, Half-day, Leave
- Employees see only their own records; Admin/HR sees all

### 6.5 Leave & Time-Off Management
- Employee: select leave type (Paid/Sick/Unpaid), date range, remarks
- Status lifecycle: Pending → Approved / Rejected
- Admin: view all requests, approve/reject with comments; changes reflect immediately

### 6.6 Payroll/Salary Management
- Employee: read-only payroll view
- Admin: view payroll of all employees, update salary structure, ensure accuracy

### 6.7 Notifications & Reports
- Email & in-app notification alerts (leave status change, approvals pending, etc.)
- Analytics & reports dashboard — salary slips, attendance reports (exportable)

## 7. Non-Functional Requirements
- **Security:** Encrypted passwords (bcrypt/argon2), HTTPS-only, RBAC enforced server-side, input validation, audit trail for sensitive actions (see Security & Access Document)
- **Performance:** Dashboard loads < 2s on 4G; API responses < 500ms p95
- **Availability:** 99.5% uptime target
- **Scalability:** Support growth from 20 to 2,000+ employees without architecture rewrite
- **Usability:** Fully responsive (desktop, tablet, mobile web), WCAG 2.1 AA accessibility baseline
- **Data Integrity:** All leave/attendance/payroll changes are auditable and immutable-logged
- **Localization-ready:** English default, structure allows future i18n

## 8. Success Metrics
- 100% of employees onboarded digitally within first 2 weeks of launch
- Leave approval turnaround time reduced to < 24 hours
- Zero manual payroll-viewing requests via email/HR desk
- < 1% login failure rate due to system errors

## 9. Assumptions & Constraints
- Single organization / single tenant per deployment (v1)
- Admin accounts are provisioned by a super-admin or seeded manually (no public HR signup)
- Currency and salary structure assumed single-currency (configurable later)
- Design reference: Excalidraw wireframe — https://link.excalidraw.com/l/65VNwvy7c4X/58RLEJ4oOwh

## 10. Glossary
- **Admin / HR Officer:** User with management and approval privileges
- **Employee:** Regular user with limited, self-scoped access
- **Time-Off:** Paid leave, sick leave, unpaid leave, etc.
