"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Sparkles,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Eye,
  FileText,
  ChevronDown,
  RotateCcw,
  LifeBuoy,
  Quote,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Reveal from "@/components/ui/Reveal";
import { EvidenceQuote } from "@/components/analysis/EvidenceQuote";
import { RiskBreakdown } from "@/components/analysis/RiskBreakdown";
import KnowledgeTriad from "@/components/analysis/KnowledgeTriad";
import { AnalysisSkeleton } from "@/components/analysis/AnalysisStates";
import ReadAloudButton from "@/components/voice/ReadAloudButton";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAnalysis } from "@/lib/analysis/AnalysisContext";
import { useDemo } from "@/lib/demo/DemoContext";
import { useSettings, useT, format } from "@/lib/i18n/SettingsContext";
import { PATTERNS } from "@/lib/engine/patterns";
import { REGIONAL_PATTERNS } from "@/lib/engine/regional-patterns";
import { cn } from "@/lib/utils";

const ALL_RULE_COUNT = PATTERNS.length + REGIONAL_PATTERNS.length;

/** Severity drives tone; colour alone never carries the meaning — the word does too. */
const severityTone: Record<string, { chip: string; dot: string }> = {
  low: { chip: "text-emerald-400 border-emerald-500/25 bg-emerald-500/[0.07]", dot: "bg-emerald-400" },
  medium: { chip: "text-amber-400 border-amber-500/25 bg-amber-500/[0.07]", dot: "bg-amber-400" },
  high: { chip: "text-rose-400 border-rose-500/25 bg-rose-500/[0.07]", dot: "bg-rose-400" },
  critical: { chip: "text-rose-400 border-rose-500/30 bg-rose-500/10", dot: "bg-rose-400" },
};

export default function ResultPage() {
  const router = useRouter();
  const { analysis, hasUserInput, inputText, isReady, persistenceWarning } = useAnalysis();
  const { goToStep } = useDemo();
  const { locale } = useSettings();
  const t = useT();
  const [showMessage, setShowMessage] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (!isReady || !analysis) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <AnalysisSkeleton label={t.loading.result} />
        </main>
        <Footer />
      </div>
    );
  }

  const signalCount = analysis.signalsDetected;
  const hasPaymentSignal = analysis.riskBreakdown.some((f) =>
    ["payment-pressure", "withdrawal-pressure"].includes(f.category)
  );

  // Every category and fact kind is in the dictionary, so an unknown key can
  // only ever be a new engine value — fall back to the raw key rather than
  // inventing English copy here.
  const categoryLabel = (category: string) =>
    t.categories[category as keyof typeof t.categories] ?? category;

  const factLabel = (kind: string) => t.facts[kind as keyof typeof t.facts] ?? kind;

  const riskTone = {
    low: {
      label: t.riskHeadline.low,
      wrapper: "border-emerald-500/25 bg-emerald-500/[0.06]",
      text: "text-emerald-400",
      icon: CheckCircle,
    },
    medium: {
      label: t.riskHeadline.medium,
      wrapper: "border-amber-500/25 bg-amber-500/[0.06]",
      text: "text-amber-400",
      icon: AlertCircle,
    },
    high: {
      label: t.riskHeadline.high,
      wrapper: "border-amber-500/30 bg-amber-500/[0.08]",
      text: "text-amber-400",
      icon: AlertCircle,
    },
    critical: {
      label: t.riskHeadline.critical,
      wrapper: "border-rose-500/30 bg-rose-500/[0.08]",
      text: "text-rose-400",
      icon: AlertCircle,
    },
  }[analysis.overallRisk] ?? {
    label: t.riskHeadline.medium,
    wrapper: "border-amber-500/25 bg-amber-500/[0.06]",
    text: "text-amber-400",
    icon: AlertCircle,
  };

  const RiskIcon = riskTone.icon;

  const spokenSummary = [
    hasUserInput ? t.result.yourMessage : t.result.sampleMessage,
    signalCount === 0
      ? t.result.noMatchTitle
      : format(t.result.matchTitle, { count: signalCount, plural: signalCount === 1 ? "" : "s" }),
    t.result.nextHeading,
    ...analysis.recommendedActions.map((a) => `${a.title}. ${a.instruction}`),
  ].join(". ");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20 px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* ============ VERDICT ============ */}
          <Reveal className="text-center mb-10 sm:mb-14">
            <Badge variant="subtle" className="mb-6">
              <Sparkles className="w-3 h-3" aria-hidden="true" />
              {t.result.badge}
            </Badge>

            <h1 className="heading-1 text-text-primary mb-4 text-balance">
              {signalCount === 0
                ? t.result.noMatchTitle
                : format(t.result.matchTitle, {
                    count: signalCount,
                    plural: signalCount === 1 ? "" : "s",
                  })}
            </h1>

            <p className="body-lg text-text-secondary max-w-2xl mx-auto mb-8">
              {signalCount === 0
                ? t.result.noMatchSubtitle
                : hasUserInput
                ? t.result.matchSubtitleUser
                : t.result.matchSubtitleSample}
            </p>

            {/* Overall status: restrained, not a red wall */}
            <div
              className={cn(
                "inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 px-5 py-4 rounded-xl border",
                riskTone.wrapper
              )}
            >
              <span className="flex items-center gap-2.5">
                <RiskIcon className={cn("w-5 h-5 shrink-0", riskTone.text)} aria-hidden="true" />
                <span className={cn("text-[15px] font-semibold", riskTone.text)}>{riskTone.label}</span>
              </span>
              <span className="hidden sm:block w-px h-6 bg-current opacity-20" aria-hidden="true" />
              <ReadAloudButton
                locale={locale}
                text={spokenSummary}
                label={t.language.readAloud}
                className="!border-current/20 !bg-transparent"
              />
            </div>
          </Reveal>

          {persistenceWarning && (
            <Reveal delay={60}>
              <div className="card border-amber-500/20 bg-amber-500/[0.05] p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-amber-400 mb-0.5">{t.nav.offlineReady}</p>
                  <p className="text-[12px] text-text-secondary">{t.loading.resultDetail}</p>
                </div>
              </div>
            </Reveal>
          )}

          {/* ============ NEXT STEPS ============ */}
          <Reveal delay={100}>
            <section className="card p-6 sm:p-8 mb-6" aria-labelledby="next-heading">
              <div className="flex items-start gap-4 mb-7">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 shrink-0">
                  <ArrowRight className="w-5 h-5 text-white" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 id="next-heading" className="heading-3 text-text-primary mb-1.5">
                    {t.result.nextHeading}
                  </h2>
                  <p className="body-base text-text-secondary">
                    {hasPaymentSignal ? t.result.nextPaymentLead : t.result.nextGenericLead}
                  </p>
                </div>
              </div>

              <ol className="space-y-3 mb-7">
                {analysis.recommendedActions.map((action, i) => {
                  const relatedSignals = analysis.signals.filter((s) =>
                    action.signalIds.includes(s.id)
                  );
                  const relatedFacts = analysis.extractedFacts.filter((f) =>
                    action.factIds.includes(f.id)
                  );
                  const priorityLabel =
                    action.priority === "urgent"
                      ? t.result.priorityFirst
                      : action.priority === "important"
                      ? t.result.priorityNext
                      : t.result.priorityBaseline;
                  const priorityTone =
                    action.priority === "urgent"
                      ? "rose"
                      : action.priority === "important"
                      ? "amber"
                      : "emerald";

                  return (
                    <li
                      key={action.id}
                      className="flex gap-4 p-4 sm:p-5 rounded-xl bg-bg-surface/40 border border-border-hairline transition-colors hover:border-border-subtle"
                    >
                      <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-bg-card-hover border border-border-subtle font-mono text-xs font-bold text-cyan-400">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-[15px] font-semibold text-text-primary">{action.title}</h3>
                          <Badge variant={priorityTone} size="sm">
                            {priorityLabel}
                          </Badge>
                        </div>
                        <p className="body-base text-text-secondary mb-2">{action.instruction}</p>
                        <p className="text-[12px] text-text-muted leading-relaxed">{action.rationale}</p>

                        {(relatedSignals.length > 0 || relatedFacts.length > 0) && (
                          <div
                            className="flex flex-wrap gap-1.5 mt-3"
                            aria-label={t.result.whatCanIVerify}
                          >
                            {relatedSignals.map((s) => (
                              <a
                                key={s.id}
                                href={`#signal-${s.id}`}
                                className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-bg-surface border border-border-hairline text-[12px] text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/[0.06] transition-colors"
                              >
                                &ldquo;{s.phrase}&rdquo;
                              </a>
                            ))}
                            {relatedFacts.map((f) => (
                              <a
                                key={f.id}
                                href={`#fact-${f.id}`}
                                className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-bg-surface border border-border-hairline text-[12px] text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/[0.06] transition-colors"
                              >
                                {factLabel(f.kind)}: {f.value}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>

              {signalCount === 0 && (
                <p className="body-base text-amber-400 mb-6">{t.result.noMatchStillVerify}</p>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => {
                    goToStep("understand");
                    router.push("/manipulation");
                  }}
                  size="lg"
                  className="sm:flex-1"
                  iconRight={<RotateCcw className="w-5 h-5" />}
                >
                  {t.result.seePhrases}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push("/recovery")}
                  size="lg"
                  className="sm:flex-1"
                  icon={<LifeBuoy className="w-5 h-5" />}
                >
                  {t.result.needHelp}
                </Button>
              </div>
            </section>
          </Reveal>

          {/* ============ SIGNAL CARDS ============ */}
          {signalCount > 0 && (
            <Reveal delay={140}>
              <section className="mb-6" aria-labelledby="matched-heading">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
                  <div className="min-w-0">
                    <h2 id="matched-heading" className="heading-2 text-text-primary">
                      {t.result.matchedHeading}
                    </h2>
                    <p className="body-base text-text-secondary mt-1.5">
                      {hasUserInput ? t.result.matchedSubtitleUser : t.result.matchedSubtitleSample}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 stagger-children">
                  {analysis.signals.map((signal, index) => {
                    const claim = analysis.claims[index];
                    const tone = severityTone[signal.severity] ?? severityTone.low;

                    return (
                      <article
                        key={signal.id}
                        id={`signal-${signal.id}`}
                        className="card p-5 sm:p-6 scroll-mt-28"
                      >
                        <div className="flex flex-wrap items-center gap-2.5 mb-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold",
                              tone.chip
                            )}
                          >
                            <span className={cn("w-1.5 h-1.5 rounded-full", tone.dot)} aria-hidden="true" />
                            {format(t.result.severityPattern, {
                              severity: t.severities[signal.severity as keyof typeof t.severities],
                            })}
                          </span>
                          <h3 className="text-[15px] font-semibold text-text-primary">
                            {categoryLabel(signal.type)}
                          </h3>
                          <span className="font-mono text-[11px] text-text-muted">
                            {format(t.result.ruleExactMatch, { rule: signal.ruleId })}
                          </span>
                        </div>

                        <EvidenceQuote phrase={signal.phrase} evidence={signal.evidence} />

                        <p className="body-base text-text-secondary mt-4">{signal.explanation}</p>

                        {/* Why it matters */}
                        {claim?.verificationNeeded && (
                          <div className="mt-4 p-4 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/15">
                            <div className="flex items-center gap-2 mb-2">
                              <Scale className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                                {t.result.whatCanIVerify}
                              </span>
                            </div>
                            <p className="text-[13px] text-text-secondary leading-relaxed">
                              {claim.verificationNeeded}
                            </p>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            </Reveal>
          )}

          {/* ============ NO SIGNALS ============ */}
          {signalCount === 0 && (
            <Reveal delay={140}>
              <section className="card p-8 sm:p-10 mb-6 text-center">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-bg-surface border border-border-subtle mb-6">
                  <Eye className="w-6 h-6 text-text-tertiary" aria-hidden="true" />
                </span>
                <h2 className="heading-3 text-text-primary mb-3">{t.empty.title}</h2>
                <p className="body-base text-text-secondary mb-6 max-w-lg mx-auto">{t.empty.body}</p>
                <div className="p-4 rounded-xl bg-amber-500/[0.05] border border-amber-500/15 text-left max-w-lg mx-auto">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="text-[13px] font-medium text-amber-400 mb-1">{t.empty.warningTitle}</p>
                      <p className="text-[13px] text-text-secondary leading-relaxed">
                        {t.empty.warningBody}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </Reveal>
          )}

          {/* ============ EXTRACTED FACTS ============ */}
          {analysis.extractedFacts.length > 0 && (
            <Reveal delay={180}>
              <section className="mb-6" aria-labelledby="facts-heading">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h2 id="facts-heading" className="heading-2 text-text-primary">
                    {t.result.factsHeading}
                  </h2>
                  <Badge variant="subtle" size="sm">
                    {analysis.extractedFacts.length} extracted
                  </Badge>
                </div>
                <p className="body-base text-text-secondary mb-6">{t.result.factsSubtitle}</p>

                <div className="grid sm:grid-cols-2 gap-3">
                  {analysis.extractedFacts.map((fact) => (
                    <div
                      key={fact.id}
                      id={`fact-${fact.id}`}
                      className="card p-5 scroll-mt-28"
                    >
                      <div className="flex items-baseline justify-between gap-3 mb-3">
                        <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
                          {factLabel(fact.kind)}
                        </span>
                      </div>
                      <p className="font-mono text-lg font-bold text-emerald-400 break-all mb-3">
                        {fact.value}
                      </p>
                      <EvidenceQuote phrase={fact.value} evidence={fact.evidence} />
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          {/* ============ THE DISTINCTION ============ */}
          {signalCount > 0 && (
            <Reveal delay={200}>
              <section className="card p-6 sm:p-8 mb-6" aria-labelledby="distinction-heading">
                <div className="flex items-start gap-3 mb-2">
                  <Quote className="w-5 h-5 text-cyan-400 shrink-0 mt-1" aria-hidden="true" />
                  <h2 id="distinction-heading" className="heading-3 text-text-primary">
                    {t.result.claimVersusEvidence}
                  </h2>
                </div>
                <p className="body-base text-text-secondary mb-7 pl-8">
                  {t.result.notProofLine}
                </p>

                <div className="space-y-3">
                  {analysis.signals.slice(0, 4).map((signal) => {
                    const verification = analysis.claims.find(
                      (c) => c.id === signal.claimId
                    )?.verificationNeeded;

                    return (
                      <div
                        key={`distinction-${signal.id}`}
                        className="grid sm:grid-cols-2 gap-3 items-stretch"
                      >
                        <div className="claim-card !p-4">
                          <span className="claim-label !mb-2">{t.result.claimLabel}</span>
                          <p className="text-[14px] text-text-primary font-medium break-words">
                            &ldquo;{signal.phrase}&rdquo;
                          </p>
                        </div>
                        <div className="evidence-card !p-4">
                          <span className="evidence-label !mb-2">{t.result.evidenceLabel}</span>
                          <p className="text-[14px] text-text-primary leading-relaxed">
                            {verification ?? t.landing.evidenceExample}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </Reveal>
          )}

          {/* ============ WHAT WE KNOW / DON'T KNOW / WHAT TO VERIFY ============ */}
          {signalCount > 0 && (
            <Reveal delay={210}>
              <KnowledgeTriad analysis={analysis} />
            </Reveal>
          )}

          {/* ============ METHOD + SCORE ============ */}
          <Reveal delay={220}>
            <section className="mb-6 space-y-3">
              <details className="card group p-5 sm:p-6">
                <summary className="flex items-center gap-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-bg-surface border border-border-subtle shrink-0">
                    <Sparkles className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[15px] font-semibold text-text-primary">
                      {t.explain.howThisWorks}
                    </span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-text-muted transition-transform group-open:rotate-180 shrink-0" aria-hidden="true" />
                </summary>
                <ol className="grid sm:grid-cols-2 gap-3 mt-5 pt-5 border-t border-border-hairline">
                  {[
                    { k: t.explain.step1, v: format(t.explain.ruleCount, { count: ALL_RULE_COUNT }) },
                    { k: t.explain.step2, v: t.explain.step2Body },
                    { k: t.explain.step3, v: t.explain.step3Body },
                    { k: t.explain.step4, v: t.explain.step4Body },
                  ].map((item, i) => (
                    <li key={item.k} className="flex gap-3 p-3.5 rounded-xl bg-bg-surface/40 border border-border-hairline">
                      <span className="shrink-0 font-mono text-[11px] font-bold text-cyan-400 pt-0.5">
                        0{i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-text-primary mb-0.5">{item.k}</p>
                        <p className="text-[12px] text-text-tertiary leading-relaxed">{item.v}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </details>

              {analysis.riskBreakdown.length > 0 && (
                <details
                  className="card group p-5 sm:p-6"
                  open={showBreakdown}
                  onToggle={(e) => setShowBreakdown((e.target as HTMLDetailsElement).open)}
                >
                  <summary className="flex items-center gap-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-bg-surface border border-border-subtle shrink-0">
                      <Scale className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[15px] font-semibold text-text-primary">
                        {t.result.howScoreCalculated}
                      </span>
                    </span>
                    <ChevronDown className="w-4 h-4 text-text-muted transition-transform group-open:rotate-180 shrink-0" aria-hidden="true" />
                  </summary>
                  <div className="mt-5 pt-5 border-t border-border-hairline">
                    <RiskBreakdown
                      factors={analysis.riskBreakdown}
                      score={analysis.riskScore}
                      labelFor={categoryLabel}
                    />
                  </div>
                </details>
              )}

              <details className="card group p-5 sm:p-6">
                <summary className="flex items-center gap-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-bg-surface border border-border-subtle shrink-0">
                    <FileText className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[15px] font-semibold text-text-primary">
                      {t.result.showMessage}
                    </span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-text-muted transition-transform group-open:rotate-180 shrink-0" aria-hidden="true" />
                </summary>
                <div className="mt-5 pt-5 border-t border-border-hairline">
                  <div className="max-h-72 overflow-auto whitespace-pre-wrap break-words font-mono text-[13px] text-text-secondary leading-relaxed p-4 bg-bg-surface/40 rounded-xl border border-border-hairline">
                    {inputText}
                  </div>
                  <p className="text-[12px] text-text-muted mt-3 text-center">
                    {hasUserInput ? t.result.yourMessage : t.result.sampleMessage}
                  </p>
                </div>
              </details>
            </section>
          </Reveal>

          {/* ============ NAVIGATION ============ */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button variant="secondary" size="lg" onClick={() => router.push("/investigate")}>
              {t.result.editMessage}
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => router.push("/replay")}
              iconRight={<RotateCcw className="w-5 h-5" />}
            >
              {t.result.openReplay}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}