"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { ProfileView } from "@/components/profile/ProfileView";
import { Loader2, AlertCircle } from "lucide-react";

export default function EmployeeProfilePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/employees/me");
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to load profile");
        setIsLoading(false);
        return;
      }

      setProfile(data.data);
    } catch {
      setError("Network error loading profile");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <AppShell activeItem="profile">
      <div className="p-4 md:p-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-ink-muted">Loading your profile...</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto my-12 p-6 glass-card border-danger/30 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-danger mx-auto" />
            <div className="text-sm font-semibold text-ink">{error}</div>
            <button
              onClick={fetchProfile}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-white"
            >
              Retry
            </button>
          </div>
        ) : (
          profile && (
            <ProfileView
              profile={profile}
              currentUserRole="EMPLOYEE"
              onProfileUpdated={fetchProfile}
            />
          )
        )}
      </div>
    </AppShell>
  );
}
