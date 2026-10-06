"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LOCALE_META, type Locale } from "../i18n/SettingsContext";

/**
 * Speech synthesis wrapper.
 *
 * Feature-detected: on browsers without `speechSynthesis` (and in some embedded
 * webviews) the hook reports `isSupported === false` and callers hide the
 * control rather than showing a button that does nothing.
 *
 * Two details matter for correctness:
 *  - Voices load asynchronously in most browsers, so `getVoices()` can return an
 *    empty list on first call. We listen for `voiceschanged`.
 *  - A page change can leave an utterance playing, so `stop()` is called on
 *    unmount.
 */

export interface SpeakOptions {
  lang?: string;
  onEnd?: () => void;
  onStart?: () => void;
  onError?: () => void;
}

export function useSpeech() {
  const supported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance !== "undefined";

  const [isSpeaking, setIsSpeaking] = useState(false);
  const activeRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    if (!supported) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // cancel() can throw if the engine is mid-teardown; nothing to recover.
    }
    activeRef.current = null;
    setIsSpeaking(false);
  }, [supported]);

  /**
   * Pick a voice that matches the requested language, preferring an exact
   * regional match (hi-IN) before a language-only match (hi).
   */
  const pickVoice = useCallback(
    (tag: string): SpeechSynthesisVoice | null => {
      if (!supported) return null;
      let voices: SpeechSynthesisVoice[] = [];
      try {
        voices = window.speechSynthesis.getVoices();
      } catch {
        return null;
      }
      if (voices.length === 0) return null;

      const lower = tag.toLowerCase();
      const language = lower.split("-")[0];

      return (
        voices.find((v) => v.lang.toLowerCase() === lower) ??
        voices.find((v) => v.lang.toLowerCase().startsWith(language)) ??
        voices.find((v) => v.lang.toLowerCase().includes(language)) ??
        null
      );
    },
    [supported]
  );

  const speak = useCallback(
    (text: string, options: SpeakOptions = {}) => {
      if (!supported || !text.trim()) return false;

      stop();

      const utterance = new window.SpeechSynthesisUtterance(text);
      const tag = options.lang ?? LOCALE_META.en.speechTag;
      utterance.lang = tag;

      const voice = pickVoice(tag);
      if (voice) utterance.voice = voice;

      utterance.rate = 0.95;
      utterance.pitch = 1;
      // Marathi and Hindi voices are not universal; defaulting to hi-IN gives
      // a Hindi voice a chance to read Devanagari sensibly.
      if (LOCALE_META.hi.htmlLang.startsWith(tag.slice(0, 2))) {
        if (!voice) utterance.lang = "hi-IN";
      }

      utterance.onstart = () => {
        activeRef.current = utterance;
        setIsSpeaking(true);
        options.onStart?.();
      };
      utterance.onend = () => {
        activeRef.current = null;
        setIsSpeaking(false);
        options.onEnd?.();
      };
      utterance.onerror = () => {
        activeRef.current = null;
        setIsSpeaking(false);
        options.onError?.();
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        setIsSpeaking(false);
        options.onError?.();
        return false;
      }

      return true;
    },
    [supported, stop, pickVoice]
  );

  // Never leave audio playing after navigating away.
  useEffect(() => stop, [stop]);

  /** Speech tag for a locale, used by callers building the utterance text. */
  const speechTagFor = useCallback(
    (locale: Locale) => LOCALE_META[locale].speechTag,
    []
  );

  return { isSupported: supported, isSpeaking, speak, stop, speechTagFor };
}
