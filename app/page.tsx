import Link from "next/link";
import { 
  Users, 
  CalendarCheck2, 
  Clock, 
  CreditCard, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  Building2
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="w-full glass-panel sticky top-0 z-50 border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/30 font-heading font-bold text-xl">
              D
            </div>
            <div>
              <span className="font-heading font-bold text-xl text-ink tracking-tight">Dayflow</span>
              <span className="text-xs text-primary font-medium block -mt-1">HRMS Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="px-4 py-2 text-sm font-medium text-ink hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-btn transition-all shadow-sm shadow-primary/30 flex items-center gap-1.5"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-primary-soft border border-primary/20 text-primary text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Every workday, perfectly aligned</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-ink tracking-tight max-w-4xl leading-tight">
          Modern HR operations, <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-primary via-[#766BFF] to-accent-coral bg-clip-text text-transparent">
            seamlessly orchestrated.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-ink-secondary max-w-2xl">
          From self-service employee portals to role-governed admin workflows — Dayflow unites attendance, leave approvals, profile records, and payroll in one secure hub.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full max-w-md justify-center">
          <Link
            href="/sign-in"
            className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-btn shadow-md shadow-primary/25 transition-all text-center flex items-center justify-center gap-2"
          >
            Access HRMS Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/sign-up"
            className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-surface-muted text-ink border border-border font-medium rounded-btn transition-all text-center"
          >
            Register Employee
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left">
          <div className="glass-card p-6">
            <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center text-primary mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-ink mb-1">Employee Profiles</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              Complete digital profiles with role-gated fields, salary breakdown, and document vaults.
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="w-12 h-12 rounded-xl bg-accent-teal-soft flex items-center justify-center text-accent-teal mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-ink mb-1">Live Attendance</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              Instant daily check-in/out, streak tracking, weekly heatmaps, and admin oversight.
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="w-12 h-12 rounded-xl bg-accent-coral-soft flex items-center justify-center text-accent-coral mb-4">
              <CalendarCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-ink mb-1">Leave Approvals</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              One-click leave applications with real-time admin approval queue and status alerts.
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="w-12 h-12 rounded-xl bg-accent-amber-soft flex items-center justify-center text-accent-amber mb-4">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-ink mb-1">Payroll & Slips</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              Secure read-only salary structure for employees and audit-logged updates for admins.
            </p>
          </div>
        </div>

        {/* Security and RBAC Guarantee */}
        <div className="mt-16 w-full max-w-4xl glass-panel rounded-card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-border">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-semibold text-ink">Enterprise-Grade RBAC & Security</h4>
              <p className="text-sm text-ink-muted">Strict server-side validation, JWT tokens, audit logging, and bcrypt password hashing.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-ink-secondary bg-surface px-4 py-2 rounded-pill border border-border">
            <CheckCircle2 className="w-4 h-4 text-accent-teal" />
            <span>PostgreSQL + Prisma Verified</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/60 py-6 mt-12 bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-muted">
          <p>© {new Date().getFullYear()} Dayflow HRMS. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Single-Tenant Ready</span>
            <span>WCAG 2.1 AA Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
