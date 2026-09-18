"use client";

import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";

export function SafetyBadge({ reportsCount }: { reportsCount: number }) {
  const { t } = useLocale();
  const isClear = reportsCount === 0;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
        isClear
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-amber-500/30 bg-amber-500/10 text-amber-300"
      }`}
      title={isClear ? t("safety.clearHint") : t("safety.flaggedHint")}
    >
      {isClear ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
      {isClear ? t("safety.clear") : t("safety.flagged", { count: reportsCount })}
    </span>
  );
}
