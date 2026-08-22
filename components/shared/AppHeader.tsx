"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

export function AppHeader({ user: initialUser }: { user?: AppHeaderProps["user"] }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState(initialUser || null);

  React.useEffect(() => {
    if (!currentUser || !currentUser.email) {
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setCurrentUser({
              email: json.data.email,
              role: json.data.role,
              employee: json.data.employee || null,
            });
          }
        })
        .catch(() => {});
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/sign-in");
      router.refresh();
    }
  };

  const user = currentUser || initialUser;
  const isAdmin = user?.role === "ADMIN";
  const displayName =
    user?.employee?.firstName && user?.employee?.lastName
      ? `${user.employee.firstName} ${user.employee.lastName}`
      : user?.name || user?.email?.split("@")[0] || (isAdmin ? "Admin User" : "Employee");

  return (
    <header className="w-full bg-white border-b border-border sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Navigation Link */}
        <Link
          href={isAdmin ? "/admin/dashboard" : "/employee/dashboard"}
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <div
            className={`w-9 h-9 rounded-lg text-white flex items-center justify-center font-heading font-extrabold text-lg shadow-xs ${
              isAdmin ? "bg-primary" : "bg-secondary"
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
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                  isAdmin
                    ? "bg-primary-soft text-primary border border-primary/20"
                    : "bg-secondary-soft text-secondary border border-secondary/20"
                }`}
              >
                {isAdmin ? "Admin Console" : "Employee Portal"}
              </span>
            </div>
            <span className="text-[11px] text-ink-muted hidden sm:block -mt-0.5">
              People Operations Platform
            </span>
          </div>
        </Link>

        {/* Right Actions: Notification Bell + User Chip + Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          <NotificationBell />

          <Link
            href={isAdmin ? "/admin/employees" : "/employee/profile"}
            className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-border hover:opacity-85 transition-opacity"
            title="View Profile"
          >
            <div className="w-8 h-8 rounded-full bg-primary-soft text-primary font-bold flex items-center justify-center text-xs border border-primary/20">
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
                    <User className="w-2.5 h-2.5 text-secondary" />{" "}
                    {user?.employee?.employeeCode || "Staff"}
                  </>
                )}
              </span>
            </div>
          </Link>

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
