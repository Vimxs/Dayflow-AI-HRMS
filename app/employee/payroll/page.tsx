"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/shared/AppHeader";
import { SalaryCard } from "@/components/payroll/SalaryCard";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  FileText,
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface PayrollData {
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
  } | null;
}

function getMonthLabel(month: string) {
  const [y, m] = month.split("-");
  return new Date(`${y}-${m}-01`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function adjustMonth(current: string, delta: number): string {
  const [y, m] = current.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function EmployeePayrollPage() {
  const router = useRouter();
  const [data, setData] = useState<PayrollData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.employee?.id) {
          setEmployeeId(json.data.employee.id);
        } else {
          router.push("/sign-in");
        }
      })
      .catch(() => router.push("/sign-in"));
  }, [router]);

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/payroll/${employeeId}`)
      .then((res) => {
        if (res.status === 401) { router.push("/sign-in"); return null; }
        return res.json();
      })
      .then((json) => {
        if (!json) return;
        if (json.success) setData(json.data);
        else setError(json.error);
      })
      .catch(() => setError("Failed to load payroll data"))
      .finally(() => setLoading(false));
  }, [employeeId, router]);

  const handleDownloadSlip = async () => {
    if (!employeeId) return;
    setIsDownloading(true);
    try {
      const res = await fetch(`/api/payroll/${employeeId}/slip?month=${selectedMonth}`);
      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "Failed to generate salary slip");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `salary-slip-${selectedMonth}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Network error while downloading salary slip");
    } finally {
      setIsDownloading(false);
    }
  };

  const canGoNext = selectedMonth < currentMonth;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas">
        <header className="h-16 border-b border-border bg-white/60" />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full animate-pulse space-y-6">
          <div className="h-48 rounded-2xl bg-surface-muted" />
          <div className="h-32 rounded-2xl bg-surface-muted" />
        </main>
      </div>
    );
  }

  const hasPayroll = !!data?.payroll;

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      {data && (
        <AppHeader
          user={{
            email: data.employee.email,
            role: "EMPLOYEE",
            employee: {
              firstName: data.employee.firstName,
              lastName: data.employee.lastName,
              jobTitle: data.employee.jobTitle,
              department: data.employee.department,
              employeeCode: data.employee.employeeCode,
            },
          }}
        />
      )}

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        <div>
          <Link
            href="/employee/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-ink">Salary & Compensation</h1>
            <p className="text-xs text-ink-muted mt-0.5">
              Your confidential salary structure and monthly salary slips
            </p>
          </div>

          {hasPayroll && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl border border-border bg-white px-1 py-1">
                <button
                  type="button"
                  onClick={() => setSelectedMonth(adjustMonth(selectedMonth, -1))}
                  className="p-1.5 rounded-lg hover:bg-canvas text-ink-secondary"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-ink min-w-28 text-center px-1">
                  <Calendar className="w-3 h-3 inline mr-1 text-primary" />
                  {getMonthLabel(selectedMonth)}
                </span>
                <button
                  type="button"
                  onClick={() => canGoNext && setSelectedMonth(adjustMonth(selectedMonth, 1))}
                  disabled={!canGoNext}
                  className="p-1.5 rounded-lg hover:bg-canvas text-ink-secondary disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <Button
                size="sm"
                onClick={handleDownloadSlip}
                isLoading={isDownloading}
                className="text-xs flex items-center gap-1.5 shadow-sm shadow-primary/20"
              >
                <Download className="w-3.5 h-3.5" /> Download Slip
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-danger-soft border border-danger/30 text-danger text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {hasPayroll ? (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <h2 className="font-heading font-bold text-base text-ink">Salary Structure</h2>
              </div>
              <span className="text-[11px] font-semibold text-primary px-2.5 py-0.5 rounded-full bg-primary-soft">
                Confidential
              </span>
            </div>
            <SalaryCard
              baseSalary={data!.payroll!.baseSalary}
              allowances={data!.payroll!.allowances}
              deductions={data!.payroll!.deductions}
              effectiveFrom={data!.payroll!.effectiveFrom}
            />
          </div>
        ) : (
          <div className="glass-card p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-muted mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6 text-ink-light" />
            </div>
            <h3 className="font-heading font-bold text-base text-ink">Payroll Not Configured</h3>
            <p className="text-xs text-ink-muted max-w-xs mx-auto">
              Your salary structure is being set up by HR Operations. Please check back later or
              contact your HR team.
            </p>
          </div>
        )}

        {hasPayroll && (
          <div className="p-4 rounded-xl bg-primary-soft/40 border border-primary/15 text-xs text-ink-secondary flex items-start gap-2.5">
            <FileText className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-primary">Salary Slip Download</p>
              <p className="mt-0.5">
                Use the month selector and &ldquo;Download Slip&rdquo; to generate a
                Dayflow-branded PDF salary slip for any completed month. Slips are generated
                on-demand and not stored on our servers.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
