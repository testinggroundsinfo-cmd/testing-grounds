import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { T } from "@/components/i18n/T";
import { ProjectCarousel, type CarouselProject } from "@/components/project/ProjectCarousel";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const HOME_PROJECT_COLUMNS =
  "id, owner_id, title, short_description, description, cover_url, created_at, upvote_count";

async function loadHomeProjects() {
  try {
    const supabase = await createClient();
    const baseQuery = () =>
      supabase
        .from("projects")
        .select(HOME_PROJECT_COLUMNS)
        .or("project_type.eq.project,project_type.is.null")
        .eq("is_published", true);

    const [popularResult, newestResult] = await Promise.all([
      baseQuery()
        .order("upvote_count", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(10),
      baseQuery().order("created_at", { ascending: false }).limit(25),
    ]);

    if (popularResult.error) {
      console.error("Homepage popular projects query failed:", popularResult.error);
    }
    if (newestResult.error) {
      console.error("Homepage newest projects query failed:", newestResult.error);
    }

    return {
      popularProjects: (popularResult.data ?? []) as CarouselProject[],
      newestProjects: (newestResult.data ?? []) as CarouselProject[],
    };
  } catch (error) {
    console.error("Unable to load homepage projects:", error);
    return {
      popularProjects: [] as CarouselProject[],
      newestProjects: [] as CarouselProject[],
    };
  }
}

export default async function HomePage() {
  const { popularProjects, newestProjects } = await loadHomeProjects();

  return (
    <AppShell>
      <div className="space-y-10">
        <section className="max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-accent">MVP</p>
          <h1 className="text-4xl font-semibold tracking-tight">
            <T k="home.title" />
          </h1>
          <p className="text-zinc-400">
            <T k="home.description" />
          </p>
          <div className="flex gap-3 pt-2">
            <Link
              href="/gaming"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950"
            >
              <T k="home.gaming" />
            </Link>
            <Link
              href="/software"
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white"
            >
              <T k="home.software" />
            </Link>
          </div>
        </section>

        <ProjectCarousel variant="popular" projects={popularProjects} />
        <ProjectCarousel variant="new" projects={newestProjects} />
      </div>
    </AppShell>
  );
}