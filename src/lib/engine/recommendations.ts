import type {
  ClaimCategory,
  ExtractedFact,
  RecommendedAction,
  Signal,
} from "../types";
import { DEFAULT_LOCALE, type Dictionary, type Locale } from "../i18n/types";
import { en } from "../i18n/en";
import { hi } from "../i18n/hi";
import { mr } from "../i18n/mr";
import { format } from "../i18n/types";

const DICTIONARIES: Record<Locale, Dictionary> = { en, hi, mr };

/**
 * Action copy, resolved per locale.
 *
 * Fixed safety guidance written as plain language. This is decision support for
 * verifying a message, never investment advice and never a fraud verdict.
 */
/**
 * Stems that have both a `Title` and an `Instruction` key in the dictionary.
 * Typing this as a union keeps the lookup below compile-checked, so renaming a
 * translation key becomes a build error instead of an "undefined" on screen.
 */
type ActionStem =
  | "paymentPause"
  | "withdrawalPause"
  | "deadline"
  | "identity"
  | "claims"
  | "social"
  | "review";

interface ActionTemplate {
  id: string;
  priority: RecommendedAction["priority"];
  /** Stem shared by the title and instruction keys in `Dictionary["actions"]`. */
  key: ActionStem;
  categories: ClaimCategory[];
  factKinds: ExtractedFact["kind"][];
}

/**
 * Ordered by priority. Payment first, because sending money is the most
 * irreversible step a user can take from a suspicious message.
 */
const ACTION_TEMPLATES: ActionTemplate[] = [
  {
    id: "action-payment-pause",
    priority: "urgent",
    key: "paymentPause",
    categories: ["payment-pressure", "withdrawal-pressure"],
    factKinds: ["amount", "payment-handle"],
  },
  {
    id: "action-wait-and-verify",
    priority: "urgent",
    key: "deadline",
    categories: ["urgency"],
    factKinds: ["deadline"],
  },
  {
    id: "action-verify-identity",
    priority: "important",
    key: "identity",
    categories: ["authority", "impersonation"],
    factKinds: [],
  },
  {
    id: "action-check-claims",
    priority: "important",
    key: "claims",
    categories: ["guaranteed-language", "unrealistic-outcome"],
    factKinds: ["percentage"],
  },
  {
    id: "action-check-social-proof",
    priority: "important",
    key: "social",
    categories: ["social-proof"],
    factKinds: [],
  },
  {
    id: "action-review-message",
    priority: "important",
    key: "review",
    categories: ["other"],
    factKinds: [],
  },
];

/**
 * Build the action plan for a completed analysis.
 *
 * At most three steps are returned so the panel stays readable on a small
 * screen. Each step cites the signal ids and fact ids that caused it, so the UI
 * can link straight to the evidence.
 */
export function recommendActions(
  signals: Signal[],
  facts: ExtractedFact[],
  locale: Locale = DEFAULT_LOCALE
): RecommendedAction[] {
  const copy = DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];

  if (signals.length === 0) {
    return [
      {
        id: "action-verify-anyway",
        priority: "general",
        title: copy.actions.identityTitle,
        instruction: copy.actions.identityInstruction,
        rationale: copy.empty.warningBody,
        signalIds: [],
        factIds: [],
      },
    ];
  }

  const byCategory = new Map<ClaimCategory, Signal[]>();
  for (const signal of signals) {
    const group = byCategory.get(signal.type) ?? [];
    group.push(signal);
    byCategory.set(signal.type, group);
  }

  const actions: RecommendedAction[] = [];

  for (const template of ACTION_TEMPLATES) {
    const matched = template.categories.flatMap(
      (category) => byCategory.get(category) ?? []
    );
    if (matched.length === 0) continue;

    const hasWithdrawalPressure = byCategory.has("withdrawal-pressure");

    // The single payment template covers both pressure types; the wording
    // differs because "pay a fee to withdraw" needs a different warning.
    // The single payment template covers both pressure types; the wording
    // differs because "pay a fee to withdraw" needs its own warning.
    const stem: ActionStem =
      template.id === "action-payment-pause" && hasWithdrawalPressure
        ? "withdrawalPause"
        : template.key;

    const examples = matched
      .slice(0, 2)
      .map((signal) => `“${signal.phrase}”`)
      .join(" ");

    actions.push({
      id: template.id,
      priority: template.priority,
      title: copy.actions[`${stem}Title`],
      instruction: copy.actions[`${stem}Instruction`],
      rationale: format(copy.actions.rationale, { examples }),
      signalIds: matched.map((signal) => signal.id),
      factIds: facts
        .filter((fact) => template.factKinds.includes(fact.kind))
        .map((fact) => fact.id),
    });

    if (actions.length === 3) break;
  }

  return actions;
}
