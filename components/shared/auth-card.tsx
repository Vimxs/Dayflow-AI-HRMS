import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  badgeText?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({
  title,
  subtitle,
  badgeText = "Dayflow HRMS",
  children,
  footer,
}: AuthCardProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3 group" aria-label="Go to Dayflow Homepage">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-heading font-bold text-2xl shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
            D
          </div>
          <div className="text-left">
            <span className="font-heading font-bold text-2xl text-ink tracking-tight block">
              Dayflow
            </span>
            <span className="text-xs text-primary font-semibold block -mt-1">
              HR Operations Suite
            </span>
          </div>
        </Link>
      </div>

      {/* Main Glass Card */}
      <div className="w-full max-w-md glass-panel rounded-2xl p-6 sm:p-8 shadow-xl border border-border">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-primary-soft text-primary text-xs font-semibold mb-3">
            <Sparkles className="w-3 h-3" />
            <span>{badgeText}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-ink-secondary mt-1.5">{subtitle}</p>
        </div>

        {children}

        {footer && <div className="mt-6 pt-6 border-t border-border/80 text-center">{footer}</div>}
      </div>

      {/* Footer Info */}
      <p className="mt-8 text-xs text-ink-muted text-center">
        Protected by Dayflow Enterprise RBAC &bull; Single-Tenant Deployment
      </p>
    </div>
  );
}
