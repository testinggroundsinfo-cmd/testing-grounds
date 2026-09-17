"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";

type TranslateParams = Record<string, string | number>;

/**
 * Lightweight client wrapper to render a single translated string inside a
 * server component, without converting the whole page/component to a client
 * component. Useful for headings/labels embedded in server-rendered pages
 * that fetch data with the server Supabase client.
 */
export function T({ k, params }: { k: string; params?: TranslateParams }) {
  const { t } = useLocale();
  return <>{t(k, params)}</>;
}