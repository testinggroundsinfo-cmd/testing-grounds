import type { Metadata } from "next";
import { AdBlockDetector } from "@/components/ads/AdBlockDetector";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
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
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body className="min-h-screen">
        <NextIntlClientProvider messages={messages}>
          <AdBlockDetector />
          <SiteHeader />
          <main className="mx-auto w-full max-w-7xl px-4 py-8">{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
