"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Sparkles,
  Upload,
  Link2,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  RotateCcw,
  Type,
  Lock,
  ScanLine,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Reveal from "@/components/ui/Reveal";
import MicButton from "@/components/voice/MicButton";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAnalysis } from "@/lib/analysis/AnalysisContext";
import { useDemo } from "@/lib/demo/DemoContext";
import { useSettings, useT, format } from "@/lib/i18n/SettingsContext";
import { sampleMessage } from "@/lib/data/mock-data";
import { readScreenshot, OcrError, LOW_CONFIDENCE, type OcrErrorCode } from "@/lib/ocr/readScreenshot";
import { inspectUrl, type LinkInspection } from "@/lib/engine/url-inspector";
import { cn } from "@/lib/utils";

const MAX_CHARS = 20000;
const MIN_CHARS = 10;

const inputModes = [
  { id: "text", icon: Type },
  { id: "screenshot", icon: Upload },
  { id: "url", icon: Link2 },
] as const;

type ModeId = (typeof inputModes)[number]["id"];

const PREVIEW_STEP_KEYS = ["one", "two", "three", "four", "five"] as const;
type PreviewStepKey = (typeof PREVIEW_STEP_KEYS)[number];

export default function InvestigatePage() {
  const router = useRouter();
  const { isDemoMode, goToStep } = useDemo();
  const { inputText, hasUserInput, isReady, submitMessage } = useAnalysis();
  const { locale } = useSettings();
  const t = useT();

  const [activeMode, setActiveMode] = useState<ModeId>("text");
  const [message, setMessage] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSample, setIsSample] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Screenshot reading (on-device OCR)
  const [ocr, setOcr] = useState<
    | { status: "idle" }
    | { status: "working"; stage: "preparing" | "reading"; fraction: number }
    | { status: "error"; code: OcrErrorCode }
  >({ status: "idle" });
  const [ocrNotice, setOcrNotice] = useState<{ confidence: number } | null>(null);
  const lastFile = useRef<File | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => () => abortRef.current?.abort(), []);

  // Link check (address only, never opened)
  const [linkInput, setLinkInput] = useState("");
  const [linkResult, setLinkResult] = useState<LinkInspection | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (isDemoMode) {
      setMessage(sampleMessage);
      setIsSample(true);
    } else if (hasUserInput) {
      setMessage(inputText);
      setIsSample(false);
    }
  }, [hasUserInput, inputText, isDemoMode, isReady]);

  const trimmed = message.trim();
  const isEmpty = trimmed.length === 0;
  const isTooLong = message.length > MAX_CHARS;
  const isTooShort = !isEmpty && trimmed.length < MIN_CHARS;
  const isInvalid = isEmpty || isTooLong || isTooShort;
  const showError = showValidation && isInvalid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);
    if (isInvalid || !isReady) return;
    submitMessage(trimmed, isSample && trimmed === sampleMessage ? "sample" : "user");
    setIsSubmitting(true);
    goToStep("input");
    router.push("/analyzing");
  };

  const handleSample = () => {
    setMessage(sampleMessage);
    setIsSample(true);
    setShowValidation(false);
    setActiveMode("text");
  };

  const handleMessageChange = (value: string) => {
    setMessage(value);
    setIsSample(false);
    if (showValidation) setShowValidation(false);
  };

  const handleTranscript = (text: string) => {
    setMessage((prev) => (prev ? `${prev}\n${text}` : text));
    setIsSample(false);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const runOcr = useCallback(async (file: File) => {
    lastFile.current = file;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setOcr({ status: "working", stage: "preparing", fraction: 0 });
    setOcrNotice(null);
    try {
      const result = await readScreenshot(file, {
        signal: controller.signal,
        onProgress: (stage, fraction) => setOcr({ status: "working", stage, fraction }),
      });
      // Never submit OCR output automatically: put it where the person can check and fix it.
      setMessage(result.text);
      setIsSample(false);
      setShowValidation(false);
      setOcrNotice({ confidence: result.confidence });
      setOcr({ status: "idle" });
      setActiveMode("text");
    } catch (error) {
      if (error instanceof OcrError && error.code === "aborted") return;
      setOcr({ status: "error", code: error instanceof OcrError ? error.code : "load-failed" });
    }
  }, []);

  const acceptFile = useCallback(
    (file?: File | null) => {
      if (file) void runOcr(file);
    },
    [runOcr]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      acceptFile(e.dataTransfer.files?.[0]);
    },
    [acceptFile]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    acceptFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const handleLinkCheck = (e?: React.FormEvent) => {
    e?.preventDefault();
    setLinkResult(inspectUrl(linkInput));
  };

  const addLinkToMessage = () => {
    if (!linkResult || !linkResult.ok) return;
    setMessage((prev) => (prev.trim() ? `${prev.trim()}\n${linkResult.address}` : linkResult.address));
    setIsSample(false);
    setShowValidation(false);
    setActiveMode("text");
  };

  const ocrErrorText = (code: OcrErrorCode) =>
    code === "unsupported"
      ? t.input.ocr.errorType
      : code === "too-large"
      ? t.input.ocr.errorTooLarge
      : code === "no-text"
      ? t.input.ocr.errorNoText
      : t.input.ocr.errorLoad;

  const errorMessage = isEmpty
    ? t.input.errorEmpty
    : isTooLong
    ? t.input.errorTooLong
    : t.input.errorTooShort;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20 px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <Reveal className="max-w-2xl mx-auto text-center mb-10 sm:mb-14">
            <Badge variant="cyan" className="mb-5" dot>
              <Sparkles className="w-3 h-3" aria-hidden="true" />
              {isDemoMode ? t.input.demoBadge : t.input.normalBadge}
            </Badge>
            <h1 className="heading-1 text-text-primary mb-4 text-balance">{t.input.title}</h1>
            <p className="body-lg text-text-secondary">{t.input.subtitle}</p>
          </Reveal>

          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* ============ LEFT: INPUT ============ */}
            <Reveal delay={60} className="min-w-0 lg:col-span-7">
              <form onSubmit={handleSubmit} noValidate>
                {/* Mode selector */}
                <div
                  className="grid grid-cols-3 gap-2 mb-5"
                  role="radiogroup"
                  aria-label={t.input.modeLabel}
                >
                  {inputModes.map((mode) => {
                    const active = activeMode === mode.id;
                    const modeCopy = t.input.modes[mode.id];
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setActiveMode(mode.id)}
                        role="radio"
                        aria-checked={active}
                        className={cn(
                          "flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-3",
                          "rounded-xl border text-center sm:text-left",
                          "transition-all duration-200 min-h-[56px]",
                          active
                            ? "bg-bg-card-hover border-cyan-500/30 shadow-[0_0_18px_rgba(6,214,224,0.1)]"
                            : "bg-bg-card border-border-hairline hover:border-border-subtle hover:bg-bg-card-hover"
                        )}
                      >
                        <mode.icon
                          className={cn(
                            "w-[18px] h-[18px] shrink-0 mx-auto sm:mx-0",
                            active ? "text-cyan-400" : "text-text-muted"
                          )}
                          aria-hidden="true"
                        />
                        <span className="min-w-0">
                          <span
                            className={cn(
                              "block text-[13px] font-medium",
                              active ? "text-text-primary" : "text-text-secondary"
                            )}
                          >
                            {modeCopy.label}
                          </span>
                          <span className="hidden sm:block text-[11px] text-text-muted leading-tight mt-0.5">
                            {modeCopy.desc}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div
                  className={cn(
                    "card p-5 sm:p-7 transition-all duration-200",
                    dragActive && "border-cyan-500/50 bg-cyan-500/[0.04]"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {/* ---------- TEXT ---------- */}
                  {activeMode === "text" && (
                    <>
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <label htmlFor="message-input" className="text-[13px] font-medium text-text-primary">
                          {t.input.label}
                        </label>
                        <span
                          className={cn(
                            "font-mono text-[11px] tabular-nums",
                            isTooLong ? "text-rose-400" : "text-text-muted"
                          )}
                        >
                          {message.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                        </span>
                      </div>

                      <div className="relative">
                        <textarea
                          id="message-input"
                          value={message}
                          onChange={(e) => handleMessageChange(e.target.value)}
                          aria-required="true"
                          aria-invalid={showError}
                          aria-describedby={showError ? "message-help message-error" : "message-help"}
                          placeholder={t.input.placeholder}
                          rows={9}
                          className={cn(
                            "w-full min-h-[180px] bg-bg-input border rounded-xl p-4",
                            "text-[15px] leading-relaxed text-text-primary",
                            "placeholder:text-text-muted resize-y",
                            "transition-all duration-200",
                            "focus:outline-none focus:ring-[3px]",
                            showError
                              ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/15"
                              : "border-border-default hover:border-border-strong focus:border-cyan-500 focus:ring-cyan-500/15"
                          )}
                        />

                        {dragActive && (
                          <div className="absolute inset-0 rounded-xl bg-bg-base/85 border-2 border-dashed border-cyan-500/60 flex items-center justify-center pointer-events-none">
                            <div className="text-center px-4">
                              <Upload className="w-7 h-7 text-cyan-400 mx-auto mb-2" aria-hidden="true" />
                              <p className="text-[13px] font-medium text-cyan-400">{t.input.dropHint}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <p id="message-help" className="mt-3 flex items-start gap-2 text-[12px] text-text-muted">
                        <Shield className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
                        {t.input.helpText}
                      </p>

                      {showError && (
                        <p
                          id="message-error"
                          role="alert"
                          className="mt-3 flex items-start gap-2 text-[13px] text-rose-400 animate-fade-in"
                        >
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                          {errorMessage}
                        </p>
                      )}

                      {ocrNotice && (
                        <div
                          role="status"
                          className="mt-4 p-4 rounded-xl bg-cyan-500/[0.06] border border-cyan-500/20 animate-fade-in"
                        >
                          <p className="text-[13px] font-medium text-cyan-400 mb-0.5">{t.input.ocr.doneTitle}</p>
                          <p className="text-[12px] text-text-secondary leading-relaxed">{t.input.ocr.doneBody}</p>
                          {ocrNotice.confidence < LOW_CONFIDENCE && (
                            <p className="text-[12px] text-amber-400 mt-2">
                              {format(t.input.ocr.lowConfidence, { percent: ocrNotice.confidence })}
                            </p>
                          )}
                        </div>
                      )}

                      {isSample && (
                        <div className="mt-4 p-4 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 animate-fade-in">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                            <div>
                              <p className="text-[13px] font-medium text-amber-400 mb-0.5">
                                {t.input.sampleNoticeTitle}
                              </p>
                              <p className="text-[12px] text-text-secondary leading-relaxed">
                                {t.input.sampleNoticeBody}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* ---------- SCREENSHOT ---------- */}
                  {activeMode === "screenshot" && (
                    <div
                      className={cn("drop-zone p-8 sm:p-14 text-center", dragActive && "drag-active")}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="screenshot-upload"
                      />

                      {ocr.status === "working" ? (
                        <div role="status" aria-live="polite">
                          <Loader2 className="w-7 h-7 text-cyan-400 mx-auto mb-4 animate-spin" aria-hidden="true" />
                          <p className="text-[14px] font-medium text-text-primary mb-3">
                            {ocr.stage === "preparing"
                              ? t.input.ocr.preparing
                              : format(t.input.ocr.reading, { percent: Math.round(ocr.fraction * 100) })}
                          </p>
                          <div className="h-1.5 max-w-xs mx-auto rounded-full bg-bg-surface overflow-hidden">
                            <div
                              className="h-full bg-cyan-500 transition-[width] duration-200"
                              style={{ width: `${ocr.stage === "reading" ? Math.max(4, Math.round(ocr.fraction * 100)) : 4}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          {ocr.status === "error" && (
                            <div role="alert" className="mb-6 p-4 rounded-xl bg-rose-500/[0.06] border border-rose-500/25 text-left">
                              <p className="flex items-center gap-2 text-[13px] font-medium text-rose-400 mb-1">
                                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                                {t.input.ocr.errorTitle}
                              </p>
                              <p className="text-[12px] text-text-secondary leading-relaxed mb-3">
                                {ocrErrorText(ocr.code)}
                              </p>
                              <div className="flex flex-col sm:flex-row gap-2">
                                {ocr.code !== "unsupported" && ocr.code !== "too-large" && (
                                  <Button type="button" variant="secondary" onClick={() => lastFile.current && void runOcr(lastFile.current)}>
                                    {t.input.ocr.retry}
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => {
                                    setOcr({ status: "idle" });
                                    setActiveMode("text");
                                  }}
                                >
                                  {t.input.ocr.pasteInstead}
                                </Button>
                              </div>
                            </div>
                          )}
                          <label htmlFor="screenshot-upload" className="cursor-pointer block">
                            <span className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-bg-surface border border-border-subtle mb-5 transition-colors hover:border-cyan-500/40">
                              <Upload className="w-6 h-6 text-text-tertiary" aria-hidden="true" />
                            </span>
                            <h3 className="heading-4 text-text-primary mb-2">{t.input.uploadScreenshot}</h3>
                            <p className="body-base text-text-secondary mb-5 max-w-sm mx-auto">
                              {t.input.screenshotHint}
                            </p>
                            <span className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-bg-card-hover border border-border-default text-text-primary text-sm font-medium min-h-[48px]">
                              {t.input.chooseFile}
                            </span>
                          </label>
                          <p className="mt-5 text-[12px] text-text-muted max-w-sm mx-auto">{t.input.ocr.languageNote}</p>
                        </>
                      )}
                    </div>
                  )}

                  {/* ---------- URL (link check) ---------- */}
                  {activeMode === "url" && (
                    <div className="py-6 sm:py-10">
                      <div className="text-center">
                        <span className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-bg-surface border border-border-subtle mb-5">
                          <Link2 className="w-6 h-6 text-text-tertiary" aria-hidden="true" />
                        </span>
                        <h3 className="heading-4 text-text-primary mb-2">{t.input.fetchFromUrl}</h3>
                        <p className="body-base text-text-secondary mb-2 max-w-sm mx-auto">{t.input.urlHint}</p>
                        <p className="text-[12px] text-text-muted mb-6 max-w-sm mx-auto">{t.input.link.notOpened}</p>
                      </div>
                      <div className="max-w-md mx-auto">
                        <label htmlFor="link-input" className="sr-only">{t.input.fetchFromUrl}</label>
                        <input
                          id="link-input"
                          type="text"
                          inputMode="url"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                          value={linkInput}
                          onChange={(e) => {
                            setLinkInput(e.target.value);
                            setLinkResult(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleLinkCheck(e);
                          }}
                          placeholder={t.input.link.placeholder}
                          className="input mb-3"
                        />
                        <Button type="button" variant="secondary" fullWidth onClick={() => handleLinkCheck()}>
                          {t.input.link.check}
                        </Button>

                        {linkResult && !linkResult.ok && (
                          <p role="alert" className="mt-3 flex items-start gap-2 text-[13px] text-rose-400 animate-fade-in">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                            {linkResult.reason === "empty" ? t.input.link.errorEmpty : t.input.link.errorInvalid}
                          </p>
                        )}

                        {linkResult && linkResult.ok && (
                          <div className="mt-5 animate-fade-in" role="status">
                            <p className="text-[13px] font-semibold text-text-primary mb-1">{t.input.link.resultTitle}</p>
                            <p className="font-mono text-[12px] text-text-muted break-all mb-3">{linkResult.host}</p>
                            {linkResult.findings.length === 0 ? (
                              <p className="text-[13px] text-text-secondary leading-relaxed">{t.input.link.clean}</p>
                            ) : (
                              <ul className="space-y-2.5">
                                {linkResult.findings.map((f) => {
                                  const copy = t.input.link.findings[f.id];
                                  return (
                                    <li
                                      key={f.id}
                                      className={cn(
                                        "p-3.5 rounded-xl border text-left",
                                        f.severity === "warning"
                                          ? "border-rose-500/25 bg-rose-500/[0.06]"
                                          : f.severity === "caution"
                                          ? "border-amber-500/25 bg-amber-500/[0.06]"
                                          : "border-border-hairline bg-bg-surface/50"
                                      )}
                                    >
                                      <p className="text-[13px] font-medium text-text-primary">{copy.title}</p>
                                      <p className="text-[12px] text-text-secondary leading-relaxed mt-0.5">{copy.detail}</p>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                            <Button type="button" variant="ghost" fullWidth className="mt-4" onClick={addLinkToMessage}>
                              {t.input.link.addToMessage}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ---------- PRIVACY ---------- */}
                  <div className="mt-6 pt-6 border-t border-border-hairline">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-500/[0.08] border border-cyan-500/15 shrink-0">
                        <Lock className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-text-primary">
                          {t.input.privacyHeading}
                        </p>
                        <p className="text-[12px] text-text-secondary mt-1 leading-relaxed">
                          {t.input.privacyBody} {t.input.privacyNoCredentials}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ---------- ACTIONS ---------- */}
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleSample}
                      icon={<RotateCcw className="w-4 h-4" />}
                    >
                      {t.input.loadSample}
                    </Button>
                    <div className="flex-1 flex flex-col sm:flex-row gap-3">
                      <MicButton locale={locale} onTranscript={handleTranscript} disabled={isTooLong} />
                      <Button
                        type="submit"
                        disabled={isSubmitting || !isReady}
                        size="lg"
                        className="flex-1"
                        iconRight={
                          isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Sparkles className="w-5 h-5" />
                          )
                        }
                      >
                        {isSubmitting ? t.input.submitting : t.input.submit}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </Reveal>

            {/* ============ RIGHT: PREVIEW / INTELLIGENCE PANEL ============ */}
            <Reveal delay={120} className="min-w-0 lg:col-span-5">
              <div className="lg:sticky lg:top-24 space-y-4">
                <div className="card p-6">
                  <div className="flex items-center gap-2.5 mb-5">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 shrink-0">
                      <ScanLine className="w-4 h-4 text-violet-400" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-text-primary">{t.input.previewTitle}</p>
                      <p className="text-[11px] text-text-muted">{t.input.previewSubtitle}</p>
                    </div>
                  </div>

                  {/* Vertical progress preview */}
                  <ol className="relative space-y-0">
                    {PREVIEW_STEP_KEYS.map((key, i) => {
                      const step = t.input.previewSteps[key];
                      return (
                      <li key={step.label} className="relative flex gap-3.5 pb-5 last:pb-0">
                        {i < 4 && (
                          <span
                            className="absolute left-[11px] top-6 bottom-0 w-px bg-gradient-to-b from-border-default to-transparent"
                            aria-hidden="true"
                          />
                        )}
                        <span className="relative z-10 shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-bg-card-hover border border-border-default font-mono text-[11px] font-bold text-text-tertiary">
                          {i + 1}
                        </span>
                        <div className="min-w-0 pt-0.5">
                          <p className="text-[13px] font-medium text-text-primary leading-snug">{step.label}</p>
                          <p className="text-[12px] text-text-muted mt-0.5 leading-snug">{step.detail}</p>
                        </div>
                      </li>
                      );
                    })}
                  </ol>
                </div>

                {/* Privacy card */}
                <div className="card p-6">
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                      <Shield className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                    </span>
                    <p className="text-[13px] font-semibold text-text-primary">{t.input.nothingUploaded}</p>
                  </div>
                  <ul className="space-y-2.5">
                    {[
                      t.input.privacyBody,
                      t.input.nothingUploadedPoint2,
                      t.nav.offlineReady,
                    ].map((point) => (
                      <li key={point} className="flex items-start gap-2 text-[12px] text-text-secondary">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" aria-hidden="true" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* What happens next */}
                <div className="card p-6">
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 shrink-0">
                      <Layers className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                    </span>
                    <p className="text-[13px] font-semibold text-text-primary">
                      {t.input.stepsReadingLabel}
                    </p>
                  </div>
                  <ol className="space-y-2.5">
                    {[
                      { n: t.input.step1, d: "Paste or speak your message" },
                      { n: t.input.step2, d: "Known tactics are matched locally" },
                      { n: t.input.step3, d: "Cited results with a next step" },
                    ].map((step, i) => (
                      <li key={step.n} className="flex gap-3">
                        <span className="shrink-0 font-mono text-[11px] font-bold text-cyan-400 pt-0.5">
                          0{i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[13px] text-text-primary font-medium leading-snug">{step.n}</p>
                          <p className="text-[12px] text-text-muted mt-0.5">{step.d}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}