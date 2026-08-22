import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-btn text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-sm shadow-primary/30 hover:bg-primary-hover active:bg-primary-dark",
        secondary:
          "bg-primary-soft text-primary hover:bg-primary-soft/80 border border-primary/20",
        outline:
          "border border-border bg-white text-ink hover:bg-surface-muted hover:border-ink-light",
        ghost:
          "text-ink hover:bg-surface-muted hover:text-primary",
        danger:
          "bg-danger text-white shadow-sm shadow-danger/25 hover:bg-danger-hover",
        dangerOutline:
          "border border-danger/30 text-danger bg-danger-soft hover:bg-danger-soft/80",
        teal:
          "bg-accent-teal text-white shadow-sm shadow-accent-teal/25 hover:bg-accent-teal/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs rounded-md",
        lg: "h-12 px-6 text-base rounded-lg",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
