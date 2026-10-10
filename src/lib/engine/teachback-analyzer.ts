import { ClaimCategory } from "../types";

export interface TeachBackAnalysis {
  id: string;
  detectedReasoning: ClaimCategory[];
  reasoningLabels: string[];
  response: string;
  checklist: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  category: ClaimCategory | "general";
}

const REASONING_PATTERNS: {
  keywords: string[];
  category: ClaimCategory;
  label: string;
}[] = [
  {
    keywords: ["sebi", "registered", "official", "government", "approved", "licensed", "certified", "authority", "regulator"],
    category: "authority",
    label: "Authority-based reasoning",
  },
  {
    keywords: ["everyone", "others", "people", "members", "lakhs", "thousands", "crores", "all", "group", "community"],
    category: "social-proof",
    label: "Social proof reasoning",
  },
  {
    keywords: ["today", "last chance", "limited", "urgent", "now", "immediately", "expires", "deadline", "act fast", "hurry", "quick"],
    category: "urgency",
    label: "Urgency-based reasoning",
  },
  {
    keywords: ["guaranteed", "profit", "return", "money", "earn", "income", "double", "triple", "risk-free", "safe"],
    category: "guaranteed-language",
    label: "Outcome-based reasoning",
  },
  {
    keywords: ["send", "pay", "deposit", "upi", "money", "transfer", "payment"],
    category: "payment-pressure",
    label: "Payment-based reasoning",
  },
  {
    keywords: ["withdraw", "unlock", "release", "fee", "charge", "processing"],
    category: "withdrawal-pressure",
    label: "Withdrawal-based reasoning",
  },
];

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: "check-1", text: "Verify the entity independently", category: "general" },
  { id: "check-2", text: "Check the claim using an authoritative source", category: "general" },
  { id: "check-3", text: "Don't rely only on links supplied by the sender", category: "general" },
  { id: "check-4", text: "Don't let urgency replace verification", category: "urgency" },
  { id: "check-5", text: "Never share OTPs/passwords", category: "general" },
];

/**
 * Analyze teach-back response using simple keyword matching.
 * Returns detected reasoning categories and a checklist.
 */
export function analyzeTeachBack(response: string): TeachBackAnalysis {
  const lowerResponse = response.toLowerCase();
  const detectedReasoning: ClaimCategory[] = [];
  const reasoningLabels: string[] = [];

  for (const pattern of REASONING_PATTERNS) {
    const matched = pattern.keywords.some((keyword) => lowerResponse.includes(keyword));
    if (matched && !detectedReasoning.includes(pattern.category)) {
      detectedReasoning.push(pattern.category);
      reasoningLabels.push(pattern.label);
    }
  }

  // If no specific reasoning detected, default to general
  if (detectedReasoning.length === 0) {
    detectedReasoning.push("other");
    reasoningLabels.push("General trust reasoning");
  }

  return {
    id: `tb-${Date.now()}`,
    detectedReasoning,
    reasoningLabels,
    response,
    checklist: DEFAULT_CHECKLIST,
  };
}
