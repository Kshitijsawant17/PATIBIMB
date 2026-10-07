import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { PATTERNS } from "@/lib/engine/patterns";
import { REGIONAL_PATTERNS } from "@/lib/engine/regional-patterns";

export const metadata: Metadata = {
  title: "How PRATIBIMB is built — problem, method, limits",
  description:
    "What PRATIBIMB does differently from a scam detector, how it handles uncertainty and privacy, what it cannot do, and how impact would be measured.",
};

const RULES = PATTERNS.length + REGIONAL_PATTERNS.length;

const PIPELINE = [
  ["Input", "Text, a screenshot, or a link. Screenshots are read by on-device OCR (English today). Links are inspected as text only and never opened."],
  ["Claim extraction", "Fixed rules copy out what the message says: amounts, percentages, deadlines, payment handles. Each keeps the exact character range it came from."],
  ["Risk-signal engine", `${RULES} deterministic rules (English, Hinglish, Hindi, Marathi) match persuasion tactics. Each tactic counts once at its strongest severity, so repeating "urgent!" cannot inflate the result.`],
  ["Explanation", "Every signal is shown with the exact words, a plain-language reason, and what to verify. Detected signals are never presented as verified facts."],
  ["Replay", "An educational simulation built from the tactics actually found. It shows how the message works on a reader. It does not predict what will happen."],
  ["Teach-back", "The person says why the message felt trustworthy. Their choice is mapped to a named reasoning pattern and one concrete habit."],
  ["Recovery", "If money was sent: preserve evidence, record the timeline, identify the recipient, prepare a summary, contact official channels. Never pay again to recover."],
];

const FAQ: [string, string][] = [
  ["What problem does this solve?", "First-time and newly digital investors receive persuasive investment messages on WhatsApp, Telegram and SMS. The damage is done by the persuasion, before any money moves. Most tools judge the message after the fact. PRATIBIMB works on the moment before."],
  ["How is this different from a scam detector?", "A detector gives a verdict and asks to be trusted. PRATIBIMB shows how the persuasion works (Manipulation Replay), asks why the message felt believable (Teach-Back), and turns that into a verification habit. Success means the person needs the tool less next time."],
  ["How do you handle uncertainty and false confidence?", "The product never says \"this is a scam\". It reports matched signals and separates three things: what the message says, what cannot be known from text, and what to verify on an official source the person finds themselves. Claims are never marked verified, because nothing is looked up."],
  ["What if the tool is wrong?", "A match is a warning, not proof, and the screen says so. Missing a tactic is possible: the rules are finite and a determined sender can reword. Every result cites its rule and exact text so a person or reviewer can see why it fired, and the checks in scripts/check-engine.mjs guard against regressions and false positives."],
  ["How is privacy protected?", "Analysis, OCR and link checks run in the browser. No message, image or link is sent to a server or AI service, and the OCR runtime is served from this site rather than a third-party CDN. The tool never asks for passwords, OTPs or banking details."],
  ["Why use rules instead of an AI model?", "The core question is verification, which needs traceable reasoning. Rules are auditable, work offline, cost nothing per use, and cannot invent a regulator check. A language model could later help extract claims from messy text, with the rules still deciding what is shown."],
  ["Can it work in regional languages?", "The interface and many explanations exist in English, Hindi and Marathi, and the rule engine already has Hindi, Marathi and Hinglish rules. Screenshot reading is English-only today; other languages need additional OCR language models. The Marathi rule explanations need native-speaker review."],
  ["Why wouldn't WhatsApp, Google or SEBI just build this?", "They may build detection. The part that is hard for them is a private, on-device teaching loop that does not claim authority over a person's decision. This is a judgement, not a tested claim."],
  ["Can it scale?", "It is a static front end with no server-side analysis, so cost per user is near zero and it works offline. Scaling the hard part means growing and maintaining rules and translations, which needs community and regulator input."],
];

const METRICS = [
  "Investigation completion rate (people who reach the explanation after starting)",
  "Teach-back completion rate",
  "Pattern recognition: whether people name the tactic correctly in later sessions",
  "Verification behaviour: share choosing Verify or Walk away at the checkpoint",
  "Recovery workflow completion among people who report a payment",
  "Repeat dependence: whether people need the tool less over time",
];

const LIMITS = [
  "No live verification: the tool does not check any registry, so it cannot confirm that anyone is or is not registered.",
  "Rule coverage is finite. New wording can evade it until rules are updated.",
  "Screenshot reading supports English only and can misread text; the person is asked to check it.",
  "Link check reads the address text only. It says nothing about the page behind it.",
  "No user study has been run, so there are no measured impact figures.",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-20 px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow mb-3">For judges and reviewers</p>
          <h1 className="heading-1 text-text-primary mb-4 text-balance">
            An investor-resilience system, not a scam detector
          </h1>
          <p className="body-lg text-text-secondary mb-10">
            PRATIBIMB doesn&apos;t just flag suspicious financial content. It shows how the manipulation
            works, asks why it felt trustworthy, and turns that into a verification habit. This page
            explains how, and where it falls short.
          </p>

          <section className="card p-6 sm:p-8 mb-6" aria-labelledby="pipeline">
            <h2 id="pipeline" className="heading-3 text-text-primary mb-5">How it works</h2>
            <ol className="space-y-4">
              {PIPELINE.map(([title, body], i) => (
                <li key={title} className="flex gap-4">
                  <span className="shrink-0 font-mono text-[11px] font-bold text-cyan-400 pt-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-text-primary">{title}</p>
                    <p className="text-[13px] text-text-secondary leading-relaxed mt-0.5">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="text-[12px] text-text-muted mt-5">
              There is no AI model in the loop today. Rules extract and validate; the interface explains.
            </p>
          </section>

          <section className="card p-6 sm:p-8 mb-6" aria-labelledby="limits">
            <h2 id="limits" className="heading-3 text-text-primary mb-4">What it cannot do</h2>
            <ul className="space-y-2.5">
              {LIMITS.map((item) => (
                <li key={item} className="flex gap-2.5 text-[13px] leading-relaxed text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-[7px] shrink-0" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-6 sm:p-8 mb-6" aria-labelledby="metrics">
            <h2 id="metrics" className="heading-3 text-text-primary mb-1.5">Metrics we would measure in deployment</h2>
            <p className="text-[13px] text-text-muted mb-4">No usage statistics exist yet. These are potential impact measures, not results.</p>
            <ul className="space-y-2.5">
              {METRICS.map((item) => (
                <li key={item} className="flex gap-2.5 text-[13px] leading-relaxed text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-[7px] shrink-0" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="faq" className="mb-6">
            <h2 id="faq" className="heading-3 text-text-primary mb-4">Questions a reviewer would ask</h2>
            <div className="space-y-3">
              {FAQ.map(([q, a]) => (
                <details key={q} className="card group p-5">
                  <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden text-[14px] font-semibold text-text-primary">
                    {q}
                  </summary>
                  <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">{a}</p>
                </details>
              ))}
            </div>
          </section>

          <p className="text-[12px] text-text-muted">
            PRATIBIMB is educational. It gives no investment advice and cannot recover money.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
