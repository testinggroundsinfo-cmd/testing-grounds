import Link from "next/link";
import { ArrowLeft, ExternalLink, Globe, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/server";
import type { PlatformKind, ProjectCategory } from "@/types/database";

type ProfilePageProps = {
  params: Promise<{ username: string }>;
};

type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  website_url: string | null;
};

type PublishedProject = {
  id: string;
  title: string;
  category: ProjectCategory;
  slug: string;
  short_pitch: string;
  platforms: PlatformKind[];
  cover_image_url: string | null;
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

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, website_url")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (profileError || !profile) {
    notFound();
  }

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select(
      "id, title, category, slug, short_pitch, platforms, cover_image_url",
    )
    .eq("owner_id", profile.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (projectsError) {
    throw new Error("Impossibile caricare i progetti del creatore.");
  }
  const publishedProjects = (projects ?? []) as PublishedProject[];

  return (
    <AppShell>
      <div className="space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna ai progetti
        </Link>

        <header className="rounded-2xl border border-white/10 bg-ink-800 p-6 shadow-panel sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {profile.avatar_url ? (
              <div
                className="h-24 w-24 shrink-0 rounded-full border border-white/10 bg-cover bg-center"
                style={{ backgroundImage: `url(${profile.avatar_url})` }}
                role="img"
                aria-label={`Avatar di ${profile.display_name}`}
              />
            ) : (
              <div
                className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-white/10 bg-accent-glow text-accent"
                aria-hidden
              >
                <UserRound className="h-10 w-10" />
              </div>
            )}

            <div className="min-w-0 space-y-2">
              <p className="text-xs uppercase tracking-widest text-accent">
                Creatore
              </p>
              <h1 className="text-3xl font-semibold tracking-tight">
                {profile.display_name}
              </h1>
              <p className="text-sm text-zinc-500">@{profile.username}</p>
              {profile.bio ? (
                <p className="max-w-2xl whitespace-pre-wrap text-zinc-300">
                  {profile.bio}
                </p>
              ) : null}
              {profile.website_url ? (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-dim"
                >
                  <Globe className="h-4 w-4" />
                  Sito web
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
          </div>
        </header>

        <section className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent">
              Portfolio
            </p>
            <h2 className="mt-1 text-2xl font-semibold">
              Progetti pubblicati
            </h2>
          </div>

          {publishedProjects.length > 0 ? (
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {publishedProjects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/projects/${project.id}`}
                    className="group block h-full overflow-hidden rounded-2xl border border-white/10 bg-ink-800 transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-panel"
                  >
                    <div
                      className="aspect-video bg-ink-700 bg-cover bg-center"
                      style={
                        project.cover_image_url
                          ? {
                              backgroundImage: `url(${project.cover_image_url})`,
                            }
                          : undefined
                      }
                    >
                      {!project.cover_image_url ? (
                        <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-zinc-500">
                          {project.category === "gaming"
                            ? "Gaming"
                            : "Software"}
                        </div>
                      ) : null}
                    </div>
                    <div className="space-y-3 p-5">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-zinc-500">
                          {project.category === "gaming"
                            ? "Playtest"
                            : "Software"}
                        </p>
                        <h3 className="mt-1 text-lg font-medium text-white group-hover:text-accent">
                          {project.title}
                        </h3>
                      </div>
                      <p className="line-clamp-2 text-sm text-zinc-400">
                        {project.short_pitch}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {project.platforms.length > 0 ? (
                          project.platforms.map((platform) => (
                            <span
                              key={platform}
                              className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-zinc-300"
                            >
                              {platformLabels[platform] ?? platform}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-zinc-500">
                            Piattaforme non specificate
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-ink-800/60 px-6 py-12 text-center">
              <p className="text-zinc-300">
                Questo creatore non ha ancora pubblicato progetti.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
