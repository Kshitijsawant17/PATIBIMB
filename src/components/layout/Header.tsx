"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Shield, Sparkles, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSettings, useT, type Locale } from "@/lib/i18n/SettingsContext";
import { LowBandwidthToggle } from "@/components/settings/LowBandwidthToggle";
import { cn } from "@/lib/utils";

/** Hrefs are fixed; labels come from the dictionary so they follow the locale. */
const NAV_PATHS = ["/investigate", "/replay", "/teachback", "/recovery"] as const;

const locales: Array<{ code: Locale; label: string; short: string }> = [
  { code: "en", label: "English", short: "EN" },
  { code: "hi", label: "Hindi", short: "हि" },
  { code: "mr", label: "Marathi", short: "मर" },
];

export default function Header() {
  const pathname = usePathname();
  const { locale, setLocale } = useSettings();
  const t = useT();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the language menu on outside click / Escape.
  useEffect(() => {
    if (!langOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLangOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [langOpen]);

  // Close the mobile sheet when the route changes so it never covers a new page.
  useEffect(() => {
    setMobileOpen(false);
    setLangOpen(false);
  }, [pathname]);

  // Escape closes the mobile sheet; below the lg breakpoint only, since above it
  // the sheet does not exist.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const currentLocale = locales.find((l) => l.code === locale) ?? locales[0];
  const navItems = NAV_PATHS.map((href) => ({
    href,
    label: t.ui.navLinks[
      href === "/investigate"
        ? "investigate"
        : href === "/replay"
          ? "replay"
          : href === "/teachback"
            ? "learn"
            : "recover"
    ],
  }));

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-[200] transition-all duration-300",
        scrolled
          ? "glass-strong border-b border-border-hairline shadow-lg"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <nav
        className="container-wide mx-auto px-5 sm:px-6 lg:px-8"
        aria-label={t.ui.navMain}
      >
        <div className="flex items-center justify-between h-16 lg:h-[72px] gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 group"
            aria-label={t.ui.brandHome}
          >
            <span className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 shadow-[0_0_20px_rgba(6,214,224,0.2)] transition-shadow duration-300 group-hover:shadow-[0_0_28px_rgba(6,214,224,0.35)]">
              <Shield className="w-[18px] h-[18px] text-white" aria-hidden="true" />
            </span>
            <span className="text-[17px] font-bold text-text-primary tracking-tight">
              PRATIBIMB
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                    active
                      ? "text-cyan-400"
                      : "text-text-tertiary hover:text-text-primary"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-cyan-500 to-violet-500" aria-hidden="true" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language menu */}
            <div ref={langRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setLangOpen((v) => !v)}
                aria-expanded={langOpen}
                aria-haspopup="listbox"
                className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-surface border border-transparent hover:border-border-hairline transition-colors duration-150"
              >
                {currentLocale.short}
                <ChevronDown className={cn("w-3.5 h-3.5 text-text-muted transition-transform", langOpen && "rotate-180")} aria-hidden="true" />
              </button>

              {langOpen && (
                <div
                  role="listbox"
                  aria-label={t.ui.selectLanguage}
                  className="absolute right-0 top-full mt-2 w-44 glass-strong rounded-xl shadow-xl py-1 animate-slide-down origin-top-right z-10"
                >
                  {locales.map((loc) => {
                    const active = locale === loc.code;
                    return (
                      <button
                        key={loc.code}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          setLocale(loc.code);
                          setLangOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150",
                          active
                            ? "bg-cyan-500/10 text-cyan-400"
                            : "text-text-secondary hover:text-text-primary hover:bg-bg-surface"
                        )}
                      >
                        <span className="font-medium">{loc.label}</span>
                        {active && <Check className="w-4 h-4 shrink-0" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <LowBandwidthToggle variant="compact" />

            {/* Desktop CTA */}
            <Link href="/investigate" className="hidden lg:inline-flex">
              <Button size="sm" variant="primary" icon={<Sparkles className="w-4 h-4" />}>
                {t.ui.startInvestigation}
              </Button>
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? t.ui.closeMenu : t.ui.openMenu}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 -mr-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile sheet. Scrolls internally so it still fits short landscape
          viewports instead of pushing the page below the fold. */}
      {mobileOpen && (
        <div
          className="lg:hidden glass-strong border-t border-border-hairline animate-slide-down max-h-[calc(100dvh-4.25rem)] overflow-y-auto overscroll-contain"
        >
          <div className="container-wide mx-auto px-5 sm:px-6 py-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between px-4 py-3.5 rounded-lg text-[15px] font-medium transition-colors duration-150",
                        active
                          ? "bg-cyan-500/10 text-cyan-400"
                          : "text-text-secondary hover:text-text-primary hover:bg-bg-surface"
                      )}
                    >
                      {item.label}
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" aria-hidden="true" />}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="divider my-4" role="separator" />

            <div className="flex items-center justify-between gap-4 px-1">
              <div
                className="flex items-center gap-1 bg-bg-surface/60 border border-border-hairline rounded-lg p-1"
                role="group"
                aria-label={t.ui.languageGroup}
              >
                {locales.map((loc) => {
                  const active = locale === loc.code;
                  return (
                    <button
                      key={loc.code}
                      type="button"
                      onClick={() => setLocale(loc.code)}
                      aria-pressed={active}
                      className={cn(
                        "px-3.5 py-2 rounded-md text-sm font-medium transition-colors duration-150",
                        active
                          ? "bg-bg-card-hover text-cyan-400 border border-cyan-500/20"
                          : "text-text-tertiary hover:text-text-primary"
                      )}
                    >
                      {loc.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <Link href="/investigate" onClick={() => setMobileOpen(false)} className="block mt-4">
              <Button fullWidth size="lg" variant="primary" icon={<Sparkles className="w-5 h-5" />}>
                {t.ui.startInvestigation}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}