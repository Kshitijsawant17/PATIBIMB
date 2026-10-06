"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Sparkles, Shield, FileText, Layers, Scale, Route } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAnalysis } from "@/lib/analysis/AnalysisContext";
import { useDemo } from "@/lib/demo/DemoContext";
import { useT, format } from "@/lib/i18n/SettingsContext";
import { investigationSteps } from "@/lib/data/mock-data";
import { AnalysisSkeleton } from "@/components/analysis/AnalysisStates";
import { cn } from "@/lib/utils";

const TICK_MS = 50;

/**
 * The visible pipeline. Labels come from the dictionary; the descriptions
 * explain what each stage actually does, so the wait reads as work in progress.
 */
const stages = [
  { labelKey: "reading" as const, descKey: "one" as const, icon: FileText },
  { labelKey: "matching" as const, descKey: "two" as const, icon: Sparkles },
  { labelKey: "grouping" as const, descKey: "three" as const, icon: Layers },
  { labelKey: "preparing" as const, descKey: "four" as const, icon: Route },
];

export default function AnalyzingPage() {
  const router = useRouter();
  const { goToStep } = useDemo();
  const { analysis, hasUserInput, inputText, isReady } = useAnalysis();
  const t = useT();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isReady || !analysis) return;

    const totalDuration = investigationSteps.reduce((sum, s) => sum + s.duration, 0);
    let elapsed = 0;
    let advanceTimer: ReturnType<typeof setTimeout> | undefined;

    setCurrentStep(0);
    setProgress(0);

    const interval = setInterval(() => {
      elapsed += TICK_MS;
      setProgress(Math.min(100, (elapsed / totalDuration) * 100));

      let accumulated = 0;
      for (let i = 0; i < investigationSteps.length; i++) {
        accumulated += investigationSteps[i].duration;
        if (elapsed < accumulated) {
          setCurrentStep(i);
          break;
        }
      }

      if (elapsed >= totalDuration) {
        clearInterval(interval);
        advanceTimer = setTimeout(() => {
          goToStep("understand");
          router.push("/result");
        }, 450);
      }
    }, TICK_MS);

    return () => {
      clearInterval(interval);
      if (advanceTimer) clearTimeout(advanceTimer);
    };
  }, [analysis, isReady, router, goToStep]);

  if (!isReady || !analysis) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <AnalysisSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  const messagePreview =
    inputText.length > 260 ? `${inputText.slice(0, 260).trimEnd()}…` : inputText;
  const roundedProgress = Math.round(progress);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20 px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Status header */}
          <div className="text-center mb-10 sm:mb-12">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-cyan-500/[0.08] border border-cyan-500/20 mb-6"
              role="status"
              aria-live="polite"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse-soft" aria-hidden="true" />
              <span className="text-[12px] font-medium text-cyan-400">
                {hasUserInput ? t.analyzing.checkingUser : t.analyzing.checkingSample}
              </span>
            </div>
            <h1 className="heading-2 text-text-primary mb-3 text-balance">
              Building your investigation…
            </h1>
            <p className="body-base text-text-secondary max-w-lg mx-auto">{t.analyzing.subtitle}</p>
          </div>

          {/* Message under inspection */}
          <div className="card p-5 sm:p-6 mb-6 relative overflow-hidden">
            <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-border-hairline">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-bg-surface border border-border-subtle shrink-0">
                <Shield className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-text-primary">
                  {hasUserInput ? t.analyzing.userPreview : t.analyzing.samplePreview}
                </p>
              </div>
            </div>
            <div className="relative">
              {/* Scan line over the preview */}
              <div
                className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-cyan-400/[0.07] to-transparent animate-scan-line pointer-events-none"
                aria-hidden="true"
              />
              <p className="font-mono text-[13px] leading-relaxed text-text-secondary break-words max-h-32 overflow-hidden">
                {messagePreview}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[12px] text-text-muted tabular-nums">
                {format(t.analyzing.percentWithMatches, {
                  percent: roundedProgress,
                  count: analysis.signalsDetected,
                  plural: analysis.signalsDetected === 1 ? "" : "s",
                })}
              </span>
            </div>
            <ProgressBar value={progress} max={100} size="md" animated />
          </div>

          {/* Vertical stage list */}
          <ol className="relative" aria-label={t.input.stepsReadingLabel}>
            {/* Rail behind the steps */}
            <div
              className="absolute left-[19px] top-4 bottom-4 w-px bg-border-hairline hidden sm:block"
              aria-hidden="true"
            />

            {stages.map((stage, i) => {
              const isActive = i === currentStep;
              const isDone = i < currentStep;
              const Icon = stage.icon;

              return (
                <li
                  key={stage.labelKey}
                  className={cn(
                    "relative flex gap-4 pb-4 last:pb-0 transition-opacity duration-300",
                    !isActive && !isDone && "opacity-45"
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  {/* Node */}
                  <span
                    className={cn(
                      "relative z-10 shrink-0 flex items-center justify-center w-10 h-10 rounded-xl",
                      "transition-all duration-300",
                      isDone
                        ? "bg-emerald-500/15 border border-emerald-500/25 text-emerald-400"
                        : isActive
                        ? "bg-gradient-to-br from-cyan-500 to-violet-500 border border-transparent text-white shadow-[0_0_20px_rgba(6,214,224,0.2)]"
                        : "bg-bg-card border border-border-subtle text-text-muted"
                    )}
                  >
                    {isDone ? (
                      <Check className="w-[18px] h-[18px]" aria-hidden="true" />
                    ) : (
                      <Icon className={cn("w-[18px] h-[18px]", isActive && "animate-pulse-soft")} aria-hidden="true" />
                    )}
                  </span>

                  {/* Copy */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                      <span className="text-[11px] font-mono text-text-muted">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p
                        className={cn(
                          "text-[15px] font-medium leading-snug",
                          isDone ? "text-text-secondary" : "text-text-primary"
                        )}
                      >
                        {t.analyzing.stageDesc[stage.descKey]}
                      </p>
                      {isActive && (
                        <span className="text-[11px] text-cyan-400 animate-pulse-soft">
                          {t.analyzing.running}
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-text-tertiary mt-1 leading-snug">
                      {t.analyzing.steps[stage.labelKey]}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Method note keeps the wait honest */}
          <div className="mt-9 pt-7 border-t border-border-hairline flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-bg-surface border border-border-subtle shrink-0">
              <Scale className="w-4 h-4 text-text-tertiary" aria-hidden="true" />
            </span>
            <p className="text-[12px] text-text-muted leading-relaxed">
              This is a fixed rule scan running on this device. It is not an AI verdict and it cannot
              confirm whether a sender is genuine.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}