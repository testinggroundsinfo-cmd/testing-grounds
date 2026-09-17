export const locales = ["it", "en", "es", "fr", "de", "pt", "zh", "ja"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "it";
export const localeCookieName = "testing-grounds-locale";

export const localeLabels: Record<Locale, string> = {
  it: "Italiano",
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  zh: "简体中文",
  ja: "日本語",
};

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}
