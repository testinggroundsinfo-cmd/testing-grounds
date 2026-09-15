import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["it", "en", "es", "de", "fr"],
  defaultLocale: "it",
  localePrefix: "never",
});

export type AppLocale = (typeof routing.locales)[number];
