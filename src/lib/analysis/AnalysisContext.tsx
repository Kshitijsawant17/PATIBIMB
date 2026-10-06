"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { buildAnalysis, sampleMessage } from "@/lib/data/mock-data";
import { readSessionItem, STORAGE_KEYS, writeSessionItem } from "@/lib/storage";
import { useSettings } from "@/lib/i18n/SettingsContext";
import type { MockAnalysis } from "@/lib/types";

interface AnalysisContextValue {
  /** null until sessionStorage has been read on the client. */
  analysis: MockAnalysis | null;
  /** Text currently under analysis. */
  inputText: string;
  /** False while the stored text is still being read from sessionStorage. */
  isReady: boolean;
  /** True when the results on screen came from text the user submitted. */
  hasUserInput: boolean;
  /** True if this browser could not keep the submitted text across navigation. */
  persistenceWarning: boolean;
  /** Save the submitted text and refresh the shared analysis immediately. */
  submitMessage: (text: string, source?: "user" | "sample") => boolean;
  /** Restore the built-in sample. Used when starting a fresh investigation. */
  resetToSample: () => void;
}

const AnalysisContext = createContext<AnalysisContextValue | undefined>(undefined);

/**
 * Owns the analysis for the whole session.
 *
 * Submitted text lives in sessionStorage, which is only readable on the client,
 * so consumers must handle `isReady === false` by rendering a loading state
 * rather than reading during render. That keeps server and client markup in
 * agreement and avoids hydration mismatches.
 */
export function AnalysisProvider({ children }: { children: ReactNode }) {
  const { locale } = useSettings();
  const [inputText, setInputText] = useState<string>("");
  const [isReady, setIsReady] = useState(false);
  const [hasUserInput, setHasUserInput] = useState(false);
  const [persistenceWarning, setPersistenceWarning] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const stored = readSessionItem(STORAGE_KEYS.input);
    // Deep-linking straight to a results screen, or a demo run, has no stored
    // text. Fall back to the sample so the screen is still meaningful.
    const usable = Boolean(stored && stored.trim().length > 0);
    if (usable) {
      setInputText(stored as string);
      setHasUserInput((stored as string) !== sampleMessage);
    } else {
      writeSessionItem(STORAGE_KEYS.input, sampleMessage);
      setInputText(sampleMessage);
      setHasUserInput(false);
    }
    setIsReady(true);
  }, []);

  // Re-runs when the locale changes so explanations are re-rendered in the
  // newly chosen language. The stored text is untouched.
  const analysis = useMemo(
    () => (isReady ? buildAnalysis(inputText, locale) : null),
    [isReady, inputText, locale]
  );

  const resetToSample = useCallback(() => {
    initialized.current = true;
    const persisted = writeSessionItem(STORAGE_KEYS.input, sampleMessage);
    setInputText(sampleMessage);
    setHasUserInput(false);
    setPersistenceWarning(!persisted);
    setIsReady(true);
  }, []);

  const submitMessage = useCallback(
    (text: string, source: "user" | "sample" = "user") => {
      const submittedText = text.trim();
      if (!submittedText) return false;

      // Keep the in-memory context authoritative for this flow. If storage is
      // blocked, navigation still works and the result page can explain the limitation.
      const persisted = writeSessionItem(STORAGE_KEYS.input, submittedText);
      initialized.current = true;
      setInputText(submittedText);
      setHasUserInput(source === "user");
      setPersistenceWarning(!persisted);
      setIsReady(true);
      return persisted;
    },
    []
  );

  const value = useMemo<AnalysisContextValue>(
    () => ({
      analysis,
      inputText,
      isReady,
      hasUserInput,
      persistenceWarning,
      submitMessage,
      resetToSample,
    }),
    [analysis, inputText, isReady, hasUserInput, persistenceWarning, submitMessage, resetToSample]
  );

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>;
}

export function useAnalysis(): AnalysisContextValue {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
}
