"use client";

import { Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useT } from "@/lib/i18n/SettingsContext";
import { useSpeech } from "@/lib/speech/speechSynthesis";
import { LOCALE_META, type Locale } from "@/lib/i18n/types";

/**
 * Reads a result screen aloud in the selected language.
 *
 * The spoken text is assembled from the real analysis, so what is read matches
 * what is on screen. Renders nothing when the browser has no speech engine.
 */
export default function ReadAloudButton({
  locale,
  text,
  className = "",
  label,
}: {
  locale: Locale;
  /** Plain text assembled by the caller from the visible result content. */
  text: string;
  className?: string;
  /** Optional override for the button label. */
  label?: string;
}) {
  const t = useT();
  const { isSupported, isSpeaking, speak, stop } = useSpeech();

  if (!isSupported) return null;

  const handleClick = () => {
    if (isSpeaking) {
      stop();
      return;
    }
    speak(text, { lang: LOCALE_META[locale].speechTag });
  };

  return (
    <Button
      variant="secondary"
      onClick={handleClick}
      className={className}
      aria-pressed={isSpeaking}
      aria-label={isSpeaking ? t.language.readAloudStop : (label ?? t.language.readAloud)}
    >
      {isSpeaking ? (
        <Square className="w-5 h-5 shrink-0" aria-hidden="true" />
      ) : (
        <Volume2 className="w-5 h-5 shrink-0" aria-hidden="true" />
      )}
      {isSpeaking ? t.language.readAloudStop : (label ?? t.language.readAloud)}
    </Button>
  );
}
