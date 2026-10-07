import { ClaimCategory } from "../types";

/**
 * Teach-back: map the reason a person gave for trusting a message to a named
 * reasoning pattern, so recognition can turn into a habit.
 *
 * Two inputs, in order of reliability:
 *  1. Reason chips. They carry a stable id, so the mapping is exact and does not
 *     depend on the language the person's interface is in.
 *  2. Free text. Matched with word-boundary keywords only; it is a best-effort
 *     hint and falls back to "general trust reasoning" rather than guessing.
 */

export type ReasonId = "official" | "returns" | "urgent" | "others" | "notime";

/** Reason chip -> the persuasion tactic it responds to. */
export const REASON_CATEGORY: Record<ReasonId, ClaimCategory> = {
  official: "authority",
  returns: "guaranteed-language",
  urgent: "urgency",
  others: "social-proof",
  // "I had no time to verify" is the effect of urgency, not of a payment demand.
  notime: "urgency",
};

/** Plain-language names for the reasoning pattern (English default; locales override). */
export const REASONING_LABELS: Record<ClaimCategory, string> = {
  authority: "Authority bias",
  urgency: "Urgency pressure",
  "social-proof": "Social proof",
  "unrealistic-outcome": "Outcome promise",
  "guaranteed-language": "Trust in guaranteed outcomes",
  impersonation: "Trust in a familiar-sounding sender",
  "payment-pressure": "Pressure to pay first",
  "withdrawal-pressure": "Pressure to pay before withdrawing",
  other: "General trust reasoning",
};

export interface TeachBackInput {
  /** Selected reason-chip ids. Unknown ids are ignored. */
  reasonIds: string[];
  /** Free text, if any. */
  text: string;
}

export interface TeachBackAnalysis {
  id: string;
  detectedReasoning: ClaimCategory[];
  /** English names, parallel to `detectedReasoning`. Screens localise via the category. */
  reasoningLabels: string[];
  /** What the person said, for display. */
  response: string;
  checklist: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  category: ClaimCategory | "general";
}

/**
 * Keywords are matched at a word start (`\bkeyword`) so "call" or "small" can
 * never be read as "all", and "know" can never be read as "now". Multi-word
 * phrases are used where a single word would be ambiguous.
 */
const KEYWORDS: { category: ClaimCategory; words: string[] }[] = [
  {
    category: "authority",
    words: ["sebi", "registered", "official", "government", "approved", "licensed", "certified", "regulator", "authority", "आधिकारिक", "सरकारी", "सेबी", "अधिकृत"],
  },
  {
    category: "social-proof",
    words: ["everyone", "everybody", "others", "members", "lakh", "thousand", "crore", "group", "community", "many people", "सब ", "सभी", "सगळे", "सर्व"],
  },
  {
    category: "urgency",
    words: ["today", "last chance", "limited", "urgent", "immediately", "expire", "deadline", "hurry", "no time", "right now", "जल्दी", "आज ही", "आजच", "घाई"],
  },
  {
    category: "guaranteed-language",
    words: ["guarantee", "profit", "return", "earn", "income", "double", "triple", "risk-free", "risk free", "गारंटी", "मुनाफा", "नफा", "परतावा"],
  },
  { category: "payment-pressure", words: ["send money", "deposit", "upi", "transfer", "payment"] },
  { category: "withdrawal-pressure", words: ["withdraw", "unlock", "release", "fee", "charge", "processing"] },
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function textMatches(text: string, word: string): boolean {
  // `\b` does not work for Devanagari, so Indic keywords use a plain substring test.
  if (/[^\u0000-\u007f]/.test(word)) return text.includes(word);
  return new RegExp(`\\b${escapeRegExp(word)}`, "i").test(text);
}

/** Questions a person can ask themselves next time. Texts are localised by id. */
export const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: "check-1", text: "Can I check this claim myself, from an official source, before I invest?", category: "general" },
  { id: "check-2", text: "Did this feel convincing mainly because of the urgency?", category: "urgency" },
  { id: "check-3", text: "Did I ask for the terms of the returns in writing?", category: "guaranteed-language" },
  { id: "check-4", text: "Did I talk to someone I trust before sending any money?", category: "general" },
  { id: "check-5", text: "I will never share an OTP, password or PIN with anyone.", category: "general" },
];

export function analyzeTeachBack(input: TeachBackInput): TeachBackAnalysis {
  const detected: ClaimCategory[] = [];
  const add = (category: ClaimCategory) => {
    if (!detected.includes(category)) detected.push(category);
  };

  // 1. Chips are exact.
  for (const id of input.reasonIds) {
    const category = REASON_CATEGORY[id as ReasonId];
    if (category) add(category);
  }

  // 2. Free text adds anything the chips did not already cover.
  const text = (input.text ?? "").trim();
  if (text) {
    for (const { category, words } of KEYWORDS) {
      if (words.some((word) => textMatches(text, word))) add(category);
    }
  }

  if (detected.length === 0) add("other");

  return {
    id: `tb-${Date.now()}`,
    detectedReasoning: detected,
    reasoningLabels: detected.map((c) => REASONING_LABELS[c]),
    response: text,
    checklist: DEFAULT_CHECKLIST,
  };
}
