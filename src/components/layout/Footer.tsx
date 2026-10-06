"use client";

import Link from "next/link";
import { Shield, Sparkles, BookOpen, Heart, ExternalLink, Radio, Landmark, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useT } from "@/lib/i18n/SettingsContext";

export default function Footer() {
  const t = useT();

  // Only real destinations. A link that 404s or anchors to nothing is worse
  // than no link, so this list deliberately contains nothing decorative.
  const productLinks = [
    { label: t.nav.investigate, href: "/investigate" },
    { label: t.map.title, href: "/manipulation" },
    { label: t.replay.title, href: "/replay" },
    { label: t.teachback.title, href: "/teachback" },
    { label: t.resilience.title, href: "/resilience" },
    { label: t.recovery.badge, href: "/recovery" },
  ];

  const helpLinks = [
    {
      label: t.ui.channels.cybercrime,
      desc: t.ui.channels.cybercrimeDesc,
      href: "https://cybercrime.gov.in",
      icon: ShieldAlert,
      external: true,
    },
    {
      label: t.ui.channels.helpline,
      desc: t.ui.channels.helplineDesc,
      href: "tel:1930",
      icon: Radio,
      external: false,
    },
    {
      label: t.ui.channels.sebi,
      desc: t.ui.channels.sebiDesc,
      href: "https://sebi.gov.in",
      icon: Landmark,
      external: true,
    },
  ];

  const trustBadges = [
    { icon: BookOpen, label: t.common.notAdvice },
    { icon: Sparkles, label: t.landing.trustLocal },
    { icon: Heart, label: t.common.privacyFirst },
  ];

  return (
    <footer className="relative border-t border-border-hairline">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 relative">
        <div className="py-14 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-4 lg:gap-12">
            {/* Brand */}
            <div>
              <Link
                href="/"
                className="flex items-center gap-2.5 mb-5 w-fit"
                aria-label={t.ui.brandHome}
              >
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
                  <Shield className="w-[18px] h-[18px] text-white" aria-hidden="true" />
                </span>
                <span className="text-[17px] font-bold text-text-primary tracking-tight">
                  PRATIBIMB
                </span>
              </Link>
              <p className="text-[13px] leading-relaxed text-text-tertiary max-w-xs">
                {t.ui.footerBlurb}
              </p>
            </div>

            {/* Product */}
            <nav aria-label={t.ui.footerProduct}>
              <h2 className="eyebrow mb-4">{t.ui.footerProduct}</h2>
              <ul className="space-y-0 lg:space-y-2.5">
                {productLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center min-h-[44px] lg:min-h-0 text-[13px] text-text-tertiary hover:text-cyan-400 transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Where to get real help */}
            <nav aria-label={t.ui.footerOfficialHelp}>
              <h2 className="eyebrow mb-4">{t.ui.footerOfficialHelp}</h2>
              <ul className="space-y-0 lg:space-y-2.5">
                {helpLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      {...(link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="group inline-flex items-center gap-2 min-h-[44px] lg:min-h-0 text-[13px] text-text-tertiary hover:text-cyan-400 transition-colors duration-150"
                    >
                      <link.icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block">{link.label}</span>
                        <span className="block text-[11px] text-text-muted group-hover:text-text-tertiary transition-colors duration-150">
                          {link.desc}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* The one thing to remember */}
            <div>
              <h2 className="eyebrow mb-4">{t.ui.footerKeepInMind}</h2>
              <p className="text-[13px] leading-relaxed text-text-tertiary mb-2">
                {t.ui.footerReminder}
              </p>
              <Link
                href="/#how-it-works"
                className="inline-flex items-center gap-2 min-h-[44px] lg:min-h-0 text-[13px] font-medium text-cyan-400 hover:gap-2.5 transition-all duration-200"
              >
                {t.landing.howTitle}
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-7 border-t border-border-hairline">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <ul className="flex items-center gap-2 flex-wrap">
                {trustBadges.map((badge) => (
                  <li key={badge.label}>
                    <Badge variant="subtle" size="sm">
                      <badge.icon className="w-3 h-3" aria-hidden="true" />
                      {badge.label}
                    </Badge>
                  </li>
                ))}
              </ul>
              <p className="text-[12px] text-text-muted">
                &copy; {new Date().getFullYear()} PRATIBIMB. {t.common.hackathonCredit}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}