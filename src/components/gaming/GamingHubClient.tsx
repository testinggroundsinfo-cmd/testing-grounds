"use client";

import Link from "next/link";
import { ArrowRight, Download, Search, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { AdBanner } from "@/components/ads/AdBanner";
import { ProjectCarousel } from "@/components/project/ProjectCarousel";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { FavoriteButton } from "@/components/project/FavoriteButton";
import type { PlatformKind } from "@/types/database";

export type GamingProject = {
  id: string;
  owner_id?: string | null;
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
  upvote_count?: number | null;
};

type Filter =
  | "Tutti"
  | "Action"
  | "RPG"
  | "Adventure"
  | "Platformer"
  | "Horror"
  | "Strategy"
  | "Simulation"
  | "Puzzle"
  | "Indie";
type Badge = "Trending" | "Popolare" | "Top Rated" | "Novità";

const filters: Filter[] = [
  "Tutti",
  "Action",
  "RPG",
  "Adventure",
  "Platformer",
  "Horror",
  "Strategy",
  "Simulation",
  "Puzzle",
  "Indie",
];

const filterKeys: Record<Filter, string> = {
  Tutti: "filter.all",
  Action: "filter.action",
  RPG: "filter.rpg",
  Adventure: "filter.adventure",
  Platformer: "filter.platformer",
  Horror: "filter.horror",
  Strategy: "filter.strategy",
  Simulation: "filter.simulation",
  Puzzle: "filter.puzzle",
  Indie: "filter.indie",
};

const filterAliases: Partial<Record<Filter, string[]>> = {
  RPG: ["rpg", "gdr", "role playing"],
  Adventure: ["adventure", "avventura"],
  Platformer: ["platformer", "platform"],
  Horror: ["horror", "survival horror"],
  Strategy: ["strategy", "strategia", "rts", "tattico"],
  Simulation: ["simulation", "simulatore", "simulazione", "sim"],
  Puzzle: ["puzzle", "rompicapo"],
  Action: ["action", "azione"],
  Indie: ["indie"],
};

const platformKeys: Record<PlatformKind, string> = {
  pc: "platform.pc",
  mobile: "platform.mobile",
  webgl: "platform.webgl",
  console: "platform.console",
  web_saas: "platform.webSaas",
  mobile_ios: "platform.mobileIos",
  mobile_android: "platform.mobileAndroid",
  desktop: "platform.desktop",
  browser_extension: "platform.browserExtension",
};

function projectMatchesFilter(project: GamingProject, filter: Filter) {
  if (filter === "Tutti") {
    return true;
  }

  const keywords = filterAliases[filter] ?? [filter.toLowerCase()];
  return (project.tags ?? [])
    .filter((value): value is string => typeof value === "string")
    .some((value) => {
      const normalizedTag = value.toLowerCase().replace(/[-_]/g, " ");
      return keywords.some((keyword) => normalizedTag.includes(keyword));
    });
}

function ProjectCard({
  project,
  badge,
}: {
  project: GamingProject;
  badge: Badge;
}) {
  const { t } = useLocale();
  return (
    <li className="relative">
      <Link
        href={`/projects/${project.id}`}
        className="group relative block h-full overflow-hidden rounded-2xl border border-white/10 bg-ink-800 transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-panel"
      >
        <span className="absolute left-3 top-3 z-10 rounded-full bg-ink-950/85 px-2.5 py-1 text-xs font-semibold text-accent backdrop-blur">
          {badge === "Trending"
            ? t("gaming.hub.badgeTrending")
            : badge === "Top Rated"
              ? t("gaming.hub.badgeTopRated")
              : badge === "Novità"
                ? t("gaming.hub.badgeNew")
                : t("gaming.hub.badgePopular")}
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
                {project.development_status?.replaceAll("_", " ") || t("gaming.hub.defaultStatus")}
              </p>
              <h3 className="mt-1 text-lg font-medium text-white group-hover:text-accent">
                {project.title || t("gaming.hub.untitled")}
              </h3>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-zinc-500 group-hover:text-accent" />
          </div>
          <p className="line-clamp-2 text-sm text-zinc-400">
            {project.short_description ||
              project.description ||
              t("gaming.hub.noDescription")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(project.platforms ?? []).map((platform) => (
              <span
                key={platform}
                className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-zinc-300"
              >
                {platformKeys[platform] ? t(platformKeys[platform]) : platform}
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
              {t("gaming.hub.communityData")}
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-accent" />
              {t("gaming.hub.indie")}
            </span>
          </div>
        </div>
      </Link>
      <div className="absolute right-3 top-3 z-20">
        <FavoriteButton projectId={project.id} ownerId={project.owner_id ?? undefined} compact />
      </div>
    </li>
  );
}

type SortOrder = "newest" | "oldest";

export function GamingHubClient({ projects }: { projects: GamingProject[] }) {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("Tutti");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const normalizedQuery = query.trim().toLowerCase();

  const visible = useMemo(
    () =>
      projects
        .filter((project) => {
          const searchable = `${project.title ?? ""} ${
            project.description ?? ""
          } ${(project.tags ?? []).join(" ")} ${(project.platforms ?? [])
            .map((platform) => platform)
            .join(" ")}`.toLowerCase();
          return (
            (!normalizedQuery || searchable.includes(normalizedQuery)) &&
            projectMatchesFilter(project, filter)
          );
        })
        .sort((a, b) => {
          const dateA = a.created_at ?? "";
          const dateB = b.created_at ?? "";
          return sortOrder === "newest"
            ? dateB.localeCompare(dateA)
            : dateA.localeCompare(dateB);
        }),
    [filter, normalizedQuery, projects, sortOrder],
  );

  const empty = (
    <p className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-zinc-400">
      {filter === "Tutti" ? t("gaming.hub.emptyAll") : t("gaming.hub.emptyFiltered")}
    </p>
  );

  return (
    <div className="space-y-10">
      <header className="rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/15 via-ink-800 to-ink-900 p-6 shadow-panel sm:p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">
          {t("gaming.hub.tag")}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          {t("gaming.hub.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-300">
          {t("gaming.hub.subtitle")}
        </p>
        <Link
          href="/dashboard/projects/new?type=gaming"
          className="mt-6 inline-flex rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-accent-dim"
        >
          {t("gaming.hub.publish")}
        </Link>
      </header>

      <ProjectCarousel variant="popular" projects={projects} />
      <ProjectCarousel variant="new" projects={projects} />

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("gaming.hub.searchPlaceholder")}
              aria-label={t("gaming.hub.searchLabel")}
              className="w-full rounded-lg border border-white/10 bg-ink-900 py-2 pl-10 pr-3 text-sm outline-none focus:border-accent/50"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-zinc-400">
            {t("gaming.hub.sortBy")}
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as SortOrder)}
              className="rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-accent/50"
            >
              <option value="newest">{t("gaming.hub.sortNewest")}</option>
              <option value="oldest">{t("gaming.hub.sortOldest")}</option>
            </select>
          </label>
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
              {t(filterKeys[item])}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent">
            {t("gaming.hub.catalogTag")}
          </p>
          <h2 className="mt-1 text-2xl font-semibold">
            {t("gaming.hub.catalogTitle")}
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