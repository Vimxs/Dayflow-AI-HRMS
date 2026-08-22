"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthCard } from "@/components/shared/auth-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Loader2, Mail, ArrowRight } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "prompt">(
    token ? "loading" : "prompt"
  );
  const [message, setMessage] = useState<string>("");
  const [resendEmail, setResendEmail] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  const verifyToken = useCallback(async (tokenString: string) => {
    setStatus("loading");
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenString }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus("error");
        setMessage(data.error || "Verification failed. The link may be expired or invalid.");
        return;
      }

      setStatus("success");
      setMessage(data.message || "Your email has been verified successfully!");
    } catch {
      setStatus("error");
      setMessage("An unexpected network error occurred during verification.");
    }
  }, []);

  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, [token, verifyToken]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    setIsResending(true);
    setResendSuccess(null);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });

      const data = await res.json();
      setResendSuccess(
        data.message || "If an unverified account exists, a link has been dispatched."
      );
    } catch {
      setMessage("Failed to send verification email.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthCard
      title="Email Verification"
      subtitle="Corporate identity activation"
      badgeText="Account Verification"
    >
      {/* Loading State */}
      {status === "loading" && (
        <div className="text-center py-8 space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          <p className="text-sm font-medium text-ink">Verifying your corporate email...</p>
          <p className="text-xs text-ink-muted">Please wait while we validate your security token.</p>
        </div>
      )}

      {/* Success State */}
      {status === "success" && (
        <div className="text-center space-y-4 py-4">
          <div className="w-14 h-14 rounded-full bg-accent-teal-soft text-accent-teal flex items-center justify-center mx-auto border border-accent-teal/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-lg font-bold text-ink">Account Verified!</h2>
          <p className="text-sm text-ink-secondary">{message}</p>

          <div className="pt-4">
            <Button
              className="w-full"
              onClick={() => router.push("/sign-in?verified=true")}
            >
              Proceed to Sign In <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Error State */}
      {status === "error" && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-lg bg-danger-soft border border-danger/30 text-danger text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{message}</span>
          </div>

          <div className="p-4 rounded-xl bg-surface-muted border border-border">
            <p className="text-xs font-semibold text-ink mb-2">Request a New Verification Link:</p>
            <form onSubmit={handleResend} className="space-y-3">
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-light absolute left-3 top-3" />
                <Input
                  type="email"
                  placeholder="Enter your corporate email"
                  className="pl-9 text-xs"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                isLoading={isResending}
              >
                Dispatch New Verification Link
              </Button>
            </form>

            {resendSuccess && (
              <p className="mt-2 text-xs text-accent-teal bg-white p-2 rounded border border-accent-teal/20">
                {resendSuccess}
              </p>
            )}
          </div>

          <div className="pt-2 text-center">
            <Link href="/sign-in" className="text-xs text-primary font-medium hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      )}

      {/* Manual Prompt State (when no token in URL) */}
      {status === "prompt" && (
        <div className="space-y-4">
          <p className="text-sm text-ink-secondary text-center">
            Enter your corporate email below to receive a fresh verification link.
          </p>

          <form onSubmit={handleResend} className="space-y-3">
            <div>
              <Label htmlFor="resendEmail" required>Corporate Email</Label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-light absolute left-3 top-3" />
                <Input
                  id="resendEmail"
                  type="email"
                  placeholder="name@dayflow.com"
                  className="pl-9"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isResending}
            >
              Send Verification Email
            </Button>
          </form>

          {resendSuccess && (
            <div className="p-3 rounded-lg bg-accent-teal-soft border border-accent-teal/30 text-accent-teal text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{resendSuccess}</span>
            </div>
          )}

          <div className="pt-2 text-center">
            <Link href="/sign-in" className="text-xs text-primary font-medium hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      )}
    </AuthCard>
  );
}
