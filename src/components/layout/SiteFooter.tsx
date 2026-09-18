"use client";

import { AdBanner } from "@/components/ads/AdBanner";
import { useLocale } from "@/components/i18n/LocaleProvider";

export function SiteFooter() {
  const { t } = useLocale();
  return (
    <footer className="border-t border-white/10 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdBanner format="horizontal" slotId="site-footer" />
        <p className="text-center text-xs leading-relaxed text-zinc-500">
          {t("footer.transparency")}
        </p>
      </div>
    </footer>
  );
}
