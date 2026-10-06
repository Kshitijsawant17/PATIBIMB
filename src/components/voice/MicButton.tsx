"use client";

import { useRef } from "react";
import { Mic, Square } from "lucide-react";
import { useT, LOCALE_META, type Locale } from "@/lib/i18n/SettingsContext";
import { useSpeechRecognition } from "@/lib/speech/speechRecognition";

/**
 * Dictation button for the input screen.
 *
 * Renders nothing where the Web Speech API is unavailable, so the user is never
 * offered a control that cannot work. Transcripts are appended to the textarea
 * rather than replacing it, because a user usually already pasted part of the
 * message and does not want it lost.
 */
export default function MicButton({
  locale,
  onTranscript,
  disabled = false,
}: {
  locale: Locale;
  onTranscript: (text: string, isFinal: boolean) => void;
  disabled?: boolean;
}) {
  const t = useT();
  const { isSupported, isListening, error, start, stop } = useSpeechRecognition(
    LOCALE_META[locale].speechTag
  );
  // Interim results replace each other; keep the last one so we can reset it.
  const interimRef = useRef("");

  if (!isSupported) return null;

  const handleClick = () => {
    if (isListening) {
      stop();
      return;
    }
    interimRef.current = "";
    start((text, isFinal) => {
      onTranscript(text, isFinal);
      if (!isFinal) interimRef.current = text;
    });
  };

  const errorMessage =
    error === "not-allowed" || error === "service-not-allowed"
      ? t.input.micDenied
      : error === "no-speech"
        ? t.input.micNoSpeech
        : error === "unsupported"
          ? t.input.micUnsupported
          : null;

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-pressed={isListening}
        className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer border disabled:opacity-50 disabled:cursor-not-allowed ${
          isListening
            ? "bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_16px_rgba(248,113,113,0.12)]"
            : "bg-bg-card text-text-secondary border-border-subtle hover:text-text-primary hover:border-border-strong hover:bg-bg-card-hover"
        }`}
      >
        {isListening ? (
          <Square className="w-5 h-5 shrink-0" aria-hidden="true" />
        ) : (
          <Mic className="w-5 h-5 shrink-0" aria-hidden="true" />
        )}
        {isListening ? t.input.micStop : t.input.micStart}
      </button>

      {isListening && (
        <p role="status" className="text-xs text-cyan-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse-soft" />
          {t.input.micListening}
        </p>
      )}

      {errorMessage && !isListening && (
        <p role="alert" className="text-xs text-amber-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
