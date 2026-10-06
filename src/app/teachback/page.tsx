"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Brain,
  Zap,
  RefreshCw,
  Quote,
  ArrowRight as ArrowIcon,
  Landmark,
  Clock,
  Users,
  TrendingUp,
  BadgeCheck,
  Wallet,
  ShieldQuestion,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Reveal from "@/components/ui/Reveal";
import ReadAloudButton from "@/components/voice/ReadAloudButton";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { analyzeTeachBack, type TeachBackAnalysis } from "@/lib/engine/teachback-analyzer";
import { STORAGE_KEYS, writeSessionJSON } from "@/lib/storage";
import { useDemo } from "@/lib/demo/DemoContext";
import { useSettings, useT } from "@/lib/i18n/SettingsContext";
import { signalIcon, signalTone } from "@/lib/signal-presentation";
import { cn } from "@/lib/utils";

/**
 * Emotion chips. No emoji — each feeling gets an icon chip so the row reads as
 * a control, not as a sticker sheet.
 */
const emotionOptions: Array<{ id: string; icon: LucideIcon; key: string }> = [
  { id: "excited", icon: Sparkles, key: "excited" },
  { id: "fearful", icon: ShieldQuestion, key: "fearful" },
  { id: "curious", icon: Brain, key: "curious" },
  { id: "pressured", icon: Clock, key: "pressured" },
  { id: "trusting", icon: BadgeCheck, key: "trusting" },
  { id: "other", icon: Brain, key: "other" },
];

/** Why the message felt trustworthy. These map to the analyzer's categories. */
const reasonOptions: Array<{ id: string; icon: LucideIcon; category: string }> = [
  { id: "official", icon: Landmark, category: "authority" },
  { id: "returns", icon: TrendingUp, category: "guaranteed-language" },
  { id: "urgent", icon: Clock, category: "urgency" },
  { id: "others", icon: Users, category: "social-proof" },
  { id: "notime", icon: Wallet, category: "payment-pressure" },
];

export default function TeachBackPage() {
  const router = useRouter();
  const { isDemoMode, goToStep } = useDemo();
  const { locale } = useSettings();
  const t = useT();

  const [response, setResponse] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<TeachBackAnalysis | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleReason = (id: string) =>
    setSelectedReasons((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));

  const handleSubmit = () => {
    // A chip-only answer still counts: the selected reasons become the text
    // that gets analysed, so nothing the user chose is discarded.
    const combined =
      response.trim() ||
      selectedReasons.map((id) => t.teachback.reasons[id]).filter(Boolean).join(". ");

    if (!combined.trim()) return;
    setResponse(combined);
    setAnalysis(analyzeTeachBack(combined));
  };

  const toggleCheckItem = (id: string) => {
    const next = new Set(checkedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCheckedItems(next);
  };

  const handleContinue = () => {
    writeSessionJSON(STORAGE_KEYS.teachback, {
      response,
      emotion: selectedEmotion,
      reasons: selectedReasons,
      analysis,
    });
    goToStep("learn");
    router.push("/resilience");
  };

  /* ============================ STEP 1: RECOGNITION ============================ */
  if (!analysis) {
    const canSubmit = Boolean(response.trim()) || selectedReasons.length > 0;

    return (
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 pt-24 pb-20 px-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <Reveal className="max-w-2xl mx-auto text-center mb-10 sm:mb-12">
              <Badge variant={isDemoMode ? "amber" : "cyan"} className="mb-5">
                <Sparkles className="w-3 h-3" aria-hidden="true" />
                {isDemoMode ? t.teachback.demoBadge : t.teachback.badge}
              </Badge>
              <h1 className="heading-1 text-text-primary mb-4 text-balance">
                {t.teachback.subtitle}
              </h1>
              <p className="body-lg text-text-secondary">
                Be honest. Naming the reason is the whole point.
              </p>
            </Reveal>

            {/* Why it felt trustworthy */}
            <Reveal delay={60}>
              <section className="card p-6 sm:p-8 mb-5" aria-labelledby="reason-heading">
                <h2 id="reason-heading" className="heading-3 text-text-primary mb-1.5">
                  {t.teachback.reasonHeading}
                </h2>
                <p className="body-base text-text-muted mb-6">{t.teachback.reasonHelp}</p>

                <div className="flex flex-wrap gap-2.5" role="group" aria-labelledby="reason-heading">
                  {reasonOptions.map((reason) => {
                    const active = selectedReasons.includes(reason.id);
                    const Icon = reason.icon;
                    return (
                      <button
                        key={reason.id}
                        type="button"
                        onClick={() => toggleReason(reason.id)}
                        aria-pressed={active}
                        className={cn(
                          "inline-flex items-center gap-2.5 px-4 py-3 rounded-xl border",
                          "text-[13px] font-medium transition-all duration-200 min-h-[48px]",
                          active
                            ? "bg-cyan-500/[0.08] border-cyan-500/35 text-text-primary shadow-[0_0_18px_rgba(6,214,224,0.09)]"
                            : "bg-bg-surface border-border-hairline text-text-secondary hover:text-text-primary hover:border-border-subtle"
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-4 h-4 shrink-0",
                            active ? "text-cyan-400" : "text-text-muted"
                          )}
                          aria-hidden="true"
                        />
                        {t.teachback.reasons[reason.id] ?? reason.id}
                        {active && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" aria-hidden="true" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            </Reveal>

            {/* How it made you feel */}
            <Reveal delay={110}>
              <section className="card p-6 sm:p-8 mb-5" aria-labelledby="emotion-heading">
                <h2 id="emotion-heading" className="heading-3 text-text-primary mb-6">
                  {t.teachback.emotionHeading}
                </h2>
                <div
                  className="grid grid-cols-2 sm:grid-cols-3 gap-2.5"
                  role="radiogroup"
                  aria-labelledby="emotion-heading"
                >
                  {emotionOptions.map((emotion) => {
                    const active = selectedEmotion === emotion.id;
                    const Icon = emotion.icon;
                    return (
                      <button
                        key={emotion.id}
                        type="button"
                        onClick={() => setSelectedEmotion(emotion.id)}
                        role="radio"
                        aria-checked={active}
                        className={cn(
                          "flex items-center justify-center gap-2 px-3 py-3.5 rounded-xl border",
                          "text-[13px] font-medium transition-all duration-200 min-h-[52px]",
                          active
                            ? "bg-violet-500/[0.08] border-violet-500/30 text-text-primary"
                            : "bg-bg-surface border-border-hairline text-text-secondary hover:text-text-primary hover:border-border-subtle"
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-4 h-4 shrink-0",
                            active ? "text-violet-400" : "text-text-muted"
                          )}
                          aria-hidden="true"
                        />
                        <span className="truncate">
                          {t.teachback.emotions[emotion.key] ?? emotion.key}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </Reveal>

            {/* Free text */}
            <Reveal delay={160}>
              <section className="card p-6 sm:p-8 mb-6">
                <label htmlFor="teachback-input" className="heading-3 text-text-primary mb-1.5 block">
                  {t.teachback.textareaLabel}
                </label>
                <p className="body-base text-text-muted mb-5">Optional, but it teaches more.</p>
                <textarea
                  id="teachback-input"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder={t.teachback.placeholder}
                  rows={5}
                  className="w-full bg-bg-input border border-border-default rounded-xl p-4 text-[15px] leading-relaxed text-text-primary placeholder:text-text-muted resize-y transition-all duration-200 focus:outline-none focus:border-cyan-500 focus:ring-[3px] focus:ring-cyan-500/15"
                />

                <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
                  <Button variant="ghost" onClick={() => setResponse(t.teachback.exampleResponse)} icon={<RefreshCw className="w-4 h-4" />}>
                    {t.teachback.seeExample}
                  </Button>
                  <p className="flex items-center gap-2 text-[12px] text-text-muted">
                    <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                    {t.teachback.voiceComingSoon}
                  </p>
                </div>
              </section>
            </Reveal>

            <Reveal delay={200}>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                size="lg"
                fullWidth
                iconRight={<ArrowRight className="w-5 h-5" />}
              >
                {t.teachback.analyzeResponse}
              </Button>
            </Reveal>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /* ===================== STEP 2: REASONING PATTERN + HABIT ===================== */
  const spokenSummary = `${t.teachback.resultTitle}. ${analysis.reasoningLabels.join(". ")}. ${t.teachback.keyQuestion}`;

  // Habits derived from what the user actually said, most relevant first.
  const detectedCategories = Array.from(
    new Set([...analysis.detectedReasoning, ...reasonOptions.filter((r) => selectedReasons.includes(r.id)).map((r) => r.category)])
  );
  const habits = detectedCategories
    .map((c) => t.teachback.nextTimeAdvice[c as keyof typeof t.teachback.nextTimeAdvice])
    .filter(Boolean);
  const primaryHabit = habits[0] ?? t.teachback.defaultAdvice;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20 px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Reveal className="max-w-2xl mx-auto text-center mb-10 sm:mb-12">
            <Badge variant="emerald" className="mb-5">
              <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
              {t.teachback.completeBadge}
            </Badge>
            <h1 className="heading-1 text-text-primary mb-4 text-balance">{t.teachback.resultTitle}</h1>
            <p className="body-lg text-text-secondary mb-6">{t.teachback.resultSubtitle}</p>
            <ReadAloudButton locale={locale} text={spokenSummary} />
          </Reveal>

          {/* REACTION → RECOGNITION → HABIT */}
          <Reveal delay={60}>
            <ol className="grid sm:grid-cols-3 gap-3 mb-6">
              {[
                { step: "Reaction", tone: "text-text-tertiary", body: analysis.response.slice(0, 90) },
                {
                  step: "Recognition",
                  tone: "text-cyan-400",
                  body: analysis.reasoningLabels[0] ?? t.teachback.reasonHeading,
                },
                { step: "Habit", tone: "text-emerald-400", body: primaryHabit },
              ].map((item, i) => (
                <li key={item.step} className="relative">
                  {i < 2 && (
                    <span
                      className="hidden sm:block absolute top-7 -right-2 translate-x-1/2 z-10 text-text-muted/50"
                      aria-hidden="true"
                    >
                      <ArrowIcon className="w-4 h-4" />
                    </span>
                  )}
                  <div className="card p-5 h-full">
                    <p className={cn("eyebrow mb-2.5", item.tone)}>{item.step}</p>
                    <p className="text-[13px] leading-relaxed text-text-secondary line-clamp-4">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>

          {/* Reasoning pattern */}
          <Reveal delay={100}>
            <section className="card p-6 sm:p-8 mb-5" aria-labelledby="reasoning-heading">
              <h2 id="reasoning-heading" className="heading-3 text-text-primary mb-1.5">
                {t.teachback.reasoningHeading}
              </h2>
              <p className="body-base text-text-muted mb-6">{t.teachback.resultSubtitle}</p>

              <div className="space-y-2.5">
                {analysis.reasoningLabels.map((label, index) => {
                  const category = analysis.detectedReasoning[index];
                  const Icon = signalIcon(category);
                  return (
                    <div
                      key={label}
                      className={cn(
                        "flex items-start gap-3.5 p-4 rounded-xl border border-border-hairline bg-bg-surface/50",
                        "transition-colors duration-200 hover:border-border-subtle"
                      )}
                    >
                      <span
                        className={cn(
                          "shrink-0 flex items-center justify-center w-9 h-9 rounded-lg border",
                          signalTone(category)
                        )}
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </span>
                      <p className="text-[14px] font-medium text-text-primary leading-snug pt-1.5">
                        {label}
                      </p>
                    </div>
                  );
                })}

                {analysis.reasoningLabels.length === 0 && (
                  <p className="body-base text-text-secondary">{t.result.noMatchSubtitle}</p>
                )}
              </div>
            </section>
          </Reveal>

          {/* What to do next time */}
          <Reveal delay={140}>
            <section className="card p-6 sm:p-8 mb-5" aria-labelledby="next-time-heading">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                  <ArrowIcon className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                </span>
                <h2 id="next-time-heading" className="heading-3 text-text-primary">
                  {t.teachback.nextTimeHeading}
                </h2>
              </div>

              <p className="heading-2 text-text-primary mb-5 leading-snug">{primaryHabit}</p>

              {habits.length > 1 && (
                <ul className="space-y-2.5 pt-5 border-t border-border-hairline">
                  {habits.slice(1).map((habit) => (
                    <li key={habit} className="flex items-start gap-2.5 text-[13px] text-text-secondary">
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"
                        aria-hidden="true"
                      />
                      {habit}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </Reveal>

          {/* Your answer, kept visible */}
          <Reveal delay={180}>
            <details className="card group p-5 sm:p-6 mb-5">
              <summary className="flex items-center gap-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-bg-surface border border-border-subtle shrink-0">
                  <Quote className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                </span>
                <span className="flex-1 min-w-0 text-[14px] font-semibold text-text-primary">
                  {t.teachback.yourResponse}
                </span>
              </summary>
              <blockquote className="mt-5 pt-5 border-t border-border-hairline body-base text-text-secondary italic border-l-2 border-cyan-500/30 pl-4">
                &ldquo;{analysis.response}&rdquo;
              </blockquote>
            </details>
          </Reveal>

          {/* Key question */}
          <Reveal delay={200}>
            <div className="card p-6 sm:p-8 mb-5 text-center">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 mb-4">
                <Brain className="w-6 h-6 text-white" aria-hidden="true" />
              </span>
              <p className="eyebrow !text-cyan-400 mb-2.5">{t.teachback.askYourself}</p>
              <p className="heading-2 text-text-primary text-balance">
                {t.teachback.keyQuestion}
              </p>
            </div>
          </Reveal>

          {/* Checklist */}
          <Reveal delay={240}>
            <section className="card p-6 sm:p-8 mb-7" aria-labelledby="checklist-heading">
              <h2 id="checklist-heading" className="heading-3 text-text-primary mb-6">
                {t.teachback.checklistHeading}
              </h2>
              <div className="space-y-2.5">
                {analysis.checklist.map((item) => {
                  const checked = checkedItems.has(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="checkbox"
                      aria-checked={checked}
                      onClick={() => toggleCheckItem(item.id)}
                      className={cn(
                        "w-full flex items-start gap-3.5 p-4 rounded-xl border text-left",
                        "transition-all duration-200 min-h-[56px]",
                        checked
                          ? "bg-emerald-500/[0.05] border-emerald-500/25"
                          : "bg-bg-surface border-border-hairline hover:border-border-subtle"
                      )}
                    >
                      <span
                        className={cn(
                          "shrink-0 flex items-center justify-center w-6 h-6 rounded-md border-2 mt-0.5 transition-colors duration-200",
                          checked
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-border-default"
                        )}
                      >
                        {checked && <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />}
                      </span>
                      <span
                        className={cn(
                          "text-[14px] leading-snug pt-0.5",
                          checked ? "text-text-muted line-through" : "text-text-primary"
                        )}
                      >
                        {item.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </Reveal>

          <Reveal delay={280}>
            <Button
              onClick={handleContinue}
              size="lg"
              fullWidth
              className="sm:w-auto sm:min-w-[280px]"
              iconRight={<ArrowRight className="w-5 h-5" />}
            >
              {t.teachback.continue}
            </Button>
          </Reveal>
        </div>
      </main>

      <Footer />
    </div>
  );
}