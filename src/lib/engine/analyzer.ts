import {
  AnalysisResult,
  Claim,
  ClaimCategory,
  EvidenceStatus,
  RiskFactor,
  Severity,
  Signal,
} from "../types";
import { DEFAULT_LOCALE, type Locale } from "../i18n/types";
import { getPatternCopy } from "../i18n/content";
import { CATEGORY_LABELS, PATTERNS } from "./patterns";
import { REGIONAL_PATTERNS } from "./regional-patterns";
import { createTextEvidence } from "./evidence";
import { extractMessageFacts } from "./extractor";
import { recommendActions } from "./recommendations";

/**
 * English rules first, then Hindi/Marathi/Hinglish rules.
 *
 * Ordering matters: the English rules are the more precise ones, so they get
 * first claim on a phrase. Regional rules then add coverage for wording that
 * only appears in Hinglish or a regional language.
 */
const ALL_PATTERNS = [...PATTERNS, ...REGIONAL_PATTERNS];

/**
 * Deterministic rule-based analyzer.
 * No AI, no APIs — just pattern matching against known manipulation signals.
 *
 * Every score this function returns is explainable: `riskScore` is the sum of
 * per-category weights, and `riskBreakdown` shows exactly which categories
 * contributed and by how much.
 */

/** Weight of a single detected category, keyed by its highest severity. */
export const SEVERITY_WEIGHTS: Record<Severity, number> = {
  low: 1,
  medium: 3,
  high: 6,
  critical: 10,
};

const SEVERITY_ORDER: Severity[] = ["low", "medium", "high", "critical"];

/**
 * Score bands, evaluated ascending. The first band whose ceiling the score
 * falls under wins, so a score of 0 is always "low".
 */
const RISK_BANDS: { max: number; level: Severity }[] = [
  { max: 3, level: "low" },
  { max: 9, level: "medium" },
  { max: 17, level: "high" },
  { max: Infinity, level: "critical" },
];

const RISK_SUMMARIES: Record<Severity, string> = {
  low: "Low manipulation risk — few known patterns matched",
  medium: "Some manipulation patterns detected",
  high: "Multiple high-severity manipulation patterns detected",
  critical: "Multiple critical manipulation patterns detected",
};

/**
 * Match all patterns against the raw text.
 * IDs are scoped to a single analysis so results never depend on call order.
 */
export function analyzeMessage(
  rawText: string,
  locale: Locale = DEFAULT_LOCALE
): AnalysisResult {
  const text = typeof rawText === "string" ? rawText : "";
  const claims: Claim[] = [];
  const signals: Signal[] = [];

  // Scoped per analysis instead of module-global, so IDs are reproducible.
  let idCounter = 0;
  const nextId = (prefix: string) => `${prefix}-${++idCounter}`;

  ALL_PATTERNS.forEach((pattern, index) => {
    const match = text.match(pattern.regex);
    if (!match) return;

    const rawPhrase = match[0] ?? "";
    const phrase = rawPhrase.trim();
    if (!phrase) return;
    const leadingWhitespace = rawPhrase.length - rawPhrase.trimStart().length;
    const matchStart = (match.index ?? 0) + leadingWhitespace;
    const evidence = createTextEvidence(text, matchStart, matchStart + phrase.length);

    // Pass the whole pattern so a missing translation falls back to this rule's
    // own English text rather than to an empty string.
    const copy = getPatternCopy(locale, pattern);

    claims.push({
      id: nextId("claim"),
      text: copy.claimText,
      category: pattern.category,
      severity: pattern.severity,
      evidenceStatus: determineEvidenceStatus(pattern.category, text),
      explanation: copy.explanation,
      verificationNeeded: copy.verificationNeeded,
    });

    signals.push({
      id: nextId("signal"),
      ruleId: `R${String(index + 1).padStart(2, "0")}`,
      type: pattern.category,
      severity: pattern.severity,
      phrase,
      explanation: copy.explanation,
      evidence,
    });
  });

  const extractedFacts = extractMessageFacts(text);
  const recommendedActions = recommendActions(signals, extractedFacts, locale);
  const riskBreakdown = buildRiskBreakdown(signals);
  const riskScore = riskBreakdown.reduce((sum, f) => sum + f.weight, 0);
  const overallRisk = scoreToSeverity(riskScore);

  return {
    id: nextId("analysis"),
    claims,
    signals,
    extractedFacts,
    recommendedActions,
    overallRisk,
    riskSummary: generateRiskSummary(overallRisk, signals.length),
    claimsDetected: claims.length,
    signalsDetected: signals.length,
    riskScore,
    riskBreakdown,
  };
}

/**
 * Collapse signals into one weight per category.
 *
 * A category is capped at its highest matched severity so that repeating the
 * same tactic ("urgent! urgent! urgent!") cannot inflate the score. Breadth of
 * distinct tactics is what raises risk, not repetition of one.
 */
function buildRiskBreakdown(signals: Signal[]): RiskFactor[] {
  const byCategory = new Map<ClaimCategory, { severity: Severity; matches: number }>();

  for (const signal of signals) {
    const existing = byCategory.get(signal.type);
    if (!existing) {
      byCategory.set(signal.type, { severity: signal.severity, matches: 1 });
      continue;
    }
    existing.matches += 1;
    if (SEVERITY_ORDER.indexOf(signal.severity) > SEVERITY_ORDER.indexOf(existing.severity)) {
      existing.severity = signal.severity;
    }
  }

  return Array.from(byCategory.entries())
    .map(([category, { severity, matches }]) => ({
      category,
      label: CATEGORY_LABELS[category],
      severity,
      weight: SEVERITY_WEIGHTS[severity],
      matches,
    }))
    .sort((a, b) => b.weight - a.weight || a.label.localeCompare(b.label));
}

export function scoreToSeverity(score: number): Severity {
  const band = RISK_BANDS.find((b) => score <= b.max);
  return band ? band.level : "low";
}

function determineEvidenceStatus(
  category: string,
  rawText: string
): EvidenceStatus {
  // Check for verification indicators
  const hasRegNumber = /(registration\s*(no|number|#)|reg\s*(no|number|#))/i.test(rawText);
  const hasWebsite = /(www\.|https?:\/\/|website)/i.test(rawText);
  const hasContact = /(phone|contact|call|email|address)/i.test(rawText);

  if (category === "authority") {
    if (hasRegNumber) return "needs-verification";
    return "no-evidence";
  }

  if (category === "payment-pressure" || category === "withdrawal-pressure") {
    return "no-evidence";
  }

  if (hasWebsite || hasContact) {
    return "needs-verification";
  }

  return "no-evidence";
}

function generateRiskSummary(risk: Severity, signalCount: number): string {
  if (signalCount === 0) {
    return "No known manipulation patterns matched";
  }

  return RISK_SUMMARIES[risk];
}

/**
 * Get explanation for why a signal was shown
 */
export function getSignalExplanation(signal: Signal): string {
  return `Signal detected: ${CATEGORY_LABELS[signal.type]}\n\nWhy it matters:\n${signal.explanation}\n\nThis signal alone does not establish that the message is fraudulent.`;
}

/**
 * Get explanation for why a claim was shown
 */
export function getClaimExplanation(claim: Claim): string {
  return `Claim detected: ${claim.text}\n\nCategory: ${CATEGORY_LABELS[claim.category]}\n\nWhy it matters:\n${claim.explanation}\n\nVerification needed:\n${claim.verificationNeeded}`;
}
