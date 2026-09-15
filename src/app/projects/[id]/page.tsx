import Link from "next/link";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectTabs } from "@/components/project/ProjectTabs";
import { createClient } from "@/lib/supabase/server";
import type { DistributionKind } from "@/types/database";

type ProjectPageProps = {
  params: Promise<{ id: string }>;
};

type Project = {
  id: string;
  category: "gaming" | "software";
  title: string;
  description: string;
  cover_image_url: string | null;
  youtube_url: string | null;
  iframe_url: string | null;
  distribution_kind: DistributionKind | null;
  distribution_url: string | null;
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

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, category, title, description, cover_image_url, youtube_url, iframe_url, distribution_kind, distribution_url",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const project = data as Project;
  const youtubeEmbedUrl = project.youtube_url
    ? getYoutubeEmbedUrl(project.youtube_url)
    : null;

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
          <p className="text-lg text-zinc-300">{project.description}</p>
        </header>

        {project.cover_image_url ? (
          <div
            role="img"
            aria-label={`Immagine di copertina di ${project.title}`}
            className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-ink-800 bg-cover bg-center shadow-panel"
            style={{ backgroundImage: `url(${project.cover_image_url})` }}
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

        {project.distribution_kind && project.distribution_url ? (
          <section className="rounded-2xl border border-accent/30 bg-accent/5 p-6">
            <h2 className="text-xl font-semibold">Come provarlo</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Accedi alla versione di test del progetto.
            </p>
            <a
              href={project.distribution_url}
              target="_blank"
              rel="noreferrer"
              download={isDownload(project.distribution_kind) ? true : undefined}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-accent-dim"
            >
              {isDownload(project.distribution_kind) ? (
                <Download className="h-4 w-4" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              {distributionLabel(project.distribution_kind)}
            </a>
          </section>
        ) : null}

        <ProjectTabs
          slug={project.id}
          projectId={project.id}
          category={project.category}
        />
      </article>
    </AppShell>
  );
}
