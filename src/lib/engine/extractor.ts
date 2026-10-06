import type { ExtractedFact, ExtractedFactKind } from "../types";
import { createTextEvidence } from "./evidence";

const MAX_FACTS = 12;

interface FactRule {
  kind: ExtractedFactKind;
  label: string;
  regex: RegExp;
  shouldInclude?: (text: string, start: number, value: string) => boolean;
}

/**
 * Pull out literal details that help a person verify a suspicious message.
 *
 * These are text extractions, not verified financial facts. Every result is
 * anchored to its exact source range, and an upper bound keeps unusual input
 * from flooding the interface.
 */
const FACT_RULES: FactRule[] = [
  {
    kind: "amount",
    label: "Amount mentioned",
    regex: /(?:₹\s*\d[\d,]*(?:\.\d+)?|\b(?:INR|Rs\.?)\s*\d[\d,]*(?:\.\d+)?)/gi,
  },
  {
    kind: "percentage",
    label: "Percentage mentioned",
    regex: /\b\d{1,4}(?:\.\d+)?\s?%/gi,
  },
  {
    kind: "deadline",
    label: "Deadline or time pressure",
    regex:
      /\b(?:today\s+only|(?:before|by|until|till|deadline(?:\s+(?:is|at))?|expires?\s*(?:at|on)?)\s+\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?|o'clock)(?:\s+(?:today|tonight|tomorrow))?|expires?\s+(?:today|tonight|tomorrow))/gi,
  },
  {
    kind: "payment-handle",
    label: "Possible payment handle",
    regex: /\b[a-z0-9._-]{2,}@[a-z][a-z0-9.-]{1,}\b/gi,
    shouldInclude: (text, start, value) => {
      const nearbyText = text.slice(Math.max(0, start - 36), start + value.length + 36);
      return /@upi\b/i.test(value) || /\bupi\b|\bpay(?:ment)?\b|\btransfer\b/i.test(nearbyText);
    },
  },
];

export function extractMessageFacts(input: string): ExtractedFact[] {
  const text = typeof input === "string" ? input : "";
  const facts: Array<Omit<ExtractedFact, "id">> = [];

  for (const rule of FACT_RULES) {
    for (const match of text.matchAll(rule.regex)) {
      const value = match[0]?.trim();
      if (!value) continue;

      const rawStart = match.index ?? 0;
      const leadingWhitespace = match[0].length - match[0].trimStart().length;
      const start = rawStart + leadingWhitespace;
      const end = start + value.length;

      if (rule.shouldInclude && !rule.shouldInclude(text, start, value)) continue;

      facts.push({
        kind: rule.kind,
        label: rule.label,
        value,
        evidence: createTextEvidence(text, start, end),
      });
    }
  }

  const uniqueFacts = new Map<string, Omit<ExtractedFact, "id">>();
  for (const fact of facts.sort((a, b) => a.evidence.start - b.evidence.start)) {
    const key = `${fact.kind}:${fact.evidence.start}:${fact.evidence.end}`;
    if (!uniqueFacts.has(key)) uniqueFacts.set(key, fact);
  }

  return Array.from(uniqueFacts.values())
    .slice(0, MAX_FACTS)
    .map((fact, index) => ({ ...fact, id: `fact-${index + 1}` }));
}
