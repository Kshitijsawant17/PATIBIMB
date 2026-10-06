"use client";

import { forwardRef, useState } from "react";
import { ChevronDown, Copy, Check } from "lucide-react";
import type { TextEvidence } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { useT, format } from "@/lib/i18n/SettingsContext";
import { cn } from "@/lib/utils";

interface EvidenceQuoteProps {
  phrase: string;
  evidence: TextEvidence;
  maxLength?: number;
}

export const EvidenceQuote = forwardRef<HTMLDivElement, EvidenceQuoteProps>(
  ({ phrase, evidence, maxLength = 200 }, ref) => {
    const t = useT();
    const [expanded, setExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    const hasContext = evidence.before.length > 0 || evidence.after.length > 0;
    const context = hasContext
      ? `${evidence.before}${phrase}${evidence.after}`
      : phrase;
    const showExpand = context.length > maxLength;
    const displayContext = expanded ? context : context.slice(0, maxLength) + (showExpand ? "…" : "");

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(phrase);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Silently fail
      }
    };

    const highlightPhrase = (text: string) => {
      const parts = text.split(phrase);
      if (parts.length === 1) return text;
      return parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <mark className="bg-cyan-500/15 text-cyan-400 px-1.5 py-0.5 rounded font-medium">
              {phrase}
            </mark>
          )}
        </span>
      ));
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative bg-bg-surface/30 border border-border-hairline rounded-xl p-4",
          "transition-all duration-200 hover:border-border-subtle hover:bg-bg-surface/50"
        )}
        data-evidence="true"
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-sm text-text-primary leading-relaxed break-words">
              {highlightPhrase(displayContext)}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg text-text-muted hover:text-cyan-400 hover:bg-bg-card-hover transition-colors"
              aria-label={copied ? t.result.copied : t.result.copyPhrase}
              title={t.result.copyPhrase}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            {showExpand && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card-hover transition-colors"
                aria-label={expanded ? t.result.showLess : t.result.showMore}
                aria-expanded={expanded}
              >
                <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <Badge variant="subtle" size="sm">
            {format(t.result.position, { start: evidence.start, end: evidence.end })}
          </Badge>
          <span className="body-xs text-text-muted">{t.result.exactMatch}</span>
        </div>
      </div>
    );
  }
);

EvidenceQuote.displayName = "EvidenceQuote";