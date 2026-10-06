"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  color?: "cyan" | "violet" | "amber" | "emerald" | "rose";
  showLabel?: boolean;
  label?: string;
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      max = 100,
      size = "md",
      animated = false,
      color = "cyan",
      showLabel = false,
      label,
      className,
      ...props
    },
    ref
  ) => {
    const percentage = Math.max(0, Math.min(100, (value / max) * 100));

    const sizeClasses = {
      sm: "progress-bar-sm",
      md: "",
      lg: "progress-bar-lg",
    };

    const colorStyles = {
      cyan: { background: "var(--gradient-cyan-violet)" },
      violet: { background: "linear-gradient(135deg, var(--color-violet-500) 0%, var(--color-cyan-500) 100%)" },
      amber: { background: "linear-gradient(135deg, var(--color-amber-500) 0%, var(--color-rose-500) 100%)" },
      emerald: { background: "linear-gradient(135deg, var(--color-emerald-500) 0%, var(--color-cyan-500) 100%)" },
      rose: { background: "linear-gradient(135deg, var(--color-rose-500) 0%, var(--color-amber-500) 100%)" },
    };

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {(showLabel || label) && (
          <div className="flex items-center justify-between mb-2">
            <span className="label text-text-secondary">{label ?? `${Math.round(percentage)}%`}</span>
            <span className="mono font-bold text-cyan-400 tabular-nums">{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          className={cn(
            "progress-bar",
            sizeClasses[size],
            animated && "progress-bar-animated"
          )}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        >
          <div
            className="progress-bar-fill"
            style={{
              width: `${percentage}%`,
              ...colorStyles[color],
            }}
          />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = "ProgressBar";

export interface CircularProgressProps extends HTMLAttributes<SVGSVGElement> {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: "cyan" | "violet" | "amber" | "emerald" | "rose";
  animated?: boolean;
  children?: React.ReactNode;
}

export const CircularProgress = forwardRef<SVGSVGElement, CircularProgressProps>(
  (
    {
      value,
      max = 100,
      size = 64,
      strokeWidth = 4,
      color = "cyan",
      animated = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const percentage = Math.max(0, Math.min(100, (value / max) * 100));
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    const colorClasses = {
      cyan: "stroke-[url(#cyan-violet-gradient)]",
      violet: "stroke-[url(#violet-cyan-gradient)]",
      amber: "stroke-[url(#amber-rose-gradient)]",
      emerald: "stroke-[url(#emerald-cyan-gradient)]",
      rose: "stroke-[url(#rose-amber-gradient)]",
    };

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        className={cn("circular-progress", className)}
        viewBox={`0 0 ${size} ${size}`}
        {...props}
      >
        <defs>
          <linearGradient id="cyan-violet-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-cyan-500)" />
            <stop offset="100%" stopColor="var(--color-violet-500)" />
          </linearGradient>
          <linearGradient id="violet-cyan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-violet-500)" />
            <stop offset="100%" stopColor="var(--color-cyan-500)" />
          </linearGradient>
          <linearGradient id="amber-rose-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-amber-500)" />
            <stop offset="100%" stopColor="var(--color-rose-500)" />
          </linearGradient>
          <linearGradient id="emerald-cyan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-emerald-500)" />
            <stop offset="100%" stopColor="var(--color-cyan-500)" />
          </linearGradient>
          <linearGradient id="rose-amber-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-rose-500)" />
            <stop offset="100%" stopColor="var(--color-amber-500)" />
          </linearGradient>
        </defs>
        <circle
          className="circular-progress-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        <circle
          className={cn(
            "circular-progress-fill",
            colorClasses[color],
            animated && "transition-all duration-700 ease-out"
          )}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transitionDuration: animated ? "700ms" : "0ms" }}
        />
        {children && (
          <text
            x={size / 2}
            y={size / 2 + 4}
            textAnchor="middle"
            dominantBaseline="central"
            className="font-mono font-bold text-text-primary"
            fontSize={size * 0.22}
          >
            {children}
          </text>
        )}
      </svg>
    );
  }
);

CircularProgress.displayName = "CircularProgress";