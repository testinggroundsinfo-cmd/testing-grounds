import type { Metadata } from "next";
import { cookies } from "next/headers";
import Script from "next/script";
import { AdBlockDetector } from "@/components/ads/AdBlockDetector";
import { ToastProvider } from "@/components/feedback/ToastProvider";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { defaultLocale, isLocale } from "@/i18n/config";
import "./globals.css";

export const metadata: Metadata = {
  title: "Testing-Grounds — Beta & Playtest per indie",
  description:
    "Piattaforma gratuita per il beta testing e il playtesting di giochi indie e software.",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    shortcut: ["/logo.png"],
  },
  other: {
    "google-adsense-account": "ca-pub-7880355478377757",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestedLocale = (await cookies()).get("testing-grounds-locale")?.value;
  const locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;

  return (
    <html lang={locale} className="dark">
      <body className="min-h-screen">
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7880355478377757"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <LocaleProvider initialLocale={locale}>
          <ToastProvider>
            <AdBlockDetector />
            <SiteHeader />
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </main>
            <SiteFooter />
          </ToastProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
