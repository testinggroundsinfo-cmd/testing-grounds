"use client";

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
    <label className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-zinc-200">
      <span aria-hidden="true" className="text-accent">🌐</span>
      <span className="sr-only">Language</span>
      <select
        value={locale}
        onChange={(event) => changeLocale(event.target.value as Locale)}
        className="max-w-28 bg-transparent outline-none"
        aria-label="Language"
      >
        {locales.map((item) => (
          <option key={item} value={item}>
            {localeLabels[item]}
          </option>
        ))}
      </select>
    </label>
  );
}