"use client";

import { Eye, HelpCircle, ShieldCheck } from "lucide-react";
import { useT, format } from "@/lib/i18n/SettingsContext";
import type { ClaimCategory, MockAnalysis } from "@/lib/types";

type UnknownKey = keyof ReturnType<typeof useT>["result"]["triad"]["unknowns"];

const MAX_ROWS = 4;

/**
 * Separates three things that are easy to blur:
 *  - what is literally written in the message (seen, not verified),
 *  - what nobody can tell from the text alone,
 *  - what the person should check on an official source.
 *
 * Everything here is derived from the engine's own output. Nothing is looked up
 * externally, so nothing here claims that a regulator or a person was checked.
 */
export default function KnowledgeTriad({ analysis }: { analysis: MockAnalysis }) {
  const t = useT();
  const copy = t.result.triad;

  const tactics = Array.from(new Set(analysis.signals.map((s) => s.type)));
  const signalCount = analysis.signals.length;

  const know: string[] = [
    format(copy.signalsLine, {
      count: signalCount,
      plural: signalCount === 1 ? "" : "s",
      tactics: tactics.length,
      tacticPlural: tactics.length === 1 ? "" : "s",
    }),
    ...analysis.extractedFacts.slice(0, MAX_ROWS - 1).map((fact) =>
      format(copy.statesLine, {
        kind: t.facts[fact.kind as keyof typeof t.facts] ?? fact.kind,
        value: fact.value,
      })
    ),
  ];

  // What the text cannot tell you, one line per tactic that was seen. The sender
  // is always unknown from text alone, so it is always listed.
  const unknown: string[] = tactics
    .filter((c): c is Exclude<ClaimCategory, "other"> => c in copy.unknowns)
    .slice(0, MAX_ROWS - 1)
    .map((c) => copy.unknowns[c as UnknownKey]);
  if (!tactics.includes("impersonation")) unknown.push(copy.unknowns.sender);

  // What to verify: the first verification step of each distinct tactic.
  const seen = new Set<ClaimCategory>();
  const verify: string[] = [];
  for (const claim of analysis.claims) {
    if (seen.has(claim.category)) continue;
    seen.add(claim.category);
    verify.push(claim.verificationNeeded);
    if (verify.length >= MAX_ROWS) break;
  }

  const columns = [
    {
      key: "know",
      title: copy.knowTitle,
      note: copy.knowNote,
      items: know,
      Icon: Eye,
      tone: "text-cyan-400",
      chip: "bg-cyan-500/10 border-cyan-500/20",
      dot: "bg-cyan-400",
    },
    {
      key: "dont-know",
      title: copy.dontKnowTitle,
      note: copy.dontKnowNote,
      items: unknown,
      Icon: HelpCircle,
      tone: "text-amber-400",
      chip: "bg-amber-500/10 border-amber-500/20",
      dot: "bg-amber-400",
    },
    {
      key: "verify",
      title: copy.verifyTitle,
      note: copy.verifyNote,
      items: verify,
      Icon: ShieldCheck,
      tone: "text-violet-400",
      chip: "bg-violet-500/10 border-violet-500/20",
      dot: "bg-violet-400",
    },
  ];

  return (
    <section className="card p-6 sm:p-8 mb-6" aria-labelledby="triad-heading">
      <h2 id="triad-heading" className="heading-3 text-text-primary mb-1.5">
        {copy.title}
      </h2>
      <p className="body-base text-text-secondary mb-6 max-w-2xl">{copy.subtitle}</p>

      <div className="grid md:grid-cols-3 gap-3">
        {columns.map(({ key, title, note, items, Icon, tone, chip, dot }) => (
          <div
            key={key}
            className="rounded-xl border border-border-hairline bg-bg-surface/50 p-5 min-w-0"
          >
            <div className="flex items-center gap-2.5 mb-1">
              <span
                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border shrink-0 ${chip}`}
              >
                <Icon className={`w-4 h-4 ${tone}`} aria-hidden="true" />
              </span>
              <h3 className="text-[14px] font-semibold text-text-primary leading-snug">{title}</h3>
            </div>
            <p className="text-[11px] text-text-muted mb-4 pl-[42px]">{note}</p>
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-text-secondary">
                  <span className={`w-1.5 h-1.5 rounded-full mt-[7px] shrink-0 ${dot}`} aria-hidden="true" />
                  <span className="min-w-0 break-words">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
