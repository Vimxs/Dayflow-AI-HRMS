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
  Search,
  Check,
  X,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface AdminLeaveRequest {
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
  employee: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    department: string;
    jobTitle: string;
    email: string;
    profilePictureUrl: string | null;
  };
}

interface LeaveSummary {
  totalPending: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
}

export default function AdminLeavesPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<AdminLeaveRequest[]>([]);
  const [summary, setSummary] = useState<LeaveSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Review Modal state
  const [selectedRequest, setSelectedRequest] = useState<AdminLeaveRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const fetchAdminLeaves = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter !== "ALL") queryParams.set("status", statusFilter);
      if (deptFilter !== "ALL") queryParams.set("department", deptFilter);
      if (searchQuery.trim()) queryParams.set("search", searchQuery.trim());

      const res = await fetch(`/api/leaves?${queryParams.toString()}`);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push("/sign-in");
          return;
        }
        throw new Error("Failed to load leave requests");
      }
      const json = await res.json();
      if (json.success) {
        setRequests(json.data.requests);
        setSummary(json.data.summary);
      } else {
        setError(json.error);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminLeaves();
  }, [statusFilter, deptFilter, searchQuery, router]);

  const openReviewModal = (req: AdminLeaveRequest, action: "APPROVED" | "REJECTED") => {
    setSelectedRequest(req);
    setReviewAction(action);
    setReviewComment("");
    setReviewError(null);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !reviewAction) return;

    setIsReviewing(true);
    setReviewError(null);

    try {
      const res = await fetch(`/api/leaves/${selectedRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: reviewAction,
          reviewComment,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setReviewError(json.error || "Failed to process review");
      } else {
        setSelectedRequest(null);
        setReviewAction(null);
        setReviewComment("");
        await fetchAdminLeaves();
      }
    } catch {
      setReviewError("Network error while submitting leave review");
    } finally {
      setIsReviewing(false);
    }
  };

  const departments = [
    "ALL",
    "Engineering",
    "Sales",
    "Marketing",
    "Human Resources",
    "Finance",
    "Operations",
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas">
        <header className="h-16 border-b border-border bg-white/60" />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full animate-pulse space-y-6">
          <div className="h-32 rounded-3xl bg-surface-muted" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-24 rounded-2xl bg-surface-muted" />
            <div className="h-24 rounded-2xl bg-surface-muted" />
            <div className="h-24 rounded-2xl bg-surface-muted" />
          </div>
          <div className="h-96 rounded-2xl bg-surface-muted" />
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

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Executive Console
          </Link>
        </div>

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#EDEBFF] via-[#F4F1FF] to-[#FFF0EC] border border-primary/15 shadow-sm">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-primary/20 text-primary text-xs font-semibold shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Executive HR & Supervisor Authority</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
                Leave Approvals Console
              </h1>
              <p className="text-xs sm:text-sm text-ink-secondary">
                Review employee time-off applications, record supervisor approval notes, and synchronize workforce availability
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-white border border-border text-xs font-semibold text-ink shadow-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Audit-Logged Approvals
              </span>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-danger-soft border border-danger/30 text-danger text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* KPI Strip */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* KPI 1: Pending Approvals */}
            <div className="glass-card p-5 border-l-4 border-l-accent-coral flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-muted">Requires Review</span>
                <div className="w-8 h-8 rounded-xl bg-accent-coral/10 text-accent-coral flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-heading font-bold text-ink">
                  {summary.totalPending}
                </span>
                <span className="text-[11px] font-semibold text-accent-coral bg-accent-coral/10 px-2 py-0.5 rounded-full">
                  Pending Applications
                </span>
              </div>
            </div>

            {/* KPI 2: Approved This Month */}
            <div className="glass-card p-5 border-l-4 border-l-accent-teal flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-muted">Approved This Month</span>
                <div className="w-8 h-8 rounded-xl bg-accent-teal-soft text-accent-teal flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-heading font-bold text-ink">
                  {summary.approvedThisMonth}
                </span>
                <span className="text-[11px] font-semibold text-accent-teal bg-accent-teal-soft px-2 py-0.5 rounded-full">
                  Synchronized to Attendance
                </span>
              </div>
            </div>

            {/* KPI 3: Rejected This Month */}
            <div className="glass-card p-5 border-l-4 border-l-danger flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-muted">Rejected This Month</span>
                <div className="w-8 h-8 rounded-xl bg-danger-soft text-danger flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-heading font-bold text-ink">
                  {summary.rejectedThisMonth}
                </span>
                <span className="text-[11px] font-semibold text-danger bg-danger-soft px-2 py-0.5 rounded-full">
                  Declined with Feedback
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Approvals Table & Filters */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-heading font-bold text-base text-ink">
                Leave Requests & Approval Queue
              </h2>
              <p className="text-xs text-ink-muted">
                Review applicant remarks, check dates, and record official supervisor determinations
              </p>
            </div>

            {/* Search & Status Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-ink-light absolute left-3 top-2.5" />
                <Input
                  type="text"
                  placeholder="Search applicant or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              {/* Status Tab Pills */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-canvas border border-border/80 w-full sm:w-auto overflow-x-auto">
                {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
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
          </div>

          {/* Department Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-ink-muted mr-1">Department:</span>
            {departments.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setDeptFilter(dept)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  deptFilter === dept
                    ? "bg-primary text-white shadow-xs"
                    : "bg-surface border border-border text-ink-secondary hover:border-primary/30"
                }`}
              >
                {dept === "ALL" ? "All Departments" : dept}
              </button>
            ))}
          </div>

          {/* Approvals Table */}
          <div className="overflow-x-auto rounded-xl border border-border/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-border/80 text-ink-muted uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-4 py-3">Applicant</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Duration & Dates</th>
                  <th className="px-4 py-3">Applicant Remarks</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reviewer Notes</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 bg-white">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-xs text-ink-muted">
                      <CheckCircle2 className="w-8 h-8 text-accent-teal mx-auto mb-2 opacity-60" />
                      No leave applications found matching current criteria.
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => {
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
                        {/* Applicant */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary-soft text-primary font-bold flex items-center justify-center text-xs flex-shrink-0">
                              {req.employee.firstName.charAt(0)}
                            </div>
                            <div>
                              <span className="font-semibold text-ink block">
                                {req.employee.firstName} {req.employee.lastName}
                              </span>
                              <span className="font-mono text-[10px] text-ink-light block">
                                {req.employee.employeeCode}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-surface-muted border border-border font-medium text-[11px] text-ink">
                            {req.employee.department}
                          </span>
                        </td>

                        {/* Leave Type */}
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

                        {/* Duration & Dates */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-0.5">
                            <span className="font-bold text-ink block">
                              {req.days} {req.days === 1 ? "day" : "days"}
                            </span>
                            <span className="text-[10px] text-ink-light flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-ink-light" />
                              {new Date(req.startDate).toLocaleDateString()} &rarr;{" "}
                              {new Date(req.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </td>

                        {/* Remarks */}
                        <td className="px-4 py-3.5 text-ink max-w-[200px] truncate">
                          {req.remarks ? (
                            <span title={req.remarks}>&ldquo;{req.remarks}&rdquo;</span>
                          ) : (
                            <span className="text-ink-light italic">None</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusBadgeClass}`}
                          >
                            {statusIcon}
                            <span>{req.status}</span>
                          </span>
                        </td>

                        {/* Reviewer Details */}
                        <td className="px-4 py-3.5 text-ink-secondary text-[11px]">
                          {req.reviewedBy ? (
                            <div className="space-y-0.5">
                              <span className="font-semibold text-ink block">{req.reviewedBy}</span>
                              {req.reviewComment && (
                                <p className="text-[10px] text-ink-muted italic truncate max-w-[150px]" title={req.reviewComment}>
                                  &ldquo;{req.reviewComment}&rdquo;
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-ink-light italic">Pending</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          {req.status === "PENDING" ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openReviewModal(req, "APPROVED")}
                                className="px-2.5 py-1 rounded-lg bg-accent-teal text-white hover:bg-accent-teal/90 text-[11px] font-semibold inline-flex items-center gap-1 shadow-xs transition-colors"
                              >
                                <Check className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openReviewModal(req, "REJECTED")}
                                className="px-2.5 py-1 rounded-lg border border-danger/30 text-danger hover:bg-danger-soft text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
                              >
                                <X className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-ink-light">Completed</span>
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

      {/* Review Modal Dialog (T5.3) */}
      {selectedRequest && reviewAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 space-y-5 bg-white shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    reviewAction === "APPROVED"
                      ? "bg-accent-teal-soft text-accent-teal"
                      : "bg-danger-soft text-danger"
                  }`}
                >
                  {reviewAction === "APPROVED" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                </div>
                <h2 className="font-heading font-bold text-base text-ink">
                  {reviewAction === "APPROVED" ? "Approve Time-Off Request" : "Reject Time-Off Request"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedRequest(null);
                  setReviewAction(null);
                }}
                className="p-1 rounded-lg text-ink-light hover:bg-surface-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reviewError && (
              <div className="p-3 rounded-lg bg-danger-soft border border-danger/30 text-danger text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}

            {/* Applicant Summary Card */}
            <div className="p-3.5 rounded-xl bg-canvas border border-border/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink">
                  {selectedRequest.employee.firstName} {selectedRequest.employee.lastName}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-primary-soft text-primary font-bold text-[10px]">
                  {selectedRequest.leaveType} &bull; {selectedRequest.days}{" "}
                  {selectedRequest.days === 1 ? "day" : "days"}
                </span>
              </div>
              <div className="text-[11px] text-ink-secondary flex items-center justify-between">
                <span>{selectedRequest.employee.department}</span>
                <span>
                  {new Date(selectedRequest.startDate).toLocaleDateString()} &rarr;{" "}
                  {new Date(selectedRequest.endDate).toLocaleDateString()}
                </span>
              </div>
              {selectedRequest.remarks && (
                <p className="text-[11px] text-ink-muted italic border-t border-border pt-1.5">
                  &ldquo;{selectedRequest.remarks}&rdquo;
                </p>
              )}
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <Label htmlFor="reviewComment" className="text-xs">
                  {reviewAction === "APPROVED"
                    ? "Supervisor Approval Notes (Optional)"
                    : "Reason for Rejection (Recommended)"}
                </Label>
                <div className="relative mt-1">
                  <textarea
                    id="reviewComment"
                    rows={3}
                    placeholder={
                      reviewAction === "APPROVED"
                        ? "e.g. Approved. Tasks successfully handed over."
                        : "e.g. Incomplete sprint deliverables / staffing shortfall on requested dates."
                    }
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    maxLength={500}
                    className="w-full text-xs rounded-xl border border-border p-3 text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-[10px] text-ink-light absolute right-2.5 bottom-2.5">
                    {reviewComment.length}/500
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRequest(null);
                    setReviewAction(null);
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isReviewing}
                  className={`text-xs ${
                    reviewAction === "APPROVED"
                      ? "bg-accent-teal hover:bg-accent-teal/90"
                      : "bg-danger hover:bg-danger/90"
                  }`}
                >
                  {reviewAction === "APPROVED" ? "Confirm Approval" : "Confirm Rejection"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
