"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  format,
  isLocale,
  LOCALE_META,
  type Locale,
} from "./types";
import { en } from "./en";
import { hi } from "./hi";
import { mr } from "./mr";
import { pickLocale } from "./content";
import { STORAGE_KEYS, readSessionItem, writeSessionItem } from "../storage";

const DICTIONARIES = { en, hi, mr } as const;

export interface SettingsValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Skip animations and heavy visuals for slow connections or devices. */
  lowBandwidth: boolean;
  setLowBandwidth: (value: boolean) => void;
  /** True once persisted settings have been read from storage. */
  isReady: boolean;
}

const SettingsContext = createContext<SettingsValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [lowBandwidth, setLowBandwidthState] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Read settings after mount. sessionStorage is client-only, so this keeps the
  // server and first client render identical and avoids a hydration mismatch.
  useEffect(() => {
    const storedLocale = readSessionItem(STORAGE_KEYS.locale);
    if (isLocale(storedLocale)) {
      setLocaleState(storedLocale);
    } else if (typeof navigator !== "undefined") {
      // First-time visitor: follow the phone's language preference.
      setLocaleState(pickLocale(navigator.language));
    }

    setLowBandwidthState(readSessionItem(STORAGE_KEYS.lowBandwidth) === "1");

    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;

    // Respect a data-saver preference the user already set at the OS or
    // browser level, rather than overriding their choice.
    const slowConnection =
      connection?.saveData === true ||
      connection?.effectiveType === "2g" ||
      connection?.effectiveType === "slow-2g";

    if (
      readSessionItem(STORAGE_KEYS.lowBandwidth) === null &&
      slowConnection
    ) {
      setLowBandwidthState(true);
      writeSessionItem(STORAGE_KEYS.lowBandwidth, "1");
    }

    setIsReady(true);
  }, []);

  // Reflect the choice on <html> so CSS and the <html lang> attribute follow it.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.lang = LOCALE_META[locale].htmlLang;
    root.dataset.lowBandwidth = lowBandwidth ? "true" : "false";
  }, [locale, lowBandwidth]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    writeSessionItem(STORAGE_KEYS.locale, next);
  }, []);

  const setLowBandwidth = useCallback((value: boolean) => {
    setLowBandwidthState(value);
    writeSessionItem(STORAGE_KEYS.lowBandwidth, value ? "1" : "0");
  }, []);

  const value = useMemo<SettingsValue>(
    () => ({ locale, setLocale, lowBandwidth, setLowBandwidth, isReady }),
    [locale, setLocale, lowBandwidth, setLowBandwidth, isReady]
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

/**
 * Settings plus the dictionary for the active locale.
 *
 * `t` is the resolved dictionary. Because `Dictionary` is a strict interface,
 * a missing or misspelled key in a translation is a compile error.
 */
export function useSettings(): SettingsValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

export function useDictionary() {
  const { locale } = useSettings();
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

/** Shorthand used throughout the UI. */
export function useT() {
  return useDictionary();
}

export { format };

export { LOCALE_META, type Locale };
