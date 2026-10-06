import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DemoProvider } from "@/lib/demo/DemoContext";
import { AnalysisProvider } from "@/lib/analysis/AnalysisContext";
import { SettingsProvider } from "@/lib/i18n/SettingsContext";
import ServiceWorkerRegistrar from "@/components/pwa/ServiceWorkerRegistrar";
import DemoNav from "@/components/layout/DemoNav";

export const metadata: Metadata = {
  title: "PRATIBIMB — Check a suspicious investment message",
  description:
    "Paste a suspicious investment message. See the exact words that match known pressure tactics, and get a safe next step. Works offline. Not investment advice.",
  applicationName: "PRATIBIMB",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "PRATIBIMB",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  keywords: [
    "investment fraud",
    "stock market scam",
    "SEBI",
    "financial literacy",
    "scam awareness",
    "UPI fraud",
    "Hindi",
    "Marathi",
  ],
  openGraph: {
    title: "PRATIBIMB — Check a suspicious investment message",
    description:
      "See the exact words in a message that match known pressure tactics, then verify before you act.",
    type: "website",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  themeColor: "#060a13",
  width: "device-width",
  initialScale: 1,
  // Not capped: pinch-zoom is an accessibility feature, and a user reading
  // small Hindi or Marathi text needs it.
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" data-low-bandwidth="false">
      <body className="min-h-screen antialiased">
        <SettingsProvider>
          <DemoProvider>
            <AnalysisProvider>
              <ServiceWorkerRegistrar />
              <DemoNav />

              {children}
            </AnalysisProvider>
          </DemoProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
