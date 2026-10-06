"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Sparkles,
  ArrowRight,
  Zap,
  Users,
  Eye,
  ScanLine,
  Landmark,
  Clock,
  Gauge,
  MessageSquareWarning,
  RotateCcw,
  Brain,
  LifeBuoy,
  Lock,
  ArrowDown,
  Quote,
  CircleSlash,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Reveal from "@/components/ui/Reveal";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useDemo } from "@/lib/demo/DemoContext";
import { useT, format } from "@/lib/i18n/SettingsContext";
import { PATTERNS } from "@/lib/engine/patterns";
import { REGIONAL_PATTERNS } from "@/lib/engine/regional-patterns";
import { cn } from "@/lib/utils";

const RULE_COUNT = PATTERNS.length + REGIONAL_PATTERNS.length;

/**
 * Order of the fictional message in the hero. Each entry is a real engine
 * category, so the chips below carry the same names the rest of the app uses
 * and nothing on screen is invented for marketing.
 */
const CONSOLE_ORDER = [
  "urgency",
  "guaranteed-language",
  "social-proof",
  "authority",
  "payment-pressure",
] as const;

/** Colour per category. Reused from the shared map so a category looks the same everywhere. */
const toneStyles: Record<string, string> = {
  authority: "text-cyan-400 border-cyan-500/25 bg-cyan-500/[0.07]",
  urgency: "text-rose-400 border-rose-500/25 bg-rose-500/[0.07]",
  "social-proof": "text-violet-400 border-violet-500/25 bg-violet-500/[0.07]",
  "guaranteed-language": "text-amber-400 border-amber-500/25 bg-amber-500/[0.07]",
  "payment-pressure": "text-rose-400 border-rose-500/25 bg-rose-500/[0.07]",
};

const highlightStyles: Record<string, string> = {
  urgency: "bg-rose-500/15 text-rose-300 decoration-rose-400/50",
  "guaranteed-language": "bg-amber-500/15 text-amber-300 decoration-amber-400/50",
  "social-proof": "bg-violet-500/15 text-violet-300 decoration-violet-400/50",
  authority: "bg-cyan-500/15 text-cyan-300 decoration-cyan-400/50",
  "payment-pressure": "bg-rose-500/15 text-rose-300 decoration-rose-400/50",
};

/** The four manipulation stages previewed on the landing page. */
const REPLAY_STAGE_KEYS = ["one", "two", "three", "four"] as const;

/** Ambient light sources. Static, so there is nothing to animate per frame. */
function AmbientField() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="radial-glow-cyan" style={{ top: "-180px", right: "-120px" }} />
      <div className="radial-glow-violet" style={{ top: "420px", left: "-200px" }} />
      {/* Faint grid keeps large empty areas from reading as flat black. */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(148,163,184,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.045) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)",
        }}
      />
    </div>
  );
}

/** Thin scan line that sweeps the hero message card. */
function ScanSweep({ running }: { running: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        className={cn(
          "absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-cyan-400/[0.09] to-transparent",
          running && "animate-scan-line"
        )}
      />
    </div>
  );
}

export default function LandingPage() {
  const { startDemo } = useDemo();
  const router = useRouter();
  const t = useT();
  const [scanTick, setScanTick] = useState(0);

  // Restart the sweep periodically so the hero feels alive. Disabled for
  // reduced-motion and low-bandwidth users via the CSS media query.
  useEffect(() => {
    const id = setInterval(() => setScanTick((n) => n + 1), 5200);
    return () => clearInterval(id);
  }, []);

  // `startDemo` is what raises the demo rail. `goToStep` only moves the
  // highlight, so calling it alone would leave the rail hidden.
  const handleDemo = () => {
    startDemo();
    router.push("/investigate");
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <AmbientField />

      <Header />

      <main className="flex-1">
        {/* ================= HERO ================= */}
        <section className="relative pt-28 pb-16 sm:pt-32 lg:pt-40 lg:pb-24 px-5 sm:px-6 lg:px-8">
          <div className="container-wide mx-auto">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
              {/* Left: the promise */}
              <div className="min-w-0 lg:col-span-6 xl:col-span-5">
                <Reveal>
                  <Badge variant="cyan" size="md" className="mb-7">
                    <Sparkles className="w-3 h-3" aria-hidden="true" />
                    {t.landing.eyebrow}
                  </Badge>
                </Reveal>

                <Reveal delay={60}>
                  <h1 className="heading-hero text-text-primary mb-7 text-balance">
                    {t.landing.heroTitleBefore}
                    <span className="gradient-text-cyan-violet">{t.landing.heroTitleAccent}</span>
                    <br className="hidden sm:block" />
                    {t.landing.heroTitleAfter}
                  </h1>
                </Reveal>

                <Reveal delay={120}>
                  <p className="body-lg text-text-secondary max-w-xl mb-9">
                    {t.landing.subtitle}
                  </p>
                </Reveal>

                <Reveal delay={180}>
                  <div className="flex flex-col sm:flex-row gap-3 mb-10">
                    <Link href="/investigate" className="sm:w-auto w-full">
                      <Button size="xl" variant="primary" fullWidth className="sm:w-auto" iconRight={<ArrowRight className="w-5 h-5" />}>
                        {t.landing.ownCta}
                      </Button>
                    </Link>
                    <a href="#how-it-works" className="sm:w-auto w-full">
                      <Button size="xl" variant="secondary" fullWidth className="sm:w-auto" icon={<ArrowDown className="w-5 h-5" />}>
                        {t.landing.howCta}
                      </Button>
                    </a>
                  </div>
                </Reveal>

                <Reveal delay={240}>
                  <ul className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    {[
                      { icon: Lock, label: t.landing.trustLocal },
                      { icon: Shield, label: t.landing.trustNoAdvice },
                      { icon: Sparkles, label: t.landing.trustNoData },
                    ].map((item) => (
                      <li key={item.label} className="flex items-center gap-2 text-[13px] text-text-tertiary">
                        <item.icon className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>

              {/* Right: the product, shown doing its job */}
              <div className="min-w-0 lg:col-span-6 xl:col-span-7">
                <Reveal delay={120}>
                  <div className="relative">
                    {/* Ambient halo behind the console */}
                    <div className="absolute -inset-8 -z-10" aria-hidden="true">
                      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-cyan-500/10 blur-[90px]" />
                      <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-violet-500/10 blur-[90px]" />
                    </div>

                    <div className="grid sm:grid-cols-5 gap-4">
                      {/* The suspicious message */}
                      <div className="sm:col-span-3">
                        <div className="card p-5 sm:p-6 relative overflow-hidden h-full">
                          <div className="scan-corners" aria-hidden="true">
                            <span />
                          </div>

                          <div className="flex items-center gap-2.5 mb-5 pb-5 border-b border-border-hairline">
                            <span className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                              <MessageSquareWarning className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-text-primary">{t.landing.consoleTitle}</p>
                              <p className="text-[11px] text-text-muted">{t.landing.consoleNote}</p>
                            </div>
                          </div>

                          <div className="relative font-mono text-[13px] sm:text-sm leading-relaxed">
                            <ScanSweep key={scanTick} running />
                            <ul className="space-y-2.5">
                              {CONSOLE_ORDER.map((category) => (
                                <li key={category} className="flex gap-2.5">
                                  <span className="text-text-muted select-none" aria-hidden="true">
                                    ›
                                  </span>
                                  <span className="min-w-0">
                                    <mark className={cn("rounded px-1 py-0.5 -mx-1", highlightStyles[category])}>
                                      {t.landing.consoleLines[category]}
                                    </mark>
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* What the engine found */}
                      <div className="sm:col-span-2">
                        <div className="card p-5 h-full flex flex-col">
                          <div className="flex items-baseline justify-between gap-2 mb-1">
                            <span className="eyebrow">{t.landing.consoleSignals}</span>
                            <span className="font-mono text-2xl font-bold text-cyan-400 tabular-nums">
                              {String(CONSOLE_ORDER.length).padStart(2, "0")}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-muted mb-4">{t.landing.consoleLocal}</p>

                          <ul className="space-y-2 flex-1">
                            {CONSOLE_ORDER.map((category, i) => (
                              <li
                                key={category}
                                className={cn(
                                  "flex items-center gap-2 px-2.5 py-2 rounded-lg border text-[11px] font-medium animate-fade-in-up",
                                  toneStyles[category]
                                )}
                                style={{ animationDelay: `${i * 90}ms` }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" aria-hidden="true" />
                                <span className="truncate">{t.categories[category]}</span>
                              </li>
                            ))}
                          </ul>

                          <div className="mt-4 pt-4 border-t border-border-hairline">
                            <p className="text-[11px] text-text-muted leading-relaxed">
                              {t.landing.citedNote}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ================= THE COST ================= */}
        <section className="relative py-16 lg:py-24 px-5 sm:px-6 lg:px-8 border-t border-border-hairline">
          <div className="mx-auto max-w-6xl">
            <Reveal className="max-w-3xl mx-auto text-center mb-14">
              <Badge variant="rose" className="mb-5">
                <CircleSlash className="w-3 h-3" aria-hidden="true" />
                {t.landing.whyExistsEyebrow}
              </Badge>
              <h2 className="heading-1 text-text-primary mb-5 text-balance">
                {t.landing.whyExistsBefore}
                <span className="gradient-text-cyan-violet">{t.landing.whyExistsAccent}</span>
                {t.landing.whyExistsAfter}
              </h2>
              <p className="body-lg text-text-secondary">{t.landing.whyExistsBody}</p>
            </Reveal>

            <div className="grid sm:grid-cols-3 gap-4 lg:gap-5">
              {[
                {
                  icon: Landmark,
                  title: t.landing.costAuthorityTitle,
                  body: t.landing.costAuthorityBody,
                },
                {
                  icon: Clock,
                  title: t.landing.costUrgencyTitle,
                  body: t.landing.costUrgencyBody,
                },
                {
                  icon: Gauge,
                  title: t.landing.costOutcomeTitle,
                  body: t.landing.costOutcomeBody,
                },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 80}>
                  <div className="card p-7 h-full group">
                    <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-bg-surface border border-border-subtle text-cyan-400 mb-5 transition-all duration-300 group-hover:border-cyan-500/30 group-hover:shadow-[0_0_20px_rgba(6,214,224,0.15)]">
                      <item.icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <h3 className="heading-4 text-text-primary mb-2.5">{item.title}</h3>
                    <p className="body-base text-text-secondary">{item.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section id="how-it-works" className="relative py-16 lg:py-24 px-5 sm:px-6 lg:px-8 border-t border-border-hairline scroll-mt-20">
          <div className="mx-auto max-w-6xl">
            <Reveal className="max-w-2xl mx-auto text-center mb-14">
              <Badge variant="cyan" className="mb-5">
                <Eye className="w-3 h-3" aria-hidden="true" />
                {t.landing.howTitle.toUpperCase()}
              </Badge>
              <h2 className="heading-1 text-text-primary mb-5 text-balance">{t.landing.howSubtitle}</h2>
              <p className="body-base text-text-tertiary">{format(t.landing.ruleSummary, { count: RULE_COUNT })}</p>
            </Reveal>

            <ol className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { n: "01", title: t.landing.howFlow.one, body: t.landing.step1Title, href: "/investigate" },
                { n: "02", title: t.landing.howFlow.two, body: t.landing.step2Title, href: "/result" },
                { n: "03", title: t.landing.howFlow.three, body: t.replay.subtitle, href: "/replay" },
                { n: "04", title: t.landing.howFlow.four, body: t.teachback.subtitle, href: "/teachback" },
                { n: "05", title: t.landing.howFlow.five, body: t.recovery.subtitle, href: "/recovery" },
              ].map((step, i) => (
                <Reveal key={step.n} delay={i * 70} as="li">
                  <Link href={step.href} className="block h-full group">
                    <div className="card p-5 h-full transition-all duration-300 group-hover:border-cyan-500/25 group-hover:-translate-y-1">
                      <span className="font-mono text-xs font-bold text-text-muted group-hover:text-cyan-400 transition-colors">
                        {step.n}
                      </span>
                      <h3 className="text-[15px] font-semibold text-text-primary mt-2 mb-1.5">{step.title}</h3>
                      <p className="text-[13px] leading-relaxed text-text-tertiary line-clamp-2">{step.body}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </ol>

            <Reveal delay={200}>
              <div className="mt-10 text-center">
                <Button variant="secondary" size="lg" onClick={handleDemo} iconRight={<ArrowRight className="w-5 h-5" />}>
                  {t.landing.demoCta}
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================= SIGNATURE: CLAIM vs EVIDENCE ================= */}
        <section className="relative py-16 lg:py-24 px-5 sm:px-6 lg:px-8 border-t border-border-hairline overflow-hidden">
          {/* Signature moment gets its own restrained light source. */}
          <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-cyan-500/[0.055] blur-[110px]" />
          </div>

          <div className="mx-auto max-w-6xl">
            <Reveal className="max-w-2xl mx-auto text-center mb-12">
              <Badge variant="violet" className="mb-5">
                <Quote className="w-3 h-3" aria-hidden="true" />
                {t.landing.distinctionEyebrow}
              </Badge>
              <h2 className="heading-1 text-text-primary mb-5 text-balance">
                {t.landing.distinctionTitle}
              </h2>
              <p className="body-lg text-text-secondary">
                {t.landing.distinctionBody}
                <em className="text-text-primary not-italic font-medium">
                  {t.landing.distinctionEmphasis}
                </em>
                {t.landing.distinctionEmphasisTail}
              </p>
            </Reveal>

            <Reveal delay={100}>
              <div className="max-w-4xl mx-auto card p-6 sm:p-8">
                <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-5 sm:gap-6 items-start">
                  {/* Claim */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 rounded-md bg-rose-500/10 border border-rose-500/25 flex items-center justify-center shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" aria-hidden="true" />
                      </span>
                      <span className="claim-label !mb-0">{t.result.claimLabel}</span>
                    </div>
                    <div className="claim-card">
                      <p className="claim-text font-medium text-text-primary">{t.landing.claimExample}</p>
                      <p className="text-[12px] text-text-muted mt-3 leading-relaxed">
                        {t.landing.authorityNote}
                      </p>
                    </div>
                  </div>

                  {/* Connector */}
                  <div className="hidden sm:flex flex-col items-center justify-center gap-1 px-1 pt-8" aria-hidden="true">
                    <span className="text-cyan-400/50">
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </div>
                  <div className="sm:hidden flex justify-center -my-2" aria-hidden="true">
                    <span className="text-cyan-400/50 rotate-90">
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </div>

                  {/* Evidence */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                      </span>
                      <span className="evidence-label !mb-0">{t.result.evidenceLabel}</span>
                    </div>
                    <div className="evidence-card">
                      <p className="evidence-text">{t.landing.evidenceExample}</p>
                      <p className="text-[12px] text-text-muted mt-3 leading-relaxed">
                        {t.landing.authorityVerify}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-7 pt-6 border-t border-border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="body-base text-text-primary font-medium">
                    {t.common.decisionYours}. {t.common.notAdvice}.
                  </p>
                  <Link href="/result" className="inline-flex shrink-0">
                    <Button variant="secondary" size="md" iconRight={<ArrowRight className="w-4 h-4" />}>
                      {t.landing.realAnalysisCta}
                    </Button>
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================= SIGNATURE: REPLAY ================= */}
        <section className="relative py-16 lg:py-24 px-5 sm:px-6 lg:px-8 border-t border-border-hairline">
          <div className="mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <Reveal>
                <Badge variant="amber" className="mb-5">
                  <Sparkles className="w-3 h-3" aria-hidden="true" />
                  {t.landing.replayBadge}
                </Badge>
                <h2 className="heading-1 text-text-primary mb-5 text-balance">
                  {t.replay.title}
                </h2>
                <p className="body-lg text-text-secondary mb-7">{t.landing.replayBody}</p>
                <ul className="space-y-3 mb-8">
                  {[t.landing.replayPoint1, t.landing.replayPoint2, t.landing.replayPoint3].map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-[14px] text-text-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
                <Link href="/replay" className="inline-flex">
                  <Button variant="primary" size="lg" iconRight={<ArrowRight className="w-5 h-5" />}>
                    {t.map.openReplay}
                  </Button>
                </Link>
              </Reveal>

              {/* Stage list */}
              <Reveal delay={120}>
                <ol className="relative space-y-3">
                  <div className="replay-connector hidden sm:block" aria-hidden="true" />
                  {REPLAY_STAGE_KEYS.map((key, i) => {
                    const stage = t.landing.replayStages[key];
                    return (
                      <li
                        key={key}
                        className="relative flex gap-4 p-5 card animate-fade-in-up"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <span className="relative z-10 shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/15 to-violet-500/15 border border-cyan-500/20 font-mono text-xs font-bold text-cyan-400">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h3 className="text-[15px] font-semibold text-text-primary">{stage.title}</h3>
                          </div>
                          <p className="font-mono text-[13px] text-cyan-300/90 mb-2 wrap-anywhere">{stage.line}</p>
                          <p className="text-[13px] leading-relaxed text-text-tertiary">{stage.effect}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ================= SIGNATURE: REACTION → RECOGNITION → HABIT ================= */}
        <section className="relative py-16 lg:py-24 px-5 sm:px-6 lg:px-8 border-t border-border-hairline">
          <div className="mx-auto max-w-6xl">
            <Reveal className="max-w-2xl mx-auto text-center mb-12">
              <Badge variant="cyan" className="mb-5">
                <Brain className="w-3 h-3" aria-hidden="true" />
                {t.landing.teachbackEyebrow}
              </Badge>
              <h2 className="heading-1 text-text-primary mb-5 text-balance">
                {t.teachback.subtitle}
              </h2>
              <p className="body-lg text-text-secondary">{t.landing.teachbackBody}</p>
            </Reveal>

            <Reveal delay={100}>
              <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-4">
                {[
                  {
                    step: t.landing.teachReaction,
                    body: t.landing.teachReactionBody,
                    tone: "text-text-secondary",
                  },
                  {
                    step: t.landing.teachRecognition,
                    body: t.landing.teachRecognitionBody,
                    tone: "text-cyan-400",
                  },
                  {
                    step: t.landing.teachHabit,
                    body: t.landing.teachHabitBody,
                    tone: "text-emerald-400",
                  },
                ].map((item, i) => (
                  <div key={item.step} className="relative">
                    {i < 2 && (
                      <span
                        className="hidden sm:block absolute top-1/2 -right-2 translate-x-1/2 -translate-y-1/2 text-text-muted/40 z-10"
                        aria-hidden="true"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                    <div className="card p-6 h-full">
                      <p className={cn("eyebrow mb-3", item.tone)}>{item.step}</p>
                      <p className="text-[14px] leading-relaxed text-text-secondary">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="mt-10 max-w-2xl mx-auto text-center">
                <div className="card p-7">
                  <p className="heading-3 text-text-primary mb-2.5">{t.resilience.goalLine1}</p>
                  <p className="heading-3 gradient-text-cyan-violet mb-3">{t.resilience.goalLine2}</p>
                  <p className="body-base text-text-secondary">{t.resilience.goalBody}</p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================= ALREADY SENT MONEY ================= */}
        <section className="relative py-16 lg:py-24 px-5 sm:px-6 lg:px-8 border-t border-border-hairline">
          <div className="mx-auto max-w-6xl">
            <Reveal className="max-w-3xl mx-auto text-center card p-8 sm:p-10">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-6">
                <LifeBuoy className="w-6 h-6" aria-hidden="true" />
              </span>
              <h2 className="heading-2 text-text-primary mb-4">{t.recovery.title}</h2>
              <p className="body-lg text-text-secondary mb-8 max-w-xl mx-auto">
                {t.landing.recoveryTeaser}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/recovery" className="w-full sm:w-auto">
                  <Button size="lg" variant="primary" fullWidth className="sm:w-auto" icon={<LifeBuoy className="w-5 h-5" />}>
                    {t.result.needHelp}
                  </Button>
                </Link>
                <Link href="/" className="w-full sm:w-auto">
                  <Button size="lg" variant="ghost" fullWidth className="sm:w-auto">
                    {t.resilience.backHome}
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================= FINAL CTA ================= */}
        <section className="relative py-20 lg:py-28 px-5 sm:px-6 lg:px-8 border-t border-border-hairline overflow-hidden">
          <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-violet-500/[0.06] blur-[110px]" />
          </div>

          <div className="container-narrow mx-auto text-center">
            <Reveal>
              <h2 className="heading-1 text-text-primary mb-6 text-balance">{t.landing.ctaTitle}</h2>
              <p className="body-lg text-text-secondary max-w-xl mx-auto mb-10">{t.landing.ctaBody}</p>
              <Link href="/investigate" className="inline-block w-full sm:w-auto">
                <Button size="xl" variant="primary" fullWidth className="sm:w-auto" iconRight={<ArrowRight className="w-5 h-5" />}>
                  {t.landing.ownCta}
                </Button>
              </Link>
              <p className="body-xs text-text-muted mt-7">{t.common.hackathonCredit}</p>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}