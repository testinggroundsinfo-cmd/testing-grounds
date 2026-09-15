"use client";

import { Globe2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";
import { routing, type AppLocale } from "@/i18n/routing";

const localeLabels: Record<AppLocale, string> = {
  it: "Italiano",
  en: "English",
  es: "Español",
  de: "Deutsch",
  fr: "Français",
};

export function LanguageSwitcher() {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const t = useTranslations("nav");
  const [isPending, setIsPending] = useState(false);

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value as AppLocale;
    setIsPending(true);
    document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=31536000;samesite=lax`;
    router.refresh();
    window.setTimeout(() => setIsPending(false), 300);
  }

  return (
    <label className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2 py-1.5 text-zinc-300">
      <Globe2 className="h-4 w-4 text-accent" aria-hidden="true" />
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        onChange={handleChange}
        disabled={isPending}
        aria-label={t("language")}
        className="cursor-pointer bg-transparent text-xs outline-none"
      >
        {routing.locales.map((item) => (
          <option key={item} value={item} className="bg-ink-900">
            {localeLabels[item]}
          </option>
        ))}
      </select>
    </label>
  );
}
