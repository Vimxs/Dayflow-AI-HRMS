"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/shared/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Users,
  Search,
  Filter,
  UserCheck,
  Building2,
  Briefcase,
  ChevronRight,
  Loader2,
  ShieldAlert,
} from "lucide-react";

interface EmployeeListItem {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  phone?: string | null;
  profilePictureUrl?: string | null;
  user: {
    id: string;
    email: string;
    role: "ADMIN" | "EMPLOYEE";
    isVerified: boolean;
  };
}

export default function AdminEmployeesDirectoryPage() {
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("query", searchQuery);
      if (selectedDept !== "ALL") params.set("department", selectedDept);

      const res = await fetch(`/api/employees?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to load employees");
        setIsLoading(false);
        return;
      }

      setEmployees(data.data || []);
    } catch {
      setError("Network error loading employee directory");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedDept]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const departments = ["ALL", "Human Resources", "Engineering", "Design", "General"];

  return (
    <AppShell activeItem="employees">
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* ── Directory Header ──────────────────────────── */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-ink flex items-center gap-2">
              <Users className="w-7 h-7 text-primary" /> Employee Directory
            </h1>
            <p className="text-xs text-ink-muted mt-1">
              Manage organization members, view role claims, and update employee profiles.
            </p>
          </div>

          <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-primary-soft text-primary border border-primary/20">
            Total Employees: <strong>{employees.length}</strong>
          </div>
        </div>

        {/* ── Search & Filter Controls ──────────────────── */}
        <div className="glass-card p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-ink-light absolute left-3 top-3" />
            <Input
              placeholder="Search by name, ID code, designation, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            <Filter className="w-4 h-4 text-ink-muted flex-shrink-0" />
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex-shrink-0 ${
                  selectedDept === dept
                    ? "bg-primary text-white"
                    : "bg-canvas text-ink-secondary hover:text-ink hover:bg-primary-soft"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* ── Employee Table / Card List ────────────────── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-ink-muted">Loading employee records...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center glass-card border-danger/30 text-danger space-y-2">
            <ShieldAlert className="w-8 h-8 mx-auto" />
            <div className="text-sm font-bold">{error}</div>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center glass-card text-ink-muted space-y-2">
            <Users className="w-10 h-10 mx-auto text-ink-light opacity-50" />
            <div className="text-sm font-semibold">No employees found</div>
            <p className="text-xs">Try clearing your search query or department filter.</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-canvas/60 text-xs font-bold text-ink-muted uppercase tracking-wider">
                    <th className="p-4">Employee</th>
                    <th className="p-4">ID Code</th>
                    <th className="p-4">Designation</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Role</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {employees.map((emp) => {
                    const fullName = `${emp.firstName} ${emp.lastName}`.trim();
                    return (
                      <tr key={emp.id} className="hover:bg-canvas/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-painted-header text-white font-bold text-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                              {emp.profilePictureUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={emp.profilePictureUrl} alt={fullName} className="w-full h-full object-cover" />
                              ) : (
                                <span>
                                  {emp.firstName[0]}
                                  {emp.lastName[0]}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-ink">{fullName}</div>
                              <div className="text-xs text-ink-muted">{emp.user.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-mono font-semibold text-xs text-ink">{emp.employeeCode}</td>

                        <td className="p-4 text-ink-secondary">
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-primary" /> {emp.jobTitle}
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded bg-accent-teal-soft text-accent-teal">
                            <Building2 className="w-3 h-3" /> {emp.department}
                          </span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                              emp.user.role === "ADMIN"
                                ? "bg-primary-soft text-primary border border-primary/20"
                                : "bg-canvas text-ink-secondary border border-border"
                            }`}
                          >
                            <UserCheck className="w-3 h-3" /> {emp.user.role}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <Link href={`/employees/${emp.id}`}>
                            <Button size="sm" variant="ghost" className="text-primary hover:text-primary-dark">
                              Manage Profile <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
