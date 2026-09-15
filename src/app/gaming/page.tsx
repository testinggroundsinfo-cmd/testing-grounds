import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/server";
import type { PlatformKind } from "@/types/database";

export const dynamic = "force-dynamic";

type GamingProject = {
  id: string;
  title?: string | null;
  short_pitch?: string | null;
  platforms?: PlatformKind[] | null;
  tags?: string[] | null;
  cover_image_url: string | null;
  report_count?: number | null;
  views?: number | null;
  downloads?: number | null;
  created_at?: string | null;
};

const platformLabels: Record<PlatformKind, string> = {
  pc: "PC",
  mobile: "Mobile",
  webgl: "WebGL",
  console: "Console",
  web_saas: "Web / SaaS",
  mobile_ios: "iOS",
  mobile_android: "Android",
  desktop: "Desktop",
  browser_extension: "Browser extension",
};

type Badge = "Trending" | "Popolare" | "Novità";

function ProjectCard({
  project,
  badge,
}: {
  project: GamingProject;
  badge: Badge;
}) {
  return (
    <li className="min-w-0">
      <Link
        href={`/projects/${project.id}`}
        className="group relative block h-full overflow-hidden rounded-2xl border border-white/10 bg-ink-800 transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-panel"
      >
        <span className="absolute left-3 top-3 z-10 rounded-full bg-ink-950/85 px-2.5 py-1 text-xs font-semibold text-accent backdrop-blur">
          {badge === "Trending"
            ? "🔥 Trending"
            : badge === "Novità"
              ? "🆕 Novità"
              : "★ Popolare"}
        </span>
        <div
          className="aspect-video bg-ink-700 bg-cover bg-center"
          style={
            project.cover_image_url
              ? { backgroundImage: `url(${project.cover_image_url})` }
              : undefined
          }
        >
          {!project.cover_image_url ? (
            <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-zinc-500">
              Gaming
            </div>
          ) : null}
        </div>
        <div className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Playtest
              </p>
              <h2 className="mt-1 text-lg font-medium text-white group-hover:text-accent">
                {project.title || "Progetto senza titolo"}
              </h2>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-zinc-500 group-hover:text-accent" />
          </div>
          <p className="line-clamp-2 text-sm text-zinc-400">
            {project.short_pitch || "Nessuna descrizione disponibile."}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(project.platforms ?? []).map((platform) => (
              <span
                key={platform}
                className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-zinc-300"
              >
                {platformLabels[platform] ?? platform}
              </span>
            ))}
            {(project.tags ?? []).slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-accent-glow px-2.5 py-1 text-xs text-accent"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </li>
  );
}

export default async function GamingPage() {
  let projects: GamingProject[] = [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select(
        "id, title, short_pitch, platforms, tags, cover_image_url, report_count, created_at",
      )
      .eq("category", "gaming")
      .eq("project_type", "project")
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

  // I contatori opzionali vengono trattati come zero quando non valorizzati.
  const popular = [...projects]
    .sort(
      (a, b) =>
        (b.views ?? 0) +
        (b.downloads ?? 0) +
        (b.report_count ?? 0) -
        ((a.views ?? 0) + (a.downloads ?? 0) + (a.report_count ?? 0)),
    )
    .slice(0, 6);
  const recent = [...projects]
    .sort((a, b) =>
      (b.created_at ?? "").localeCompare(a.created_at ?? ""),
    )
    .slice(0, 6);
  const emptyMessage = (
    <p className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-zinc-400">
      I nuovi videogiochi appariranno qui appena pubblicati.
    </p>
  );

  return (
    <AppShell>
      <header className="mb-8 max-w-3xl space-y-3">
        <h1 className="text-3xl font-semibold">Gaming</h1>
        <p className="text-sm text-zinc-400">
          PC, Mobile, WebGL e Console · Pre-Alpha, Alpha, Closed Beta, Playtest
        </p>
      </header>

      <div className="space-y-10">
        <section className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent">
              🔥 Più Popolari
            </p>
            <h2 className="mt-1 text-2xl font-semibold">
              I titoli più seguiti dalla community
            </h2>
          </div>
          {popular.length > 0 ? (
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {popular.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  badge={index < 3 ? "Trending" : "Popolare"}
                />
              ))}
            </ul>
          ) : (
            emptyMessage
          )}
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent">
              🆕 Nuove Uscite / Più Recenti
            </p>
            <h2 className="mt-1 text-2xl font-semibold">
              Appena pubblicati
            </h2>
          </div>
          {recent.length > 0 ? (
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {recent.map((project) => (
                <ProjectCard key={project.id} project={project} badge="Novità" />
              ))}
            </ul>
          ) : (
            emptyMessage
          )}
        </section>
      </div>
    </AppShell>
  );
}
