import Link from "next/link";
import { ArrowLeft, Download, ExternalLink, Puzzle } from "lucide-react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { MINECRAFT_FALLBACK_COVER, moddingGameBySlug } from "@/data/modding-games";
import { createClient } from "@/lib/supabase/server";
import { FavoriteButton } from "@/components/project/FavoriteButton";

type ModdingGamePageProps = {
  params: Promise<{ "game-slug": string }>;
};

type ModProject = {
  id: string;
  owner_id: string;
  title: string;
  slug: string;
  description: string;
  mod_version: string;
  compatibility: string;
  mod_type: string | null;
  mod_dependencies: string | null;
  mod_file_url: string | null;
  game_cover_url: string | null;
  cover_url: string | null;
};

export default async function ModdingGamePage({
  params,
}: ModdingGamePageProps) {
  const { "game-slug": gameSlug } = await params;
  const game = moddingGameBySlug.get(gameSlug);
  if (!game) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, owner_id, title, slug, description, mod_version, compatibility, mod_type, mod_dependencies, mod_file_url, game_cover_url, cover_url",
    )
    .eq("project_type", "mod")
    .eq("game_slug", game.slug)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Impossibile caricare le mod di questo gioco.");
  }

  const mods = (data ?? []) as ModProject[];
  const gameCover =
    game.cover_url ||
    (game.slug === "minecraft"
      ? MINECRAFT_FALLBACK_COVER
      : "");

  return (
    <AppShell>
      <div className="space-y-8">
        <Link
          href="/modding"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Tutti i giochi
        </Link>

        <header className="overflow-hidden rounded-2xl border border-white/10 bg-ink-800 shadow-panel">
          <div
            className="aspect-[3/1] min-h-40 bg-cover bg-center"
            style={{ backgroundImage: `url(${gameCover})` }}
            role="img"
            aria-label={`Cover di ${game.name}`}
          />
          <div className="space-y-2 p-6 sm:p-8">
            <p className="text-xs uppercase tracking-widest text-accent">
              Modding community
            </p>
            <h1 className="text-3xl font-semibold">{game.name}</h1>
            <p className="text-zinc-400">
              {mods.length} {mods.length === 1 ? "mod pubblicata" : "mod pubblicate"}
            </p>
          </div>
        </header>

        {mods.length > 0 ? (
          <ul className="grid gap-5 md:grid-cols-2">
            {mods.map((mod) => (
              <li
                key={mod.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-ink-800"
              >
                <div
                  className="aspect-video bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${mod.cover_url || mod.game_cover_url || gameCover})`,
                  }}
                  role="img"
                  aria-label={`Cover della mod ${mod.title}`}
                />
                <div className="space-y-4 p-5">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-xl font-semibold">{mod.title}</h2>
                      <div className="flex items-center gap-2">
                        <FavoriteButton projectId={mod.id} ownerId={mod.owner_id} compact />
                        <span className="shrink-0 rounded-full bg-accent-glow px-2.5 py-1 text-xs text-accent">
                          v{mod.mod_version}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                      {mod.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-zinc-300">
                    <span className="rounded-full bg-white/5 px-2.5 py-1">
                      Compatibilità: {mod.compatibility}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1">
                      <Puzzle className="h-3.5 w-3.5 text-accent" />
                      Mod
                    </span>
                    {mod.mod_type ? (
                      <span className="rounded-full bg-white/5 px-2.5 py-1">
                        {mod.mod_type.replaceAll("_", " ")}
                      </span>
                    ) : null}
                  </div>
                  {mod.mod_dependencies ? (
                    <p className="text-xs text-zinc-400">
                      <strong className="font-medium text-zinc-300">Dipendenze:</strong>{" "}
                      {mod.mod_dependencies}
                    </p>
                  ) : null}
                  <p className="line-clamp-3 text-sm leading-relaxed text-zinc-400">
                    {mod.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/projects/${mod.id}`}
                      className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white hover:bg-white/10"
                    >
                      Dettagli
                    </Link>
                    {mod.mod_file_url ? (
                      <a
                        href={mod.mod_file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-ink-950 hover:bg-accent-dim"
                      >
                        {mod.mod_file_url.toLowerCase().includes(".zip") ? (
                          <Download className="h-4 w-4" />
                        ) : (
                          <ExternalLink className="h-4 w-4" />
                        )}
                        Scarica / apri
                      </a>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-ink-800/60 px-6 py-14 text-center">
            <Puzzle className="mx-auto h-8 w-8 text-accent" />
            <h2 className="mt-4 text-xl font-semibold">Nessuna mod ancora</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Sii il primo a pubblicare una mod per {game.name}.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
