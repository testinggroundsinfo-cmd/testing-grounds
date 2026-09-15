import Link from "next/link";
import { ArrowRight, Puzzle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { moddingGames } from "@/data/modding-games";
import { createClient } from "@/lib/supabase/server";

type ModActivity = {
  game_slug: string | null;
  report_count: number;
  created_at: string;
};

export default async function ModdingPage() {
  const supabase = await createClient();
  const { data: modRows } = await supabase
    .from("projects")
    .select("game_slug, report_count, created_at")
    .eq("project_type", "mod")
    .eq("is_published", true);

  const activity = new Map<string, { count: number; interactions: number; latest: string }>();
  for (const row of (modRows ?? []) as ModActivity[]) {
    if (!row.game_slug) continue;
    const current = activity.get(row.game_slug) ?? {
      count: 0,
      interactions: 0,
      latest: row.created_at,
    };
    current.count += 1;
    current.interactions += row.report_count ?? 0;
    current.latest = current.latest > row.created_at ? current.latest : row.created_at;
    activity.set(row.game_slug, current);
  }

  const gamesWithActivity = moddingGames.map((game) => ({
    game,
    ...(activity.get(game.slug) ?? { count: 0, interactions: 0, latest: "" }),
  }));
  const popularGames = [...gamesWithActivity]
    .sort((a, b) => b.count * 10 + b.interactions - (a.count * 10 + a.interactions))
    .slice(0, 8);
  const recentGames = [...gamesWithActivity]
    .filter(({ latest }) => latest)
    .sort((a, b) => b.latest.localeCompare(a.latest))
    .slice(0, 8);

  function GameCard({
    item,
    badge,
  }: {
    item: (typeof gamesWithActivity)[number];
    badge: "Popolare" | "Nuovo" | "Trending";
  }) {
    return (
      <li className="min-w-[260px] flex-1 sm:min-w-[280px]">
        <Link
          href={`/modding/${item.game.slug}`}
          className="group relative block h-full overflow-hidden rounded-2xl border border-white/10 bg-ink-800 transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-panel"
        >
          <span className="absolute left-3 top-3 z-10 rounded-full bg-ink-950/85 px-2.5 py-1 text-xs font-semibold text-accent backdrop-blur">
            {badge === "Trending" ? "🔥 Trending" : badge === "Nuovo" ? "🆕 Nuovo" : "★ Popolare"}
          </span>
          <div className="aspect-[16/9] bg-cover bg-center" style={{ backgroundImage: `url(${item.game.cover_url})` }} role="img" aria-label={`Cover di ${item.game.name}`} />
          <div className="flex items-center justify-between gap-3 p-5">
            <div>
              <h2 className="font-medium text-white group-hover:text-accent">{item.game.name}</h2>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-zinc-400">
                <Puzzle className="h-4 w-4 text-accent" />
                {item.count} {item.count === 1 ? "mod disponibile" : "mod disponibili"}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-zinc-500 transition group-hover:translate-x-1 group-hover:text-accent" />
          </div>
        </Link>
      </li>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <header className="max-w-3xl space-y-3">
          <p className="text-xs uppercase tracking-widest text-accent">
            Community hub
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Modding Hub
          </h1>
          <p className="text-zinc-400">
            Scopri mod, total conversion e contenuti creati dalla community per
            i tuoi giochi preferiti.
          </p>
        </header>

        <section className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent">🔥 Più Popolari</p>
            <h2 className="mt-1 text-2xl font-semibold">Le mod più seguite</h2>
          </div>
          <ul className="flex snap-x gap-5 overflow-x-auto pb-3">
            {popularGames.map((item, index) => (
              <GameCard key={item.game.slug} item={item} badge={index < 3 ? "Trending" : "Popolare"} />
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent">🆕 Più Recenti / Nuove Uscite</p>
            <h2 className="mt-1 text-2xl font-semibold">Appena pubblicate</h2>
          </div>
          {recentGames.length > 0 ? (
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {recentGames.map((item) => <GameCard key={item.game.slug} item={item} badge="Nuovo" />)}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-zinc-400">Le nuove mod appariranno qui appena pubblicate.</p>
          )}
        </section>
      </div>
    </AppShell>
  );
}
