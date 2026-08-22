"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/shared/AppHeader";
import { SalaryCard } from "@/components/payroll/SalaryCard";
import { PayrollEditForm } from "@/components/payroll/PayrollEditForm";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  DollarSign,
  AlertCircle,
  Settings,
  X,
  Download,
} from "lucide-react";

interface EmployeePayrollRow {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  jobTitle: string;
  hasPayroll: boolean;
  payroll: {
    id: string;
    baseSalary: number;
    allowances: number;
    deductions: number;
    netSalary: number;
    effectiveFrom: string;
  } | null;
}

const DEPARTMENTS = ["ALL", "ENGINEERING", "SALES", "MARKETING", "HR", "FINANCE", "OPERATIONS"];

export default function AdminPayrollPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeePayrollRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [drawerEmployee, setDrawerEmployee] = useState<EmployeePayrollRow | null>(null);

  const fetchPayroll = async () => {
    try {
      const res = await fetch("/api/payroll");
      if (res.status === 401) { router.push("/sign-in"); return; }
      if (res.status === 403) { router.push("/employee/dashboard"); return; }
      const json = await res.json();
      if (json.success) setEmployees(json.data.employees);
      else setError(json.error);
    } catch {
      setError("Failed to load payroll data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayroll(); }, []);

  const filtered = useMemo(() => {
    return employees.filter((emp) => {
      const matchesDept = selectedDept === "ALL" || emp.department === selectedDept;
      const q = searchQuery.toLowerCase();
      const matchesQ =
        !q ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(q) ||
        emp.employeeCode.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q);
      return matchesDept && matchesQ;
    });
  }, [employees, searchQuery, selectedDept]);

  const totalPayroll = filtered.reduce((acc, emp) => acc + (emp.payroll?.netSalary || 0), 0);
  const configured = filtered.filter((e) => e.hasPayroll).length;

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

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Operations Hub
            </Link>
            <h1 className="text-2xl font-heading font-bold text-ink">Payroll Management</h1>
            <p className="text-xs text-ink-muted">
              Configure and manage salary structures for all employees
            </p>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-5">
            <p className="text-xs text-ink-muted">Total Monthly Payroll</p>
            <p className="text-2xl font-heading font-bold text-ink mt-1">
              ${totalPayroll.toLocaleString()}
            </p>
            <p className="text-[11px] text-ink-light mt-0.5">Across {filtered.length} employees</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-xs text-ink-muted">Configured Payrolls</p>
            <p className="text-2xl font-heading font-bold text-accent-teal mt-1">{configured}</p>
            <p className="text-[11px] text-ink-light mt-0.5">of {filtered.length} total</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-xs text-ink-muted">Pending Configuration</p>
            <p className="text-2xl font-heading font-bold text-accent-coral mt-1">
              {filtered.length - configured}
            </p>
            <p className="text-[11px] text-ink-light mt-0.5">Need payroll setup</p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-ink-light absolute left-3 top-2.5" />
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DEPARTMENTS.map((dept) => (
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
                {dept === "ALL" ? "All" : dept.charAt(0) + dept.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-danger-soft border border-danger/30 text-danger text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Table */}
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-ink-muted animate-pulse">Loading payroll records...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-canvas border-b border-border/80 text-ink-muted uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Base</th>
                    <th className="px-4 py-3">Allowances</th>
                    <th className="px-4 py-3">Deductions</th>
                    <th className="px-4 py-3">Net Pay</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-white">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-xs text-ink-muted">
                        No employees match your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((emp) => (
                      <tr key={emp.id} className="hover:bg-canvas/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary-soft text-primary font-bold text-xs flex items-center justify-center flex-shrink-0">
                              {emp.firstName.charAt(0)}
                            </div>
                            <div>
                              <span className="font-semibold text-ink block">
                                {emp.firstName} {emp.lastName}
                              </span>
                              <span className="text-[11px] text-ink-muted font-mono">
                                {emp.employeeCode}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-surface-muted border border-border font-medium text-[11px]">
                            {emp.department}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-ink">
                          {emp.payroll ? `$${emp.payroll.baseSalary.toLocaleString()}` : "—"}
                        </td>
                        <td className="px-4 py-3.5 text-accent-teal font-semibold">
                          {emp.payroll ? `+$${emp.payroll.allowances.toLocaleString()}` : "—"}
                        </td>
                        <td className="px-4 py-3.5 text-danger font-semibold">
                          {emp.payroll ? `-$${emp.payroll.deductions.toLocaleString()}` : "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          {emp.payroll ? (
                            <span className="font-heading font-bold text-primary flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {emp.payroll.netSalary.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-ink-light italic">Not set</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {emp.hasPayroll ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-accent-teal font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-accent-coral font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-accent-coral" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setDrawerEmployee(emp)}
                              className="px-2.5 py-1 rounded-lg bg-primary-soft border border-primary/20 text-primary font-semibold text-[11px] inline-flex items-center gap-1 hover:bg-primary hover:text-white transition-colors"
                            >
                              <Settings className="w-3 h-3" />
                              {emp.hasPayroll ? "Edit" : "Configure"}
                            </button>
                            <Link
                              href={`/admin/payroll/${emp.id}`}
                              className="px-2.5 py-1 rounded-lg bg-surface border border-border hover:border-primary/40 text-ink-secondary font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                            >
                              <ArrowRight className="w-3 h-3" />
                              Details
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Quick-Edit Drawer */}
      {drawerEmployee && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-xs"
            onClick={() => setDrawerEmployee(null)}
          />
          <div className="relative z-10 w-full max-w-md bg-white shadow-xl flex flex-col animate-in slide-in-from-right-full h-full">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="font-heading font-bold text-base text-ink">
                  {drawerEmployee.hasPayroll ? "Edit" : "Create"} Payroll
                </h2>
                <p className="text-xs text-ink-muted">
                  {drawerEmployee.firstName} {drawerEmployee.lastName} · {drawerEmployee.employeeCode}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDrawerEmployee(null)}
                className="p-1.5 rounded-lg hover:bg-canvas text-ink-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {drawerEmployee.payroll && (
                <div className="rounded-xl border border-border overflow-hidden p-3">
                  <SalaryCard
                    baseSalary={drawerEmployee.payroll.baseSalary}
                    allowances={drawerEmployee.payroll.allowances}
                    deductions={drawerEmployee.payroll.deductions}
                    effectiveFrom={drawerEmployee.payroll.effectiveFrom}
                    compact
                  />
                </div>
              )}

              <PayrollEditForm
                employeeId={drawerEmployee.id}
                currentPayroll={drawerEmployee.payroll}
                onSuccess={() => { setDrawerEmployee(null); fetchPayroll(); }}
              />

              {drawerEmployee.hasPayroll && (
                <Link
                  href={`/admin/payroll/${drawerEmployee.id}`}
                  className="w-full text-xs flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-border hover:border-primary/30 text-ink-secondary hover:text-primary transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  View Audit Trail & Download Slips
                  <ArrowRight className="w-3 h-3 ml-auto" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
