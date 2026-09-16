"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import type { Project } from "@/types/database";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjects() {
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error("Devi accedere per vedere i tuoi progetti.");
        const { data, error: queryError } = await supabase
          .from("projects")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });
        if (queryError) throw queryError;
        setProjects((data ?? []) as Project[]);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Impossibile caricare i progetti.");
      } finally {
        setLoading(false);
      }
    }
    void loadProjects();
  }, []);

  async function deleteProject(project: Project) {
    if (!window.confirm(`Eliminare "${project.title}"?`)) return;
    try {
      const response = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Impossibile eliminare il progetto.");
      setProjects((current) => current.filter((item) => item.id !== project.id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Impossibile eliminare il progetto.");
    }
  }

  const publishedCount = projects.filter((project) => project.is_published).length;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent">Area personale</p>
          <h1 className="mt-2 text-3xl font-semibold">I miei progetti</h1>
          <p className="mt-2 text-sm text-zinc-400">Gestisci le tue schede, release e pubblicazioni.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/settings" className="rounded-lg border border-white/10 px-4 py-2 text-sm">⚙ Impostazioni Profilo</Link>
          <Link href="/dashboard/projects/new" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950">Nuovo progetto</Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-ink-800 p-4"><p className="text-sm text-zinc-400">Totale progetti</p><p className="mt-1 text-2xl font-semibold">{projects.length}</p></div>
        <div className="rounded-xl border border-white/10 bg-ink-800 p-4"><p className="text-sm text-zinc-400">Pubblicati</p><p className="mt-1 text-2xl font-semibold text-accent">{publishedCount}</p></div>
        <div className="rounded-xl border border-white/10 bg-ink-800 p-4"><p className="text-sm text-zinc-400">Bozze</p><p className="mt-1 text-2xl font-semibold">{projects.length - publishedCount}</p></div>
      </div>

      {loading ? <div className="animate-pulse rounded-xl bg-white/10 p-8 text-sm text-zinc-400">Caricamento progetti...</div> : null}
      {error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}
      {!loading && !error && projects.length === 0 ? <div className="rounded-xl border border-dashed border-white/10 p-8 text-sm text-zinc-400">Non hai ancora creato progetti.</div> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <article key={project.id} className="rounded-xl border border-white/10 bg-ink-800 p-5">
            <div className="flex items-start justify-between gap-3"><h2 className="font-semibold">{project.title}</h2><span className="rounded-full bg-white/10 px-2 py-1 text-xs">{project.is_published ? "Pubblicato" : "Bozza"}</span></div>
            <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{project.short_description || project.description}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <Link href={`/dashboard/projects/${project.id}/edit`} className="rounded-md border border-white/10 px-3 py-1.5">Modifica</Link>
              <Link href={`/dashboard/projects/${project.id}/releases`} className="rounded-md border border-white/10 px-3 py-1.5">Release</Link>
              <button type="button" onClick={() => void deleteProject(project)} className="rounded-md border border-red-400/30 px-3 py-1.5 text-red-300">Elimina</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
