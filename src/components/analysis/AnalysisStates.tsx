"use client";

import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useT } from "@/lib/i18n/SettingsContext";
import { Shield, Search, RotateCcw, AlertCircle } from "lucide-react";

interface AnalysisSkeletonProps {
  label?: string;
  detail?: string;
}

/**
 * Shared loading state for every screen that needs an analysis result.
 * A calm scanner rather than a spinner, so a slow device still reads as
 * "working" instead of "broken".
 */
export function AnalysisSkeleton({ label, detail }: AnalysisSkeletonProps) {
  const t = useT();
  const heading = label || t.loading.analyzing;
  const description = detail || t.loading.resultDetail;

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-md text-center" role="status" aria-live="polite">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border border-border-hairline" />
          <div className="absolute inset-3 rounded-full border border-border-subtle" />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-500 animate-spin"
            style={{ animationDuration: "1.6s" }}
          />
          <div
            className="absolute inset-0 rounded-full border border-transparent border-b-violet-500 animate-spin"
            style={{ animationDuration: "2.8s", animationDirection: "reverse" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" aria-hidden="true" />
            </div>
          </div>
        </div>
        <p className="heading-3 text-text-primary mb-2">{heading}</p>
        <p className="body-base text-text-secondary mb-8">{description}</p>
        <ProgressBar value={0} max={100} animated size="md" />
      </div>
    </div>
  );
}

interface NoSignalsFoundProps {
  onRestart?: () => void;
}

export function NoSignalsFound({ onRestart }: NoSignalsFoundProps) {
  const t = useT();

  return (
    <div className="card p-10 text-center max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-xl bg-bg-surface border border-border-subtle flex items-center justify-center mx-auto mb-6">
        <Search className="w-6 h-6 text-text-tertiary" aria-hidden="true" />
      </div>
      <h2 className="heading-3 text-text-primary mb-3">{t.empty.title}</h2>
      <p className="body-base text-text-secondary mb-6">{t.empty.body}</p>

      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 text-left">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <AlertCircle className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <p className="label text-amber-400 mb-1">{t.empty.warningTitle}</p>
            <p className="body-base text-text-secondary">{t.empty.warningBody}</p>
          </div>
        </div>
      </div>

      {onRestart && (
        <Button
          variant="secondary"
          onClick={onRestart}
          className="mt-6"
          icon={<RotateCcw className="w-4 h-4" />}
        >
          {t.empty.tryAnother}
        </Button>
      )}
    </div>
  );
}