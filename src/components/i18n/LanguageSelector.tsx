"use client";

import { Languages } from "lucide-react";
import { localeCookieName, localeLabels, locales, type Locale } from "@/i18n/config";
import { useLocale } from "@/components/i18n/LocaleProvider";

export function LanguageSelector() {
  const { locale, setLocale } = useLocale();

  function changeLocale(nextLocale: Locale) {
    document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    setLocale(nextLocale);
    document.documentElement.lang = nextLocale;
  }

  return (
    <label className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-zinc-200">
      <Languages className="h-4 w-4 text-accent" aria-hidden="true" />
      <span className="sr-only">Language</span>
      <select
        value={locale}
        onChange={(event) => changeLocale(event.target.value as Locale)}
        className="max-w-24 bg-transparent outline-none"
        aria-label="Language"
      >
        {locales.map((item) => <option key={item} value={item}>{localeLabels[item]}</option>)}
      </select>
    </label>
  );
}
