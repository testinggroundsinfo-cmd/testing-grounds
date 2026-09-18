import { AppShell } from "@/components/layout/AppShell";
import {
  SoftwareHubClient,
  type SoftwareProject,
} from "@/components/software/SoftwareHubClient";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SoftwarePage() {
  let projects: SoftwareProject[] = [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select(
        "id, owner_id, title, short_description, description, platforms, tags, cover_url, created_at, development_status, upvote_count",
      )
      .eq("category", "software")
      .or("project_type.eq.project,project_type.is.null")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    if (!error && Array.isArray(data)) {
      projects = data as SoftwareProject[];
    }
  } catch (error) {
    console.error("Unable to load software projects:", error);
  }

  return (
    <AppShell>
      <SoftwareHubClient projects={projects} />
    </AppShell>
  );
}
