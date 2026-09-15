import { AdSlot } from "@/components/ads/AdSlot";
import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-white/10 px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdSlot placement="footer" />
        <p className="text-center text-xs leading-relaxed text-zinc-500">
          {t("transparency")}
        </p>
      </div>
    </footer>
  );
}
