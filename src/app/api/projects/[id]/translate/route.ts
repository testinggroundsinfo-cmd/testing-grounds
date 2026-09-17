import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

const deepLTargetLocales: Record<Locale, string> = {
  it: "IT",
  en: "EN",
  es: "ES",
  fr: "FR",
  de: "DE",
  pt: "PT-PT",
  zh: "ZH",
  ja: "JA",
};

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "La traduzione automatica non è ancora configurata." },
      { status: 503 },
    );
  }

  const { id } = await params;
  const selectedLocale = (await cookies()).get("testing-grounds-locale")?.value;
  const targetLocale = isLocale(selectedLocale) ? selectedLocale : defaultLocale;
  const supabase = await createClient();
  const { data: project, error } = await supabase
    .from("projects")
    .select("title, short_description, description, content_locale")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !project) {
    return NextResponse.json({ error: "Progetto non trovato." }, { status: 404 });
  }
  if (project.content_locale === targetLocale) {
    return NextResponse.json({
      title: project.title,
      shortDescription: project.short_description,
      description: project.description,
    });
  }

  const sourceLocale = isLocale(project.content_locale)
    ? deepLTargetLocales[project.content_locale]
    : undefined;
  const hasShortDescription = Boolean(project.short_description?.trim());
  const sourceTexts = [project.title, project.description];
  if (hasShortDescription) sourceTexts.splice(1, 0, project.short_description!);
  const payload = new URLSearchParams({
    target_lang: deepLTargetLocales[targetLocale],
    ...(sourceLocale ? { source_lang: sourceLocale } : {}),
  });
  sourceTexts.forEach((text) => payload.append("text", text));

  const response = await fetch(
    process.env.DEEPL_API_URL ?? "https://api-free.deepl.com/v2/translate",
    {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload.toString(),
    },
  );

  if (!response.ok) {
    console.error("DeepL translation failed:", response.status, await response.text());
    return NextResponse.json(
      { error: "Impossibile tradurre la scheda progetto. Riprova più tardi." },
      { status: 502 },
    );
  }

  const result = (await response.json()) as {
    translations: Array<{ text: string }>;
  };
  const translated = result.translations.map(({ text }) => text);
  const title = translated.shift();
  const shortDescription = hasShortDescription ? translated.shift() ?? null : null;
  const description = translated.shift();

  if (!title || !description) {
    return NextResponse.json(
      { error: "La risposta di traduzione non è valida." },
      { status: 502 },
    );
  }

  return NextResponse.json({ title, shortDescription, description });
}
