"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import type { ProjectRelease } from "@/types/database";

export default function ProjectReleasesPage({ params }: { params: Promise<{ id: string }> }) {
  const [projectId, setProjectId] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [releases, setReleases] = useState<ProjectRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void params.then(({ id }) => {
      setProjectId(id);
      void load(id);
    });
  }, [params]);

  async function load(id: string) {
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error("Devi accedere per gestire le release.");
      const { data: project, error: projectError } = await supabase.from("projects").select("title").eq("id", id).eq("owner_id", user.id).single();
      if (projectError) throw projectError;
      const { data, error: releaseError } = await supabase.from("project_releases").select("*").eq("project_id", id).order("created_at", { ascending: false });
      if (releaseError) throw releaseError;
      setProjectTitle(project.title);
      setReleases((data ?? []) as ProjectRelease[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Impossibile caricare le release.");
    } finally { setLoading(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage(""); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Devi accedere per salvare una release.");
      const { error: insertError } = await supabase.from("project_releases").insert({
        project_id: projectId,
        version: String(form.get("version") ?? "").trim(),
        changelog: String(form.get("changelog") ?? "").trim() || null,
        download_url: String(form.get("download_url") ?? "").trim() || null,
      });
      if (insertError) throw insertError;
      setMessage("Release aggiunta correttamente.");
      event.currentTarget.reset();
      await load(projectId);
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Impossibile aggiungere la release."); }
    finally { setSaving(false); }
  }

  return <div className="mx-auto max-w-3xl space-y-6">
    <div><Link href="/dashboard/projects" className="text-sm text-accent">← I miei progetti</Link><h1 className="mt-2 text-3xl font-semibold">Release {projectTitle ? `· ${projectTitle}` : ""}</h1></div>
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-ink-800 p-6">
      <label className="block text-sm">Versione<input name="version" required placeholder="1.0.0" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" /></label>
      <label className="block text-sm">Changelog<textarea name="changelog" rows={5} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" /></label>
      <label className="block text-sm">Download URL<input name="download_url" type="url" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" /></label>
      <button disabled={saving || loading} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50">{saving ? "Salvataggio..." : "Aggiungi release"}</button>
      {message ? <p className="text-sm text-accent">{message}</p> : null}{error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}
    </form>
    <section className="space-y-3"><h2 className="text-xl font-semibold">Storico release</h2>{loading ? <p className="text-sm text-zinc-400">Caricamento...</p> : releases.map((release) => <article key={release.id} className="rounded-xl border border-white/10 bg-ink-800 p-4"><div className="flex justify-between gap-3"><h3 className="font-semibold">v{release.version}</h3><time className="text-xs text-zinc-400">{new Date(release.created_at).toLocaleDateString("it-IT")}</time></div><p className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">{release.changelog || "Nessun changelog."}</p>{release.download_url ? <a href={release.download_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-accent">Download</a> : null}</article>)}{!loading && releases.length === 0 ? <p className="text-sm text-zinc-400">Nessuna release registrata.</p> : null}</section>
  </div>;
}
