"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import { adFormats, isEzoicConfigured } from "@/lib/ads";

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
      data-ad-provider={isEzoicConfigured ? "ezoic" : "placeholder"}
      data-ad-format={isSidebar ? adFormats.sidebar.desktop : adFormats.footer.desktop}
      data-ad-slot={isSidebar ? "sidebar" : "footer"}
      className={`relative ad-slot advertisement adsbygoogle flex max-w-full items-center justify-center overflow-hidden border border-white/10 bg-ink-800/60 text-xs uppercase tracking-widest text-zinc-500 ${
        isSidebar
          ? "h-[250px] w-[min(100%,300px)] rounded-2xl p-4 lg:h-[600px] lg:w-[160px]"
          : "min-h-[90px] w-full rounded-2xl px-3 py-5 sm:min-h-[90px] sm:px-6"
      } ${className} ${isSidebar ? "mb-12" : "mb-10"}`}
      aria-label={ariaLabel ?? t("ads.slotAriaLabel")}
    >
      <span>
        {t("ads.label")} ·{" "}
        {isSidebar ? (
          <>
            <span className="sm:hidden">300×250</span>
            <span className="hidden sm:inline lg:hidden">300×250</span>
            <span className="hidden lg:inline">160×600</span>
          </>
        ) : (
          <>
            <span className="sm:hidden">728×90</span>
            <span className="hidden sm:inline">728×90 / 970×90</span>
          </>
        )}
      </span>
      <p className="absolute left-3 right-3 top-full mt-2 text-center text-[10px] normal-case leading-relaxed tracking-normal text-zinc-500">
        {t("ads.support")}
      </p>
    </aside>
  );
}