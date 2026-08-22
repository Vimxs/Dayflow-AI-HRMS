import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

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
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-canvas">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3 group" aria-label="Go to Dayflow Homepage">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-white font-heading font-extrabold text-2xl shadow-xs group-hover:bg-primary-dark transition-colors">
            D
          </div>
          <div className="text-left">
            <span className="font-heading font-bold text-2xl text-ink tracking-tight block leading-none">
              Dayflow
            </span>
            <span className="text-xs text-primary font-semibold block mt-1">
              Enterprise HR Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Main B2B Auth Card */}
      <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 border border-border shadow-xs">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold uppercase tracking-wider mb-3 border border-primary/10">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{badgeText}</span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-ink tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1.5">{subtitle}</p>
        </div>

        {children}

        {footer && <div className="mt-6 pt-6 border-t border-border text-center text-xs">{footer}</div>}
      </div>

      {/* Footer Info */}
      <p className="mt-8 text-xs text-ink-muted text-center">
        Protected by Dayflow Enterprise Security &bull; Single-Tenant Isolated Environment
      </p>
    </div>
  );
}
