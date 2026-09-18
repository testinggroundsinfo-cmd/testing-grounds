"use client";

import { Share2 } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useToast } from "@/components/feedback/ToastProvider";

export function ShareButton() {
  const { t } = useLocale();
  const { toast } = useToast();

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast(t("share.copied"));
    } catch (error) {
      console.error("Unable to copy project link:", error);
      toast(t("share.copyError"), "error");
    }
  }

  return (
    <button
      type="button"
      onClick={() => void share()}
      className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-ink-900/80 px-3 py-2 text-sm text-zinc-300 transition hover:border-accent/40 hover:text-accent"
    >
      <Share2 className="h-4 w-4" />
      {t("share.button")}
    </button>
  );
}
