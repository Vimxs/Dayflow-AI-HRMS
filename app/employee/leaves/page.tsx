"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/shared/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Plus,
  Trash2,
  CalendarDays,
  FileText,
  X,
  Sparkles,
} from "lucide-react";

interface LeaveRequestItem {
  id: string;
  leaveType: "PAID" | "SICK" | "UNPAID";
  startDate: string;
  endDate: string;
  days: number;
  remarks: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedBy: string | null;
  reviewComment: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

interface LeaveBalances {
  paidTotal: number;
  paidUsed: number;
  paidRemaining: number;
  sickTotal: number;
  sickUsed: number;
  sickRemaining: number;
  unpaidUsed: number;
  pendingCount: number;
}

export default function EmployeeLeavesPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<LeaveRequestItem[]>([]);
  const [balances, setBalances] = useState<LeaveBalances | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Apply Leave Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<"PAID" | "SICK" | "UNPAID">("PAID");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // User session info
  const [userProfile, setUserProfile] = useState<{
    email: string;
    role: string;
    employee?: {
      firstName?: string;
      lastName?: string;
      jobTitle?: string;
      department?: string;
      employeeCode?: string;
    };
  } | null>(null);

  const fetchLeaves = async () => {
    try {
      const res = await fetch("/api/leaves");
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/sign-in");
          return;
        }
        throw new Error("Failed to fetch leave records");
      }
      const json = await res.json();
      if (json.success) {
        setRequests(json.data.requests);
        setBalances(json.data.balances);
      } else {
        setError(json.error);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load leave records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch profile for header
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success) {
          setUserProfile({
            email: json.data.profile.email,
            role: json.data.profile.role,
            employee: {
              firstName: json.data.profile.firstName,
              lastName: json.data.profile.lastName,
              jobTitle: json.data.profile.jobTitle,
              department: json.data.profile.department,
              employeeCode: json.data.profile.employeeCode,
            },
          });
        }
      })
      .catch(() => {});

    fetchLeaves();
  }, [router]);

  const calculateDaysBetween = (start: string, end: string) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || s > e) return 0;
    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const durationDays = calculateDaysBetween(startDate, endDate);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!startDate || !endDate) {
      setFormError("Please select both start and end dates.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setFormError("End date must be on or after start date.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaveType,
          startDate,
          endDate,
          remarks,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setFormError(json.error || "Failed to submit leave application");
      } else {
        setFormSuccess("Leave application submitted successfully!");
        setStartDate("");
        setEndDate("");
        setRemarks("");
        // Refresh leaves and balances
        await fetchLeaves();
        setTimeout(() => {
          setIsModalOpen(false);
          setFormSuccess(null);
        }, 1500);
      }
    } catch {
      setFormError("A network error occurred while submitting your leave application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelLeave = async (id: string) => {
    if (!confirm("Are you sure you want to withdraw this pending leave request?")) return;

    try {
      const res = await fetch(`/api/leaves/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error || "Failed to cancel leave request");
      } else {
        await fetchLeaves();
      }
    } catch {
      alert("Network error while cancelling leave request");
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === "ALL") return true;
    return r.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas">
        <header className="h-16 border-b border-border bg-white/60" />
        <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full animate-pulse space-y-6">
          <div className="h-32 rounded-3xl bg-surface-muted" />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="h-24 rounded-2xl bg-surface-muted" />
            <div className="h-24 rounded-2xl bg-surface-muted" />
            <div className="h-24 rounded-2xl bg-surface-muted" />
            <div className="h-24 rounded-2xl bg-surface-muted" />
          </div>
          <div className="h-72 rounded-2xl bg-surface-muted" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <AppHeader user={userProfile} />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/employee/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
        </div>

        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#EDEBFF] via-[#F4F1FF] to-[#FFF0EC] border border-primary/15 shadow-sm">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-primary/20 text-primary text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Self-Service Time-Off Management</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
                Leave & Absence Portal
              </h1>
              <p className="text-xs sm:text-sm text-ink-secondary">
                Track your annual paid & sick leave balances, submit time-off requests, and monitor approval status
              </p>
            </div>

            <Button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 shadow-sm shadow-primary/25 flex items-center gap-2 transition-all flex-shrink-0"
            >
              <Plus className="w-4 h-4" /> Apply for Leave
            </Button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-danger-soft border border-danger/30 text-danger text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4 Leave Balances KPI Cards (T5.2) */}
        {balances && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Paid Leave */}
            <div className="glass-card p-5 border-l-4 border-l-primary flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-muted">Paid Leave</span>
                <span className="px-2 py-0.5 rounded-full bg-primary-soft text-primary font-bold text-[10px]">
                  Annual 18d
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-heading font-bold text-ink">
                    {balances.paidRemaining}
                  </span>
                  <span className="text-xs text-ink-light font-medium">
                    {balances.paidUsed} days used
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-2.5 w-full bg-border rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (balances.paidRemaining / balances.paidTotal) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Sick Leave */}
            <div className="glass-card p-5 border-l-4 border-l-accent-teal flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-muted">Sick Leave</span>
                <span className="px-2 py-0.5 rounded-full bg-accent-teal-soft text-accent-teal font-bold text-[10px]">
                  Annual 12d
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-heading font-bold text-ink">
                    {balances.sickRemaining}
                  </span>
                  <span className="text-xs text-ink-light font-medium">
                    {balances.sickUsed} days used
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-2.5 w-full bg-border rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-accent-teal h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (balances.sickRemaining / balances.sickTotal) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Unpaid Leave */}
            <div className="glass-card p-5 border-l-4 border-l-accent-amber flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-muted">Unpaid Leave</span>
                <span className="px-2 py-0.5 rounded-full bg-accent-amber/10 text-accent-amber font-bold text-[10px]">
                  LWP
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-heading font-bold text-ink">
                  {balances.unpaidUsed}
                </span>
                <span className="text-xs text-ink-light font-medium">
                  days taken
                </span>
              </div>
            </div>

            {/* Card 4: Pending Approvals */}
            <div className="glass-card p-5 border-l-4 border-l-accent-coral flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-muted">Pending Review</span>
                <div className="w-7 h-7 rounded-lg bg-accent-coral/10 text-accent-coral flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-heading font-bold text-ink">
                  {balances.pendingCount}
                </span>
                <span className="text-[11px] font-semibold text-accent-coral bg-accent-coral/10 px-2 py-0.5 rounded-full">
                  Under HR Review
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Leave Requests Table & Filters (T5.2) */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-heading font-bold text-base text-ink">
                My Leave Applications
              </h2>
              <p className="text-xs text-ink-muted">
                Complete history of your time-off submissions and approval logs
              </p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-canvas border border-border/80 self-start sm:self-auto">
              {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === status
                      ? "bg-white text-primary shadow-xs border border-primary/20"
                      : "text-ink-secondary hover:text-ink"
                  }`}
                >
                  {status === "ALL"
                    ? "All"
                    : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-border/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-border/80 text-ink-muted uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Remarks</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reviewer Details</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 bg-white">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-xs text-ink-muted">
                      <CalendarDays className="w-8 h-8 text-ink-light mx-auto mb-2 opacity-50" />
                      No leave requests found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => {
                    let statusBadgeClass = "bg-accent-coral/10 text-accent-coral border-accent-coral/20";
                    let statusIcon = <Clock className="w-3 h-3" />;

                    if (req.status === "APPROVED") {
                      statusBadgeClass = "bg-accent-teal-soft text-accent-teal border-accent-teal/20";
                      statusIcon = <CheckCircle2 className="w-3 h-3" />;
                    } else if (req.status === "REJECTED") {
                      statusBadgeClass = "bg-danger-soft text-danger border-danger/20";
                      statusIcon = <XCircle className="w-3 h-3" />;
                    }

                    return (
                      <tr key={req.id} className="hover:bg-canvas/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1 ${
                              req.leaveType === "PAID"
                                ? "bg-primary-soft text-primary"
                                : req.leaveType === "SICK"
                                ? "bg-accent-teal-soft text-accent-teal"
                                : "bg-surface-muted text-ink"
                            }`}
                          >
                            {req.leaveType}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-ink">
                          {req.days} {req.days === 1 ? "day" : "days"}
                        </td>
                        <td className="px-4 py-3.5 text-ink-secondary">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-ink-light flex-shrink-0" />
                            <span>
                              {new Date(req.startDate).toLocaleDateString()} &rarr;{" "}
                              {new Date(req.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-ink max-w-xs truncate">
                          {req.remarks ? (
                            <span title={req.remarks}>&ldquo;{req.remarks}&rdquo;</span>
                          ) : (
                            <span className="text-ink-light italic">None provided</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusBadgeClass}`}
                          >
                            {statusIcon}
                            <span>{req.status}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-ink-secondary text-[11px]">
                          {req.reviewedBy ? (
                            <div className="space-y-0.5">
                              <span className="font-semibold text-ink block">{req.reviewedBy}</span>
                              {req.reviewComment && (
                                <p className="text-[10px] text-ink-muted italic truncate max-w-[150px]">
                                  &ldquo;{req.reviewComment}&rdquo;
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-ink-light italic">Pending Review</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {req.status === "PENDING" && (
                            <button
                              type="button"
                              onClick={() => handleCancelLeave(req.id)}
                              className="px-2.5 py-1 rounded-lg border border-danger/30 text-danger hover:bg-danger-soft text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
                              title="Withdraw leave request"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Withdraw</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Apply for Leave Modal Dialog (T5.1) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 space-y-5 bg-white shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="font-heading font-bold text-base text-ink">
                  Apply for Time-Off
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-ink-light hover:bg-surface-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-danger-soft border border-danger/30 text-danger text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 rounded-lg bg-accent-teal-soft border border-accent-teal/30 text-accent-teal text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleApplyLeave} className="space-y-4">
              {/* Leave Type Selector */}
              <div>
                <Label htmlFor="leaveType" className="text-xs">Leave Category</Label>
                <select
                  id="leaveType"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as "PAID" | "SICK" | "UNPAID")}
                  className="w-full mt-1.5 text-xs rounded-xl border border-border px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="PAID">Paid Leave (Annual Entitlement)</option>
                  <option value="SICK">Sick / Medical Leave</option>
                  <option value="UNPAID">Unpaid Leave (Leave Without Pay)</option>
                </select>
              </div>

              {/* Date Range Pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="startDate" className="text-xs">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-xs">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              {/* Dynamic Duration Indicator */}
              {durationDays > 0 && (
                <div className="p-3 rounded-xl bg-primary-soft/50 border border-primary/20 flex items-center justify-between text-xs text-primary">
                  <span className="font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Total Duration:
                  </span>
                  <span className="font-bold font-heading">
                    {durationDays} {durationDays === 1 ? "Calendar Day" : "Calendar Days"}
                  </span>
                </div>
              )}

              {/* Remarks Textarea */}
              <div>
                <Label htmlFor="remarks" className="text-xs">
                  Reason / Handover Notes (Optional)
                </Label>
                <div className="relative mt-1">
                  <textarea
                    id="remarks"
                    rows={3}
                    placeholder="Briefly state the reason for absence and any emergency contact info..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    maxLength={500}
                    className="w-full text-xs rounded-xl border border-border p-3 text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-[10px] text-ink-light absolute right-2.5 bottom-2.5">
                    {remarks.length}/500
                  </span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isSubmitting}
                  className="text-xs"
                >
                  Submit Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
