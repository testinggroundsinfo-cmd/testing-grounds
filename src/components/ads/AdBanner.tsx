"use client";

import { AdSlot } from "@/components/ads/AdSlot";
import { useLocale } from "@/components/i18n/LocaleProvider";

export function AdBanner({
  format,
  slotId,
}: {
  format: "horizontal";
  slotId: string;
}) {
  const { t } = useLocale();
  return (
    <AdSlot
      placement="footer"
      className="mb-0 min-h-[90px] w-full max-w-full"
      aria-label={t("ads.bannerAriaLabel", { slotId })}
    />
  );
}