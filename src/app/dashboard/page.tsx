"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import type { Project } from "@/types/database";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { FavoriteButton } from "@/components/project/FavoriteButton";

export default function DashboardPage() {
  const { t } = useLocale();
  const [projects, setProjects] = useState<Project[]>([]);
  const [favorites, setFavorites] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjects() {
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error(t("dashboard.mustLoginProjects"));
        const { data, error: queryError } = await supabase
          .from("projects")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });
        if (queryError) throw queryError;
        setProjects((data ?? []) as Project[]);
        const { data: favoriteRows, error: favoritesError } = await supabase
          .from("project_favorites")
          .select("project_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (favoritesError) throw favoritesError;
        const favoriteIds = (favoriteRows ?? []).map((row) => row.project_id);
        if (favoriteIds.length) {
          const { data: favoriteProjects, error: favoriteProjectsError } = await supabase
            .from("projects")
            .select("*")
            .in("id", favoriteIds);
          if (favoriteProjectsError) throw favoriteProjectsError;
          setFavorites((favoriteProjects ?? []) as Project[]);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : t("dashboard.unableToLoadProjects"));
      } finally {
        setLoading(false);
      }
    }
    void loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function deleteProject(project: Project) {
    if (!window.confirm(t("dashboard.deleteConfirm", { title: project.title }))) return;
    try {
      const response = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || t("dashboard.unableToDeleteProject"));
      setProjects((current) => current.filter((item) => item.id !== project.id));
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : t("dashboard.unableToDeleteProject");
      console.error("Errore eliminazione:", deleteError);
      setError(message);
      window.alert(t("dashboard.deleteFailed", { message }));
    }
  }

  const publishedCount = projects.filter((project) => project.is_published).length;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent">{t("dashboard.personalArea")}</p>
          <h1 className="mt-2 text-3xl font-semibold">{t("dashboard.myProjects")}</h1>
          <p className="mt-2 text-sm text-zinc-400">{t("dashboard.manageSubtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/settings" className="rounded-lg border border-white/10 px-4 py-2 text-sm">{t("dashboard.settingsLink")}</Link>
          <Link href="/dashboard/projects/new" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950">{t("dashboard.newProject")}</Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-ink-800 p-4"><p className="text-sm text-zinc-400">{t("dashboard.totalProjects")}</p><p className="mt-1 text-2xl font-semibold">{projects.length}</p></div>
        <div className="rounded-xl border border-white/10 bg-ink-800 p-4"><p className="text-sm text-zinc-400">{t("dashboard.published")}</p><p className="mt-1 text-2xl font-semibold text-accent">{publishedCount}</p></div>
        <div className="rounded-xl border border-white/10 bg-ink-800 p-4"><p className="text-sm text-zinc-400">{t("dashboard.drafts")}</p><p className="mt-1 text-2xl font-semibold">{projects.length - publishedCount}</p></div>
      </div>

      {loading ? <div className="animate-pulse rounded-xl bg-white/10 p-8 text-sm text-zinc-400">{t("dashboard.loadingProjects")}</div> : null}
      {error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}
      {!loading && !error && projects.length === 0 ? <div className="rounded-xl border border-dashed border-white/10 p-8 text-sm text-zinc-400">{t("dashboard.noProjectsYet")}</div> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <article key={project.id} className="rounded-xl border border-white/10 bg-ink-800 p-5">
            <div className="flex items-start justify-between gap-3"><h2 className="font-semibold">{project.title}</h2><span className="rounded-full bg-white/10 px-2 py-1 text-xs">{project.is_published ? t("dashboard.publishedBadge") : t("dashboard.draftBadge")}</span></div>
            <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{project.short_description || project.description}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <Link href={`/dashboard/projects/${project.id}`} className="rounded-md border border-white/10 px-3 py-1.5">{t("dashboard.applications")}</Link>
              <Link href={`/dashboard/projects/${project.id}/edit`} className="rounded-md border border-white/10 px-3 py-1.5">{t("dashboard.edit")}</Link>
              <Link href={`/dashboard/projects/${project.id}/releases`} className="rounded-md border border-white/10 px-3 py-1.5">{t("dashboard.releases")}</Link>
              <button type="button" onClick={() => void deleteProject(project)} className="rounded-md border border-red-400/30 px-3 py-1.5 text-red-300">{t("dashboard.deleteAction")}</button>
            </div>
          </article>
        ))}
      </div>
      {!loading ? (
        <section className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent">{t("favorites.dashboardLabel")}</p>
            <h2 className="mt-1 text-2xl font-semibold">{t("favorites.dashboardTitle")}</h2>
          </div>
          {favorites.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {favorites.map((project) => (
                <article key={project.id} className="rounded-xl border border-white/10 bg-ink-800 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{project.title}</h3>
                    <FavoriteButton projectId={project.id} ownerId={project.owner_id} compact />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{project.short_description || project.description}</p>
                  <Link href={`/projects/${project.id}`} className="mt-4 inline-flex text-sm text-accent">{t("common.view")}</Link>
                </article>
              ))}
            </div>
          ) : <p className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-zinc-400">{t("favorites.empty")}</p>}
        </section>
      ) : null}
    </div>
  );
}