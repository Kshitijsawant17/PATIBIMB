"use client";

import { useSettings, useT } from "@/lib/i18n/SettingsContext";
import { Zap, ZapOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function LowBandwidthToggle({
  variant = "default",
  className,
}: {
  variant?: "default" | "compact";
  className?: string;
} = {}) {
  const { lowBandwidth, setLowBandwidth } = useSettings();
  const t = useT();
  const label = lowBandwidth ? t.language.lowBandwidthOff : t.language.lowBandwidthOn;

  if (variant === "compact") {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={lowBandwidth}
        onClick={() => setLowBandwidth(!lowBandwidth)}
        className={cn(
          "relative shrink-0 rounded-full transition-colors duration-200",
          "w-12 h-7 flex items-center",
          lowBandwidth
            ? "bg-cyan-500 shadow-[0_0_14px_rgba(6,214,224,0.35)]"
            : "bg-bg-card-hover border border-border-default hover:border-border-strong",
          className
        )}
        aria-label={label}
      >
        <span
          className={cn(
            "absolute w-5 h-5 rounded-full bg-text-primary shadow-sm flex items-center justify-center",
            "transition-transform duration-200",
            lowBandwidth ? "translate-x-6" : "translate-x-1"
          )}
          aria-hidden="true"
        >
          {lowBandwidth ? (
            <Zap className="w-3 h-3 text-cyan-500" />
          ) : (
            <ZapOff className="w-3 h-3 text-text-muted" />
          )}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={lowBandwidth}
      onClick={() => setLowBandwidth(!lowBandwidth)}
      className={cn(
        "relative flex items-center rounded-full transition-colors duration-200",
        "w-14 h-7",
        lowBandwidth
          ? "bg-cyan-500 shadow-[0_0_16px_rgba(6,214,224,0.35)]"
          : "bg-bg-card-hover border border-border-default hover:border-border-strong",
        className
      )}
      aria-label={label}
    >
      <span
        className={cn(
          "absolute w-5 h-5 rounded-full bg-text-primary shadow-sm flex items-center justify-center",
          "transition-transform duration-200",
          lowBandwidth ? "translate-x-7" : "translate-x-1"
        )}
        aria-hidden="true"
      >
        {lowBandwidth ? (
          <Zap className="w-3 h-3 text-cyan-500" />
        ) : (
          <ZapOff className="w-3 h-3 text-text-muted" />
        )}
      </span>
      <span className="absolute left-1/2 -translate-x-1/2 text-[11px] font-semibold text-text-inverse pointer-events-none">
        {lowBandwidth ? "ON" : "OFF"}
      </span>
    </button>
  );
}