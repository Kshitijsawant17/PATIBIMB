"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Speech recognition wrapper (Web Speech API).
 *
 * Support is patchy in practice: absent on Firefox and most iOS Safari
 * versions, present on Chrome and Edge, and often blocked over plain HTTP on
 * non-localhost hosts. The hook therefore reports `isSupported` and callers
 * must hide the control entirely rather than showing a dead button.
 *
 * TypeScript's DOM lib has no `SpeechRecognition` types in this project, so
 * the minimal surface we use is declared locally.
 */

interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultLike {
  readonly length: number;
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionResultListLike {
  readonly length: number;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

type SpeechErrorKind =
  | "no-speech"
  | "not-allowed"
  | "service-not-allowed"
  | "audio-capture"
  | "network"
  | "aborted"
  | "unsupported";

export function useSpeechRecognition(lang: string) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<SpeechErrorKind | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // Feature detection runs after mount because the constructor is not present
  // in every browser and is not safe to touch during SSR.
  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    setIsSupported(typeof Ctor === "function");
  }, []);

  const stop = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      recognition.stop();
    } catch {
      recognition.abort?.();
    }
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  useEffect(() => stop, [stop]);

  const start = useCallback(
    (onTranscript: (text: string, isFinal: boolean) => void) => {
      const w = window as unknown as {
        SpeechRecognition?: SpeechRecognitionCtor;
        webkitSpeechRecognition?: SpeechRecognitionCtor;
      };
      const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
      if (typeof Ctor !== "function") {
        setError("unsupported");
        return false;
      }

      setError(null);

      try {
        const recognition = new Ctor();
        recognition.lang = lang;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
          let interim = "";
          let final = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0]?.transcript ?? "";
            if (result.isFinal) final += transcript;
            else interim += transcript;
          }

          if (final) onTranscript(final, true);
          else if (interim) onTranscript(interim, false);
        };

        recognition.onerror = (event) => {
          const kind = event.error as SpeechErrorKind;
          setError(kind);
          if (kind === "not-allowed" || kind === "service-not-allowed") {
            recognitionRef.current = null;
            setIsListening(false);
          }
        };

        recognition.onend = () => {
          recognitionRef.current = null;
          setIsListening(false);
        };

        recognition.onstart = () => setIsListening(true);

        recognition.start();
        recognitionRef.current = recognition;
        return true;
      } catch {
        setError("unsupported");
        return false;
      }
    },
    [lang]
  );

  return { isSupported, isListening, error, start, stop };
}
