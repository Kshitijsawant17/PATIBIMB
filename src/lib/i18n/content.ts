import type { Pattern } from "../engine/patterns";
import {
  DEFAULT_LOCALE,
  type ContentDictionary,
  type Locale,
  type PatternCopy,
  type RecoveryItemCopy,
  type ReplayBranchCopy,
} from "./types";
import { enContent } from "./content/en";
import { hiContent } from "./content/hi";
import { mrContent } from "./content/mr";

/**
 * Translated copy for content that lives inside data files rather than in JSX:
 * manipulation-rule explanations, replay scripts, and the recovery checklist.
 *
 * Every lookup falls back to English. A missing translation therefore degrades
 * to readable English instead of showing a blank string, which matters more than
 * strict completeness on a low-end phone.
 */

const CONTENT: Record<Locale, ContentDictionary> = {
  en: enContent,
  hi: hiContent,
  mr: mrContent,
};

/**
 * Pick the best available locale for content.
 *
 * Uses `navigator.languages` when available so a user who only has Hindi
 * installed still gets Hindi, rather than being dropped back to English.
 */
export function pickLocale(preferred?: string | null): Locale {
  if (preferred) {
    const lower = preferred.toLowerCase();
    if (lower.startsWith("hi")) return "hi";
    if (lower.startsWith("mr")) return "mr";
    if (lower.startsWith("en")) return "en";
  }

  if (typeof navigator !== "undefined") {
    for (const tag of navigator.languages ?? []) {
      const lower = tag.toLowerCase();
      if (lower.startsWith("hi")) return "hi";
      if (lower.startsWith("mr")) return "mr";
    }
  }

  return DEFAULT_LOCALE;
}

/**
 * Translated copy for one manipulation rule, falling back to the rule's own
 * English text. The pattern is required so the fallback is always meaningful.
 */
export function getPatternCopy(locale: Locale, key: string): PatternCopy;
export function getPatternCopy(locale: Locale, pattern: Pattern): PatternCopy;
export function getPatternCopy(
  locale: Locale,
  keyOrPattern: string | Pattern
): PatternCopy {
  const fallback: PatternCopy = {
    claimText: typeof keyOrPattern === "string" ? "" : keyOrPattern.claimText,
    explanation: typeof keyOrPattern === "string" ? "" : keyOrPattern.explanation,
    verificationNeeded:
      typeof keyOrPattern === "string" ? "" : keyOrPattern.verificationNeeded,
  };
  if (!keyOrPattern) return fallback;

  const key =
    typeof keyOrPattern === "string"
      ? keyOrPattern
      : (keyOrPattern.copyKey ??
        keyOrPattern.claimText
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""));

  const localized = CONTENT[locale]?.patterns?.[key];
  if (localized) {
    return {
      claimText: localized.claimText || fallback.claimText,
      explanation: localized.explanation || fallback.explanation,
      verificationNeeded: localized.verificationNeeded || fallback.verificationNeeded,
    };
  }
  return fallback;
}

/** Translated replay branch, or null when the locale has no copy for it. */
export function getReplayCopy(
  locale: Locale,
  branchId: string
): ReplayBranchCopy | null {
  return CONTENT[locale]?.replay?.[branchId] ?? null;
}

/** Translated recovery checklist row, falling back to English. */
export function getRecoveryItemCopy(
  locale: Locale,
  itemId: string,
  fallback: RecoveryItemCopy
): RecoveryItemCopy {
  const localized = CONTENT[locale]?.recoveryItems?.[itemId];
  if (!localized) return fallback;
  return {
    label: localized.label || fallback.label,
    description: localized.description || fallback.description,
  };
}

/** Translated timeline row label, falling back to English. */
export function getRecoveryTimelineCopy(
  locale: Locale,
  eventId: string,
  fallback: string
): string {
  return CONTENT[locale]?.recoveryTimeline?.[eventId] || fallback;
}

/** Localised name of a teach-back reasoning pattern, falling back to the English name. */
export function getTeachbackLabel(
  locale: Locale,
  category: string,
  fallback: string
): string {
  return CONTENT[locale]?.teachback?.labels?.[category] || fallback;
}

/** Localised self-check question, falling back to the English text. */
export function getTeachbackChecklistText(
  locale: Locale,
  itemId: string,
  fallback: string
): string {
  return CONTENT[locale]?.teachback?.checklist?.[itemId] || fallback;
}

/** Total number of rule descriptions a locale translates. */
export function countPatternTranslations(locale: Locale): number {
  return Object.keys(CONTENT[locale]?.patterns ?? {}).length;
}

export { enContent, hiContent, mrContent };
