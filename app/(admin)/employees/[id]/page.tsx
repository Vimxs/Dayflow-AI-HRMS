"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shared/AppShell";
import { ProfileView } from "@/components/profile/ProfileView";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";

export default function AdminEmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const employeeId = resolvedParams.id;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployee = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/employees/${employeeId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to load employee details");
        setIsLoading(false);
        return;
      }

      const emp = data.data;
      setProfile({
        id: emp.id,
        userId: emp.user.id,
        email: emp.user.email,
        role: emp.user.role,
        employeeCode: emp.employeeCode,
        firstName: emp.firstName,
        lastName: emp.lastName,
        phone: emp.phone,
        address: emp.address,
        jobTitle: emp.jobTitle,
        department: emp.department,
        dateOfJoining: emp.dateOfJoining,
        profilePictureUrl: emp.profilePictureUrl,
        payroll: emp.payroll,
        documents: emp.documents || [],
      });
    } catch {
      setError("Network error loading employee details");
    } finally {
      setIsLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  return (
    <AppShell activeItem="employees">
      <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Link
            href="/employees"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Employee Directory
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-ink-muted">Loading employee record...</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto my-12 p-6 glass-card border-danger/30 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-danger mx-auto" />
            <div className="text-sm font-semibold text-ink">{error}</div>
            <Link
              href="/employees"
              className="inline-block px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-white"
            >
              Return to Directory
            </Link>
          </div>
        ) : (
          profile && (
            <ProfileView
              profile={profile}
              currentUserRole="ADMIN"
              onProfileUpdated={fetchEmployee}
            />
          )
        )}
      </div>
    </AppShell>
  );
}
