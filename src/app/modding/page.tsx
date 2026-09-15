import Link from "next/link";
import { ArrowRight, Puzzle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { moddingGames } from "@/data/modding-games";
import { createClient } from "@/lib/supabase/server";

export default async function ModdingPage() {
  const supabase = await createClient();
  const gamesWithCounts = await Promise.all(
    moddingGames.map(async (game) => {
      const { count } = await supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("project_type", "mod")
        .eq("game_slug", game.slug)
        .eq("is_published", true);
      return { game, count: count ?? 0 };
    }),
  );

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

        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {gamesWithCounts.map(({ game, count }) => (
            <li key={game.slug}>
              <Link
                href={`/modding/${game.slug}`}
                className="group block overflow-hidden rounded-2xl border border-white/10 bg-ink-800 transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-panel"
              >
                <div
                  className="aspect-[16/9] bg-cover bg-center"
                  style={{ backgroundImage: `url(${game.cover_url})` }}
                  role="img"
                  aria-label={`Cover di ${game.name}`}
                />
                <div className="flex items-center justify-between gap-3 p-5">
                  <div>
                    <h2 className="font-medium text-white group-hover:text-accent">
                      {game.name}
                    </h2>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-zinc-400">
                      <Puzzle className="h-4 w-4 text-accent" />
                      {count} {count === 1 ? "mod disponibile" : "mod disponibili"}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-zinc-500 transition group-hover:translate-x-1 group-hover:text-accent" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
