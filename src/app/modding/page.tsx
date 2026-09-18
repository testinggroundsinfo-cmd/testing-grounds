import { AppShell } from "@/components/layout/AppShell";
import { ModdingHubClient } from "@/components/modding/ModdingHubClient";
import { moddingGames } from "@/data/modding-games";
import { createClient } from "@/lib/supabase/server";

type ModActivity = {
  game_slug: string | null;
  created_at?: string | null;
};

type ModProject = {
  id: string;
  owner_id: string | null;
  title: string | null;
  short_description: string | null;
  description: string | null;
  cover_url: string | null;
  game_slug: string | null;
  game_cover_url: string | null;
  created_at: string | null;
  upvote_count: number | null;
};

export default async function ModdingPage() {
  let modRows: ModActivity[] = [];
  let modProjects: ModProject[] = [];
  try {
    const supabase = await createClient();
    const [{ data, error }, modResult] = await Promise.all([
      supabase
      .from("projects")
      .select("game_slug, created_at")
      .eq("project_type", "mod")
      .eq("is_published", true),
      supabase
        .from("projects")
        .select("id, owner_id, title, short_description, description, cover_url, game_slug, game_cover_url, created_at, upvote_count")
        .eq("project_type", "mod")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(25),
    ]);
    if (!error && Array.isArray(data)) modRows = data as ModActivity[];
    if (!modResult.error && Array.isArray(modResult.data)) modProjects = modResult.data as ModProject[];
  } catch {
    modRows = [];
    modProjects = [];
  }

  const activity = new Map<string, { count: number; interactions: number; latest: string }>();
  for (const row of modRows) {
    if (!row.game_slug) continue;
    const current = activity.get(row.game_slug) ?? { count: 0, interactions: 0, latest: "" };
    current.count += 1;
    current.interactions = current.count;
    current.latest = current.latest > (row.created_at ?? "") ? current.latest : row.created_at ?? "";
    activity.set(row.game_slug, current);
  }
  const games = moddingGames.map((game) => ({
    game,
    ...(activity.get(game.slug) ?? { count: 0, interactions: 0, latest: "" }),
  }));

  return (
    <AppShell>
      <ModdingHubClient games={games} modProjects={modProjects} />
    </AppShell>
  );
}
