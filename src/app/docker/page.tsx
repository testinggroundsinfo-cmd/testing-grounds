import { AppShell } from "@/components/layout/AppShell";
import { DockerHubClient, type DockerProject } from "@/components/docker/DockerHubClient";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DockerPage() {
  let projects: DockerProject[] = [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("id, owner_id, title, short_description, description, tags, platforms, cover_url, created_at, upvote_count")
      .eq("category", "docker")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    if (error) console.error("Docker projects query failed:", error);
    else if (Array.isArray(data)) projects = data as DockerProject[];
  } catch (error) {
    console.error("Unable to load Docker projects:", error);
  }

  return <AppShell><DockerHubClient projects={projects} /></AppShell>;
}
