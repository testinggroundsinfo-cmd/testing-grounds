"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";

type AdSlotProps = {
  placement: "sidebar" | "footer";
  className?: string;
  "aria-label"?: string;
};

export function AdSlot({
  placement,
  className = "",
  "aria-label": ariaLabel,
}: AdSlotProps) {
  const { t } = useLocale();
  const isSidebar = placement === "sidebar";

  return (
    <aside
      className={`relative ad-slot advertisement adsbygoogle flex max-w-full items-center justify-center overflow-hidden border border-dashed border-white/10 bg-ink-800/60 text-xs uppercase tracking-widest text-zinc-500 ${
        isSidebar ? "min-h-[280px] rounded-xl p-4" : "min-h-[90px] w-full rounded-lg p-3"
      } ${className} ${isSidebar ? "mb-12" : "mb-10"}`}
      aria-label={ariaLabel ?? t("ads.slotAriaLabel")}
    >
      <span>{t("ads.label")} · {isSidebar ? "160×600" : "728×90"}</span>
      <p className="absolute left-3 right-3 top-full mt-2 text-center text-[10px] normal-case leading-relaxed tracking-normal text-zinc-500">
        {t("ads.support")}
      </p>
    </aside>
  );
}