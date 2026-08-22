"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/shared/AppHeader";
import { SalaryCard } from "@/components/payroll/SalaryCard";
import { PayrollEditForm } from "@/components/payroll/PayrollEditForm";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  Calendar,
  Activity,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";

interface EmployeePayrollDetail {
  employee: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    jobTitle: string;
    dateOfJoining: string;
  };
  payroll: {
    id: string;
    baseSalary: number;
    allowances: number;
    deductions: number;
    netSalary: number;
    effectiveFrom: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  auditHistory: Array<{
    id: string;
    action: string;
    createdAt: string;
    metadata: string | null;
  }>;
}

function getMonthLabel(month: string) {
  const [y, m] = month.split("-");
  return new Date(`${y}-${m}-01`).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function adjustMonth(current: string, delta: number): string {
  const [y, m] = current.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function AdminPayrollDetailPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params?.employeeId as string;

  const [data, setData] = useState<EmployeePayrollDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/payroll/${employeeId}`);
      if (res.status === 401) { router.push("/sign-in"); return; }
      if (res.status === 403) { router.push("/employee/dashboard"); return; }
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError(json.error);
    } catch {
      setError("Failed to load payroll details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (employeeId) fetchData(); }, [employeeId]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch(`/api/payroll/${employeeId}/slip?month=${selectedMonth}`);
      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "Failed to generate slip");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `salary-slip-${data?.employee.employeeCode || employeeId}-${selectedMonth}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Network error while downloading");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Permanently delete this payroll record? This cannot be undone.")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/payroll/${employeeId}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok && json.success) router.push("/admin/payroll");
      else alert(json.error || "Failed to delete");
    } catch {
      alert("Network error during delete");
    } finally {
      setIsDeleting(false);
    }
  };

  const canGoNext = selectedMonth < currentMonth;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas">
        <header className="h-16 border-b border-border bg-white/60" />
        <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full animate-pulse space-y-6">
          <div className="h-48 rounded-2xl bg-surface-muted" />
          <div className="grid grid-cols-2 gap-6">
            <div className="h-64 rounded-2xl bg-surface-muted" />
            <div className="h-64 rounded-2xl bg-surface-muted" />
          </div>
        </main>
      </div>
    );
  }

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

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        <Link
          href="/admin/payroll"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Payroll Directory
        </Link>

        {error && !data && (
          <div className="p-4 rounded-xl bg-danger-soft border border-danger/30 text-danger text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {data && (
          <>
            {/* Header Banner */}
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#EDEBFF] via-[#F4F1FF] to-[#E6F8F5] border border-primary/15 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="w-20 h-20 rounded-2xl bg-primary text-white flex items-center justify-center font-heading font-bold text-3xl shadow-md shadow-primary/20 flex-shrink-0">
                  {data.employee.firstName.charAt(0)}
                </div>
                <div className="space-y-1 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <h1 className="text-2xl font-heading font-bold text-ink">
                      {data.employee.firstName} {data.employee.lastName}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-primary-soft text-primary text-[11px] font-bold border border-primary/20">
                      {data.employee.employeeCode}
                    </span>
                  </div>
                  <p className="text-xs text-ink-secondary">
                    {data.employee.jobTitle} · {data.employee.department}
                  </p>
                  <p className="text-xs text-ink-light flex items-center gap-1 justify-center sm:justify-start">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    Joined {new Date(data.employee.dateOfJoining).toLocaleDateString()}
                  </p>
                </div>

                {data.payroll && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1 rounded-xl border border-border bg-white px-1 py-1">
                      <button
                        type="button"
                        onClick={() => setSelectedMonth(adjustMonth(selectedMonth, -1))}
                        className="p-1.5 rounded-lg hover:bg-canvas text-ink-secondary"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[11px] font-semibold text-ink min-w-24 text-center px-1">
                        {getMonthLabel(selectedMonth)}
                      </span>
                      <button
                        type="button"
                        onClick={() => canGoNext && setSelectedMonth(adjustMonth(selectedMonth, 1))}
                        disabled={!canGoNext}
                        className="p-1.5 rounded-lg hover:bg-canvas text-ink-secondary disabled:opacity-30"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleDownload}
                      isLoading={isDownloading}
                      className="text-xs flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Slip
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Salary Card */}
            <div className="glass-card p-6">
              <h2 className="font-heading font-bold text-base text-ink mb-5 pb-4 border-b border-border">
                Current Salary Structure
              </h2>
              {data.payroll ? (
                <SalaryCard
                  baseSalary={data.payroll.baseSalary}
                  allowances={data.payroll.allowances}
                  deductions={data.payroll.deductions}
                  effectiveFrom={data.payroll.effectiveFrom}
                />
              ) : (
                <p className="text-xs text-ink-muted py-4 text-center">No payroll configured yet.</p>
              )}
            </div>

            {/* Edit + Audit 2-col */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 space-y-4">
                <h2 className="font-heading font-bold text-base text-ink pb-3 border-b border-border">
                  {data.payroll ? "Edit Salary Structure" : "Configure Payroll"}
                </h2>
                <PayrollEditForm
                  employeeId={employeeId}
                  currentPayroll={data.payroll}
                  onSuccess={fetchData}
                />
                {data.payroll && (
                  <div className="pt-4 border-t border-border/60">
                    <p className="text-[11px] text-ink-muted mb-2 font-semibold">Danger Zone</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDelete}
                      isLoading={isDeleting}
                      className="text-xs text-danger border-danger/30 hover:bg-danger-soft hover:border-danger flex items-center gap-1.5 w-full justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Payroll Record (Audit Logged)
                    </Button>
                  </div>
                )}
              </div>

              <div className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-border">
                  <Activity className="w-4 h-4 text-primary" />
                  <h2 className="font-heading font-bold text-base text-ink">Payroll Audit Trail</h2>
                </div>
                <p className="text-xs text-ink-muted">All salary changes are immutably recorded.</p>
                <div className="divide-y divide-border/60 rounded-xl border border-border/80 overflow-hidden bg-white max-h-72 overflow-y-auto">
                  {data.auditHistory.length === 0 ? (
                    <div className="py-8 text-center text-xs text-ink-muted">No audit records yet.</div>
                  ) : (
                    data.auditHistory.map((log) => (
                      <div key={log.id} className="p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-bold text-primary text-[11px] truncate">
                            {log.action}
                          </span>
                          <span className="text-[10px] text-ink-light whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {log.metadata && (
                          <p className="text-[10px] text-ink-muted font-mono bg-canvas p-1.5 rounded truncate">
                            {log.metadata}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
