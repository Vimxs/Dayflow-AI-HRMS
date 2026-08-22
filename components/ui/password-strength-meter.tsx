import React from "react";
import { evaluatePasswordStrength } from "@/lib/auth/password";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  password?: string;
  showRequirements?: boolean;
}

export function PasswordStrengthMeter({
  password = "",
  showRequirements = true,
}: PasswordStrengthMeterProps) {
  if (!password) return null;

  const { score, label, requirements } = evaluatePasswordStrength(password);

  const getScoreColor = () => {
    switch (score) {
      case 1:
        return "bg-danger text-danger";
      case 2:
        return "bg-accent-amber text-accent-amber";
      case 3:
        return "bg-accent-teal text-accent-teal";
      case 4:
        return "bg-primary text-primary";
      default:
        return "bg-border text-ink-light";
    }
  };

  return (
    <div className="mt-2 space-y-2 text-xs">
      {/* Score Progress Bar */}
      <div className="flex items-center justify-between">
        <span className="text-ink-muted">Password Strength:</span>
        <span className={cn("font-semibold", getScoreColor().split(" ")[1])}>
          {label}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1 h-1.5 w-full bg-surface-muted rounded-pill overflow-hidden">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={cn(
              "h-full rounded-pill transition-all duration-300",
              score >= step ? getScoreColor().split(" ")[0] : "bg-border/60"
            )}
          />
        ))}
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1.5">
          {requirements.map((req) => (
            <div
              key={req.id}
              className={cn(
                "flex items-center gap-1.5 transition-colors",
                req.met ? "text-accent-teal font-medium" : "text-ink-muted"
              )}
            >
              {req.met ? (
                <Check className="w-3.5 h-3.5 text-accent-teal flex-shrink-0" />
              ) : (
                <X className="w-3.5 h-3.5 text-ink-light flex-shrink-0" />
              )}
              <span>{req.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
