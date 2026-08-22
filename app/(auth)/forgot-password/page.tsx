"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/shared/auth-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2, AlertCircle, ArrowRight, ExternalLink } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    message: string;
    resetUrl?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to process request. Please try again.");
        setIsLoading(false);
        return;
      }

      setSuccessInfo(data);
    } catch {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (successInfo) {
    return (
      <AuthCard
        title="Check Your Inbox"
        subtitle="Password reset instructions sent"
        badgeText="Reset Request"
      >
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-primary-soft text-primary flex items-center justify-center mx-auto border border-primary/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <p className="text-sm text-ink-secondary">{successInfo.message}</p>

          {successInfo.resetUrl && (
            <div className="p-3.5 rounded-xl bg-primary-soft/50 border border-primary/20 text-left my-4">
              <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
                <span>⚡</span> Development Quick-Reset
              </p>
              <p className="text-[11px] text-ink-secondary mb-2">
                Click below to set a new password in this local development environment:
              </p>
              <Link
                href={successInfo.resetUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-btn hover:bg-primary-hover transition-all shadow-sm"
              >
                Open Password Reset Form <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-ink bg-surface-muted hover:bg-border/50 rounded-btn transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset Password"
      subtitle="Enter your corporate email to receive a password reset link"
      badgeText="Security Recovery"
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-danger-soft border border-danger/30 text-danger text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

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

        <Button
          type="submit"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          Send Reset Link <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-border text-center text-xs text-ink-muted">
        Remembered your password?{" "}
        <Link href="/sign-in" className="text-primary font-semibold hover:underline">
          Back to Sign In
        </Link>
      </div>
    </AuthCard>
  );
}
