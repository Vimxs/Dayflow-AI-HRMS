"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthCard } from "@/components/shared/auth-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordStrengthMeter } from "@/components/ui/password-strength-meter";
import { Lock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    !token ? "Missing or invalid password reset token." : null
  );
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Password reset token is missing. Please use the link sent to your email.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to reset password. The link may have expired.");
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
    } catch {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthCard
        title="Password Reset Complete"
        subtitle="Your credentials have been securely updated"
        badgeText="Security Success"
      >
        <div className="text-center space-y-4 py-2">
          <div className="w-14 h-14 rounded-full bg-accent-teal-soft text-accent-teal flex items-center justify-center mx-auto border border-accent-teal/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <p className="text-sm text-ink-secondary">
            Your password has been changed. All existing sessions have been terminated for your security.
          </p>

          <div className="pt-4">
            <Button
              className="w-full"
              onClick={() => router.push("/sign-in?reset=true")}
            >
              Sign In with New Password <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Set New Password"
      subtitle="Enter a strong password meeting all organizational security rules"
      badgeText="Password Reset"
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-danger-soft border border-danger/30 text-danger text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="password" required>New Password</Label>
          <div className="relative">
            <Lock className="w-4 h-4 text-ink-light absolute left-3 top-3" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-9"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={!token}
              autoComplete="new-password"
            />
          </div>
          <PasswordStrengthMeter password={password} />
        </div>

        <div>
          <Label htmlFor="confirmPassword" required>Confirm New Password</Label>
          <div className="relative">
            <Lock className="w-4 h-4 text-ink-light absolute left-3 top-3" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="pl-9"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={!token}
              autoComplete="new-password"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          isLoading={isLoading}
          disabled={!token}
        >
          Update Password <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-border text-center text-xs text-ink-muted">
        <Link href="/sign-in" className="text-primary font-semibold hover:underline">
          Back to Sign In
        </Link>
      </div>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-ink-muted text-sm">Loading…</div></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
