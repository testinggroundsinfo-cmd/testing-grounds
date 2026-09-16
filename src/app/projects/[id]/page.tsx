import Link from "next/link";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectTabs } from "@/components/project/ProjectTabs";
import { PublicFeedbackLists } from "@/components/feedback/PublicFeedbackLists";
import { createClient } from "@/lib/supabase/server";
import type { DistributionKind } from "@/types/database";
import type { AlternativeLink } from "@/types/database";

type ProjectPageProps = {
  params: Promise<{ id: string }>;
};

type Project = {
  id: string;
  category: "gaming" | "software";
  title: string;
  short_description: string | null;
  description: string;
  cover_url: string | null;
  youtube_url: string | null;
  iframe_url: string | null;
  distribution_kind: DistributionKind | null;
  distribution_url: string | null;
  alternative_links: AlternativeLink[] | null;
};

function getYoutubeEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be") {
      const videoId = url.pathname.slice(1);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (
      url.hostname === "youtube.com" ||
      url.hostname === "www.youtube.com" ||
      url.hostname === "m.youtube.com"
    ) {
      const videoId =
        url.pathname === "/watch"
          ? url.searchParams.get("v")
          : url.pathname.startsWith("/embed/")
            ? url.pathname.split("/")[2]
            : null;
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

function distributionLabel(kind: DistributionKind) {
  return {
    iframe: "Apri il gioco",
    direct_link: "Apri link",
    testflight: "Scarica su TestFlight",
    play_beta: "Partecipa alla Play Beta",
    steam_playtest: "Apri Steam Playtest",
    drive: "Scarica da Google Drive",
    mega: "Scarica da MEGA",
    itch: "Apri su itch.io",
    zip: "Scarica il file ZIP",
  }[kind];
}

function isDownload(kind: DistributionKind) {
  return kind === "zip" || kind === "drive" || kind === "mega";
}

function getHeroDescription(
  shortDescription: string | null,
  description: string,
) {
  const shortText = shortDescription?.trim();
  if (shortText) return shortText;

  const firstSentence = description.trim().match(/^.*?[.!?](?:\s|$)/)?.[0].trim();
  if (firstSentence && firstSentence.length <= 160) return firstSentence;

  const truncated = description.trim().slice(0, 160).trimEnd();
  return truncated ? `${truncated}${description.trim().length > 160 ? "..." : ""}` : null;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, category, title, short_description, description, cover_url, youtube_url, iframe_url, distribution_kind, distribution_url, alternative_links",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const project = data as Project;
  const heroDescription = getHeroDescription(
    project.short_description,
    project.description,
  );
  const youtubeEmbedUrl = project.youtube_url
    ? getYoutubeEmbedUrl(project.youtube_url)
    : null;
  const alternativeLinks = Array.isArray(project.alternative_links)
    ? project.alternative_links.filter(
        (link) => typeof link?.label === "string" && typeof link?.url === "string",
      )
    : [];

  return (
    <AppShell>
      <article className="space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna ai progetti
        </Link>

        <header className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-accent">
            {project.category === "gaming" ? "Progetto gaming" : "Software"}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {project.title}
          </h1>
          {heroDescription ? (
            <p className="max-w-2xl text-base text-zinc-300 sm:text-lg">
              {heroDescription}
            </p>
          ) : null}
        </header>

        {project.cover_url ? (
          <div
            role="img"
            aria-label={`Immagine di copertina di ${project.title}`}
            className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-ink-800 bg-cover bg-center shadow-panel"
            style={{ backgroundImage: `url(${project.cover_url})` }}
          />
        ) : null}

        <section className="rounded-2xl border border-white/10 bg-ink-800 p-6">
          <h2 className="text-xl font-semibold">Descrizione</h2>
          <p className="mt-4 whitespace-pre-wrap leading-relaxed text-zinc-300">
            {project.description}
          </p>
        </section>

        {youtubeEmbedUrl ? (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Video</h2>
            <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-ink-800">
              <iframe
                src={youtubeEmbedUrl}
                title={`Video di ${project.title}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </section>
        ) : null}

        {project.iframe_url ? (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">
              {project.category === "gaming" ? "Gioca ora" : "Prova l'app"}
            </h2>
            <div className="min-h-[420px] overflow-hidden rounded-2xl border border-white/10 bg-ink-800">
              <iframe
                src={project.iframe_url}
                title={`Demo di ${project.title}`}
                className="h-[min(70vh,720px)] min-h-[420px] w-full"
                allow="fullscreen; autoplay"
                allowFullScreen
              />
            </div>
          </section>
        ) : null}

        {project.distribution_url || alternativeLinks.length > 0 ? (
          <section className="rounded-2xl border border-accent/30 bg-accent/5 p-6">
            <h2 className="text-xl font-semibold">
              {project.category === "gaming" ? "Scarica Ora / Prova il Gioco" : "Accedi al progetto"}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Usa il link principale oppure una fonte alternativa.
            </p>
            {project.distribution_url ? (
              <a
                href={project.distribution_url}
                target="_blank"
                rel="noreferrer"
                download={project.distribution_kind ? isDownload(project.distribution_kind) : undefined}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-accent-dim"
              >
                {project.distribution_kind && isDownload(project.distribution_kind) ? (
                  <Download className="h-4 w-4" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                {project.distribution_kind ? distributionLabel(project.distribution_kind) : "Scarica Ora"}
              </a>
            ) : null}
            {alternativeLinks.length > 0 ? (
              <details className="mt-5 rounded-lg border border-white/10 bg-ink-900/40 p-4">
                <summary className="cursor-pointer text-sm font-medium">
                  Link Alternativi &amp; Mirror
                </summary>
                <div className="mt-3 flex flex-wrap gap-2">
                  {alternativeLinks.map((link) => (
                    <a
                      key={`${link.label}-${link.url}`}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-white/10"
                    >
                      <ExternalLink className="h-4 w-4 text-accent" />
                      {link.label}
                    </a>
                  ))}
                </div>
              </details>
            ) : null}
          </section>
        ) : null}

        <ProjectTabs
          projectTitle={project.title}
          projectId={project.id}
          category={project.category}
        />
        <PublicFeedbackLists projectId={project.id} />
      </article>
    </AppShell>
  );
}
