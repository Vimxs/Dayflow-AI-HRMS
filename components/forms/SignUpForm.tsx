"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/shared/auth-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordStrengthMeter } from "@/components/ui/password-strength-meter";
import {
  AlertCircle,
  User,
  Mail,
  Lock,
  Hash,
  ArrowRight,
} from "lucide-react";

export function SignUpForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    employeeCode: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    terms: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!formData.terms) {
      setErrorMsg("You must accept the terms and conditions.");
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
        setErrorMsg(data.error || "Sign-up failed. Please check your inputs.");
      } else {
        setSuccessMsg(
          data.data?.message ||
            "Sign-up successful! Check your email to verify your account."
        );
      }
    } catch {
      setErrorMsg("Network error. Please check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (successMsg) {
    return (
      <AuthCard
        title="Check Your Email"
        subtitle="Verification link sent"
        badgeText="Almost there!"
      >
        <div className="text-center py-4 space-y-4">
          <div className="text-5xl">✉️</div>
          <p className="text-sm text-ink leading-relaxed">{successMsg}</p>
          <p className="text-xs text-ink-muted">
            In dev mode, check your server console for the verification link.
          </p>
          <Button
            type="button"
            className="w-full mt-2"
            onClick={() => router.push("/sign-in")}
          >
            Go to Sign In <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Join Dayflow"
      subtitle="Create your employee account to get started"
      badgeText="New Account"
      footer={
        <p className="text-xs text-ink-muted">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-primary font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>
      }
    >
      {errorMsg && (
        <div className="mb-4 p-3.5 rounded-lg bg-danger-soft border border-danger/30 text-danger text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="employeeCode" required>
            Employee ID / Code
          </Label>
          <div className="relative">
            <Hash className="w-4 h-4 text-ink-light absolute left-3 top-3" />
            <Input
              id="employeeCode"
              type="text"
              placeholder="e.g. EMP-1082"
              className="pl-9"
              value={formData.employeeCode}
              onChange={handleChange("employeeCode")}
              required
              autoComplete="off"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="firstName" required>
              First Name
            </Label>
            <div className="relative">
              <User className="w-4 h-4 text-ink-light absolute left-3 top-3" />
              <Input
                id="firstName"
                type="text"
                placeholder="Anita"
                className="pl-9"
                value={formData.firstName}
                onChange={handleChange("firstName")}
                required
                autoComplete="given-name"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="lastName" required>
              Last Name
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Roy"
              value={formData.lastName}
              onChange={handleChange("lastName")}
              required
              autoComplete="family-name"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email" required>
            Work Email
          </Label>
          <div className="relative">
            <Mail className="w-4 h-4 text-ink-light absolute left-3 top-3" />
            <Input
              id="email"
              type="email"
              placeholder="you@organization.com"
              className="pl-9"
              value={formData.email}
              onChange={handleChange("email")}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password" required>
            Password
          </Label>
          <div className="relative">
            <Lock className="w-4 h-4 text-ink-light absolute left-3 top-3" />
            <Input
              id="password"
              type="password"
              placeholder="Min 8 chars (A-Z, a-z, 0-9, symbol)"
              className="pl-9"
              value={formData.password}
              onChange={handleChange("password")}
              required
              autoComplete="new-password"
            />
          </div>
          <PasswordStrengthMeter password={formData.password} />
        </div>

        <div className="flex items-start gap-2.5 pt-1">
          <input
            type="checkbox"
            id="terms"
            checked={formData.terms}
            onChange={handleChange("terms")}
            className="mt-0.5 cursor-pointer accent-primary w-4 h-4 flex-shrink-0"
          />
          <label
            htmlFor="terms"
            className="text-xs text-ink-secondary cursor-pointer leading-relaxed"
          >
            I agree to the organisation&apos;s HR Policy and Terms of Service.
          </label>
        </div>

        <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
          Create Employee Account <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </form>
    </AuthCard>
  );
}
