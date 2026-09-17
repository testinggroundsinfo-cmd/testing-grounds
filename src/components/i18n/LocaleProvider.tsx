"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { defaultLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initialLocale = defaultLocale,
  children,
}: {
  initialLocale?: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const value = useMemo(() => ({
    locale,
    setLocale,
    t: (key: string) => getMessages(locale)[key] ?? key,
  }), [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale deve essere usato dentro LocaleProvider.");
  return context;
}
