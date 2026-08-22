"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  CalendarCheck2,
  Clock,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  UserCheck,
  FileSpreadsheet,
  Lock,
  Layers,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"overview" | "attendance" | "payroll">("overview");

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink font-sans selection:bg-primary-soft selection:text-primary">
      {/* 1. NAVBAR (72px, clean B2B SaaS layout) */}
      <header className="w-full bg-white border-b border-border sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-heading font-extrabold text-lg shadow-xs">
              D
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-bold text-xl text-ink tracking-tight">Dayflow</span>
              <span className="text-xs font-semibold text-primary bg-primary-soft px-2 py-0.5 rounded-md border border-primary/10">
                HRMS Portal
              </span>
            </div>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-secondary">
            <a href="#overview" className="hover:text-primary transition-colors">Product</a>
            <a href="#features" className="hover:text-primary transition-colors">Solutions</a>
            <a href="#modules" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">Resources</a>
            <a href="#about" className="hover:text-primary transition-colors">About</a>
          </nav>

          {/* Right: Auth Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="px-4 py-2 text-sm font-semibold text-ink hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-4.5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-all shadow-xs flex items-center gap-1.5"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section id="overview" className="bg-gradient-to-b from-white via-canvas to-surface-muted border-b border-border py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* LEFT COLUMN: Value Proposition */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft border border-primary/15 text-primary text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enterprise HR Technology</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-ink tracking-tight leading-[1.1]">
                Modern HR operations,{" "}
                <span className="text-primary">seamlessly orchestrated.</span>
              </h1>

              <p className="text-base sm:text-lg text-ink-secondary leading-relaxed">
                Empower your workforce with role-governed self-service, real-time attendance, automated leave approvals, and audit-logged payroll — unified in one reliable hub.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <Link
                  href="/sign-in"
                  className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg shadow-xs transition-all text-center flex items-center justify-center gap-2"
                >
                  Access Portal <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/sign-up"
                  className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-primary-soft text-primary border border-primary font-semibold rounded-lg transition-all text-center"
                >
                  Register Employee
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-border/80 grid grid-cols-3 gap-3 text-left">
                <div>
                  <span className="font-heading font-bold text-lg text-ink block">100%</span>
                  <span className="text-xs text-ink-muted">RBAC Gated</span>
                </div>
                <div>
                  <span className="font-heading font-bold text-lg text-secondary block">Real-Time</span>
                  <span className="text-xs text-ink-muted">Audit Logging</span>
                </div>
                <div>
                  <span className="font-heading font-bold text-lg text-primary block">Automated</span>
                  <span className="text-xs text-ink-muted">PDF Payslips</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Polished Dashboard Preview Centerpiece */}
            <div className="lg:col-span-7">
              <div className="glass-card rounded-2xl p-4 sm:p-6 bg-white border border-border shadow-md">
                {/* Header & Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                    <span className="text-xs font-mono font-semibold text-ink-muted ml-2">
                      app.dayflow.com/admin/dashboard
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-lg border border-border">
                    <button
                      onClick={() => setActiveTab("overview")}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        activeTab === "overview"
                          ? "bg-primary text-white shadow-xs"
                          : "text-ink-secondary hover:text-ink"
                      }`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveTab("attendance")}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        activeTab === "attendance"
                          ? "bg-primary text-white shadow-xs"
                          : "text-ink-secondary hover:text-ink"
                      }`}
                    >
                      Attendance
                    </button>
                    <button
                      onClick={() => setActiveTab("payroll")}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        activeTab === "payroll"
                          ? "bg-primary text-white shadow-xs"
                          : "text-ink-secondary hover:text-ink"
                      }`}
                    >
                      Payroll
                    </button>
                  </div>
                </div>

                {/* Dynamic Preview Body based on activeTab */}
                {activeTab === "overview" && (
                  <div>
                    {/* Dashboard Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                      <div className="p-3.5 rounded-xl bg-canvas border border-border">
                        <span className="text-xs text-ink-muted block font-medium">Total Staff</span>
                        <span className="text-xl font-heading font-bold text-ink block mt-1">148</span>
                        <span className="text-[11px] text-secondary font-semibold flex items-center gap-0.5 mt-0.5">
                          <TrendingUp className="w-3 h-3" /> Active Roster
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-secondary-soft/50 border border-secondary/20">
                        <span className="text-xs text-secondary-dark block font-medium">Present Today</span>
                        <span className="text-xl font-heading font-bold text-secondary block mt-1">134</span>
                        <span className="text-[11px] text-secondary/80">90.5% turnout</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-primary-soft/50 border border-primary/20">
                        <span className="text-xs text-primary block font-medium">On Leave</span>
                        <span className="text-xl font-heading font-bold text-primary block mt-1">8</span>
                        <span className="text-[11px] text-primary/80">Approved</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-warning-soft border border-warning/30">
                        <span className="text-xs text-ink-secondary block font-medium">Pending Approvals</span>
                        <span className="text-xl font-heading font-bold text-warning block mt-1">6</span>
                        <span className="text-[11px] text-ink-muted">Action required</span>
                      </div>
                    </div>

                    {/* Mini Visualization & Table Roster */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div className="sm:col-span-2 p-4 rounded-xl border border-border bg-white space-y-3">
                        <div className="flex items-center justify-between text-xs font-semibold text-ink">
                          <span>Weekly Attendance Distribution</span>
                          <span className="text-secondary font-mono">Teal = Present</span>
                        </div>
                        <div className="h-28 flex items-end justify-between gap-2 pt-2 border-b border-border/60 pb-2">
                          {[
                            { day: "Mon", present: 92, leave: 8 },
                            { day: "Tue", present: 96, leave: 4 },
                            { day: "Wed", present: 94, leave: 6 },
                            { day: "Thu", present: 90, leave: 10 },
                            { day: "Fri", present: 88, leave: 12 },
                          ].map((item) => (
                            <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                              <div className="w-full flex flex-col items-center gap-0.5">
                                <div className="w-full rounded-t-xs bg-primary/20" style={{ height: `${item.leave * 1.5}px` }} />
                                <div className="w-full rounded-t-xs bg-secondary" style={{ height: `${item.present * 0.8}px` }} />
                              </div>
                              <span className="text-[10px] text-ink-muted">{item.day}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-border bg-canvas space-y-2.5 text-xs">
                        <span className="font-semibold text-ink block">Pending Leave Queue</span>
                        <div className="p-2 rounded-lg bg-white border border-border flex items-center justify-between">
                          <div>
                            <span className="font-semibold block text-ink">Rahul Sharma</span>
                            <span className="text-[10px] text-ink-muted">Sick Leave · 2 days</span>
                          </div>
                          <Link href="/sign-in" className="px-2 py-0.5 rounded bg-secondary text-white font-bold text-[10px]">Review</Link>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-border flex items-center justify-between">
                          <div>
                            <span className="font-semibold block text-ink">Priya Patel</span>
                            <span className="text-[10px] text-ink-muted">Paid Leave · 1 day</span>
                          </div>
                          <Link href="/sign-in" className="px-2 py-0.5 rounded bg-secondary text-white font-bold text-[10px]">Review</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "attendance" && (
                  <div className="my-4 space-y-3">
                    <div className="p-4 rounded-xl bg-surface-muted border border-border flex items-center justify-between">
                      <div>
                        <span className="text-xs text-ink-muted block font-medium">Daily Check-In Tracker</span>
                        <span className="text-sm font-heading font-bold text-ink">Today: 09:12 AM &bull; Status: Present</span>
                      </div>
                      <Link href="/sign-in" className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg shadow-xs">
                        Check Out
                      </Link>
                    </div>
                    <div className="grid grid-cols-5 gap-2 pt-1 text-center">
                      {[
                        { day: "Mon", status: "Present", color: "text-secondary bg-secondary-soft" },
                        { day: "Tue", status: "Present", color: "text-secondary bg-secondary-soft" },
                        { day: "Wed", status: "Present", color: "text-secondary bg-secondary-soft" },
                        { day: "Thu", status: "Half Day", color: "text-accent-amber bg-warning-soft" },
                        { day: "Fri", status: "Present", color: "text-secondary bg-secondary-soft" },
                      ].map((d) => (
                        <div key={d.day} className={`p-2.5 rounded-lg border border-border/80 ${d.color}`}>
                          <span className="text-[10px] font-bold uppercase block">{d.day}</span>
                          <span className="text-xs font-semibold mt-0.5 block">{d.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "payroll" && (
                  <div className="my-4 space-y-3">
                    <div className="p-4 rounded-xl bg-white border border-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs text-ink-muted block font-medium">Monthly Take-Home Compensation</span>
                        <span className="text-2xl font-heading font-extrabold text-ink">$6,850.00</span>
                        <span className="text-[11px] text-ink-muted block mt-0.5">Base: $6,000 + Allowances: $1,200 - Deductions: $350</span>
                      </div>
                      <Link
                        href="/sign-in"
                        className="px-3.5 py-2 bg-secondary text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
                      >
                        Download PDF Slip
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. TRUST & VALUE INDICATORS */}
      <section id="about" className="bg-white border-b border-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-canvas border border-border">
              <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-ink">Secure & Compliant</h3>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Strict JWT tokens, bcrypt password hashing, and role-gated resource access.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-canvas border border-border">
              <div className="w-10 h-10 rounded-lg bg-secondary-soft text-secondary flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-ink">Employee Self-Service</h3>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Staff can update allowed contact details, check in daily, and download PDF payslips.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-canvas border border-border">
              <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-ink">Data-Driven Insights</h3>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Real-time attendance distributions, leave analytics, and automated audit logging.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES GRID */}
      <section id="features" className="py-16 lg:py-24 bg-canvas border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              Comprehensive Platform
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-ink">
              Everything you need to run people operations.
            </h2>
            <p className="text-base text-ink-secondary">
              Built specifically for modern organization structures — eliminating manual spreadsheets and fragmenting tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-lg text-ink mb-2">Employee Management</h3>
                <p className="text-xs text-ink-secondary leading-relaxed mb-4">
                  Centralized workforce roster with job titles, departments, joining dates, and document repositories.
                </p>
              </div>
              <Link href="/sign-in" className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
                Explore Roster <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-secondary-soft text-secondary flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-lg text-ink mb-2">Attendance & Leave</h3>
                <p className="text-xs text-ink-secondary leading-relaxed mb-4">
                  Daily check-in/out logging with status policy logic (Present, Half-Day, Absent) and HR leave approval queues.
                </p>
              </div>
              <Link href="/sign-in" className="text-xs font-semibold text-secondary hover:underline inline-flex items-center gap-1">
                Manage Time-Off <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center mb-4">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-lg text-ink mb-2">Payroll & Compliance</h3>
                <p className="text-xs text-ink-secondary leading-relaxed mb-4">
                  Base, allowances, and deductions structure with live net pay previews and on-demand PDF salary slip downloads.
                </p>
              </div>
              <Link href="/sign-in" className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
                View Payroll <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-secondary-soft text-secondary flex items-center justify-center mb-4">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-lg text-ink mb-2">Reports & Analytics</h3>
                <p className="text-xs text-ink-secondary leading-relaxed mb-4">
                  Exportable PDF & CSV reports for executive auditing, monthly attendance trends, and complete audit history logs.
                </p>
              </div>
              <Link href="/sign-in" className="text-xs font-semibold text-secondary hover:underline inline-flex items-center gap-1">
                Export Data <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CORE HR MODULES */}
      <section id="modules" className="py-16 lg:py-24 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-heading font-bold text-ink">Integrated Module Suite</h2>
            <p className="text-xs sm:text-sm text-ink-secondary">
              Designed around the complete employee lifecycle from onboarding to payroll distribution.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-left">
            {[
              { title: "Employee Directory", icon: Users, desc: "Searchable staff roster" },
              { title: "Attendance Tracking", icon: Clock, desc: "Live check-in & heatmaps" },
              { title: "Leave Approvals", icon: CalendarCheck2, desc: "Overlap checks & balance" },
              { title: "Payroll Engine", icon: CreditCard, desc: "Automated PDF slips" },
              { title: "Document Vault", icon: Layers, desc: "5MB restricted files" },
              { title: "Audit Trail", icon: ShieldCheck, desc: "Immutable write logs" },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.title} className="p-4 rounded-xl border border-border bg-canvas hover:border-primary/40 transition-colors">
                  <Icon className="w-5 h-5 text-primary mb-2" />
                  <h4 className="font-heading font-bold text-xs text-ink">{m.title}</h4>
                  <p className="text-[11px] text-ink-muted mt-1">{m.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-surface-muted border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Simple Deployment</span>
            <h2 className="text-3xl font-heading font-bold text-ink">How Dayflow Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-xl bg-white border border-border relative">
              <span className="w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center mb-4">
                1
              </span>
              <h3 className="font-heading font-bold text-base text-ink mb-1">Set Up Your Roster</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Add employees, assign corporate codes, job designations, departments, and initial salary structures.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-border relative">
              <span className="w-8 h-8 rounded-full bg-secondary text-white font-bold text-sm flex items-center justify-center mb-4">
                2
              </span>
              <h3 className="font-heading font-bold text-base text-ink mb-1">Empower Staff Self-Service</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Employees sign in to check in daily, view leave balances, apply for time-off, and download PDF payslips.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-border relative">
              <span className="w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center mb-4">
                3
              </span>
              <h3 className="font-heading font-bold text-base text-ink mb-1">Automate HR Operations</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Admins review leave applications with 1-click approvals, track master attendance, and audit all changes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="py-16 bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-ink">
            Build a better workplace with Dayflow.
          </h2>
          <p className="text-sm sm:text-base text-ink-secondary max-w-xl mx-auto">
            Experience an enterprise HR SaaS platform designed for clarity, security, and human-centered efficiency.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg shadow-xs transition-all text-center flex items-center justify-center gap-2"
            >
              Get Started Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sign-in"
              className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-primary-soft text-primary border border-primary font-semibold rounded-lg transition-all text-center"
            >
              Sign In to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-canvas border-t border-border py-12 text-xs text-ink-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-primary text-white font-bold flex items-center justify-center">D</div>
              <span className="font-heading font-bold text-base text-ink">Dayflow</span>
            </div>
            <p className="text-ink-secondary text-[11px] leading-relaxed">
              Enterprise HRMS & Payroll platform. Single-tenant, role-gated, and audit-compliant.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-bold text-ink mb-3 uppercase text-[11px]">Product Modules</h4>
            <ul className="space-y-2 text-ink-secondary">
              <li><Link href="/sign-in" className="hover:text-primary">Employee Roster</Link></li>
              <li><Link href="/sign-in" className="hover:text-primary">Live Attendance</Link></li>
              <li><Link href="/sign-in" className="hover:text-primary">Leave Approvals</Link></li>
              <li><Link href="/sign-in" className="hover:text-primary">Payroll & Slips</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-ink mb-3 uppercase text-[11px]">Security & Access</h4>
            <ul className="space-y-2 text-ink-secondary">
              <li><span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-secondary" /> Role-Based Access Control</span></li>
              <li><span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-secondary" /> JWT Access & Refresh</span></li>
              <li><span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-secondary" /> Audit Log Tracker</span></li>
              <li><span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-secondary" /> WCAG 2.1 AA Compliant</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-ink mb-3 uppercase text-[11px]">Corporate</h4>
            <p className="text-ink-secondary text-[11px]">
              Dayflow HR Technology Systems &bull; All data isolated and encrypted per tenant.
            </p>
            <p className="text-ink-muted text-[10px] mt-4">
              &copy; {new Date().getFullYear()} Dayflow HRMS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
