<<<<<<< HEAD
import { SignUpForm } from "@/components/forms/SignUpForm";

export const metadata = {
  title: "Sign Up",
  description: "Create an account on Dayflow HRMS",
};
=======
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/shared/auth-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordStrengthMeter } from "@/components/ui/password-strength-meter";
import { 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  Mail, 
  User, 
  Briefcase, 
  Building2, 
  BadgeCheck, 
  ArrowRight,
  ExternalLink 
} from "lucide-react";
>>>>>>> e4fb065fc1b45a9d7b6af152787dedc2e41f4873

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    employeeCode: "",
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE" as "EMPLOYEE" | "ADMIN",
    department: "Engineering",
    jobTitle: "",
    phone: "",
    address: "",
    terms: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    email: string;
    employeeCode: string;
    verificationUrl?: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.terms) {
      setError("Please agree to the organizational terms & privacy policy to continue.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to create account. Please check the provided information.");
        setIsLoading(false);
        return;
      }

      setSuccessData(data.data);
    } catch {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (successData) {
    return (
      <AuthCard
        title="Check Your Email"
        subtitle="Verification link dispatched"
        badgeText="Registration Success"
      >
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-accent-teal-soft text-accent-teal flex items-center justify-center mx-auto mb-2 border border-accent-teal/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <p className="text-sm text-ink-secondary">
            An account has been created for Employee ID{" "}
            <span className="font-semibold text-ink">{successData.employeeCode}</span>.
          </p>

          <p className="text-xs text-ink-muted">
            We sent an email verification link to{" "}
            <span className="font-semibold text-primary">{successData.email}</span>. Please click the link to activate your account.
          </p>

          {/* Dev Quick Verify Button */}
          {successData.verificationUrl && (
            <div className="p-3.5 rounded-xl bg-primary-soft/50 border border-primary/20 text-left my-4">
              <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
                <span>⚡</span> Development Quick-Activation
              </p>
              <p className="text-[11px] text-ink-secondary mb-2">
                Click below to verify immediately in this development environment:
              </p>
              <Link
                href={successData.verificationUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-btn hover:bg-primary-hover transition-all shadow-sm"
              >
                Complete Email Verification <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-primary bg-surface-muted hover:bg-border/50 rounded-btn transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
<<<<<<< HEAD
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      <SignUpForm />
    </main>
=======
    <AuthCard
      title="Create Your Account"
      subtitle="Register an employee profile on Dayflow HRMS"
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-danger-soft border border-danger/30 text-danger text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Selector */}
        <div>
          <Label htmlFor="role" required>Account Role</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, role: "EMPLOYEE" }))}
              className={`p-2.5 rounded-btn border text-xs font-medium transition-all text-center flex items-center justify-center gap-1.5 ${
                formData.role === "EMPLOYEE"
                  ? "bg-primary-soft border-primary text-primary font-semibold shadow-sm"
                  : "bg-white border-border text-ink-muted hover:border-ink-light"
              }`}
            >
              <User className="w-3.5 h-3.5" /> Employee
            </button>
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, role: "ADMIN" }))}
              className={`p-2.5 rounded-btn border text-xs font-medium transition-all text-center flex items-center justify-center gap-1.5 ${
                formData.role === "ADMIN"
                  ? "bg-primary-soft border-primary text-primary font-semibold shadow-sm"
                  : "bg-white border-border text-ink-muted hover:border-ink-light"
              }`}
            >
              <BadgeCheck className="w-3.5 h-3.5" /> HR / Admin
            </button>
          </div>
        </div>

        {/* Employee ID & Full Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="employeeCode" required>Employee ID</Label>
            <Input
              id="employeeCode"
              name="employeeCode"
              placeholder="e.g. EMP105"
              value={formData.employeeCode}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="name" required>Full Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Alex Morgan"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" required>Corporate Email</Label>
          <div className="relative">
            <Mail className="w-4 h-4 text-ink-light absolute left-3 top-3" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="alex@dayflow.com"
              className="pl-9"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Department & Job Title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="department" required>Department</Label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="flex h-10 w-full rounded-btn border border-border bg-white px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
          <div>
            <Label htmlFor="jobTitle" required>Job Title</Label>
            <Input
              id="jobTitle"
              name="jobTitle"
              placeholder="e.g. Frontend Engineer"
              value={formData.jobTitle}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <Label htmlFor="password" required>Password</Label>
          <div className="relative">
            <Lock className="w-4 h-4 text-ink-light absolute left-3 top-3" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              className="pl-9"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>
          <PasswordStrengthMeter password={formData.password} />
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start gap-2 pt-1">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            checked={formData.terms}
            onChange={handleChange}
            className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <label htmlFor="terms" className="text-xs text-ink-secondary leading-normal">
            I accept the organization&apos;s data policies and acknowledge role permissions are monitored.
          </label>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          Create Account <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border text-center text-xs text-ink-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-primary font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </AuthCard>
>>>>>>> e4fb065fc1b45a9d7b6af152787dedc2e41f4873
  );
}
