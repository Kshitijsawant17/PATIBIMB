/**
 * Reads the text in a screenshot, entirely in the browser.
 *
 * The OCR runtime and the English language model are served from this app's own
 * /ocr folder, so the image never leaves the device and no third-party CDN is
 * contacted. Everything is loaded on demand: a person who never uploads a
 * screenshot downloads none of it.
 */

export type OcrErrorCode = "unsupported" | "too-large" | "load-failed" | "no-text" | "aborted";

export class OcrError extends Error {
  constructor(public code: OcrErrorCode) {
    super(code);
    this.name = "OcrError";
  }
}

export interface OcrResult {
  text: string;
  /** Mean word confidence reported by the engine, 0-100. */
  confidence: number;
}

export type OcrStage = "preparing" | "reading";

export interface OcrOptions {
  onProgress?: (stage: OcrStage, fraction: number) => void;
  signal?: AbortSignal;
}

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ACCEPTED = /^image\/(png|jpe?g|webp|bmp|gif)$/i;
const TIMEOUT_MS = 90_000;
/** Below this the text is probably wrong enough that the person should be warned. */
export const LOW_CONFIDENCE = 70;

interface TesseractWorker {
  recognize(image: File): Promise<{ data: { text: string; confidence: number } }>;
  terminate(): Promise<unknown>;
}
interface TesseractGlobal {
  createWorker(
    lang: string,
    oem: number,
    options: Record<string, unknown>
  ): Promise<TesseractWorker>;
}

declare global {
  interface Window {
    Tesseract?: TesseractGlobal;
  }
}

let scriptPromise: Promise<TesseractGlobal> | null = null;

function loadRuntime(): Promise<TesseractGlobal> {
  if (typeof window === "undefined") return Promise.reject(new OcrError("load-failed"));
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  if (!scriptPromise) {
    scriptPromise = new Promise<TesseractGlobal>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/ocr/tesseract.min.js";
      script.async = true;
      script.onload = () =>
        window.Tesseract ? resolve(window.Tesseract) : reject(new OcrError("load-failed"));
      script.onerror = () => reject(new OcrError("load-failed"));
      document.head.appendChild(script);
    }).catch((error) => {
      // Allow a retry after a failed load (e.g. flaky connection).
      scriptPromise = null;
      throw error;
    });
  }
  return scriptPromise;
}

/** Collapse OCR noise: trim lines, drop blank runs, keep the line structure. */
export function cleanOcrText(raw: string): string {
  return raw
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function readScreenshot(file: File, options: OcrOptions = {}): Promise<OcrResult> {
  if (!ACCEPTED.test(file.type)) throw new OcrError("unsupported");
  if (file.size > MAX_IMAGE_BYTES) throw new OcrError("too-large");
  if (options.signal?.aborted) throw new OcrError("aborted");

  options.onProgress?.("preparing", 0);
  const Tesseract = await loadRuntime();
  const origin = window.location.origin;

  let worker: TesseractWorker | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const abort = () => void worker?.terminate();

  try {
    worker = await Tesseract.createWorker("eng", 1, {
      // Absolute URLs: the worker is started from a blob, where relative paths do not resolve.
      workerPath: `${origin}/ocr/worker.min.js`,
      corePath: `${origin}/ocr`,
      langPath: `${origin}/ocr`,
      gzip: false,
      logger: (m: { status?: string; progress?: number }) => {
        if (m.status === "recognizing text") options.onProgress?.("reading", m.progress ?? 0);
        else options.onProgress?.("preparing", m.progress ?? 0);
      },
    });
    options.signal?.addEventListener("abort", abort, { once: true });

    const result = await Promise.race([
      worker.recognize(file),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new OcrError("load-failed")), TIMEOUT_MS);
      }),
    ]);

    if (options.signal?.aborted) throw new OcrError("aborted");
    const text = cleanOcrText(result.data.text ?? "");
    // A handful of stray characters is noise, not a message.
    if (text.replace(/\s/g, "").length < 8) throw new OcrError("no-text");
    return { text, confidence: Math.round(result.data.confidence ?? 0) };
  } catch (error) {
    if (error instanceof OcrError) throw error;
    if (options.signal?.aborted) throw new OcrError("aborted");
    throw new OcrError("load-failed");
  } finally {
    if (timer) clearTimeout(timer);
    options.signal?.removeEventListener("abort", abort);
    void worker?.terminate().catch(() => undefined);
  }
}
