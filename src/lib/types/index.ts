export type ClaimCategory =
  | "authority"
  | "urgency"
  | "social-proof"
  | "unrealistic-outcome"
  | "guaranteed-language"
  | "impersonation"
  | "payment-pressure"
  | "withdrawal-pressure"
  | "other";

export type EvidenceStatus =
  | "verified"
  | "needs-verification"
  | "no-evidence"
  | "contradicted";

export type Severity = "low" | "medium" | "high" | "critical";

/** A literal, zero-based UTF-16 range and a short excerpt from the source text. */
export interface TextEvidence {
  start: number;
  end: number;
  before: string;
  after: string;
  beforeTruncated: boolean;
  afterTruncated: boolean;
}

export interface Claim {
  id: string;
  text: string;
  category: ClaimCategory;
  severity: Severity;
  evidenceStatus: EvidenceStatus;
  explanation: string;
  verificationNeeded: string;
}

export interface Signal {
  id: string;
  /** Stable-in-this-engine rule identifier shown in the explanation. */
  ruleId: string;
  /** The claim created from the same rule match, so screens never have to guess the pairing. */
  claimId: string;
  type: ClaimCategory;
  severity: Severity;
  phrase: string;
  explanation: string;
  /** Exact location and nearby source text that caused this rule to match. */
  evidence: TextEvidence;
}

export type ExtractedFactKind =
  | "amount"
  | "percentage"
  | "deadline"
  | "payment-handle";

/** Literal detail extracted from the submitted message; never independently verified. */
export interface ExtractedFact {
  id: string;
  kind: ExtractedFactKind;
  label: string;
  value: string;
  evidence: TextEvidence;
}

export interface RecommendedAction {
  id: string;
  priority: "urgent" | "important" | "general";
  title: string;
  instruction: string;
  rationale: string;
  /** Signals that triggered this recommendation; empty for the no-match fallback. */
  signalIds: string[];
  factIds: string[];
}

/**
 * One row of the transparent risk breakdown shown in the UI.
 * Every risk score is explainable: each category contributes at most
 * one weight (its highest matched severity) to the overall score.
 */
export interface RiskFactor {
  category: ClaimCategory;
  label: string;
  severity: Severity;
  weight: number;
  matches: number;
}

export interface AnalysisResult {
  id: string;
  claims: Claim[];
  signals: Signal[];
  extractedFacts: ExtractedFact[];
  recommendedActions: RecommendedAction[];
  overallRisk: Severity;
  riskSummary: string;
  claimsDetected: number;
  signalsDetected: number;
  /** Sum of category weights. 0 when nothing matched. */
  riskScore: number;
  /** Per-category contribution to `riskScore`, highest weight first. */
  riskBreakdown: RiskFactor[];
}

export interface ReplayOutcome {
  id: string;
  label: string;
  scenario: string;
  probability: "low" | "medium" | "high";
  timeframe: string;
  emotionalImpact: string;
}

export interface ReplayBranch {
  id: string;
  title: string;
  description: string;
  outcomes: ReplayOutcome[];
}

export interface VerificationHabit {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface MockAnalysis {
  id: string;
  claims: Claim[];
  signals: Signal[];
  extractedFacts: ExtractedFact[];
  recommendedActions: RecommendedAction[];
  replay: ReplayBranch[];
  habits: VerificationHabit[];
  riskLevel: Severity;
  riskSummary: string;
  claimsDetected: number;
  signalsDetected: number;
  overallRisk: Severity;
  riskScore: number;
  riskBreakdown: RiskFactor[];
}
