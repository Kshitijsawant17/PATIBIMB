import {
  Landmark,
  Clock,
  Users,
  TrendingUp,
  BadgeCheck,
  UserRound,
  Wallet,
  Lock,
  CircleHelp,
  type LucideIcon,
} from "lucide-react";

/**
 * One icon per manipulation category, so the same idea always looks the same
 * across the result page, the manipulation map and the replay.
 */
export const SIGNAL_ICONS: Record<string, LucideIcon> = {
  authority: Landmark,
  urgency: Clock,
  "social-proof": Users,
  "unrealistic-outcome": TrendingUp,
  "guaranteed-language": BadgeCheck,
  impersonation: UserRound,
  "payment-pressure": Wallet,
  "withdrawal-pressure": Lock,
  other: CircleHelp,
};

/** Tinted chip for the category icon. Tone is repeated in text, never colour alone. */
export const SIGNAL_TONES: Record<string, string> = {
  authority: "text-cyan-400 border-cyan-500/25 bg-cyan-500/[0.08]",
  urgency: "text-rose-400 border-rose-500/25 bg-rose-500/[0.08]",
  "social-proof": "text-violet-400 border-violet-500/25 bg-violet-500/[0.08]",
  "unrealistic-outcome": "text-amber-400 border-amber-500/25 bg-amber-500/[0.08]",
  "guaranteed-language": "text-amber-400 border-amber-500/25 bg-amber-500/[0.08]",
  impersonation: "text-orange-400 border-orange-500/25 bg-orange-500/[0.08]",
  "payment-pressure": "text-rose-400 border-rose-500/25 bg-rose-500/[0.08]",
  "withdrawal-pressure": "text-rose-400 border-rose-500/25 bg-rose-500/[0.08]",
  other: "text-text-tertiary border-border-subtle bg-bg-surface",
};

export const DEFAULT_SIGNAL_ICON = CircleHelp;

export function signalIcon(type: string): LucideIcon {
  return SIGNAL_ICONS[type] ?? DEFAULT_SIGNAL_ICON;
}

export function signalTone(type: string): string {
  return SIGNAL_TONES[type] ?? SIGNAL_TONES.other;
}