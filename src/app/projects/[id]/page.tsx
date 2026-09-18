import Link from "next/link";
import { ArrowLeft, ExternalLink, Heart } from "lucide-react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectTabs } from "@/components/project/ProjectTabs";
import { ProjectTranslation } from "@/components/project/ProjectTranslation";
import { ProjectUpvoteButton } from "@/components/project/ProjectUpvoteButton";
import { SafetyBadge } from "@/components/project/SafetyBadge";
import { DownloadButton } from "@/components/project/DownloadButton";
import { FavoriteButton } from "@/components/project/FavoriteButton";
import { ShareButton } from "@/components/project/ShareButton";
import { T } from "@/components/i18n/T";
import { createClient } from "@/lib/supabase/server";
import type { DistributionKind } from "@/types/database";
import type { AlternativeLink } from "@/types/database";

type ProjectPageProps = {
  params: Promise<{ id: string }>;
};

type Project = {
  id: string;
  owner_id: string;
  category: "gaming" | "software";
  title: string;
  short_description: string | null;
  description: string;
  cover_url: string | null;
  youtube_url: string | null;
  vimeo_url: string | null;
  iframe_url: string | null;
  distribution_kind: DistributionKind | null;
  distribution_url: string | null;
  alternative_links: AlternativeLink[] | null;
  content_locale: "it" | "en" | "es" | "fr" | "de" | "pt" | "zh" | "ja";
  upvote_count: number | null;
  safety_reports_count: number | null;
  donation_url?: string | null;
};

type ProjectRelease = {
  id: string;
  version: string;
  changelog: string | null;
  created_at: string;
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

function getVimeoEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.hostname === "vimeo.com" || url.hostname === "www.vimeo.com" || url.hostname === "player.vimeo.com") {
      const match = url.pathname.match(/(\d+)/);
      const videoId = match?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
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
      "id, owner_id, category, title, short_description, description, cover_url, youtube_url, vimeo_url, iframe_url, distribution_kind, distribution_url, alternative_links, content_locale, upvote_count, safety_reports_count",
    )
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const project = data as Project;

  // Fire-and-forget view tracking: never blocks rendering the page.
  void supabase.from("project_events").insert({ project_id: project.id, event_type: "view" });

  const { data: creator } = await supabase
    .from("profiles")
    .select("donation_url")
    .eq("id", project.owner_id)
    .maybeSingle();

  const { data: releases } = await supabase
    .from("project_releases")
    .select("id, version, changelog, created_at")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const heroDescription = getHeroDescription(
    project.short_description,
    project.description,
  );
  const youtubeEmbedUrl = project.youtube_url
    ? getYoutubeEmbedUrl(project.youtube_url)
    : null;
  const vimeoEmbedUrl = project.vimeo_url
    ? getVimeoEmbedUrl(project.vimeo_url)
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-widest text-accent">
              {project.category === "gaming" ? "Progetto gaming" : "Software"}
            </p>
            <ProjectUpvoteButton
              projectId={project.id}
              ownerId={project.owner_id}
              initialCount={project.upvote_count ?? 0}
            />
            <FavoriteButton projectId={project.id} ownerId={project.owner_id} />
            <ShareButton />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {project.title}
          </h1>
          {heroDescription ? (
            <p className="max-w-2xl text-base text-zinc-300 sm:text-lg">
              {heroDescription}
            </p>
          ) : null}
        </header>

        <ProjectTabs
          projectTitle={project.title}
          projectId={project.id}
          projectOwnerId={project.owner_id}
          category={project.category}
          overview={<>
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
        {creator?.donation_url ? (
          <a href={creator.donation_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-200 hover:bg-red-500/20">
            <Heart className="h-4 w-4 fill-current" /> <T k="project.supportCreator" />
          </a>
        ) : null}
        <ProjectTranslation
          projectId={project.id}
          sourceLocale={project.content_locale}
          original={{
            title: project.title,
            shortDescription: project.short_description,
            description: project.description,
          }}
        />
          </>}
          media={<>
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

        {vimeoEmbedUrl ? (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Vimeo</h2>
            <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-ink-800">
              <iframe
                src={vimeoEmbedUrl}
                title={`Vimeo di ${project.title}`}
                className="h-full w-full"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
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
          </>}
          changelog={<>
        {project.distribution_url || alternativeLinks.length > 0 ? (
          <section className="rounded-2xl border border-accent/30 bg-accent/5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">
                {project.category === "gaming" ? "Scarica Ora / Prova il Gioco" : "Accedi al progetto"}
              </h2>
              <SafetyBadge reportsCount={project.safety_reports_count ?? 0} />
            </div>
            <p className="mt-2 text-sm text-zinc-400">
              Usa il link principale oppure una fonte alternativa.
            </p>
            {project.distribution_url ? (
              <DownloadButton
                projectId={project.id}
                href={project.distribution_url}
                isDownload={project.distribution_kind ? isDownload(project.distribution_kind) : false}
              >
                {project.distribution_kind ? distributionLabel(project.distribution_kind) : "Scarica Ora"}
              </DownloadButton>
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

        {releases && releases.length > 0 ? (
          <section className="space-y-3 rounded-2xl border border-white/10 bg-ink-800 p-6">
            <h2 className="text-xl font-semibold"><T k="changelog.title" /></h2>
            <ul className="space-y-4">
              {(releases as ProjectRelease[]).map((release) => (
                <li key={release.id} className="border-l-2 border-accent/40 pl-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold">v{release.version}</p>
                    <time className="text-xs text-zinc-500">
                      {new Date(release.created_at).toLocaleDateString()}
                    </time>
                  </div>
                  {release.changelog ? (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-300">{release.changelog}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
          </>}
        />
      </article>
    </AppShell>
  );
}
