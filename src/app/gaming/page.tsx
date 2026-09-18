import { AppShell } from "@/components/layout/AppShell";
import { GamingHubClient, type GamingProject } from "@/components/gaming/GamingHubClient";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function GamingPage() {
  let projects: GamingProject[] = [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select(
        "id, owner_id, title, short_description, description, category, project_type, platforms, tags, cover_url, created_at, development_status, is_published, upvote_count",
      )
      .eq("category", "gaming")
      .or("project_type.eq.project,project_type.is.null")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gaming projects query failed:", error);
    } else if (Array.isArray(data)) {
      projects = (data as unknown[]).filter(
        (project): project is GamingProject =>
          typeof project === "object" &&
          project !== null &&
          "id" in project &&
          typeof project.id === "string",
      );
    }
  } catch (error) {
    console.error("Unable to load gaming projects:", error);
  }

  return (
    <AppShell>
      <GamingHubClient projects={projects} />
    </AppShell>
  );
}
