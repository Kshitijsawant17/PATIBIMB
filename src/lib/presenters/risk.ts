import type { Severity } from "@/lib/types";

/** Chip colours, keyed by severity. */
export const SEVERITY_CHIP: Record<Severity, string> = {
  low: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  medium: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  high: "bg-orange-500/10 text-orange-300 border-orange-500/30",
  critical: "bg-red-500/10 text-red-300 border-red-500/30",
};

/** Badge variant, keyed by severity. */
export const SEVERITY_BADGE: Record<
  Severity,
  "success" | "warning" | "danger" | "neutral"
> = {
  // Amber avoids implying "safe" when a low-severity pattern still matched.
  low: "warning",
  medium: "warning",
  high: "danger",
  critical: "danger",
};

/**
 * Plain-language framing for the pattern level.
 *
 * Kept in the locale dictionaries rather than here, because the wording has to
 * be translatable and "critical" is not the same idea in every language.
 */
export const RISK_HEADLINES: Record<Severity, string> = {
  low: "A few known patterns matched",
  medium: "Some manipulation patterns detected",
  high: "Many high-severity patterns detected",
  critical: "Many critical manipulation patterns detected",
};
