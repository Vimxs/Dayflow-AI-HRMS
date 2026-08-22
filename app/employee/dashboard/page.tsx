"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/shared/AppHeader";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Calendar,
  DollarSign,
  User,
  Flame,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

interface DashboardData {
  employee: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    department: string;
    phone?: string | null;
    address?: string | null;
  };
  todayAttendance: {
    id: string;
    status: string;
    checkIn: string | null;
    checkOut: string | null;
  } | null;
  streak: number;
  weeklyAttendance: Array<{
    id: string;
    date: string;
    status: string;
    checkIn: string | null;
    checkOut: string | null;
  }>;
  leaveBalances: {
    paid: number;
    sick: number;
    pendingRequests: number;
  };
  latestPayroll: {
    id: string;
    month: string;
    netSalary: number;
  } | null;
  activities: Array<{
    id: string;
    type: string;
    title: string;
    timestamp: string;
    status: string;
  }>;
}

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/employee/dashboard")
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) router.push("/sign-in");
          throw new Error("Failed to load dashboard data");
        }
        return res.json();
      })
      .then((json) => {
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas">
        <header className="h-16 border-b border-border bg-white/60" />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-pulse space-y-6">
          <div className="h-36 rounded-2xl bg-surface-muted border border-border" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-surface-muted border border-border" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-72 rounded-2xl bg-surface-muted border border-border" />
            <div className="h-72 rounded-2xl bg-surface-muted border border-border" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas p-4">
        <div className="glass-card max-w-md w-full p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-danger-soft text-danger flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-heading font-bold text-ink">Dashboard Notice</h2>
          <p className="text-xs text-ink-secondary">{error || "Unable to retrieve employee metrics."}</p>
          <Button onClick={() => window.location.reload()} size="sm" className="w-full">
            Refresh Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const { employee, todayAttendance, streak, weeklyAttendance, leaveBalances, latestPayroll, activities } = data;
  const fullName = `${employee.firstName} ${employee.lastName}`;
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <AppHeader
        user={{
          email: "",
          role: "EMPLOYEE",
          employee: {
            firstName: employee.firstName,
            lastName: employee.lastName,
            jobTitle: employee.jobTitle,
            department: employee.department,
            employeeCode: employee.employeeCode,
          },
        }}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Top Welcome Banner */}
        <div className="rounded-2xl p-6 sm:p-8 bg-surface-muted border border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-border text-primary text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{employee.department} &bull; {employee.employeeCode}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
                Good day, {employee.firstName}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-ink-secondary">
                {currentDate} &bull; {employee.jobTitle}
              </p>
            </div>

            {/* Attendance & Streak Quick Status Widget */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-3 rounded-xl border border-border bg-white shadow-xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-ink-muted block uppercase tracking-wider">
                    Streak
                  </span>
                  <span className="text-base font-heading font-bold text-ink leading-none">
                    {streak} {streak === 1 ? "Day" : "Days"}
                  </span>
                </div>
              </div>

              <div className="px-4 py-3 rounded-xl border border-border bg-white shadow-xs flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    todayAttendance?.status === "PRESENT"
                      ? "bg-secondary-soft text-secondary"
                      : "bg-warning-soft text-warning"
                  }`}
                >
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-ink-muted block uppercase tracking-wider">
                    Today
                  </span>
                  <span className="text-sm font-semibold text-ink leading-none">
                    {todayAttendance ? todayAttendance.status : "Pending Check-In"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Quick Access Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Attendance */}
          <Link
            href="/employee/attendance"
            className="group relative p-5 rounded-xl bg-white border border-border hover:border-secondary/40 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary-soft text-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-accent-teal px-2 py-0.5 rounded-full bg-accent-teal-soft">
                {todayAttendance ? "Logged" : "Action Needed"}
              </span>
            </div>
            <div>
              <h2 className="font-heading font-bold text-ink text-base group-hover:text-accent-teal transition-colors">
                Attendance
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                {todayAttendance?.checkIn
                  ? `In: ${new Date(todayAttendance.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : "Daily check-in / check-out"}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-accent-teal">
              <span>View Timesheet</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>          {/* Card 2: Leave Requests */}
          <Link
            href="/employee/leaves"
            className="group relative p-5 rounded-xl bg-white border border-border hover:border-primary/40 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              {leaveBalances.pendingRequests > 0 && (
                <span className="text-[11px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary-soft border border-primary/20">
                  {leaveBalances.pendingRequests} Pending
                </span>
              )}
            </div>
            <div>
              <h2 className="font-heading font-bold text-ink text-base group-hover:text-primary transition-colors">
                Time-Off & Leave
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                {leaveBalances.paid} Paid &bull; {leaveBalances.sick} Sick Remaining
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary">
              <span>Apply for Leave</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Payroll */}
          <Link
            href="/employee/payroll"
            className="group relative p-5 rounded-xl bg-white border border-border hover:border-secondary/40 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary-soft text-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-secondary px-2 py-0.5 rounded-full bg-secondary-soft border border-secondary/20">
                {latestPayroll ? latestPayroll.month : "Confidential"}
              </span>
            </div>
            <div>
              <h2 className="font-heading font-bold text-ink text-base group-hover:text-secondary transition-colors">
                Salary & Slips
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                {latestPayroll
                  ? `Net: $${latestPayroll.netSalary.toLocaleString()}`
                  : "View monthly breakdown"}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-secondary">
              <span>View Payslip</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: My Profile */}
          <Link
            href="/employee/profile"
            className="group relative p-5 rounded-xl bg-white border border-border hover:border-primary/40 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                <User className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary-soft border border-primary/20">
                Verified
              </span>
            </div>
            <div>
              <h2 className="font-heading font-bold text-ink text-base group-hover:text-primary transition-colors">
                My Profile
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Personal info & documents
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary">
              <span>Edit Profile</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* 2-Column Section: Weekly Attendance + Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Weekly Attendance Tracker & Leave Balances */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Attendance Overview */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-heading font-bold text-base text-ink">
                    Weekly Attendance Overview
                  </h2>
                  <p className="text-xs text-ink-muted">Past 7 scheduled workdays</p>
                </div>
                <Link
                  href="/employee/attendance"
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  Full History <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Status Legend Pills */}
              <div className="flex flex-wrap items-center gap-2 mb-6 text-[11px]">
                <span className="px-2.5 py-1 rounded-full badge-present font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" /> Present
                </span>
                <span className="px-2.5 py-1 rounded-full badge-half-day font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-amber" /> Half Day
                </span>
                <span className="px-2.5 py-1 rounded-full badge-leave font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Leave
                </span>
                <span className="px-2.5 py-1 rounded-full badge-absent font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-danger" /> Absent
                </span>
              </div>

              {/* 7-Day Day Chips Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {weeklyAttendance.length === 0 ? (
                  <p className="text-xs text-ink-muted col-span-full py-4 text-center">
                    No attendance logs recorded this week.
                  </p>
                ) : (
                  weeklyAttendance.map((log) => {
                    const dateObj = new Date(log.date);
                    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
                    const dayNum = dateObj.getDate();
                    const isPresent = log.status === "PRESENT";
                    const isHalfDay = log.status === "HALF_DAY";
                    const isLeave = log.status === "LEAVE";

                    let badgeStyle = "bg-danger-soft text-danger border-danger/20";
                    if (isPresent) badgeStyle = "badge-present";
                    else if (isHalfDay) badgeStyle = "badge-half-day";
                    else if (isLeave) badgeStyle = "badge-leave";

                    return (
                      <div
                        key={log.id}
                        className={`p-3 rounded-xl border text-center transition-all ${badgeStyle}`}
                      >
                        <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">
                          {dayName}
                        </span>
                        <span className="text-base font-heading font-bold block my-0.5">
                          {dayNum}
                        </span>
                        <span className="text-[10px] font-semibold block capitalize truncate">
                          {log.status.toLowerCase().replace("_", " ")}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Leave Balances Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-card p-5 border-l-4 border-l-primary">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-muted">Paid Leave</span>
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-heading font-bold text-ink">
                    {leaveBalances.paid}
                  </span>
                  <span className="text-xs text-ink-muted ml-1">Days remaining</span>
                </div>
              </div>

              <div className="glass-card p-5 border-l-4 border-l-accent-teal">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-muted">Sick Leave</span>
                  <TrendingUp className="w-4 h-4 text-accent-teal" />
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-heading font-bold text-ink">
                    {leaveBalances.sick}
                  </span>
                  <span className="text-xs text-ink-muted ml-1">Days remaining</span>
                </div>
              </div>

              <div className="glass-card p-5 border-l-4 border-l-accent-coral">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-muted">Pending Approvals</span>
                  <AlertCircle className="w-4 h-4 text-accent-coral" />
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-heading font-bold text-ink">
                    {leaveBalances.pendingRequests}
                  </span>
                  <span className="text-xs text-ink-muted ml-1">Under review</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Recent Activity Feed */}
          <div className="glass-card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-base text-ink">
                Recent Activity
              </h2>
              <span className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
            </div>
            <p className="text-xs text-ink-muted mb-4">
              Latest audit log events & updates for {fullName}
            </p>

            <div className="flex-1 space-y-4">
              {activities.length === 0 ? (
                <div className="py-8 text-center text-xs text-ink-muted">
                  No recent activities recorded.
                </div>
              ) : (
                activities.map((item, idx) => (
                  <div key={item.id || idx} className="flex items-start gap-3 text-xs">
                    <div className="w-7 h-7 rounded-lg bg-surface-muted border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                      {item.type === "ATTENDANCE" ? (
                        <Clock className="w-3.5 h-3.5 text-accent-teal" />
                      ) : item.type === "LEAVE" ? (
                        <Calendar className="w-3.5 h-3.5 text-accent-coral" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink leading-tight">{item.title}</p>
                      <span className="text-[10px] text-ink-light block mt-0.5">
                        {new Date(item.timestamp).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <Link
                href="/employee/attendance"
                className="w-full py-2 rounded-xl bg-surface-muted hover:bg-canvas text-center text-xs font-semibold text-primary block transition-colors border border-border/80"
              >
                Launch Self-Service Timesheet
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
