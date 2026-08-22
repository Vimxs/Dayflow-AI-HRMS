"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { LogOut, Shield, User } from "lucide-react";

interface AppHeaderProps {
  user: {
    name?: string;
    email: string;
    role: string;
    employee?: {
      firstName?: string;
      lastName?: string;
      jobTitle?: string;
      department?: string;
      employeeCode?: string;
    } | null;
  } | null;
}

export function AppHeader({ user }: AppHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/sign-in");
      router.refresh();
    }
  };

  const isAdmin = user?.role === "ADMIN";
  const displayName =
    user?.employee?.firstName && user?.employee?.lastName
      ? `${user.employee.firstName} ${user.employee.lastName}`
      : user?.name || user?.email.split("@")[0] || "User";

  return (
    <header className="glass-panel sticky top-0 z-40 border-b border-border/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl text-white flex items-center justify-center font-heading font-bold shadow-sm ${
              isAdmin
                ? "bg-primary shadow-primary/30"
                : "bg-accent-teal shadow-accent-teal/30"
            }`}
          >
            D
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-ink text-lg tracking-tight">
                Dayflow
              </span>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                  isAdmin
                    ? "bg-primary-soft text-primary border border-primary/20"
                    : "bg-accent-teal-soft text-accent-teal border border-accent-teal/20"
                }`}
              >
                {isAdmin ? "Admin Console" : "Employee Portal"}
              </span>
            </div>
            <span className="text-[11px] text-ink-muted hidden sm:block -mt-0.5">
              Single-Tenant AI HRMS & Payroll
            </span>
          </div>
        </div>

        {/* Right Actions: Notification Bell + User Badge + Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          <NotificationBell />

          <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-surface-muted border border-border flex items-center justify-center text-xs font-bold text-ink-secondary">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="text-left text-xs">
              <span className="font-semibold text-ink block leading-tight">
                {displayName}
              </span>
              <span className="text-[10px] text-ink-muted flex items-center gap-1">
                {isAdmin ? (
                  <>
                    <Shield className="w-2.5 h-2.5 text-primary" /> HR Lead
                  </>
                ) : (
                  <>
                    <User className="w-2.5 h-2.5 text-accent-teal" />{" "}
                    {user?.employee?.employeeCode || "Staff"}
                  </>
                )}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-xs flex items-center gap-1.5 hover:bg-danger-soft hover:text-danger hover:border-danger/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
