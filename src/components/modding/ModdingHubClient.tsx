"use client";

import Link from "next/link";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { ModdingGame } from "@/data/modding-games";

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
}: {
  games: GameItem[];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("Tutti");
  const t = useTranslations("hubs");
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
  const popular = [...filteredGames].sort(
      (a, b) =>
        b.count * 10 +
        b.interactions -
        (a.count * 10 + a.interactions),
    )
    .slice(0, 8);
  const recent = [...filteredGames]
    .filter(({ latest }) => latest)
    .sort((a, b) => b.latest.localeCompare(a.latest))
    .slice(0, 8);
  const featured = popular[0] ?? filteredGames[0];

  function GameCard({
    item,
    badge,
  }: {
    item: GameItem;
    badge: "Popolare" | "Nuovo" | "Trending";
  }) {
    return (
      <li>
        <Link
          href={`/modding/${item.game.slug}`}
          className="group relative block h-full overflow-hidden rounded-2xl border border-white/10 bg-ink-800 transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-panel"
        >
          <span className="absolute left-3 top-3 z-10 rounded-full bg-ink-950/85 px-2.5 py-1 text-xs font-semibold text-accent backdrop-blur">
            {badge === "Trending"
              ? "🔥 Trending"
              : badge === "Nuovo"
                ? "🆕 Nuovo"
                : "★ Popolare"}
          </span>
          <div
            className="aspect-[16/9] bg-cover bg-center"
            style={{ backgroundImage: `url(${item.game.cover_url})` }}
            role="img"
            aria-label={`Cover di ${item.game.name}`}
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
                {item.count} {item.count === 1 ? "mod" : "mod"}
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
            Community modding hub
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Dai nuova vita ai tuoi giochi.
          </h1>
          <p className="text-zinc-300">
            Esplora mod, total conversion e contenuti creati dalla community.
          </p>
          <Link
            href="/dashboard/projects/new?type=mod"
            className="inline-flex rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-accent-dim"
          >
            Pubblica la tua Mod
          </Link>
          <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-5 text-sm">
            <span><strong className="block text-lg text-white">50+</strong>Giochi supportati</span>
            <span><strong className="block text-lg text-white">100%</strong>Gratis</span>
            <span><strong className="block text-lg text-white">⚡</strong>Download veloci</span>
          </div>
        </div>
        <Sparkles className="absolute -right-4 -top-5 h-48 w-48 text-accent/10" />
      </section>

      {featured ? (
        <section className="relative overflow-hidden rounded-2xl border border-accent/30 bg-ink-800 p-6">
          <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${featured.game.cover_url})` }} />
          <div className="relative max-w-xl">
            <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-ink-950">MOD DELLA SETTIMANA</span>
            <h2 className="mt-4 text-2xl font-semibold">{featured.game.name}</h2>
            <p className="mt-2 text-sm text-zinc-300">La community sta creando contenuti incredibili per questo gioco.</p>
            <Link href={`/modding/${featured.game.slug}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-dim">Scopri le mod <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("search")} aria-label={t("search")} className="w-full rounded-lg border border-white/10 bg-ink-900 py-2 pl-10 pr-3 text-sm outline-none focus:border-accent/50" />
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full px-3 py-1.5 text-xs transition ${filter === item ? "bg-accent text-ink-950" : "bg-white/5 text-zinc-300 hover:bg-white/10"}`}>{item}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div><p className="text-xs uppercase tracking-widest text-accent">🔥 {t("popular")}</p><h2 className="mt-1 text-2xl font-semibold">Le mod più seguite</h2></div>
        {popular.length ? <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">{popular.map((item, index) => <GameCard key={item.game.slug} item={item} badge={index < 3 ? "Trending" : "Popolare"} />)}</ul> : <p className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-zinc-400">Nessun gioco corrisponde ai filtri.</p>}
      </section>

      <section className="space-y-4">
        <div><p className="text-xs uppercase tracking-widest text-accent">🆕 {t("recent")}</p><h2 className="mt-1 text-2xl font-semibold">Nuove uscite</h2></div>
        {recent.length ? <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">{recent.map((item) => <GameCard key={item.game.slug} item={item} badge="Nuovo" />)}</ul> : <p className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-zinc-400">Le nuove mod appariranno qui appena pubblicate.</p>}
      </section>
    </div>
  );
}
