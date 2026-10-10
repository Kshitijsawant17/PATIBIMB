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
  Globe2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Reveal from "@/components/ui/Reveal";
import MicButton from "@/components/voice/MicButton";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAnalysis } from "@/lib/analysis/AnalysisContext";
import { useDemo } from "@/lib/demo/DemoContext";
import { useSettings, useT } from "@/lib/i18n/SettingsContext";
import { sampleMessage } from "@/lib/data/mock-data";
import { cn } from "@/lib/utils";
import { createWorker } from "tesseract.js";

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
  const [ocrStatus, setOcrStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [screenshotName, setScreenshotName] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [urlStatus, setUrlStatus] = useState<"idle" | "fetching" | "success" | "error">("idle");
  const [urlError, setUrlError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

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

  const preprocessImage = useCallback(async (file: File): Promise<Blob> => {
    const bitmap = await createImageBitmap(file);
    const maxDimension = 2400;
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Your browser could not prepare this image.");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < pixels.data.length; i += 4) {
      const r = pixels.data[i];
      const g = pixels.data[i + 1];
      const b = pixels.data[i + 2];
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      const contrast = Math.max(0, Math.min(255, (gray - 128) * 1.35 + 128));
      pixels.data[i] = contrast;
      pixels.data[i + 1] = contrast;
      pixels.data[i + 2] = contrast;
    }
    ctx.putImageData(pixels, 0, 0);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not prepare the image."))), "image/png", 0.92);
    });
  }, []);

  const acceptFile = useCallback(async (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) {
      setOcrStatus("error");
      setScreenshotName("");
      setMessage("");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setOcrStatus("error");
      setScreenshotName(file.name);
      setMessage("");
      return;
    }

    setIsSample(false);
    setShowValidation(false);
    setScreenshotName(file.name);
    setOcrStatus("processing");
    setOcrProgress(0);
    setMessage("");
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(URL.createObjectURL(file));

    let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
    try {
      const language = locale === "hi" ? "eng+hin" : locale === "mr" ? "eng+mar" : "eng";
      worker = await createWorker(language, 1, {
        workerPath: "/tesseract/worker.min.js",
        corePath: "/tesseract/tesseract-core-lstm.wasm.js",
        langPath: "/tessdata/",
        gzip: false,
        logger: (event) => {
          if (event.status === "recognizing text" && typeof event.progress === "number") {
            setOcrProgress(Math.round(event.progress * 100));
          }
        },
      });
      const prepared = await preprocessImage(file);
      const result = await worker.recognize(prepared);
      const text = result.data.text.trim();

      if (!text) {
        setOcrStatus("error");
        setMessage("");
        return;
      }

      setMessage(text.slice(0, MAX_CHARS));
      setOcrProgress(100);
      setOcrStatus("success");
      setActiveMode("text");
    } catch {
      setOcrStatus("error");
      setMessage("");
    } finally {
      if (worker) await worker.terminate();
    }
  }, [imagePreviewUrl, locale, preprocessImage]);

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      if (activeMode !== "screenshot") return;
      const image = Array.from(event.clipboardData?.files ?? []).find((file) => file.type.startsWith("image/"));
      if (image) {
        event.preventDefault();
        void acceptFile(image);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [activeMode, acceptFile]);

  const handleUrlExtract = async () => {
    const candidate = urlValue.trim();
    if (!candidate) {
      setUrlStatus("error");
      setUrlError("Enter a web page URL first.");
      return;
    }
    setUrlStatus("fetching");
    setUrlError("");
    try {
      const response = await fetch("/api/extract-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: candidate }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The page could not be extracted.");
      setMessage(String(data.text).slice(0, MAX_CHARS));
      setIsSample(false);
      setShowValidation(false);
      setUrlStatus("success");
      setActiveMode("text");
    } catch (error) {
      setUrlStatus("error");
      setUrlError(error instanceof Error ? error.message : "The page could not be extracted.");
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      void acceptFile(e.dataTransfer.files?.[0]);
    },
    [acceptFile]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    void acceptFile(e.target.files?.[0]);
    e.target.value = "";
  };

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
                      className={cn("drop-zone p-10 sm:p-14 text-center", dragActive && "drag-active")}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        capture="environment"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="screenshot-upload"
                      />
                      {ocrStatus === "processing" && (
                        <div className="mb-5 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.05] p-4 text-left animate-fade-in">
                          <div className="flex items-start gap-3">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 shrink-0">
                              <ScanLine className="h-4 w-4 text-cyan-400 animate-pulse" aria-hidden="true" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] font-semibold text-text-primary">Reading screenshot…</p>
                              <p className="text-[12px] text-text-muted mt-0.5">OCR runs locally in your browser. No image upload is required.</p>
                              <div className="mt-3 h-1.5 rounded-full bg-bg-surface overflow-hidden">
                                <div className="h-full rounded-full bg-cyan-400 transition-all duration-200" style={{ width: `${Math.max(8, ocrProgress)}%` }} />
                              </div>
                              <p className="text-[10px] text-text-muted mt-1.5 font-mono">{ocrProgress}% extracted</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {ocrStatus === "success" && screenshotName && (
                        <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4 text-left animate-fade-in">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                              <CheckCircle className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-text-primary">Screenshot text extracted</p>
                              <p className="text-[12px] text-text-muted mt-0.5 truncate">{screenshotName}</p>
                          <p className="text-[11px] text-emerald-300/80 mt-1">Text is now loaded into the investigation box for review.</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {ocrStatus === "error" && (
                        <div className="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-4 text-left animate-fade-in">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" aria-hidden="true" />
                            <div>
                              <p className="text-[13px] font-semibold text-amber-400">We couldn&apos;t read text from this image.</p>
                              <p className="text-[12px] text-text-secondary mt-1 leading-relaxed">Try a clearer screenshot, or switch to Text and paste the message manually.</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <label htmlFor="screenshot-upload" className="cursor-pointer block">
                        {imagePreviewUrl ? (
                          <span className="block max-w-md mx-auto mb-5 overflow-hidden rounded-xl border border-border-default bg-bg-surface">
                            <img src={imagePreviewUrl} alt="Selected screenshot preview" className="w-full max-h-64 object-contain" />
                          </span>
                        ) : null}
                        <span className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-bg-surface border border-border-subtle mb-5 transition-colors hover:border-cyan-500/40">
                          <Upload className="w-6 h-6 text-text-tertiary" aria-hidden="true" />
                        </span>
                        <h3 className="heading-4 text-text-primary mb-2">{t.input.uploadScreenshot}</h3>
                        <p className="body-base text-text-secondary mb-5 max-w-sm mx-auto">
                          {t.input.screenshotHint}
                        </p>
                        <p className="text-[11px] text-text-muted mb-5">You can also drag an image here or paste a copied screenshot. Best results: clear text, high contrast, no heavy blur.</p>
                        <span className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-bg-card-hover border border-border-default text-text-primary text-sm font-medium min-h-[48px]">
                          {t.input.chooseFile}
                        </span>
                      </label>
                    </div>
                  )}

                  {/* ---------- URL ---------- */}
                  {activeMode === "url" && (
                    <div className="py-8 text-center">
                      <span className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-cyan-500/[0.08] border border-cyan-500/20 mb-5">
                        <Globe2 className="w-6 h-6 text-cyan-400" aria-hidden="true" />
                      </span>
                      <h3 className="heading-4 text-text-primary mb-2">{t.input.fetchFromUrl}</h3>
                      <p className="body-base text-text-secondary mb-6 max-w-lg mx-auto">
                        Extract readable page text on the server, then run the same explainable investigation engine. Pages requiring login or heavy JavaScript may not expose readable text.
                      </p>
                      <div className="max-w-xl mx-auto text-left">
                        <label htmlFor="url-input" className="text-[13px] font-medium text-text-primary block mb-2">Web page URL</label>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            id="url-input"
                            type="url"
                            value={urlValue}
                            onChange={(e) => { setUrlValue(e.target.value); setUrlStatus("idle"); setUrlError(""); }}
                            placeholder="https://example.com/message"
                            className="input flex-1"
                            autoComplete="url"
                          />
                          <Button type="button" variant="secondary" onClick={handleUrlExtract} disabled={urlStatus === "fetching"} icon={urlStatus === "fetching" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}>
                            {urlStatus === "fetching" ? "Extracting…" : "Extract page"}
                          </Button>
                        </div>
                        {urlStatus === "success" && (
                          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-3.5 flex items-center gap-2.5 text-[12px] text-emerald-300">
                            <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" /> Page text extracted. Switch to the text view to review it before investigating.
                          </div>
                        )}
                        {urlStatus === "error" && (
                          <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] p-3.5 flex items-start gap-2.5 text-[12px] text-rose-300">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> {urlError}
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