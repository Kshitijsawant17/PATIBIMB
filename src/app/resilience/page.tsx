"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Search,
  Timer,
  Scale,
  Link2,
  LifeBuoy,
  TrendingUp,
  BadgeCheck,
  ShieldQuestion,
  Landmark,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import Reveal from "@/components/ui/Reveal";
import ReadAloudButton from "@/components/voice/ReadAloudButton";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAnalysis } from "@/lib/analysis/AnalysisContext";
import { useDemo } from "@/lib/demo/DemoContext";
import { useSettings, useT } from "@/lib/i18n/SettingsContext";
import { signalIcon, signalTone } from "@/lib/signal-presentation";
import { cn } from "@/lib/utils";

const habitIcons: Record<string, LucideIcon> = {
  "search-check": Search,
  "timer-off": Timer,
  scale: Scale,
  "link-2-off": Link2,
};

/** The checkpoint answers. Tone is repeated in a word, never colour alone. */
const choiceOptions: Array<{ id: string; icon: LucideIcon; tone: string; statusKey: string }> = [
  { id: "walkaway", icon: ShieldCheck, tone: "emerald", statusKey: "choiceSafer" },
  { id: "verify", icon: Search, tone: "cyan", statusKey: "choiceNeutral" },
  { id: "trust", icon: ShieldQuestion, tone: "amber", statusKey: "choiceRiskier" },
];

/** The four tracked skills, in the order they should be listed. */
const progressTracks = [
  "authority",
  "urgency",
  "social-proof",
  "guaranteed-language",
] as const;

const toneChip: Record<string, string> = {
  emerald: "text-emerald-400 border-emerald-500/25 bg-emerald-500/[0.07]",
  cyan: "text-cyan-400 border-cyan-500/25 bg-cyan-500/[0.07]",
  amber: "text-amber-400 border-amber-500/25 bg-amber-500/[0.07]",
};

export default function ResiliencePage() {
  const router = useRouter();
  const { analysis, isReady, resetToSample } = useAnalysis();
  const { stopDemo } = useDemo();
  const { locale } = useSettings();
  const t = useT();
  const [choice, setChoice] = useState<string | null>(null);

  if (!isReady || !analysis) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-5 py-24">
          <div className="w-full max-w-md text-center" role="status" aria-live="polite">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border border-border-hairline" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-cyan-400" aria-hidden="true" />
              </div>
            </div>
            <p className="heading-3 text-text-primary mb-2">{t.loading.resilience}</p>
            <p className="body-base text-text-secondary">{t.loading.resultDetail}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const detectedCategories = new Set(analysis.signals.map((s) => s.type));

  const spokenSummary = [
    t.resilience.title,
    t.resilience.subtitle,
    ...analysis.habits.map((habit) => `${habit.title}. ${habit.description}`),
  ].join(". ");

  const hasPaymentRelatedSignal = analysis.riskBreakdown.some((factor) =>
    ["payment-pressure", "withdrawal-pressure"].includes(factor.category)
  );

  const selectedChoice = choiceOptions.find((c) => c.id === choice);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20 px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <Reveal className="max-w-2xl mx-auto text-center mb-10 sm:mb-12">
            <Badge variant="emerald" className="mb-5">
              <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
              {t.resilience.badge}
            </Badge>
            <h1 className="heading-1 text-text-primary mb-4 text-balance">{t.resilience.title}</h1>
            <p className="body-lg text-text-secondary mb-6">{t.resilience.subtitle}</p>
            <ReadAloudButton locale={locale} text={spokenSummary} />
          </Reveal>

          {/* ============ CHECKPOINT ============ */}
          <Reveal delay={60}>
            <section className="card p-6 sm:p-8 mb-5" aria-labelledby="checkpoint-heading">
              <h2 id="checkpoint-heading" className="heading-2 text-text-primary mb-2 text-balance">
                {t.resilience.checkpointTitle}
              </h2>
              <p className="body-base text-text-muted mb-6">{t.resilience.checkpointSubtitle}</p>

              <div
                className="grid sm:grid-cols-3 gap-2.5"
                role="radiogroup"
                aria-labelledby="checkpoint-heading"
              >
                {choiceOptions.map((option) => {
                  const active = choice === option.id;
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setChoice(option.id)}
                      role="radio"
                      aria-checked={active}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 px-3 py-5 rounded-xl border",
                        "text-[13px] font-medium text-center transition-all duration-200 min-h-[92px]",
                        active
                          ? "border-cyan-500/35 bg-cyan-500/[0.06] text-text-primary shadow-[0_0_18px_rgba(6,214,224,0.08)]"
                          : "bg-bg-surface border-border-hairline text-text-secondary hover:text-text-primary hover:border-border-subtle"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5 shrink-0",
                          active ? "text-cyan-400" : "text-text-muted"
                        )}
                        aria-hidden="true"
                      />
                      {t.resilience.choice[option.id] ?? option.id}
                    </button>
                  );
                })}
              </div>

              <p className="text-[13px] text-text-muted mt-5">{t.resilience.choiceHelp}</p>

              {selectedChoice && (
                <div className="mt-5 pt-5 border-t border-border-hairline animate-fade-in">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold mb-3",
                      toneChip[selectedChoice.tone]
                    )}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
                    {t.resilience[selectedChoice.statusKey as "choiceSafer" | "choiceRiskier" | "choiceNeutral"]}
                  </span>
                  <p className="body-base text-text-secondary">
                    {t.resilience[selectedChoice.statusKey as "choiceSafer" | "choiceRiskier" | "choiceNeutral"]}
                  </p>
                </div>
              )}
            </section>
          </Reveal>

          {/* ============ RESILIENCE PROGRESS ============ */}
          <Reveal delay={100}>
            <section className="card p-6 sm:p-8 mb-5" aria-labelledby="progress-heading">
              <h2 id="progress-heading" className="heading-2 text-text-primary mb-2">
                {t.resilience.progressTitle}
              </h2>
              <p className="body-base text-text-muted mb-7">{t.resilience.progressSubtitle}</p>

              <ul className="space-y-5">
                {progressTracks.map((track) => {
                  const seen = detectedCategories.has(track);
                  const Icon = signalIcon(track);
                  const label =
                    t.resilience.progressLabels[track] ??
                    t.categories[track as keyof typeof t.categories] ??
                    track;

                  return (
                    <li key={track}>
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={cn(
                              "shrink-0 flex items-center justify-center w-7 h-7 rounded-lg border",
                              seen ? signalTone(track) : "bg-bg-surface border-border-hairline text-text-muted"
                            )}
                          >
                            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                          </span>
                          <span className="text-[14px] font-medium text-text-primary truncate">
                            {label}
                          </span>
                        </span>
                        {seen ? (
                          <span className="shrink-0 inline-flex items-center gap-1.5 text-[12px] text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                            Recognised
                          </span>
                        ) : (
                          <span className="shrink-0 text-[12px] text-text-muted">
                            {t.resilience.progressNotYet}
                          </span>
                        )}
                      </div>
                      <ProgressBar
                        value={seen ? 100 : 0}
                        max={100}
                        size="sm"
                        animated
                        color={seen ? "emerald" : "violet"}
                        aria-label={label}
                      />
                    </li>
                  );
                })}
              </ul>
            </section>
          </Reveal>

          {/* ============ HABITS ============ */}
          <Reveal delay={140}>
            <section className="card p-6 sm:p-8 mb-5" aria-labelledby="habits-heading">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <h2 id="habits-heading" className="heading-2 text-text-primary">
                  {t.resilience.habitsTitle}
                </h2>
                <Badge variant="cyan" size="sm">
                  {analysis.habits.length}
                </Badge>
              </div>

              <ul className="grid sm:grid-cols-2 gap-3">
                {analysis.habits.map((habit) => {
                  const Icon = habitIcons[habit.icon] ?? Search;
                  return (
                    <li
                      key={habit.id}
                      className="flex items-start gap-3.5 p-4 rounded-xl bg-bg-surface/50 border border-border-hairline transition-colors duration-200 hover:border-border-subtle"
                    >
                      <span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20">
                        <Icon className="w-[18px] h-[18px] text-emerald-400" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-[14px] font-semibold text-text-primary mb-1">
                          {habit.title}
                        </h3>
                        <p className="text-[13px] leading-relaxed text-text-tertiary">
                          {habit.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </Reveal>

          {/* ============ THE POINT ============ */}
          <Reveal delay={180}>
            <div className="card p-7 sm:p-9 text-center mb-5 relative overflow-hidden">
              <div
                className="absolute inset-x-0 -bottom-24 h-48 bg-cyan-500/[0.05] blur-[80px] pointer-events-none"
                aria-hidden="true"
              />
              <span className="relative inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 mb-5">
                <TrendingUp className="w-6 h-6 text-white" aria-hidden="true" />
              </span>
              <p className="relative heading-2 text-text-primary mb-2">{t.resilience.goalLine1}</p>
              <p className="relative heading-2 gradient-text-cyan-violet mb-4 text-balance">
                {t.resilience.goalLine2}
              </p>
              <p className="relative body-base text-text-secondary max-w-md mx-auto">
                {t.resilience.goalBody}
              </p>
            </div>
          </Reveal>

          {/* Recovery */}
          {hasPaymentRelatedSignal && (
            <Reveal delay={200}>
              <Link href="/recovery" className="block mb-5 group">
                <div className="card p-5 flex items-center gap-4 border-cyan-500/25 hover:border-cyan-500/40 transition-colors duration-200">
                  <span className="shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <LifeBuoy className="w-5 h-5 text-cyan-400" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-text-primary">
                      {t.resilience.sentMoney}
                    </span>
                  </span>
                  <ArrowRight
                    className="w-5 h-5 text-text-muted shrink-0 group-hover:text-cyan-400 transition-colors"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            </Reveal>
          )}

          {/* Actions */}
          <Reveal delay={240}>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={() => {
                  stopDemo();
                  resetToSample();
                  router.push("/investigate");
                }}
                iconRight={<RotateCcw className="w-5 h-5" />}
              >
                {t.resilience.another}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push("/")}
                icon={<Landmark className="w-5 h-5" />}
              >
                {t.resilience.backHome}
              </Button>
            </div>
            <p className="text-[12px] text-text-muted text-center mt-8 max-w-lg mx-auto">
              {t.resilience.disclaimer}
            </p>
          </Reveal>
        </div>
      </main>

      <Footer />
    </div>
  );
}