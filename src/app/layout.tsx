import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdBlockDetector } from "@/components/ads/AdBlockDetector";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { defaultLocale, isLocale } from "@/i18n/config";
import "./globals.css";

export const metadata: Metadata = {
  title: "Testing-Grounds — Beta & Playtest per indie",
  description:
    "Piattaforma gratuita per il beta testing e il playtesting di giochi indie e software.",
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
        <LocaleProvider initialLocale={locale}>
          <AdBlockDetector />
          <SiteHeader />
          <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <SiteFooter />
        </LocaleProvider>
      </body>
    </html>
  );
}
