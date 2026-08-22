"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/shared/auth-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Lock, Mail, ArrowRight, Shield, User } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const registered = searchParams.get("registered");
  const verified = searchParams.get("verified");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUnverifiedEmail(null);
    setResendStatus(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.needsVerification) {
          setUnverifiedEmail(data.email || email);
        }
        setError(data.error || "Failed to sign in. Please check your credentials.");
        setIsLoading(false);
        return;
      }

      // Successful login
      const targetPath = callbackUrl || data.data.redirectTo || "/dashboard";
      router.push(targetPath);
      router.refresh();
    } catch {
      setError("An unexpected network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setIsResending(true);
    setResendStatus(null);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unverifiedEmail }),
      });
      const data = await res.json();
      setResendStatus(
        data.message || "A fresh verification link has been sent to your email."
      );
    } catch {
      setResendStatus("Failed to send verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // Quick fill helper for testing/reviewing
  const quickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <AuthCard
      title="Sign In to Dayflow"
      subtitle="Enter your corporate credentials to access your portal"
    >
      {/* Registration/Verification Banners */}
      {registered && (
        <div className="mb-4 p-3 rounded-lg bg-accent-teal-soft border border-accent-teal/30 text-accent-teal text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Account created! Please verify your email before signing in.</span>
        </div>
      )}

      {verified && (
        <div className="mb-4 p-3 rounded-lg bg-accent-teal-soft border border-accent-teal/30 text-accent-teal text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Email verified successfully! You can now sign in below.</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-3.5 rounded-lg bg-danger-soft border border-danger/30 text-danger text-xs flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>

          {unverifiedEmail && (
            <div className="pt-2 border-t border-danger/20 flex flex-col gap-2">
              <Button
                type="button"
                variant="dangerOutline"
                size="sm"
                className="w-full text-xs"
                onClick={handleResendVerification}
                isLoading={isResending}
              >
                Resend Verification Link
              </Button>
              {resendStatus && (
                <p className="text-ink text-[11px] bg-white p-2 rounded border border-border">
                  {resendStatus}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sign In Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" required>Corporate Email</Label>
          <div className="relative">
            <Mail className="w-4 h-4 text-ink-light absolute left-3 top-3" />
            <Input
              id="email"
              type="email"
              placeholder="e.g. rahul@dayflow.com"
              className="pl-9"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="password" required className="mb-0">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </div>
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
              autoComplete="current-password"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          Sign In to Portal <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </form>

      {/* Quick Demo Credentials Widget */}
      <div className="mt-6 p-3.5 rounded-xl bg-surface-muted border border-border">
        <p className="text-[11px] font-semibold text-ink-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span>⚡</span> Quick Demo Sign-In (Click to Fill)
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => quickFill("admin@dayflow.com", "Admin@123")}
            className="p-2 rounded-lg bg-white border border-border hover:border-primary/50 text-left transition-all text-xs group"
          >
            <span className="font-semibold text-ink flex items-center gap-1 group-hover:text-primary">
              <Shield className="w-3 h-3 text-primary" /> Admin / HR
            </span>
            <span className="text-[10px] text-ink-muted block mt-0.5">Anita Roy</span>
          </button>

          <button
            type="button"
            onClick={() => quickFill("rahul@dayflow.com", "Rahul@123")}
            className="p-2 rounded-lg bg-white border border-border hover:border-accent-teal/50 text-left transition-all text-xs group"
          >
            <span className="font-semibold text-ink flex items-center gap-1 group-hover:text-accent-teal">
              <User className="w-3 h-3 text-accent-teal" /> Employee
            </span>
            <span className="text-[10px] text-ink-muted block mt-0.5">Rahul Sharma</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border text-center text-xs text-ink-muted">
        Don&apos;t have an account yet?{" "}
        <Link href="/sign-up" className="text-primary font-semibold hover:underline">
          Register here
        </Link>
      </div>
    </AuthCard>
  );
}
