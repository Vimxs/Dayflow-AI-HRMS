"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/shared/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Clock,
  Calendar,
  ShieldCheck,
  Search,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface AdminDashboardData {
  kpis: {
    totalEmployees: number;
    presentToday: number;
    pendingApprovals: number;
    onLeaveToday: number;
  };
  attendanceTrend: Array<{
    name: string;
    date: string;
    Present: number;
    HalfDay: number;
    Leave: number;
    Absent: number;
  }>;
  leaveDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  pendingApprovalsList: Array<{
    id: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    days: number;
    remarks: string | null;
    createdAt: string;
    employee: {
      id: string;
      employeeCode: string;
      firstName: string;
      lastName: string;
      department: string;
      jobTitle: string;
    };
  }>;
  employees: Array<{
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    department: string;
    jobTitle: string;
    dateOfJoining: string;
    user: {
      email: string;
      isVerified: boolean;
    };
  }>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) router.push("/sign-in");
          if (res.status === 403) router.push("/employee/dashboard");
          throw new Error("Failed to load admin metrics");
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

  // Filtered employees for directory preview
  const filteredEmployees = useMemo(() => {
    if (!data?.employees) return [];
    return data.employees.filter((emp) => {
      const matchesSearch =
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = selectedDept === "ALL" || emp.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [data?.employees, searchQuery, selectedDept]);

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
            <div className="lg:col-span-2 h-80 rounded-2xl bg-surface-muted border border-border" />
            <div className="h-80 rounded-2xl bg-surface-muted border border-border" />
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
          <h2 className="text-lg font-heading font-bold text-ink">Admin Console Access</h2>
          <p className="text-xs text-ink-secondary">{error || "Failed to load management dashboard."}</p>
          <Button onClick={() => window.location.reload()} size="sm" className="w-full">
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  const { kpis, attendanceTrend, pendingApprovalsList } = data;
  const attendanceRate =
    kpis.totalEmployees > 0
      ? Math.round((kpis.presentToday / kpis.totalEmployees) * 100)
      : 0;

  const departments = ["ALL", "ENGINEERING", "SALES", "MARKETING", "HR", "FINANCE", "OPERATIONS"];

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <AppHeader
        user={{
          email: "admin@dayflow.com",
          role: "ADMIN",
          employee: {
            firstName: "Anita",
            lastName: "Roy",
            jobTitle: "HR Operations Lead",
            department: "Human Resources",
            employeeCode: "EMP001",
          },
        }}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Welcome & Overview Header */}
        <div className="rounded-2xl p-6 sm:p-8 bg-surface-muted border border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-border text-primary text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Executive HR Command Hub &bull; Organization Scope</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
                Workforce Operations Console
              </h1>
              <p className="text-xs sm:text-sm text-ink-secondary">
                Real-time staffing indicators, leave approval queue, and attendance analytics
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin/employees"
                className="px-4 py-2.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark shadow-xs flex items-center gap-2 transition-colors"
              >
                <Users className="w-4 h-4" /> Manage Roster
              </Link>
              <Link
                href="/admin/leaves"
                className="px-4 py-2.5 rounded-lg bg-white border border-border text-ink text-xs font-semibold hover:bg-primary-soft hover:text-primary shadow-xs flex items-center gap-2 transition-colors"
              >
                <Calendar className="w-4 h-4 text-primary" /> Leave Approvals
              </Link>
            </div>
          </div>
        </div>

        {/* 4 KPI Cards Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Total Employees */}
          <div className="glass-card p-5 border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-muted">Total Workforce</span>
              <div className="w-9 h-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-heading font-bold text-ink">
                {kpis.totalEmployees}
              </span>
              <span className="text-[11px] font-semibold text-secondary flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Active Roster
              </span>
            </div>
          </div>

          {/* KPI 2: Present Today */}
          <div className="glass-card p-5 border-l-4 border-l-secondary">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-muted">Present Today</span>
              <div className="w-9 h-9 rounded-lg bg-secondary-soft text-secondary flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-heading font-bold text-ink">
                {kpis.presentToday}
              </span>
              <span className="text-[11px] font-semibold text-secondary bg-secondary-soft px-2 py-0.5 rounded-full">
                {attendanceRate}% Turnout
              </span>
            </div>
          </div>

          {/* KPI 3: Pending Approvals */}
          <div className="glass-card p-5 border-l-4 border-l-warning">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-muted">Pending Approvals</span>
              <div className="w-9 h-9 rounded-lg bg-warning-soft text-warning flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-heading font-bold text-ink">
                {kpis.pendingApprovals}
              </span>
              <span className="text-[11px] font-semibold text-warning bg-warning-soft px-2 py-0.5 rounded-full border border-warning/20">
                Requires Action
              </span>
            </div>
          </div>

          {/* KPI 4: On Leave Today */}
          <div className="glass-card p-5 border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-muted">On Leave Today</span>
              <div className="w-9 h-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-heading font-bold text-ink">
                {kpis.onLeaveToday}
              </span>
              <span className="text-[11px] font-semibold text-ink-muted">
                Approved Time-off
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Middle Row: Recharts Attendance Analytics + Leave Approval Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Attendance Bar Chart */}
          <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="font-heading font-bold text-base text-ink">
                  7-Day Attendance Distribution
                </h2>
                <p className="text-xs text-ink-muted">
                  Organization-wide headcount breakdown by day
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-secondary-soft text-secondary font-bold text-[11px] border border-secondary/20">
                  Real-time Synced
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E3E7" />
                  <XAxis dataKey="name" stroke="#8F8F8F" fontSize={12} tickLine={false} />
                  <YAxis stroke="#8F8F8F" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "8px",
                      border: "1px solid #E7E3E7",
                      boxShadow: "0 2px 10px rgba(31,27,34,0.08)",
                      fontSize: "12px",
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Bar dataKey="Present" fill="#017E84" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="HalfDay" fill="#E4A900" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="Leave" fill="#714B67" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="Absent" fill="#C94F5D" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right 1 Col: Top Pending Approvals Queue */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-heading font-bold text-base text-ink">
                  Pending Approvals
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-accent-coral/10 text-accent-coral text-xs font-bold">
                  {pendingApprovalsList.length}
                </span>
              </div>
              <p className="text-xs text-ink-muted mb-4">
                Leave requests requiring supervisor review
              </p>

              <div className="space-y-3">
                {pendingApprovalsList.length === 0 ? (
                  <div className="py-12 text-center text-xs text-ink-muted">
                    <CheckCircle2 className="w-8 h-8 text-accent-teal mx-auto mb-2 opacity-80" />
                    No pending leave requests to approve!
                  </div>
                ) : (
                  pendingApprovalsList.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-xl bg-canvas border border-border/80 hover:border-primary/40 transition-colors text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-ink">
                          {req.employee.firstName} {req.employee.lastName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-primary-soft text-primary font-bold text-[10px]">
                          {req.leaveType} &bull; {req.days} {req.days === 1 ? "day" : "days"}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-muted truncate">
                        &ldquo;{req.remarks || "No remarks provided"}&rdquo;
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-ink-light pt-1">
                        <span>{req.employee.department}</span>
                        <span>{new Date(req.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <Link
                href="/admin/leaves"
                className="w-full py-2 rounded-xl bg-primary-soft hover:bg-primary/10 text-center text-xs font-semibold text-primary block transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Open Approvals Console</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Leave Type Distribution */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading font-bold text-base text-ink">
                Leave-Type Distribution
              </h2>
              <p className="text-xs text-ink-muted">
                Year-to-date breakdown of approved leaves
              </p>
            </div>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.leaveDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.leaveDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    border: "1px solid #E7E5F5",
                    boxShadow: "0 4px 20px rgba(91,79,233,0.1)",
                    fontSize: "12px",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section: Employee Directory Preview & Switcher */}
        <div className="glass-card p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-heading font-bold text-base text-ink">
                Employee Directory & Switcher
              </h2>
              <p className="text-xs text-ink-muted">
                Search and inspect employee status, role assignments, and department data
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-ink-light absolute left-3 top-2.5" />
                <Input
                  type="text"
                  placeholder="Search name, code, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Department Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {departments.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  selectedDept === dept
                    ? "bg-primary text-white shadow-xs"
                    : "bg-surface border border-border text-ink-secondary hover:border-primary/30"
                }`}
              >
                {dept === "ALL" ? "All Departments" : dept.charAt(0) + dept.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Employee Table */}
          <div className="overflow-x-auto rounded-xl border border-border/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-border/80 text-ink-muted uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Job Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 bg-white">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-ink-muted">
                      No employees match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-canvas/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary-soft text-primary font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {emp.firstName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-ink block">
                              {emp.firstName} {emp.lastName}
                            </span>
                            <span className="text-[11px] text-ink-muted">
                              {emp.user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px] text-ink-secondary">
                        {emp.employeeCode}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-surface-muted border border-border font-medium text-[11px] text-ink">
                          {emp.department}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-ink-secondary">
                        {emp.jobTitle}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-accent-teal font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" /> Active
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/admin/employees/${emp.id}`}
                          className="px-2.5 py-1 rounded-lg bg-surface border border-border hover:border-primary/40 text-primary font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
