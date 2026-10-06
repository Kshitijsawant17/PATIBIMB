"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useT } from "@/lib/i18n/SettingsContext";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useT();

  useEffect(() => {
    console.error("PRATIBIMB route error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-16">
      <div className="max-w-lg w-full">
        <div className="card p-7 sm:p-9 text-center">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/[0.08] border border-rose-500/20 mb-6">
            <AlertTriangle className="w-6 h-6 text-rose-400" aria-hidden="true" />
          </span>

          <h1 className="heading-2 text-text-primary mb-3">{t.error.title}</h1>
          <p className="body-lg text-text-secondary mb-6">{t.error.body}</p>

          <div className="p-4 rounded-xl bg-bg-surface/50 border border-border-hairline text-left mb-7">
            <p className="text-[13px] leading-relaxed text-text-secondary">
              {t.error.stayedLocal}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Button onClick={retry} size="lg" icon={<RotateCcw className="w-5 h-5" />}>
              {t.error.tryAgain}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => window.location.assign("/investigate")}
              icon={<Shield className="w-5 h-5" />}
            >
              {t.error.startOver}
            </Button>
            <Button variant="ghost" size="lg" onClick={() => window.location.assign("/")} icon={<Home className="w-5 h-5" />}>
              {t.error.home}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}