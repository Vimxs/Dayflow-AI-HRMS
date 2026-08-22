"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, AlertCircle, DollarSign } from "lucide-react";

interface PayrollEditFormProps {
  employeeId: string;
  currentPayroll?: {
    baseSalary: number;
    allowances: number;
    deductions: number;
    effectiveFrom: string;
  } | null;
  onSuccess?: () => void;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function PayrollEditForm({
  employeeId,
  currentPayroll,
  onSuccess,
}: PayrollEditFormProps) {
  const isNew = !currentPayroll;

  const [baseSalary, setBaseSalary] = useState(
    currentPayroll?.baseSalary?.toString() || ""
  );
  const [allowances, setAllowances] = useState(
    currentPayroll?.allowances?.toString() || "0"
  );
  const [deductions, setDeductions] = useState(
    currentPayroll?.deductions?.toString() || "0"
  );
  const [effectiveFrom, setEffectiveFrom] = useState(
    currentPayroll?.effectiveFrom
      ? currentPayroll.effectiveFrom.slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );

  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const base = parseFloat(baseSalary) || 0;
  const allow = parseFloat(allowances) || 0;
  const deduct = parseFloat(deductions) || 0;
  const net = base + allow - deduct;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);
    setError(null);

    const url = `/api/payroll/${employeeId}`;
    const method = isNew ? "POST" : "PATCH";
    const body = isNew
      ? { employeeId, baseSalary: base, allowances: allow, deductions: deduct, effectiveFrom }
      : { baseSalary: base, allowances: allow, deductions: deduct, effectiveFrom };
    const apiUrl = isNew ? "/api/payroll" : url;

    try {
      const res = await fetch(apiUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Failed to save payroll");
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
        onSuccess?.();
      }
    } catch {
      setError("Network error while saving payroll");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="p-3 rounded-xl bg-accent-teal-soft border border-accent-teal/30 text-accent-teal text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span className="font-semibold">
            Payroll {isNew ? "created" : "updated"} and audit trail recorded!
          </span>
        </div>
      )}
      {error && (
        <div className="p-3 rounded-xl bg-danger-soft border border-danger/30 text-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <Label htmlFor="baseSalary" className="text-xs" required>
            Base Salary ($/mo)
          </Label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-ink-light absolute left-3 top-2.5" />
            <Input
              id="baseSalary"
              type="number"
              min={0}
              step={100}
              required
              placeholder="8500"
              value={baseSalary}
              onChange={(e) => setBaseSalary(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="allowances" className="text-xs">
            Allowances ($)
          </Label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-ink-light absolute left-3 top-2.5" />
            <Input
              id="allowances"
              type="number"
              min={0}
              step={50}
              placeholder="1200"
              value={allowances}
              onChange={(e) => setAllowances(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="deductions" className="text-xs">
            Deductions ($)
          </Label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-ink-light absolute left-3 top-2.5" />
            <Input
              id="deductions"
              type="number"
              min={0}
              step={50}
              placeholder="800"
              value={deductions}
              onChange={(e) => setDeductions(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="effectiveFrom" className="text-xs" required>
            Effective From
          </Label>
          <Input
            id="effectiveFrom"
            type="date"
            required
            value={effectiveFrom}
            onChange={(e) => setEffectiveFrom(e.target.value)}
            className="text-xs"
          />
        </div>

        {/* Live net pay preview */}
        <div className="flex items-end">
          <div className="w-full p-3 rounded-xl bg-primary-soft/60 border border-primary/20 flex items-center justify-between text-xs">
            <span className="font-semibold text-ink">Net Pay Preview</span>
            <span
              className={`font-heading font-bold text-base ${
                net < 0 ? "text-danger" : "text-primary"
              }`}
            >
              {formatCurrency(net)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          size="sm"
          isLoading={isSaving}
          className="text-xs shadow-sm shadow-primary/20"
        >
          {isNew ? "Create Payroll Record" : "Save Salary Changes (Audit Logged)"}
        </Button>
      </div>
    </form>
  );
}
