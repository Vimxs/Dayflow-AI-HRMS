"use client";

import React from "react";
import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface SalaryCardProps {
  baseSalary: number;
  allowances: number;
  deductions: number;
  effectiveFrom: string;
  compact?: boolean;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function SalaryCard({
  baseSalary,
  allowances,
  deductions,
  effectiveFrom,
  compact = false,
}: SalaryCardProps) {
  const netSalary = baseSalary + allowances - deductions;

  const items = [
    {
      label: "Base Salary",
      value: baseSalary,
      icon: DollarSign,
      color: "text-ink",
      bg: "bg-canvas",
      border: "border-border",
      sub: "Monthly standard",
    },
    {
      label: "Allowances",
      value: allowances,
      icon: TrendingUp,
      color: "text-accent-teal",
      bg: "bg-accent-teal-soft/40",
      border: "border-accent-teal/20",
      sub: "HRA · Medical · Travel",
      prefix: "+",
    },
    {
      label: "Deductions",
      value: deductions,
      icon: TrendingDown,
      color: "text-danger",
      bg: "bg-danger-soft/40",
      border: "border-danger/20",
      sub: "Tax · Provident Fund",
      prefix: "-",
    },
  ];

  return (
    <div className="space-y-4">
      {compact ? (
        // Compact layout — horizontal row
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {items.map((item) => (
            <div
              key={item.label}
              className={`p-3.5 rounded-xl ${item.bg} border ${item.border}`}
            >
              <span className={`text-xs ${item.color} block font-medium`}>{item.label}</span>
              <span className={`text-lg font-heading font-bold ${item.color} block mt-1`}>
                {item.prefix}{formatCurrency(item.value)}
              </span>
            </div>
          ))}
          {/* Net Pay */}
          <div className="p-3.5 rounded-xl bg-primary-soft border border-primary/30">
            <span className="text-xs text-primary block font-semibold">Net Take-Home</span>
            <span className="text-lg font-heading font-bold text-primary block mt-1">
              {formatCurrency(netSalary)}
            </span>
          </div>
        </div>
      ) : (
        // Full layout — vertical with breakdown bar
        <div className="space-y-4">
          {/* Net pay hero */}
          <div className="rounded-xl p-6 bg-primary text-white shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 opacity-90" />
              <span className="text-xs font-bold opacity-90 tracking-wider uppercase">
                Net Monthly Take-Home
              </span>
            </div>
            <div className="text-4xl font-heading font-extrabold tracking-tight">
              {formatCurrency(netSalary)}
            </div>
            <div className="text-xs opacity-80 mt-1 font-medium">
              Effective from{" "}
              {new Date(effectiveFrom).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>

          {/* Breakdown grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={`p-4 rounded-xl ${item.bg} border ${item.border} flex flex-col gap-1`}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                    <span className={`text-xs font-semibold ${item.color}`}>{item.label}</span>
                  </div>
                  <span className={`text-2xl font-heading font-bold ${item.color}`}>
                    {item.prefix}
                    {formatCurrency(item.value)}
                  </span>
                  <span className="text-[11px] text-ink-muted">{item.sub}</span>
                </div>
              );
            })}
          </div>

          {/* Visual breakdown bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <span>Salary composition</span>
              <span className="font-semibold">{formatCurrency(baseSalary + allowances)} gross</span>
            </div>
            <div className="flex h-2.5 rounded-full overflow-hidden gap-px">
              <div
                className="bg-primary rounded-l-full"
                style={{ width: `${(baseSalary / (baseSalary + allowances)) * 100}%` }}
              />
              <div
                className="bg-accent-teal rounded-r-full"
                style={{ width: `${(allowances / (baseSalary + allowances)) * 100}%` }}
              />
            </div>
            <div className="flex items-center gap-3 text-[11px] text-ink-muted">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-primary inline-block" /> Base
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-accent-teal inline-block" /> Allowances
              </span>
              <span className="flex items-center gap-1 ml-auto">
                <span className="w-2 h-2 rounded-sm bg-danger inline-block" /> Deductions{" "}
                {formatCurrency(deductions)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
