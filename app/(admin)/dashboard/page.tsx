"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Shield, Sparkles, Building2, Users } from "lucide-react";

export default function AdminDashboardShell() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        if (data.data.user.role !== "ADMIN") {
          router.push("/employee/dashboard");
          return;
        }
        setUser(data.data.user);
        setLoading(false);
      })
      .catch(() => {
        router.push("/sign-in");
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/sign-in");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-ink">Loading Admin Operations Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-40 border-b border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-heading font-bold shadow-sm shadow-primary/30">
              D
            </div>
            <div>
              <span className="font-heading font-bold text-ink text-lg tracking-tight">Dayflow</span>
              <span className="text-[11px] text-primary font-semibold block -mt-1">Admin & HR Management</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-semibold text-ink">{user?.employee?.name || user?.email}</span>
              <span className="px-2 py-0.5 rounded-pill bg-primary-soft text-primary font-medium border border-primary/20 flex items-center gap-1">
                <Shield className="w-3 h-3" /> HR ADMIN
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-xs flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Welcome Banner */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 mb-8 border border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary-soft text-primary text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Admin Privileges Active</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink">
                HR Executive Console — {user?.employee?.name || "Anita Roy"}
              </h1>
              <p className="text-sm text-ink-secondary mt-1">
                {user?.employee?.jobTitle || "HR Operations Lead"} &bull; Full Organization Scope
              </p>
            </div>

            <div className="flex items-center gap-2 bg-surface p-3 rounded-xl border border-border text-xs text-ink-muted">
              <Users className="w-4 h-4 text-primary" />
              <span>Full CRUD & Approvals Governance</span>
            </div>
          </div>
        </div>

        {/* Phase 1 Verification Notice */}
        <div className="p-4 rounded-xl bg-primary-soft/70 border border-primary/30 text-ink text-xs mb-8">
          <p className="font-semibold text-primary mb-1">🛡️ Phase 1 — RBAC & Security Active</p>
          <p className="text-ink-secondary">
            Administrator session verified for <strong>{user?.email}</strong>. Phase 2 Admin KPI strip, employee list table, leave approvals queue, and attendance overview will be activated in the next phase.
          </p>
        </div>
      </main>
    </div>
  );
}
