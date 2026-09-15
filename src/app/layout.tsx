import type { Metadata } from "next";
import { AdBlockDetector } from "@/components/ads/AdBlockDetector";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "Testing-Grounds — Beta & Playtest per indie",
  description:
    "Piattaforma gratuita per il beta testing e il playtesting di giochi indie e software.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="dark">
      <body className="min-h-screen">
        <AdBlockDetector />
        <SiteHeader />
        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
