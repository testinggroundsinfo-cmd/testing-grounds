"use client";

import { Languages, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { Locale } from "@/i18n/config";

type TranslatedContent = {
  title: string;
  shortDescription: string | null;
  description: string;
};

export function ProjectTranslation({
  projectId,
  sourceLocale,
  original,
}: {
  projectId: string;
  sourceLocale: Locale;
  original: TranslatedContent;
}) {
  const { locale, t } = useLocale();
  const [translation, setTranslation] = useState<TranslatedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (locale === sourceLocale) return null;

  async function translate() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/projects/${projectId}/translate`, { method: "POST" });
      const body = (await response.json()) as TranslatedContent & { error?: string };
      if (!response.ok) throw new Error(body.error || t("project.translationError"));
      setTranslation({
        title: body.title,
        shortDescription: body.shortDescription,
        description: body.description,
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t("project.translationError"));
    } finally {
      setLoading(false);
    }
  }

  if (translation) {
    return (
      <section className="rounded-2xl border border-accent/30 bg-accent/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 text-sm text-accent">
            <Languages className="h-4 w-4" /> {t("project.translated")}
          </p>
          <button type="button" onClick={() => setTranslation(null)} className="inline-flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white">
            <RotateCcw className="h-4 w-4" /> {t("project.showOriginal")}
          </button>
        </div>
        <h2 className="mt-5 text-2xl font-semibold">{translation.title}</h2>
        {translation.shortDescription ? <p className="mt-2 text-zinc-300">{translation.shortDescription}</p> : null}
        <p className="mt-5 whitespace-pre-wrap leading-relaxed text-zinc-300">{translation.description}</p>
      </section>
    );
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={translate} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-accent/40 px-3 py-2 text-sm font-medium text-accent transition hover:bg-accent/10 disabled:opacity-50">
        <Languages className="h-4 w-4" />
        {loading ? t("project.translating") : t("project.translate")}
      </button>
      {error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
