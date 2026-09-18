"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Search, Sparkles } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { ModdingGame } from "@/data/modding-games";
import { ProjectCarousel, type CarouselProject } from "@/components/project/ProjectCarousel";

type Activity = { count: number; interactions: number; latest: string };
type GameItem = { game: ModdingGame } & Activity;
type Filter = "Tutti" | ModdingGame["category"];

const filters: Filter[] = [
  "Tutti",
  "RPG",
  "Action",
  "Strategy",
  "Simulation",
  "Open World",
];

export function ModdingHubClient({
  games,
  modProjects,
}: {
  games: GameItem[];
  modProjects: Array<CarouselProject & { game_slug?: string | null; game_cover_url?: string | null }>;
}) {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("Tutti");
  const carouselRef = useRef<HTMLUListElement>(null);
  const normalizedQuery = query.trim().toLowerCase();

  const filteredGames = useMemo(
    () =>
      games.filter(({ game }) => {
        const matchesQuery =
          !normalizedQuery ||
          game.name.toLowerCase().includes(normalizedQuery);
        const matchesFilter =
          filter === "Tutti" || game.category === filter;
        return matchesQuery && matchesFilter;
      }),
    [filter, games, normalizedQuery],
  );
  const featured = filteredGames[0];
  const carouselMods = modProjects.map((mod) => ({
    ...mod,
    cover_url:
      mod.cover_url ||
      (mod.game_slug === "minecraft"
        ? "/images/minecraft-fallback.svg"
        : mod.game_cover_url || null),
  }));

  function scrollCarousel(direction: 1 | -1) {
    const carousel = carouselRef.current;
    if (!carousel) return;
    carousel.scrollBy({ left: direction * carousel.clientWidth, behavior: "smooth" });
  }

  function GameCard({
    item,
    badge,
    carousel = false,
  }: {
    item: GameItem;
    badge: "Popolare" | "Nuovo" | "Trending";
    carousel?: boolean;
  }) {
    return (
      <li className={carousel ? "w-[82%] shrink-0 snap-start sm:w-[31%] xl:w-[calc((100%_-_5rem)/6)]" : undefined}>
        <Link
          href={`/modding/${item.game.slug}`}
          className="group relative block h-full overflow-hidden rounded-2xl border border-white/10 bg-ink-800 transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-panel"
        >
          <span className="absolute left-3 top-3 z-10 rounded-full bg-ink-950/85 px-2.5 py-1 text-xs font-semibold text-accent backdrop-blur">
            {badge === "Trending"
              ? t("modding.hub.badgeTrending")
              : badge === "Nuovo"
                ? t("modding.hub.badgeNew")
                : t("modding.hub.badgePopular")}
          </span>
          <img
            src={item.game.cover_url}
            alt={`Cover di ${item.game.name}`}
            className="aspect-video w-full object-cover"
          />
          <div className="flex items-center justify-between gap-3 p-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                {item.game.category}
              </p>
              <h3 className="mt-1 font-medium text-white group-hover:text-accent">
                {item.game.name}
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                {item.count} {t("modding.hub.modsCount")}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-zinc-500 group-hover:text-accent" />
          </div>
        </Link>
      </li>
    );
  }

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/15 via-ink-800 to-ink-900 p-6 shadow-panel sm:p-10">
        <div className="relative z-10 max-w-2xl space-y-5">
          <p className="text-xs uppercase tracking-[0.2em] text-accent">
            {t("modding.hub.tag")}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {t("modding.hub.title")}
          </h1>
          <p className="text-zinc-300">
            {t("modding.hub.subtitle")}
          </p>
          <Link
            href="/dashboard/projects/new?type=mod"
            className="inline-flex rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-accent-dim"
          >
            {t("modding.hub.publishMod")}
          </Link>
          <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-5 text-sm">
            <span><strong className="block text-lg text-white">50+</strong>{t("modding.hub.statGames")}</span>
            <span><strong className="block text-lg text-white">100%</strong>{t("modding.hub.statFree")}</span>
            <span><strong className="block text-lg text-white">⚡</strong>{t("modding.hub.statFastDownloads")}</span>
          </div>
        </div>
        <Sparkles className="absolute -right-4 -top-5 h-48 w-48 text-accent/10" />
      </section>

      {featured ? (
        <section className="relative overflow-hidden rounded-2xl border border-accent/30 bg-ink-800 p-6">
          <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${featured.game.cover_url})` }} />
          <div className="relative max-w-xl">
            <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-ink-950">{t("modding.hub.weekly")}</span>
            <h2 className="mt-4 text-2xl font-semibold">{featured.game.name}</h2>
            <p className="mt-2 text-sm text-zinc-300">{t("modding.hub.weeklyDescription")}</p>
            <Link href={`/modding/${featured.game.slug}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-dim">{t("modding.hub.discoverMods")} <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      ) : null}

      <ProjectCarousel variant="modPopular" projects={carouselMods} />
      <ProjectCarousel variant="modNew" projects={carouselMods} />

      <section className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("modding.hub.searchPlaceholder")} aria-label={t("modding.hub.searchLabel")} className="w-full rounded-lg border border-white/10 bg-ink-900 py-2 pl-10 pr-3 text-sm outline-none focus:border-accent/50" />
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full px-3 py-1.5 text-xs transition ${filter === item ? "bg-accent text-ink-950" : "bg-white/5 text-zinc-300 hover:bg-white/10"}`}>{item}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent">
              {filter === "Tutti" ? t("modding.allGames") : t("modding.hub.categoryLabel", { name: filter })}
            </p>
            <h2 className="mt-1 text-2xl font-semibold">
              {filter === "Tutti" ? t("modding.hub.exploreCatalog") : t("modding.hub.gamesOf", { name: filter })}
            </h2>
          </div>
          {filter === "Tutti" && filteredGames.length > 6 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={t("modding.hub.prevGames")}
                onClick={() => scrollCarousel(-1)}
                className="rounded-lg border border-white/10 p-2 text-zinc-300 transition hover:border-accent/50 hover:text-accent"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={t("modding.hub.nextGames")}
                onClick={() => scrollCarousel(1)}
                className="rounded-lg border border-white/10 p-2 text-zinc-300 transition hover:border-accent/50 hover:text-accent"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
        {filteredGames.length ? filter === "Tutti" ? (
          <ul
            ref={carouselRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:thin]"
          >
            {filteredGames.map((item, index) => (
              <GameCard
                key={item.game.slug}
                item={item}
                badge={index < 3 ? "Trending" : "Popolare"}
                carousel
              />
            ))}
          </ul>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {filteredGames.map((item) => (
              <GameCard key={item.game.slug} item={item} badge="Popolare" />
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-zinc-400">
            {t("modding.hub.noMatch")}
          </p>
        )}
      </section>
    </div>
  );
}
