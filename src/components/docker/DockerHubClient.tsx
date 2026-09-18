"use client";

import Link from "next/link";
import { Container, Terminal } from "lucide-react";
import { ProjectCarousel, type CarouselProject } from "@/components/project/ProjectCarousel";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { FavoriteButton } from "@/components/project/FavoriteButton";

export type DockerProject = CarouselProject & {
  owner_id?: string | null;
  tags?: string[] | null;
  platforms?: string[] | null;
};

const dockerTags = [
  "Docker Compose",
  "Dockerfile",
  "Server & Self-Hosted",
  "Scripts & Setup",
];

export function DockerHubClient({ projects }: { projects: DockerProject[] }) {
  const { t } = useLocale();
  return (
    <div className="space-y-10">
      <header className="rounded-3xl border border-sky-400/30 bg-gradient-to-br from-sky-400/15 via-ink-800 to-ink-900 p-6 shadow-panel sm:p-10">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-sky-400/15 p-3 text-sky-300">
            <Container className="h-8 w-8" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Docker &amp; Container</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t("docker.title")}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300">{t("docker.description")}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {dockerTags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300">
              {tag}
            </span>
          ))}
        </div>
      </header>

      <ProjectCarousel variant="popular" projects={projects} />
      <ProjectCarousel variant="new" projects={projects} />

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-400">
          <Terminal className="mx-auto mb-3 h-6 w-6 text-sky-300" />
          {t("docker.empty")}
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {projects.slice(0, 12).map((project) => (
            <article key={project.id} className="relative rounded-2xl border border-white/10 bg-ink-800 p-5">
              <FavoriteButton projectId={project.id} ownerId={project.owner_id ?? undefined} compact />
              <Link href={`/projects/${project.id}`} className="block pr-10">
                <h2 className="font-medium text-white hover:text-accent">{project.title || t("docker.untitled")}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                  {project.short_description || project.description || t("docker.noDescription")}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(project.tags ?? []).slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-sky-400/10 px-2 py-1 text-xs text-sky-300">#{tag}</span>
                  ))}
                </div>
              </Link>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
