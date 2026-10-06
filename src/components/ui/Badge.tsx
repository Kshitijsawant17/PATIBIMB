"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "cyan"
  | "violet"
  | "amber"
  | "emerald"
  | "rose"
  | "neutral"
  | "subtle";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  children: ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = "neutral",
      size = "md",
      dot = false,
      className,
      ...props
    },
    ref
  ) => {
    const variantClasses: Record<BadgeVariant, string> = {
      cyan: "badge-cyan",
      violet: "badge-violet",
      amber: "badge-amber",
      emerald: "badge-emerald",
      rose: "badge-rose",
      neutral: "badge-neutral",
      subtle: "badge-subtle",
    };

    const sizeClasses = {
      sm: "badge-sm",
      md: "",
      lg: "badge-lg",
    };

    const dotColors: Record<BadgeVariant, string> = {
      cyan: "bg-cyan-400",
      violet: "bg-violet-400",
      amber: "bg-amber-400",
      emerald: "bg-emerald-400",
      rose: "bg-rose-400",
      neutral: "bg-text-muted",
      subtle: "bg-text-muted",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "badge",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0",
              dotColors[variant]
            )}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: "safe" | "caution" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, size = "md", children, className, ...props }, ref) => {
    const statusVariants = {
      safe: "emerald",
      caution: "amber",
      warning: "amber",
      danger: "rose",
      info: "cyan",
    } as const;

    return (
      <Badge
        ref={ref}
        variant={statusVariants[status]}
        size={size}
        dot
        className={className}
        {...props}
      >
        {children}
      </Badge>
    );
  }
);

StatusBadge.displayName = "StatusBadge";