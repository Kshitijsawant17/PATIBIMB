"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, X } from "lucide-react";
import { useDemo } from "@/lib/demo/DemoContext";
import { useT } from "@/lib/i18n/SettingsContext";
import { cn } from "@/lib/utils";

/**
 * The guided demo rail.
 *
 * Visible only while demo mode is on. It is a plain set of navigation links
 * rather than ARIA tabs, because each item takes you to a different page
 * instead of swapping a panel on this one — announcing them as tabs would
 * promise a tabpanel that does not exist.
 *
 * The rail is fixed beneath the header and paired with a spacer of the same
 * height, so it pushes page content down rather than covering it.
 */
const STEPS = [
  { key: "investigate", number: "01", href: "/investigate" },
  { key: "results", number: "02", href: "/result" },
  { key: "replay", number: "03", href: "/replay" },
  { key: "learn", number: "04", href: "/teachback" },
] as const;

export default function DemoNav() {
  const { isDemoMode, stopDemo } = useDemo();
  const pathname = usePathname();
  const t = useT();

  if (!isDemoMode) return null;

  const steps = STEPS.map((step) => ({
    ...step,
    label: t.ui.demoLabels[step.key],
  }));

  // Derived from the URL rather than stored step state, so the rail can never
  // disagree with the page you are actually on.
  const currentIndex = steps.findIndex((s) => pathname.startsWith(s.href));

  return (
    <>
      <nav
        aria-label={t.ui.demoSteps}
        className="fixed top-16 lg:top-[72px] left-0 right-0 z-[190] glass-strong border-y border-border-hairline"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 h-14">
            <ol className="flex items-center gap-1.5 overflow-x-auto min-w-0">
              {steps.map((step, index) => {
                const isActive = index === currentIndex;
                const isCompleted = currentIndex > index;

                return (
                  <li key={step.href} className="shrink-0">
                    <Link
                      href={step.href}
                      aria-current={isActive ? "step" : undefined}
                      className={cn(
                        "flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-lg text-[13px] font-medium",
                        "transition-all duration-200 min-h-[44px]",
                        isActive
                          ? "bg-bg-card-hover text-cyan-400 border border-cyan-500/25"
                          : isCompleted
                            ? "text-emerald-400 border border-emerald-500/15 hover:bg-emerald-500/[0.08]"
                            : "text-text-tertiary border border-transparent hover:text-text-primary hover:bg-bg-surface"
                      )}
                    >
                      <span
                        className={cn(
                          "w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0",
                          isActive
                            ? "bg-gradient-to-br from-cyan-500 to-violet-500 text-white"
                            : isCompleted
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-bg-surface text-text-tertiary border border-border-hairline"
                        )}
                        aria-hidden="true"
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.number}
                      </span>
                      <span className="hidden sm:inline">{step.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>

            <button
              type="button"
              onClick={stopDemo}
              className="shrink-0 inline-flex items-center gap-1.5 px-2.5 rounded-lg min-h-[44px] text-[13px] text-text-tertiary hover:text-text-primary hover:bg-bg-surface transition-colors duration-150"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t.common.close}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer so the fixed rail pushes page content down instead of covering it. */}
      <div aria-hidden="true" className="h-14" />
    </>
  );
}