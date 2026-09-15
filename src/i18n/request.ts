import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { routing, type AppLocale } from "./routing";
import italianMessages from "../../messages/it.json";

type Messages = Record<string, unknown>;

function mergeMessages(fallback: Messages, messages: Messages): Messages {
  const merged: Messages = { ...fallback };

  for (const [key, value] of Object.entries(messages)) {
    const fallbackValue = merged[key];
    if (
      typeof fallbackValue === "object" &&
      fallbackValue !== null &&
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(fallbackValue) &&
      !Array.isArray(value)
    ) {
      merged[key] = mergeMessages(
        fallbackValue as Messages,
        value as Messages,
      );
    } else {
      merged[key] = value;
    }
  }

  return merged;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const localeCookie = (await cookies()).get("NEXT_LOCALE")?.value;
  const requestedLocale = await requestLocale;
  const locale: AppLocale = routing.locales.includes(
    (localeCookie ?? requestedLocale) as AppLocale,
  )
    ? ((localeCookie ?? requestedLocale) as AppLocale)
    : routing.defaultLocale;

  let messages: Messages = italianMessages;
  if (locale !== routing.defaultLocale) {
    try {
      messages = mergeMessages(
        italianMessages,
        (await import(`../../messages/${locale}.json`)).default,
      );
    } catch (error) {
      console.error(`Unable to load ${locale} translations:`, error);
    }
  }

  return {
    locale,
    messages,
  };
});
