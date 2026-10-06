"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ScanSearch,
  GraduationCap,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import Reveal from "@/components/ui/Reveal";
import { NoSignalsFound } from "@/components/analysis/AnalysisStates";
import ReadAloudButton from "@/components/voice/ReadAloudButton";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAnalysis } from "@/lib/analysis/AnalysisContext";
import { generateSimulation, type SimulationStep } from "@/lib/engine/simulator";
import { useDemo } from "@/lib/demo/DemoContext";
import { useSettings, useT, format } from "@/lib/i18n/SettingsContext";
import { signalIcon, signalTone } from "@/lib/signal-presentation";
import { cn } from "@/lib/utils";

function LoadingReplay() {
  const t = useT();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-5 py-24">
        <div className="w-full max-w-md text-center" role="status" aria-live="polite">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border border-border-hairline" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <ScanSearch className="w-6 h-6 text-cyan-400" aria-hidden="true" />
            </div>
          </div>
          <p className="heading-3 text-text-primary mb-2">{t.loading.replay}</p>
          <p className="body-base text-text-secondary">{t.loading.resultDetail}</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/**
 * One replay stage. Locked stages stay collapsed so the sequence reads as a
 * progressive reveal rather than a wall of text.
 */
function StageCard({
  step,
  index,
  isActive,
  isUnlocked,
  onSelect,
  t,
}: {
  step: SimulationStep;
  index: number;
  isActive: boolean;
  isUnlocked: boolean;
  onSelect: () => void;
  t: ReturnType<typeof useT>;
}) {
  // signalIcon only looks up a stable reference in the module-level
  // SIGNAL_ICONS record; it does not create a new component on each render.
  const Icon = signalIcon(step.signalType ?? "other");
  const tone = signalTone(step.signalType ?? "other");

  return (
    <li className="relative">
      {index > 0 && (
        <span
          className="replay-connector hidden sm:block"
          aria-hidden="true"
        />
      )}

      <button
        type="button"
        onClick={onSelect}
        disabled={!isUnlocked}
        aria-pressed={isActive}
        aria-current={isActive ? "step" : undefined}
        className={cn(
          "w-full text-left p-5 sm:p-6 rounded-2xl border transition-all duration-300",
          !isUnlocked
            ? "bg-bg-card/50 border-border-hairline opacity-55 cursor-not-allowed"
            : "bg-bg-card hover:border-border-subtle",
          isActive && isUnlocked && "border-cyan-500/30 bg-cyan-500/[0.04] shadow-[0_0_28px_rgba(6,214,224,0.09)]"
        )}
      >
        {/* Stage number + technique name */}
        <div className="flex items-center gap-3.5 mb-4">
          <span
            className={cn(
              "shrink-0 flex items-center justify-center w-10 h-10 rounded-xl font-mono text-xs font-bold transition-colors duration-300",
              isActive
                ? "bg-gradient-to-br from-cyan-500 to-violet-500 text-white"
                : isUnlocked
                ? cn("border", tone)
                : "bg-bg-surface border border-border-hairline text-text-muted"
            )}
          >
            {isActive ? (
              <Sparkles className="w-[18px] h-[18px]" aria-hidden="true" />
            ) : (
              String(index + 1).padStart(2, "0")
            )}
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-text-muted">{step.sender}</p>
            <p className="text-[13px] font-semibold text-text-primary truncate">
              {step.signalType
                ? t.categories[step.signalType as keyof typeof t.categories] ?? step.sender
                : t.replay.stepOf.replace("{current}", String(index + 1)).replace("{total}", "–")}
            </p>
          </div>

          {isUnlocked && !isActive && (
            <ChevronRight
              className="w-4 h-4 text-text-muted shrink-0"
              aria-hidden="true"
            />
          )}
        </div>

        {/* The message that would have been sent */}
        <div className="pl-0 sm:pl-[3.4rem]">
          <div className="inline-block max-w-full px-4 py-3 rounded-2xl rounded-tl-sm bg-bg-surface border border-border-hairline">
            <p className="body-base text-text-primary break-words">{step.message}</p>
          </div>
        </div>

        {/* Explanation, only for the stage in focus */}
        {isActive && (
          <div className="pl-0 sm:pl-[3.4rem] mt-5 grid sm:grid-cols-2 gap-3 animate-fade-in">
            <div className="p-4 rounded-xl bg-bg-surface/60 border border-border-hairline">
              <p className="eyebrow mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />
                {t.replay.whatIsHappening}
              </p>
              <p className="text-[13px] leading-relaxed text-text-secondary">
                {step.whatIsHappening}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-bg-surface/60 border border-border-hairline">
              <p className="eyebrow mb-2 flex items-center gap-1.5">
                {/* eslint-disable-next-line react-hooks/static-components -- stable SIGNAL_ICONS lookup, not a new component */}
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                {t.replay.whyItMatters}
              </p>
              <p className="text-[13px] leading-relaxed text-text-secondary">
                {step.whyItMatters}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/15 sm:col-span-2">
              <p className="eyebrow !text-emerald-400 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                {t.replay.whatYouCanVerify}
              </p>
              <p className="text-[13px] leading-relaxed text-text-secondary">
                {step.whatYouCanVerify}
              </p>
            </div>
          </div>
        )}
      </button>
    </li>
  );
}

export default function ReplayPage() {
  const router = useRouter();
  const { analysis, isReady } = useAnalysis();
  const { locale } = useSettings();
  const t = useT();
  const { goToStep } = useDemo();

  const [activeBranch, setActiveBranch] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  if (!isReady || !analysis) return <LoadingReplay />;

  const simulation = generateSimulation(analysis);
  const branch = simulation.branches[activeBranch] ?? simulation.branches[0] ?? null;

  if (!branch || branch.steps.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-20 px-5 sm:px-6">
          <div className="mx-auto max-w-xl">
            <NoSignalsFound onRestart={() => router.push("/investigate")} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const safeStep = Math.min(currentStep, branch.steps.length - 1);
  const progressPercent = Math.round(((safeStep + 1) / branch.steps.length) * 100);
  const isLastStep = safeStep === branch.steps.length - 1;

  const handleNext = () => {
    if (!isLastStep) setCurrentStep(safeStep + 1);
    else setIsComplete(true);
  };

  const handlePrev = () => {
    if (safeStep > 0) setCurrentStep(safeStep - 1);
  };

  const handleReplay = () => {
    setCurrentStep(0);
    setIsComplete(false);
  };

  const handleBranchChange = (index: number) => {
    setActiveBranch(index);
    setCurrentStep(0);
    setIsComplete(false);
  };

  const spokenSummary = [
    t.replay.title,
    branch.title,
    branch.description,
    ...branch.steps.slice(0, safeStep + 1).map((s) => `${s.message}. ${s.whyItMatters}`),
  ].join(". ");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20 px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <Reveal className="text-center mb-9 sm:mb-11">
            {/* Persistent, unmissable, not gamified */}
            <Badge variant="amber" className="mb-5">
              <GraduationCap className="w-3 h-3" aria-hidden="true" />
              EDUCATIONAL SIMULATION
            </Badge>
            <h1 className="heading-1 text-text-primary mb-4 text-balance">{t.replay.title}</h1>
            <p className="body-lg text-text-secondary max-w-2xl mx-auto mb-4">
              {t.replay.subtitle}
            </p>
            <p className="text-[13px] text-text-muted max-w-xl mx-auto mb-6">
              {t.replay.disclaimer}
            </p>
            <ReadAloudButton locale={locale} text={spokenSummary} />
          </Reveal>

          {/* Scenario switcher */}
          {simulation.branches.length > 1 && (
            <Reveal delay={60}>
              <div
                className="flex flex-wrap items-center justify-center gap-2 mb-8"
                role="group"
                aria-label={t.replay.branchLabel}
              >
                {simulation.branches.map((b, index) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleBranchChange(index)}
                    aria-pressed={activeBranch === index}
                    className={cn(
                      "px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 min-h-[44px]",
                      activeBranch === index
                        ? "bg-cyan-500/[0.08] text-cyan-400 border border-cyan-500/30"
                        : "bg-bg-card text-text-secondary border border-border-hairline hover:text-text-primary hover:border-border-subtle"
                    )}
                  >
                    {b.title}
                  </button>
                ))}
              </div>
            </Reveal>
          )}

          {/* Progress */}
          <Reveal delay={100}>
            <div className="mb-8">
              <div className="flex items-center justify-between text-[12px] text-text-muted mb-2.5">
                <span>
                  {format(t.replay.stepOf, {
                    current: safeStep + 1,
                    total: branch.steps.length,
                  })}
                </span>
                <span className="tabular-nums">{progressPercent}%</span>
              </div>
              <ProgressBar
                value={progressPercent}
                max={100}
                size="md"
                animated
                aria-label={t.replay.stepOf.replace("{current}", String(safeStep + 1)).replace("{total}", String(branch.steps.length))}
              />
            </div>
          </Reveal>

          {/* Stages */}
          <Reveal delay={140}>
            <ol className="relative space-y-3">
              {branch.steps.map((s, index) => (
                <StageCard
                  key={s.id}
                  step={s}
                  index={index}
                  isActive={index === safeStep}
                  isUnlocked={index <= safeStep}
                  onSelect={() => setCurrentStep(index)}
                  t={t}
                />
              ))}
            </ol>
          </Reveal>

          {/* Controls */}
          {!isComplete && (
            <Reveal delay={180}>
              <div className="flex items-stretch sm:items-center justify-center gap-3 mt-9">
                <Button
                  variant="secondary"
                  onClick={handlePrev}
                  disabled={safeStep === 0}
                  size="lg"
                  icon={<ChevronLeft className="w-5 h-5" />}
                >
                  <span className="hidden sm:inline">{t.replay.previous}</span>
                </Button>
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="flex-1 sm:flex-none sm:min-w-[200px]"
                  iconRight={
                    isLastStep ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )
                  }
                >
                  {isLastStep ? t.replay.complete : t.replay.nextStep}
                </Button>
              </div>

              <div className="mt-7 text-center">
                <Button variant="ghost" onClick={() => router.push("/manipulation")} icon={<ChevronLeft className="w-5 h-5" />}>
                  {t.replay.backToMap}
                </Button>
              </div>
            </Reveal>
          )}

          {/* Complete */}
          {isComplete && (
            <Reveal>
              <div className="mt-10 card p-7 sm:p-9 text-center">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 mb-5">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" aria-hidden="true" />
                </span>
                <h2 className="heading-2 text-text-primary mb-2.5">{t.replay.noticeTitle}</h2>
                <p className="body-lg text-text-secondary max-w-lg mx-auto mb-8">
                  {t.replay.noticeBody}
                </p>

                {/* The repeated pattern */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                  {branch.pattern.map((item, index) => (
                    <div key={item} className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-lg bg-cyan-500/[0.07] border border-cyan-500/20 text-[12px] font-medium text-cyan-300">
                        {item}
                      </span>
                      {index < branch.pattern.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-text-muted" aria-hidden="true" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-5 rounded-xl bg-amber-500/[0.05] border border-amber-500/15 text-left">
                  <p className="text-[13px] font-medium text-amber-400 mb-1.5">
                    {t.replay.keyInsight}
                  </p>
                  <p className="body-base text-text-secondary">{t.replay.keyInsightBody}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mt-8">
                  <Button variant="secondary" onClick={handleReplay} icon={<RotateCcw className="w-5 h-5" />}>
                    {t.replay.restart}
                  </Button>
                  <Button
                    onClick={() => {
                      goToStep("learn");
                      router.push("/teachback");
                    }}
                    size="lg"
                    iconRight={<ArrowRight className="w-5 h-5" />}
                  >
                    {t.replay.understood}
                  </Button>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}