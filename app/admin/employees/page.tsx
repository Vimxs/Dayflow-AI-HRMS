"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/shared/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  AlertCircle,
  X,
} from "lucide-react";

interface EmployeeItem {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  jobTitle: string;
  phone: string | null;
  address: string | null;
  dateOfJoining: string;
  isVerified: boolean;
  payroll: {
    baseSalary: number;
    allowances: number;
    deductions: number;
    netSalary: number;
  } | null;
}

export default function AdminEmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");

  // Create Employee Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    employeeCode: "",
    department: "ENGINEERING",
    jobTitle: "",
    phone: "",
    address: "",
    baseSalary: "",
    role: "EMPLOYEE",
    password: "Password@123",
  });

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/admin/employees");
      if (!res.ok) {
        if (res.status === 401) router.push("/sign-in");
        if (res.status === 403) router.push("/employee/dashboard");
        throw new Error("Failed to load staff records");
      }
      const json = await res.json();
      if (json.success) {
        setEmployees(json.data.employees);
      } else {
        setError(json.error);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error loading staff records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError(null);

    try {
      const res = await fetch("/api/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          baseSalary: formData.baseSalary ? parseFloat(formData.baseSalary) : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setCreateError(json.error || "Failed to create employee");
      } else {
        setShowAddModal(false);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          employeeCode: "",
          department: "ENGINEERING",
          jobTitle: "",
          phone: "",
          address: "",
          baseSalary: "",
          role: "EMPLOYEE",
          password: "Password@123",
        });
        fetchEmployees();
      }
    } catch {
      setCreateError("Network error during employee creation");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = selectedDept === "ALL" || emp.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [employees, searchQuery, selectedDept]);

  const departments = ["ALL", "ENGINEERING", "SALES", "MARKETING", "HR", "FINANCE", "OPERATIONS"];

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
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Operations Hub
            </Link>
            <h1 className="text-2xl font-heading font-bold text-ink">
              Staff & Workforce Directory
            </h1>
            <p className="text-xs text-ink-muted mt-0.5">
              Comprehensive employee roster, profile auditing, and salary management
            </p>
          </div>

          <Button
            onClick={() => setShowAddModal(true)}
            size="sm"
            className="text-xs flex items-center gap-1.5 self-start sm:self-auto shadow-sm shadow-primary/25"
          >
            <UserPlus className="w-4 h-4" /> Add New Employee
          </Button>
        </div>

        {/* Filter & Search Bar */}
        <div className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-ink-light absolute left-3 top-3" />
            <Input
              placeholder="Search by name, employee code, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {departments.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  selectedDept === dept
                    ? "bg-primary text-white shadow-xs"
                    : "bg-surface border border-border text-ink-secondary hover:border-primary/30"
                }`}
              >
                {dept === "ALL" ? "All" : dept.charAt(0) + dept.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Employees Table */}
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-ink-muted animate-pulse">
              Loading workforce directory...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-xs text-danger flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-canvas border-b border-border/80 text-ink-muted uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Job Title</th>
                    <th className="px-4 py-3">Compensation</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-white">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-xs text-ink-muted">
                        No employees match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-canvas/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary-soft text-primary font-bold flex items-center justify-center text-xs flex-shrink-0">
                              {emp.firstName.charAt(0)}
                            </div>
                            <div>
                              <span className="font-semibold text-ink block">
                                {emp.firstName} {emp.lastName}
                              </span>
                              <span className="text-[11px] text-ink-muted">
                                {emp.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[11px] text-ink-secondary">
                          {emp.employeeCode}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-surface-muted border border-border font-medium text-[11px] text-ink">
                            {emp.department}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-ink-secondary">
                          {emp.jobTitle}
                        </td>
                        <td className="px-4 py-3.5">
                          {emp.payroll ? (
                            <span className="font-semibold text-ink flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-accent-teal" />
                              ${emp.payroll.netSalary.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-ink-light">Not set</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 text-[11px] text-accent-teal font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" /> Active
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Link
                            href={`/admin/employees/${emp.id}`}
                            className="px-2.5 py-1 rounded-lg bg-surface border border-border hover:border-primary/40 text-primary font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                          >
                            <span>Inspect & Edit</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Add New Employee */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in-0">
            <div className="glass-card max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-base text-ink">
                      Register New Employee
                    </h2>
                    <p className="text-[11px] text-ink-muted">Create corporate account & profile</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {createError && (
                <div className="p-3 rounded-lg bg-danger-soft border border-danger/30 text-danger text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstName" required>First Name</Label>
                    <Input
                      id="firstName"
                      required
                      placeholder="Rahul"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" required>Last Name</Label>
                    <Input
                      id="lastName"
                      required
                      placeholder="Sharma"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="email" required>Corporate Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="rahul@dayflow.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="employeeCode" required>Employee Code</Label>
                    <Input
                      id="employeeCode"
                      required
                      placeholder="EMP005"
                      value={formData.employeeCode}
                      onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="department" required>Department</Label>
                    <select
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full h-9 rounded-lg border border-border px-3 bg-white text-xs text-ink"
                    >
                      <option value="ENGINEERING">Engineering</option>
                      <option value="SALES">Sales</option>
                      <option value="MARKETING">Marketing</option>
                      <option value="HR">HR</option>
                      <option value="FINANCE">Finance</option>
                      <option value="OPERATIONS">Operations</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="jobTitle" required>Job Title</Label>
                    <Input
                      id="jobTitle"
                      required
                      placeholder="Senior Full Stack Engineer"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="baseSalary">Monthly Base Salary ($)</Label>
                    <Input
                      id="baseSalary"
                      type="number"
                      placeholder="8500"
                      value={formData.baseSalary}
                      onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role" required>System Role</Label>
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full h-9 rounded-lg border border-border px-3 bg-white text-xs text-ink"
                    >
                      <option value="EMPLOYEE">Employee</option>
                      <option value="ADMIN">HR Admin</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" required>Initial Password</Label>
                    <Input
                      id="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    isLoading={isCreating}
                  >
                    Create Employee Profile
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
