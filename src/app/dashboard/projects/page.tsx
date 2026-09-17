"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import type { Project } from "@/types/database";

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
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
    void load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs uppercase tracking-widest text-accent">Area personale</p><h1 className="text-3xl font-semibold">I miei progetti</h1></div>
        <Link href="/dashboard/projects/new" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950">Nuovo progetto</Link>
      </div>
      {loading ? <div className="animate-pulse rounded-xl bg-white/10 p-8 text-sm text-zinc-400">Caricamento progetti...</div> : null}
      {error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}
      {!loading && !error && projects.length === 0 ? <p className="rounded-xl border border-white/10 p-8 text-sm text-zinc-400">Non hai ancora pubblicato progetti.</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <article key={project.id} className="overflow-hidden rounded-2xl border border-white/10 bg-ink-800">
            {project.cover_url ? <img src={project.cover_url} alt="" className="aspect-video w-full object-cover" /> : <div className="aspect-video bg-ink-900" />}
            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3"><h2 className="font-semibold">{project.title}</h2><span className={`rounded-full px-2 py-1 text-xs ${project.is_published ? "bg-accent/20 text-accent" : "bg-white/10 text-zinc-300"}`}>{project.is_published ? "Pubblicato" : "Bozza"}</span></div>
              <p className="line-clamp-2 text-sm text-zinc-400">{project.description}</p>
              <div className="flex flex-wrap gap-2 text-sm"><Link href={`/dashboard/projects/${project.id}`} className="rounded-md border border-white/10 px-3 py-1.5">Candidature</Link><Link href={`/dashboard/projects/${project.id}/edit`} className="rounded-md border border-white/10 px-3 py-1.5">Modifica</Link><Link href={`/dashboard/projects/${project.id}/releases`} className="rounded-md border border-white/10 px-3 py-1.5">Release</Link><Link href={`/projects/${project.id}`} className="rounded-md border border-white/10 px-3 py-1.5">Visualizza</Link></div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
