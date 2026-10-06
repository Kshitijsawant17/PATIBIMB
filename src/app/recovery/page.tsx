"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LifeBuoy,
  AlertCircle,
  CheckCircle2,
  FileText,
  Printer,
  RotateCcw,
  Shield,
  Phone,
  ExternalLink,
  Archive,
  Clock,
  UserRoundSearch,
  ClipboardList,
  Landmark,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Reveal from "@/components/ui/Reveal";
import ReadAloudButton from "@/components/voice/ReadAloudButton";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAnalysis } from "@/lib/analysis/AnalysisContext";
import { useDemo } from "@/lib/demo/DemoContext";
import { useSettings, useT, format } from "@/lib/i18n/SettingsContext";
import { getRecoveryItemCopy, getRecoveryTimelineCopy } from "@/lib/i18n/content";
import { cn } from "@/lib/utils";

interface EvidenceItem {
  id: string;
  label: string;
  description: string;
  preserved: boolean;
}

interface TimelineEvent {
  id: string;
  time: string;
  event: string;
  type: "message" | "action" | "payment" | "withdrawal" | "warning";
}

const evidenceChecklist: EvidenceItem[] = [
  { id: "ev-1", label: "Original message", description: "The first message you received", preserved: false },
  { id: "ev-2", label: "Sender number or handle", description: "Phone number, WhatsApp ID, or username", preserved: false },
  { id: "ev-3", label: "Links", description: "Any links shared in the message", preserved: false },
  { id: "ev-4", label: "Screenshots", description: "Screenshots of messages and profiles", preserved: false },
  { id: "ev-5", label: "Transaction reference", description: "UPI transaction ID or bank reference", preserved: false },
  { id: "ev-6", label: "Date and time", description: "When you received the message and paid", preserved: false },
  { id: "ev-7", label: "Payment request", description: "The message asking for money", preserved: false },
  { id: "ev-8", label: "Withdrawal messages", description: "Messages about withdrawing your money", preserved: false },
];

const sampleTimeline: TimelineEvent[] = [
  { id: "tl-1", time: "12:41 PM", event: "Received message", type: "message" },
  { id: "tl-2", time: "12:48 PM", event: "Joined group", type: "action" },
  { id: "tl-3", time: "1:12 PM", event: "Opened provided link", type: "action" },
  { id: "tl-4", time: "1:46 PM", event: "Payment made", type: "payment" },
  { id: "tl-5", time: "2:15 PM", event: "Withdrawal requested", type: "withdrawal" },
  { id: "tl-6", time: "2:18 PM", event: "Extra payment requested", type: "warning" },
];

/**
 * Calm blue/cyan tones throughout. This page deals with money already lost, so
 * it must read as steady and procedural rather than alarming.
 */
const timelineTones: Record<TimelineEvent["type"], string> = {
  message: "border-cyan-500/25 bg-cyan-500/[0.07] text-cyan-400",
  action: "border-violet-500/25 bg-violet-500/[0.07] text-violet-400",
  payment: "border-amber-500/25 bg-amber-500/[0.07] text-amber-400",
  withdrawal: "border-sky-500/25 bg-sky-500/[0.07] text-sky-400",
  warning: "border-rose-500/25 bg-rose-500/[0.07] text-rose-400",
};

/** The five ordered actions that head the page. */
const stepIcons = [Archive, Clock, UserRoundSearch, ClipboardList, Landmark] as const;

export default function RecoveryPage() {
  const router = useRouter();
  const { analysis, hasUserInput, inputText, isReady, resetToSample } = useAnalysis();
  const { stopDemo } = useDemo();
  const { locale } = useSettings();
  const t = useT();

  const [evidence, setEvidence] = useState<EvidenceItem[]>(evidenceChecklist);
  const [showReport, setShowReport] = useState(false);

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
                <LifeBuoy className="w-6 h-6 text-cyan-400" aria-hidden="true" />
              </div>
            </div>
            <p className="heading-3 text-text-primary mb-2">{t.loading.recovery}</p>
            <p className="body-base text-text-secondary">{t.loading.resultDetail}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const toggleEvidence = (id: string) =>
    setEvidence((prev) =>
      prev.map((item) => (item.id === id ? { ...item, preserved: !item.preserved } : item))
    );

  const preservedCount = evidence.filter((e) => e.preserved).length;
  const topTactics = analysis.riskBreakdown
    .slice(0, 3)
    .map((f) => t.categories[f.category] ?? f.label)
    .join(", ");
  const hasPaymentRelatedSignal = analysis.riskBreakdown.some((f) =>
    ["payment-pressure", "withdrawal-pressure"].includes(f.category)
  );

  const checklist = evidenceChecklist.map((item) => ({
    id: item.id,
    ...getRecoveryItemCopy(locale, item.id, {
      label: item.label,
      description: item.description,
    }),
  }));

  const nextSteps = [
    t.recovery.stepBank,
    t.recovery.stepCyber,
    t.recovery.stepSebi,
    t.recovery.stepPreserve,
    t.recovery.stepStop,
  ];

  const stepCopy = [
    t.recovery.stepPreserve,
    t.recovery.timelineNote,
    t.recovery.stepBank,
    t.recovery.generate,
    t.recovery.stepCyber,
  ];

  const spokenSummary = [t.recovery.title, t.recovery.importantBody, ...nextSteps].join(". ");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20 px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <Reveal className="max-w-2xl mx-auto text-center mb-9 sm:mb-11">
            <Badge variant="cyan" className="mb-5">
              <LifeBuoy className="w-3 h-3" aria-hidden="true" />
              {t.recovery.badge}
            </Badge>
            <h1 className="heading-1 text-text-primary mb-4 text-balance">
              Let&rsquo;s focus on what you can do now.
            </h1>
            <p className="body-lg text-text-secondary mb-6">{t.recovery.subtitle}</p>
            <ReadAloudButton locale={locale} text={spokenSummary} />
          </Reveal>

          {/* The single most important line, stated once and calmly */}
          <Reveal delay={60}>
            <div className="card border-cyan-500/25 bg-cyan-500/[0.04] p-5 sm:p-6 mb-6">
              <div className="flex items-start gap-4">
                <span className="shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <AlertCircle className="w-5 h-5 text-cyan-400" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-cyan-400 mb-1.5">
                    {t.recovery.importantTitle}
                  </p>
                  <p className="body-lg text-text-primary font-medium">
                    {t.recovery.noMoreMoney}
                  </p>
                  <p className="text-[13px] text-text-secondary mt-2 leading-relaxed">
                    {t.recovery.importantBody}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Five ordered actions */}
          <Reveal delay={100}>
            <section className="mb-6" aria-labelledby="steps-heading">
              <h2 id="steps-heading" className="heading-2 text-text-primary mb-6">
                {t.recovery.stepsHeading}
              </h2>

              <ol className="relative space-y-3">
                {stepIcons.map((Icon, i) => {
                  const key = ["one", "two", "three", "four", "five"][i];
                  return (
                    <li key={key} className="relative">
                      {i > 0 && <span className="replay-connector hidden sm:block" aria-hidden="true" />}
                      <div className="card p-5 flex items-start gap-4">
                        <span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/[0.08] border border-cyan-500/20 font-mono text-xs font-bold text-cyan-400">
                          0{i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="flex items-center gap-2 text-[15px] font-semibold text-text-primary mb-1.5">
                            <Icon className="w-4 h-4 text-cyan-400 shrink-0" aria-hidden="true" />
                            {t.recovery.steps[key] ?? key}
                          </h3>
                          <p className="text-[13px] leading-relaxed text-text-tertiary">
                            {stepCopy[i]}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          </Reveal>

          {/* Evidence checklist */}
          <Reveal delay={140}>
            <section className="card p-6 sm:p-8 mb-6" aria-labelledby="evidence-heading">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <h2 id="evidence-heading" className="heading-2 text-text-primary">
                  {t.recovery.checklistTitle}
                </h2>
                <Badge variant="cyan" size="sm">
                  {format(t.recovery.preservedCount, {
                    kept: preservedCount,
                    total: checklist.length,
                  })}
                </Badge>
              </div>

              <ul className="space-y-2.5">
                {checklist.map((item) => {
                  const saved = evidence.find((e) => e.id === item.id)?.preserved ?? false;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={saved}
                        onClick={() => toggleEvidence(item.id)}
                        className={cn(
                          "w-full flex items-start gap-3.5 p-4 rounded-xl border text-left",
                          "transition-all duration-200 min-h-[56px]",
                          saved
                            ? "bg-emerald-500/[0.05] border-emerald-500/25"
                            : "bg-bg-surface border-border-hairline hover:border-border-subtle"
                        )}
                      >
                        <span
                          className={cn(
                            "shrink-0 flex items-center justify-center w-6 h-6 rounded-md border-2 mt-0.5 transition-colors duration-200",
                            saved ? "bg-emerald-500 border-emerald-500" : "border-border-default"
                          )}
                        >
                          {saved && <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block text-[14px] font-medium leading-snug",
                              saved ? "text-text-muted line-through" : "text-text-primary"
                            )}
                          >
                            {item.label}
                          </span>
                          <span className="block text-[12px] text-text-muted mt-1">
                            {item.description}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          </Reveal>

          {/* Timeline */}
          <Reveal delay={180}>
            <section className="card p-6 sm:p-8 mb-6" aria-labelledby="timeline-heading">
              <h2 id="timeline-heading" className="heading-2 text-text-primary mb-2">
                {t.recovery.timelineTitle}
              </h2>
              <p className="body-base text-text-muted mb-6">{t.recovery.timelineNote}</p>

              <ol className="space-y-2.5">
                {sampleTimeline.map((event, index) => (
                  <li
                    key={event.id}
                    className="flex items-center gap-4 p-3.5 rounded-xl bg-bg-surface/50 border border-border-hairline"
                  >
                    <span
                      className={cn(
                        "shrink-0 flex items-center justify-center w-9 h-9 rounded-lg border font-mono text-xs font-bold",
                        timelineTones[event.type]
                      )}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium text-text-primary">
                        {getRecoveryTimelineCopy(locale, event.id, event.event)}
                      </p>
                      <p className="text-[12px] text-text-muted mt-0.5">{event.time}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </Reveal>

          {/* Report */}
          <Reveal delay={200}>
            <div className="flex justify-center mb-6">
              <Button onClick={() => setShowReport(true)} size="lg" iconRight={<FileText className="w-5 h-5" />}>
                {t.recovery.generate}
              </Button>
            </div>
          </Reveal>

          {showReport && (
            <Reveal>
              <section className="card p-6 sm:p-8 mb-6" aria-labelledby="report-heading">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-7 pb-6 border-b border-border-hairline">
                  <h2 id="report-heading" className="heading-2 text-text-primary">
                    {t.recovery.reportTitle}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={() => window.print()} icon={<Printer className="w-4 h-4" />}>
                      {t.recovery.print}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setShowReport(false)}
                      aria-label={t.common.close}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="space-y-7">
                  <section>
                    <h3 className="eyebrow mb-3">{t.recovery.summaryHeading}</h3>
                    <div className="p-4 rounded-xl bg-bg-surface/50 border border-border-hairline">
                      <p className="body-base text-text-secondary leading-relaxed">
                        {t.recovery.summaryIntro}{" "}
                        {format(t.recovery.summaryRisk, {
                          claims: analysis.claimsDetected,
                          tactics: analysis.riskBreakdown.length,
                          plural: analysis.claimsDetected === 1 ? "" : "s",
                          categoryPlural: analysis.riskBreakdown.length === 1 ? "" : "s",
                        })}
                        {topTactics ? format(t.recovery.summaryTactics, { tactics: topTactics }) : ""}
                        {hasPaymentRelatedSignal ? t.recovery.summaryMoney : ""}{" "}
                        {t.recovery.summaryEnd}
                      </p>
                    </div>
                  </section>

                  <section>
                    <h3 className="eyebrow mb-3">
                      {format(t.recovery.messageHeading, {
                        kind: hasUserInput ? t.result.yourMessage : t.result.sampleMessage,
                      })}
                    </h3>
                    <div className="p-4 rounded-xl bg-bg-surface/50 border border-border-hairline max-h-48 overflow-auto">
                      <pre className="whitespace-pre-wrap break-words font-mono text-[13px] text-text-secondary leading-relaxed">
                        {inputText}
                      </pre>
                    </div>
                  </section>

                  <section>
                    <h3 className="eyebrow mb-3">{t.recovery.timelineInReport}</h3>
                    <ul className="grid sm:grid-cols-2 gap-2.5">
                      {sampleTimeline.map((event) => (
                        <li
                          key={event.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-bg-surface/50 border border-border-hairline"
                        >
                          <span
                            className={cn(
                              "shrink-0 flex items-center justify-center w-8 h-8 rounded-lg border font-mono text-[11px] font-bold",
                              timelineTones[event.type]
                            )}
                          >
                            {event.id.replace("tl-", "")}
                          </span>
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-text-primary">
                              {getRecoveryTimelineCopy(locale, event.id, event.event)}
                            </p>
                            <p className="text-[11px] text-text-muted">{event.time}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h3 className="eyebrow mb-3">{t.recovery.claimsHeading}</h3>
                    {analysis.claims.length > 0 ? (
                      <ul className="space-y-2">
                        {analysis.claims.map((claim) => (
                          <li
                            key={claim.id}
                            className="flex items-start gap-3 p-3 rounded-xl bg-bg-surface/50 border border-border-hairline"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" aria-hidden="true" />
                            <span className="text-[13px] text-text-secondary">{claim.text}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="body-base text-text-secondary">{t.recovery.claimsEmpty}</p>
                    )}
                  </section>

                  <section>
                    <h3 className="eyebrow mb-3">{t.recovery.evidenceHeading}</h3>
                    <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {checklist.map((item) => {
                        const saved = evidence.find((e) => e.id === item.id)?.preserved ?? false;
                        return (
                          <li
                            key={item.id}
                            className="p-3 rounded-xl bg-bg-surface/50 border border-border-hairline text-center"
                          >
                            <span
                              className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-lg mx-auto mb-2",
                                saved
                                  ? "bg-emerald-500/15 text-emerald-400"
                                  : "bg-bg-card-hover text-text-muted border border-border-hairline"
                              )}
                            >
                              {saved ? (
                                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                              ) : (
                                <span className="w-3 h-3 rounded-full border border-border-default" />
                              )}
                            </span>
                            <span className="block text-[11px] font-medium text-text-primary leading-tight">
                              {item.label}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </section>

                  <section>
                    <h3 className="eyebrow mb-3">{t.recovery.nextStepsHeading}</h3>
                    <ol className="space-y-2.5">
                      {nextSteps.map((step, index) => (
                        <li
                          key={step}
                          className="flex items-start gap-3.5 p-4 rounded-xl bg-bg-surface/50 border border-border-hairline"
                        >
                          <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/[0.08] border border-cyan-500/20 font-mono text-[11px] font-bold text-cyan-400">
                            {index + 1}
                          </span>
                          <span className="text-[14px] text-text-primary leading-relaxed pt-1">
                            {step}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </section>

                  <div className="p-4 rounded-xl bg-bg-surface/50 border border-border-hairline">
                    <p className="text-[13px] text-text-secondary leading-relaxed">
                      {t.recovery.disclaimer}
                    </p>
                  </div>
                </div>
              </section>
            </Reveal>
          )}

          {/* Official channels */}
          <Reveal delay={220}>
            <section className="card p-6 sm:p-8 mb-6" aria-labelledby="official-channels">
              <h2 id="official-channels" className="heading-2 text-text-primary mb-6">
                {t.recovery.channelsTitle}
              </h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {[
                  {
                    title: t.ui.channels.cybercrime,
                    description: t.ui.channels.cybercrimeDesc,
                    url: "https://cybercrime.gov.in",
                    icon: ExternalLink,
                  },
                  {
                    title: t.ui.channels.helpline,
                    description: t.ui.channels.helplineDesc,
                    url: "tel:1930",
                    icon: Phone,
                  },
                  {
                    title: t.ui.channels.sebi,
                    description: t.ui.channels.sebiDesc,
                    url: "https://sebi.gov.in",
                    icon: ExternalLink,
                  },
                  {
                    title: t.ui.channels.rbiSachet,
                    description: t.ui.channels.rbiSachetDesc,
                    url: "https://sachet.rbi.org.in",
                    icon: ExternalLink,
                  },
                ].map((resource) => (
                  <li key={resource.title}>
                    <a
                      href={resource.url}
                      {...(resource.url.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="flex items-start gap-3.5 h-full p-4 rounded-xl bg-bg-surface/50 border border-border-hairline transition-all duration-200 hover:border-cyan-500/30 hover:bg-cyan-500/[0.04] group"
                    >
                      <span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                        <resource.icon
                          className="w-[18px] h-[18px] text-cyan-400"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-semibold text-text-primary mb-0.5">
                          {resource.title}
                        </span>
                        <span className="block text-[12px] text-text-tertiary">
                          {resource.description}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>

          {/* Reassurance */}
          <Reveal delay={260}>
            <div className="card p-7 sm:p-8 text-center mb-6">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/[0.08] border border-cyan-500/20 mb-5">
                <Shield className="w-6 h-6 text-cyan-400" aria-hidden="true" />
              </span>
              <p className="heading-3 text-text-primary mb-2.5">{t.recovery.notAloneTitle}</p>
              <p className="body-lg text-text-secondary max-w-md mx-auto">
                {t.recovery.notAloneBody}
              </p>
            </div>
          </Reveal>

          {/* Actions */}
          <Reveal delay={300}>
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
                {t.recovery.another}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push("/")}
                icon={<Shield className="w-5 h-5" />}
              >
                {t.recovery.backHome}
              </Button>
            </div>
          </Reveal>
        </div>
      </main>

      <Footer />
    </div>
  );
}