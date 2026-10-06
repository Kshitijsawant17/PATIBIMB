"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { Scale } from "lucide-react";
import { useT } from "@/lib/i18n/SettingsContext";
import { SEVERITY_CHIP } from "@/lib/presenters/risk";
import type { RiskFactor, Severity } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RiskBreakdownProps extends HTMLAttributes<HTMLDivElement> {
  factors: RiskFactor[];
  score: number;
  labelFor?: (category: string) => string;
}

export const RiskBreakdown = forwardRef<HTMLDivElement, RiskBreakdownProps>(
  ({ factors, score, labelFor, className = "", ...props }, ref) => {
    const t = useT();

    if (factors.length === 0) return null;

    const labelForCategory = (category: string) =>
      labelFor ? labelFor(category) : t.categories[category] ?? category;

    return (
      <section
        ref={ref}
        aria-labelledby="risk-breakdown-heading"
        className={cn("card glass p-6", className)}
        {...props}
      >
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/[0.08] border border-cyan-500/20 flex items-center justify-center">
              <Scale className="w-5 h-5 text-cyan-400" aria-hidden="true" />
            </div>
            <h2 id="risk-breakdown-heading" className="heading-4 text-text-primary">
              {t.result?.howScoreCalculated ?? "Risk Breakdown"}
            </h2>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-text-primary tabular-nums">{score}</div>
            <div className="body-xs text-text-muted">Total Score</div>
          </div>
        </div>

        <p className="body-base text-text-secondary mb-5">
          Each detected category contributes its highest severity once. The score is the sum of these weights.
        </p>

        <ul className="space-y-3" role="list">
          {factors.map((factor) => (
            <li key={factor.category} className="flex items-center justify-between gap-4 p-4 bg-bg-surface/30 border border-border-hairline rounded-xl transition-all hover:border-border-subtle hover:bg-bg-surface/50">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium border",
                  SEVERITY_CHIP[factor.severity as keyof typeof SEVERITY_CHIP]
                )}>
                  {t.severities[factor.severity as keyof typeof t.severities] ?? factor.severity}
                </span>
                <span className="font-medium text-text-primary truncate">
                  {labelForCategory(factor.category)}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-24 h-2 bg-bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full"
                    style={{ width: `${Math.min(100, (factor.weight / 10) * 100)}%` }}
                  />
                </div>
                <span className="mono font-bold text-text-primary tabular-nums text-lg">
                  +{factor.weight}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5 pt-5 border-t border-border-hairline flex items-center justify-between">
          <span className="body-sm text-text-muted">
            Base score: 0
          </span>
          <span className="mono font-bold text-cyan-400 text-lg">
            = {score}
          </span>
        </div>
      </section>
    );
  }
);

RiskBreakdown.displayName = "RiskBreakdown";