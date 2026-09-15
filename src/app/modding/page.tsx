import { AppShell } from "@/components/layout/AppShell";
import { ModdingHubClient } from "@/components/modding/ModdingHubClient";
import { moddingGames } from "@/data/modding-games";
import { createClient } from "@/lib/supabase/server";

type ModActivity = {
  game_slug: string | null;
  report_count?: number | null;
  created_at?: string | null;
};

export default async function ModdingPage() {
  let modRows: ModActivity[] = [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("game_slug, report_count, created_at")
      .eq("project_type", "mod")
      .eq("is_published", true);
    if (!error && Array.isArray(data)) modRows = data as ModActivity[];
  } catch {
    modRows = [];
  }

  const activity = new Map<string, { count: number; interactions: number; latest: string }>();
  for (const row of modRows) {
    if (!row.game_slug) continue;
    const current = activity.get(row.game_slug) ?? { count: 0, interactions: 0, latest: "" };
    current.count += 1;
    current.interactions += row.report_count ?? 0;
    current.latest = current.latest > (row.created_at ?? "") ? current.latest : row.created_at ?? "";
    activity.set(row.game_slug, current);
  }
  const games = moddingGames.map((game) => ({
    game,
    ...(activity.get(game.slug) ?? { count: 0, interactions: 0, latest: "" }),
  }));

  return (
    <AppShell>
      <ModdingHubClient games={games} />
    </AppShell>
  );
}
