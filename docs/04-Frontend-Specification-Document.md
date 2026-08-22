# Dayflow — Frontend Specification Document

## 1. Design Direction — "Modern Painted" Theme
A warm, soft-gradient, hand-painted-canvas aesthetic layered over a clean, functional dashboard grid. Think: **soft brush-stroke gradients + glassmorphism cards + confident sans-serif type** — professional enough for HR/payroll, expressive enough to not feel like generic SaaS.

### 1.1 Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#5B4FE9` (indigo-violet) | Primary actions, active nav, links |
| `--color-primary-soft` | `#EDEBFF` | Primary backgrounds, hover states |
| `--color-accent-coral` | `#FF7A59` | Alerts, "pending" badges, highlights |
| `--color-accent-teal` | `#12B8A6` | Success, "approved", present status |
| `--color-accent-amber` | `#F5A623` | Warning, half-day status |
| `--color-danger` | `#E5484D` | Errors, "rejected", absent status |
| `--color-ink` | `#1A1B25` | Primary text |
| `--color-muted` | `#6B7280` | Secondary text |
| `--color-canvas` | `#FBFAFF` | App background (painted gradient wash) |
| `--color-surface` | `#FFFFFF` | Card surfaces |
| `--color-border` | `#E7E5F5` | Borders, dividers |

**Painted background treatment:** app background uses a subtle multi-stop radial/linear gradient wash (`indigo → soft lavender → warm white`) behind card surfaces — never on top of readable text blocks.

### 1.2 Typography
- **Headings:** `Sora` or `Clash Display` (geometric, confident) — weights 600/700
- **Body:** `Inter` — weights 400/500/600
- Scale: `H1 32px / H2 24px / H3 20px / Body 15px / Caption 13px`
- Line height: 1.5 body, 1.2 headings

### 1.3 Shape & Elevation
- Corner radius: `12px` cards, `8px` buttons/inputs, `999px` pills/badges
- Cards: soft shadow `0 4px 24px rgba(91,79,233,0.08)`, subtle `1px` border
- Buttons: solid primary (filled), soft ghost secondary, no harsh drop shadows

## 2. Screen Inventory & Components

### 2.1 Auth Screens
- **Sign Up:** Employee ID, Email, Password, Role selector (Employee/HR), password-strength meter, terms checkbox
- **Sign In:** Email, Password, "Forgot password?" link, error banner (generic message)
- **Verify Email:** status card + "resend verification" action
- **Forgot/Reset Password:** email input → confirmation → new password form

### 2.2 Employee Dashboard
- Header: greeting + date + notification bell
- Quick-access cards (4): **Profile / Attendance / Leave Requests / Logout** — painted gradient icon tiles
- "Recent activity / alerts" feed (timeline component)
- Attendance streak / this-week status widget

### 2.3 Admin/HR Dashboard
- KPI strip: Total Employees, Present Today, Pending Approvals, On Leave Today
- Employee list table (search, filter by department, pagination)
- Attendance overview chart (weekly bar chart)
- Leave approvals queue (top 5, "view all" link)
- Employee switcher (dropdown/search to view any employee's profile)

### 2.4 Profile
- View mode: avatar, personal details, job details, salary structure (role-gated), documents list
- Edit mode: Employee → phone/address/avatar only (other fields disabled/read-only); Admin → all fields editable
- Document upload component with type/size validation feedback

### 2.5 Attendance
- Toggle: Daily view / Weekly view
- Check-in / Check-out button (large, primary, disabled after check-out)
- Status legend with color-coded chips (Present=teal, Absent=danger, Half-day=amber, Leave=primary)
- Admin: filterable table across all employees + date range picker

### 2.6 Leave Management
- Employee: "Apply for Leave" form (leave type dropdown, date range picker, remarks textarea) + status list of past requests (chip: Pending/Approved/Rejected)
- Admin: Leave Approvals table — employee, type, dates, remarks, Approve/Reject buttons with comment modal

### 2.7 Payroll
- Employee: read-only salary card (base, allowances, deductions, net) + download salary slip (PDF)
- Admin: editable salary structure form per employee, bulk view table, "update effective from" date

### 2.8 Reports/Analytics
- Attendance summary chart (monthly trend)
- Leave-type distribution chart
- Exportable salary slip / attendance report (PDF/CSV)

## 3. Responsive Rules
- Breakpoints: `mobile <640px / tablet 640–1024px / desktop >1024px`
- Sidebar nav collapses to bottom tab bar (mobile) / hamburger drawer (tablet)
- Tables convert to stacked cards below `768px`
- Touch targets minimum `44x44px`

## 4. Interaction & Feedback Patterns
- Toast notifications for all async actions (success/error), auto-dismiss 4s
- Skeleton loaders (not spinners) for card/table content
- Optimistic UI update on check-in/check-out and leave apply, with rollback on error
- Empty states illustrated (not blank) — e.g., "No leave requests yet" with painted-style icon
- Form validation inline, on-blur, with clear error text below field (never only color)

## 5. Accessibility
- WCAG 2.1 AA color contrast minimum (4.5:1 body text)
- All interactive elements keyboard-navigable, visible focus ring using `--color-primary`
- Status conveyed by icon + text, never color alone
- All form inputs have associated `<label>`, all images/icons have `alt`/`aria-label`

## 6. Component Library Notes
- Base: **shadcn/ui** primitives (Button, Input, Dialog, Table, Select, Badge, Toast) restyled with the tokens above
- Icons: **lucide-react**
- Charts: **recharts** with the palette above
- Date picker: range-capable component for leave application
