"use client";

import Link from "next/link";
import { ArrowRight, Download, Search, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { AdBanner } from "@/components/ads/AdBanner";
import type { PlatformKind } from "@/types/database";

export type GamingProject = {
  id: string;
  title?: string | null;
  short_description?: string | null;
  description?: string | null;
  category?: string | null;
  project_type?: string | null;
  is_published?: boolean | null;
  platforms?: PlatformKind[] | null;
  tags?: string[] | null;
  cover_url?: string | null;
  created_at?: string | null;
  development_status?: string | null;
};

type Filter =
  | "Tutti"
  | "Action"
  | "RPG"
  | "Platformer"
  | "Horror"
  | "Strategy"
  | "Indie";
type Badge = "Trending" | "Popolare" | "Top Rated" | "Novità";

const filters: Filter[] = [
  "Tutti",
  "Action",
  "RPG",
  "Platformer",
  "Horror",
  "Strategy",
  "Indie",
];

const platformLabels: Record<PlatformKind, string> = {
  pc: "PC",
  mobile: "Mobile",
  webgl: "WebGL",
  console: "Console",
  web_saas: "Web / SaaS",
  mobile_ios: "iOS",
  mobile_android: "Android",
  desktop: "Desktop",
  browser_extension: "Browser extension",
};

function projectMatchesFilter(project: GamingProject, filter: Filter) {
  if (filter === "Tutti") {
    return true;
  }

  const normalizedFilter = filter.toLowerCase();
  return [project.category, ...(project.tags ?? [])]
    .filter((value): value is string => typeof value === "string")
    .some((value) =>
      value.toLowerCase().replace(/[-_]/g, " ").includes(normalizedFilter),
    );
}

function ProjectCard({
  project,
  badge,
}: {
  project: GamingProject;
  badge: Badge;
}) {
  return (
    <li>
      <Link
        href={`/projects/${project.id}`}
        className="group relative block h-full overflow-hidden rounded-2xl border border-white/10 bg-ink-800 transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-panel"
      >
        <span className="absolute left-3 top-3 z-10 rounded-full bg-ink-950/85 px-2.5 py-1 text-xs font-semibold text-accent backdrop-blur">
          {badge === "Trending"
            ? "🔥 Trending"
            : badge === "Top Rated"
              ? "★ Top Rated"
              : badge === "Novità"
                ? "🆕 Novità"
                : "★ Popolare"}
        </span>
        <div
          className="aspect-video bg-ink-700 bg-cover bg-center"
          style={
            project.cover_url
              ? { backgroundImage: `url(${project.cover_url})` }
              : undefined
          }
        >
          {!project.cover_url ? (
            <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-zinc-500">
              Gaming
            </div>
          ) : null}
        </div>
        <div className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                {project.development_status?.replaceAll("_", " ") || "Indie game"}
              </p>
              <h3 className="mt-1 text-lg font-medium text-white group-hover:text-accent">
                {project.title || "Gioco senza titolo"}
              </h3>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-zinc-500 group-hover:text-accent" />
          </div>
          <p className="line-clamp-2 text-sm text-zinc-400">
            {project.short_description ||
              project.description ||
              "Nessuna descrizione disponibile."}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(project.platforms ?? []).map((platform) => (
              <span
                key={platform}
                className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-zinc-300"
              >
                {platformLabels[platform] ?? platform}
              </span>
            ))}
            {(project.tags ?? []).slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-accent-glow px-2.5 py-1 text-xs text-accent"
              >
                #{tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 border-t border-white/10 pt-3 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1">
              <Download className="h-3.5 w-3.5" />
              Dati della community
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-accent" />
              Indie
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}

export function GamingHubClient({ projects }: { projects: GamingProject[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("Tutti");
  const normalizedQuery = query.trim().toLowerCase();

  const visible = useMemo(
    () =>
      projects.filter((project) => {
        const searchable = `${project.title ?? ""} ${
          project.description ?? ""
        } ${(project.tags ?? []).join(" ")}`.toLowerCase();
        return (
          (!normalizedQuery || searchable.includes(normalizedQuery)) &&
          projectMatchesFilter(project, filter)
        );
      }),
    [filter, normalizedQuery, projects],
  );

  const empty = (
    <p className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-zinc-400">
      {filter === "Tutti"
        ? "Nessun gioco presente nel catalogo."
        : "Nessun gioco presente in questa categoria."}
    </p>
  );

  return (
    <div className="space-y-10">
      <header className="rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/15 via-ink-800 to-ink-900 p-6 shadow-panel sm:p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">
          Indie gaming hub
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Porta il tuo gioco davanti alla community.
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-300">
          Scopri nuovi videogiochi indie, partecipa ai playtest e aiuta gli
          sviluppatori a trasformare le loro idee in esperienze memorabili.
        </p>
        <Link
          href="/dashboard/projects/new?type=gaming"
          className="mt-6 inline-flex rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-accent-dim"
        >
          Pubblica il tuo Gioco
        </Link>
      </header>

      <section className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cerca un gioco..."
            aria-label="Cerca un gioco"
            className="w-full rounded-lg border border-white/10 bg-ink-900 py-2 pl-10 pr-3 text-sm outline-none focus:border-accent/50"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-full px-3 py-1.5 text-xs transition ${
                filter === item
                  ? "bg-accent text-ink-950"
                  : "bg-white/5 text-zinc-300 hover:bg-white/10"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent">
            🎮 Catalogo giochi
          </p>
          <h2 className="mt-1 text-2xl font-semibold">
            Tutti i giochi pubblicati
          </h2>
        </div>
        {visible.length ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {visible.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                badge={index < 3 ? "Trending" : index === 3 ? "Top Rated" : "Popolare"}
              />
            ))}
          </ul>
        ) : (
          empty
        )}
      </section>

      <section className="space-y-4">
        <AdBanner format="horizontal" slotId="gaming-hub-mid" />
      </section>
    </div>
  );
}
