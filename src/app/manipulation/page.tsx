"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles, RotateCcw, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Reveal from "@/components/ui/Reveal";
import { EvidenceQuote } from "@/components/analysis/EvidenceQuote";
import { NoSignalsFound } from "@/components/analysis/AnalysisStates";
import ReadAloudButton from "@/components/voice/ReadAloudButton";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAnalysis } from "@/lib/analysis/AnalysisContext";
import { useDemo } from "@/lib/demo/DemoContext";
import { useSettings, useT, format } from "@/lib/i18n/SettingsContext";
import { signalIcon, signalTone } from "@/lib/signal-presentation";
import { cn } from "@/lib/utils";

export default function ManipulationPage() {
  const router = useRouter();
  const { analysis, isReady } = useAnalysis();
  const { goToStep } = useDemo();
  const { locale } = useSettings();
  const t = useT();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!isReady || !analysis) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="min-h-[60vh] flex items-center justify-center px-5 py-24">
            <div className="w-full max-w-md text-center" role="status" aria-live="polite">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border border-border-hairline" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ScanSearch className="w-6 h-6 text-cyan-400" aria-hidden="true" />
                </div>
              </div>
              <p className="heading-3 text-text-primary mb-2">{t.loading.map}</p>
              <p className="body-base text-text-secondary">{t.loading.resultDetail}</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const selectedSignal =
    analysis.signals.find((s) => s.id === selectedId) ?? analysis.signals[0] ?? null;
  const signalCount = analysis.signals.length;
  const tacticCount = analysis.riskBreakdown.length;

  const categoryLabel = (type: string) =>
    t.categories[type as keyof typeof t.categories] ?? type;

  const spokenSummary = [
    t.map.title,
    format(t.map.subtitle, {
      signals: signalCount,
      signalPlural: signalCount === 1 ? "" : "s",
      tactics: tacticCount,
      tacticPlural: tacticCount === 1 ? "" : "s",
    }),
    selectedSignal
      ? `${categoryLabel(selectedSignal.type)}. ${selectedSignal.explanation}`
      : t.result.noMatchSubtitle,
  ].join(". ");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20 px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <Reveal className="max-w-2xl mx-auto text-center mb-10 sm:mb-14">
            <Badge variant="amber" className="mb-5">
              <Sparkles className="w-3 h-3" aria-hidden="true" />
              {t.replay.disclaimer}
            </Badge>
            <h1 className="heading-1 text-text-primary mb-4 text-balance">{t.map.title}</h1>
            <p className="body-lg text-text-secondary">
              {format(t.map.subtitle, {
                signals: signalCount,
                signalPlural: signalCount === 1 ? "" : "s",
                tactics: tacticCount,
                tacticPlural: tacticCount === 1 ? "" : "s",
              })}
            </p>
          </Reveal>

          {signalCount === 0 ? (
            <NoSignalsFound onRestart={() => router.push("/investigate")} />
          ) : (
            <Reveal delay={80}>
              <div className="grid lg:grid-cols-12 gap-5 lg:gap-6 items-start">
                {/* ---- Signal rail ---- */}
                <div className="min-w-0 lg:col-span-5 xl:col-span-4">
                  <div className="lg:sticky lg:top-24 space-y-2.5">
                    {analysis.signals.map((signal, i) => {
                      const active = selectedSignal?.id === signal.id;
                      const Icon = signalIcon(signal.type);

                      return (
                        <button
                          key={signal.id}
                          type="button"
                          onClick={() => setSelectedId(signal.id)}
                          aria-pressed={active}
                          aria-label={`${categoryLabel(signal.type)}: ${signal.phrase}`}
                          className={cn(
                            "w-full text-left flex items-start gap-3.5 p-4 rounded-xl border",
                            "transition-all duration-200 min-h-[64px]",
                            active
                              ? "bg-cyan-500/[0.06] border-cyan-500/30 shadow-[0_0_20px_rgba(6,214,224,0.08)]"
                              : "bg-bg-card border-border-hairline hover:border-border-subtle hover:bg-bg-card-hover"
                          )}
                        >
                          <span
                            className={cn(
                              "shrink-0 flex items-center justify-center w-10 h-10 rounded-xl border transition-colors duration-200",
                              active
                                ? "bg-gradient-to-br from-cyan-500 to-violet-500 border-transparent text-white"
                                : signalTone(signal.type)
                            )}
                          >
                            <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2 mb-1">
                              <span className="text-[13px] font-semibold text-text-primary truncate">
                                {categoryLabel(signal.type)}
                              </span>
                              <span className="font-mono text-[11px] text-text-muted shrink-0">
                                {String(i + 1).padStart(2, "0")}
                              </span>
                            </span>
                            <span className="block font-mono text-[12px] text-cyan-400/85 wrap-anywhere line-clamp-2">
                              &ldquo;{signal.phrase}&rdquo;
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ---- Detail ---- */}
                <div className="min-w-0 lg:col-span-7 xl:col-span-8">
                  {selectedSignal && (
                    <div className="card p-6 sm:p-8">
                      <div className="flex items-start gap-4 mb-7 pb-6 border-b border-border-hairline">
                        <span
                          className={cn(
                            "shrink-0 flex items-center justify-center w-12 h-12 rounded-xl border",
                            signalTone(selectedSignal.type)
                          )}
                        >
                          {(() => {
                            const Icon = signalIcon(selectedSignal.type);
                            return <Icon className="w-6 h-6" aria-hidden="true" />;
                          })()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h2 className="heading-2 text-text-primary break-words">
                            {categoryLabel(selectedSignal.type)}
                          </h2>
                          <p className="font-mono text-[12px] text-text-muted mt-1.5">
                            {format(t.result.ruleExactMatch, { rule: selectedSignal.ruleId })}
                          </p>
                        </div>
                        <ReadAloudButton
                          locale={locale}
                          text={`${categoryLabel(selectedSignal.type)}. ${selectedSignal.explanation}`}
                          label={t.language.readAloud}
                          className="shrink-0"
                        />
                      </div>

                      <section className="mb-7">
                        <h3 className="eyebrow mb-3">{t.map.whereItAppears}</h3>
                        <EvidenceQuote
                          phrase={selectedSignal.phrase}
                          evidence={selectedSignal.evidence}
                        />
                      </section>

                      <section className="mb-7">
                        <h3 className="eyebrow mb-3">{t.map.whyItMatters}</h3>
                        <p className="body-lg text-text-secondary leading-relaxed">
                          {selectedSignal.explanation}
                        </p>
                      </section>

                      <div className="p-5 rounded-xl bg-amber-500/[0.05] border border-amber-500/15">
                        <p className="text-[13px] font-medium text-amber-400 mb-1.5">
                          {t.map.important}
                        </p>
                        <p className="body-base text-text-secondary">{t.map.importantBody}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          )}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mt-10">
            <Button variant="secondary" onClick={() => router.push("/result")} size="lg" icon={<ArrowLeft className="w-5 h-5" />}>
              {t.map.backToClaims}
            </Button>
            {signalCount > 0 && (
              <Button
                onClick={() => {
                  goToStep("replay");
                  router.push("/replay");
                }}
                size="lg"
                iconRight={<RotateCcw className="w-5 h-5" />}
              >
                {t.map.openReplay}
              </Button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}