"use client";

import Link from "next/link";
import { SearchX, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useT } from "@/lib/i18n/SettingsContext";

export default function NotFound() {
  const t = useT();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-5 py-24">
        <div className="max-w-lg w-full">
          <div className="card p-7 sm:p-9 text-center">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-bg-surface border border-border-subtle mb-6">
              <SearchX className="w-6 h-6 text-text-tertiary" aria-hidden="true" />
            </span>

            <p className="font-mono text-xs font-bold text-cyan-400 mb-3">404</p>
            <h1 className="heading-2 text-text-primary mb-3">{t.error.notFoundTitle}</h1>
            <p className="body-lg text-text-secondary mb-8">{t.error.notFoundBody}</p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <Link href="/investigate" className="sm:w-auto w-full">
                <Button fullWidth size="lg" className="sm:w-auto" iconRight={<ArrowRight className="w-5 h-5" />}>
                  {t.error.investigate}
                </Button>
              </Link>
              <Link href="/" className="sm:w-auto w-full">
                <Button fullWidth size="lg" variant="secondary" className="sm:w-auto" icon={<Home className="w-5 h-5" />}>
                  {t.error.home}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}