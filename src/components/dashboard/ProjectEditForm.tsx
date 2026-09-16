"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import type { AlternativeLink, Project } from "@/types/database";

type Props = { project: Project };

function valueOrNull(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

export default function ProjectEditForm({ project }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [alternativeLinks, setAlternativeLinks] = useState<AlternativeLink[]>(
    project.alternative_links ?? [],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const coverFile = form.get("cover_file");
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user || user.id !== project.owner_id) throw new Error("Non hai i permessi per modificare questo progetto.");

      const cleanData = {
        title,
        short_description: valueOrNull(String(form.get("short_description") ?? "")),
        slug: String(form.get("slug") ?? "").trim() || project.slug,
        description,
        youtube_url: valueOrNull(String(form.get("youtube_url") ?? "")),
        iframe_url: valueOrNull(String(form.get("iframe_url") ?? "")),
        distribution_url: valueOrNull(String(form.get("distribution_url") ?? "")),
        alternative_links: alternativeLinks
          .map((link) => ({ label: link.label.trim(), url: link.url.trim() }))
          .filter((link) => link.label && link.url),
        cover_url: project.cover_url,
        is_published: form.get("is_published") === "on",
      };
      if (coverFile instanceof File && coverFile.size > 0) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(coverFile.type) || coverFile.size > 5 * 1024 * 1024) {
          throw new Error("La cover deve essere JPG, PNG o WebP e non superare 5 MB.");
        }
        const extension = coverFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${user.id}/${project.id}/cover.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("project-media")
          .upload(path, coverFile, { upsert: true, contentType: coverFile.type });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("project-media").getPublicUrl(path);
        cleanData.cover_url = data.publicUrl;
      }

      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanData),
      });
      const responseBody: { error?: string } = await response.json();
      if (!response.ok) {
        throw new Error(responseBody.error || "Impossibile aggiornare il progetto.");
      }
      setMessage("Progetto aggiornato correttamente.");
      router.refresh();
      router.push("/dashboard/projects");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Impossibile aggiornare il progetto.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-ink-800 p-6">
      <label className="block text-sm">Titolo<input name="title" required defaultValue={project.title} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" /></label>
      <label className="block text-sm">Slug<input name="slug" required defaultValue={project.slug} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" /></label>
      <label className="block text-sm">Descrizione breve<input name="short_description" defaultValue={project.short_description ?? ""} maxLength={180} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" /></label>
      <label className="block text-sm">Descrizione<textarea name="description" required defaultValue={project.description} rows={7} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">YouTube URL<input name="youtube_url" type="url" defaultValue={project.youtube_url ?? ""} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" /></label>
        <label className="block text-sm">Iframe URL<input name="iframe_url" type="url" defaultValue={project.iframe_url ?? ""} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" /></label>
      </div>
      <label className="block text-sm">Link distribuzione<input name="distribution_url" type="url" defaultValue={project.distribution_url ?? ""} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" /></label>
      <fieldset className="space-y-3 rounded-xl border border-white/10 bg-ink-900/50 p-4">
        <legend className="text-sm font-medium">Link Alternativi / Mirror</legend>
        <p className="text-xs text-zinc-400">Aggiungi, modifica o rimuovi fonti alternative.</p>
        {alternativeLinks.map((link, index) => (
          <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1.5fr_auto]">
            <input
              value={link.label}
              onChange={(event) => setAlternativeLinks((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))}
              placeholder="GitHub Releases"
              aria-label={`Etichetta mirror ${index + 1}`}
              className="rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm"
            />
            <input
              value={link.url}
              onChange={(event) => setAlternativeLinks((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, url: event.target.value } : item))}
              type="url"
              placeholder="https://..."
              aria-label={`URL mirror ${index + 1}`}
              className="rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm"
            />
            <button type="button" onClick={() => setAlternativeLinks((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded-lg border border-red-400/30 px-3 py-2 text-sm text-red-300">Rimuovi</button>
          </div>
        ))}
        <button type="button" onClick={() => setAlternativeLinks((current) => [...current, { label: "", url: "" }])} className="rounded-lg border border-white/10 px-3 py-2 text-sm">+ Aggiungi mirror</button>
      </fieldset>
      <label className="block text-sm">Nuova immagine di copertina<input name="cover_file" type="file" accept="image/jpeg,image/png,image/webp" className="mt-1 block w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm" /></label>
      {project.cover_url ? <img src={project.cover_url} alt="" className="h-32 w-full rounded-lg object-cover" /> : null}
      <label className="flex items-center gap-2 text-sm"><input name="is_published" type="checkbox" defaultChecked={project.is_published} /> Pubblicato</label>
      <button disabled={saving} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50">{saving ? "Salvataggio..." : "Salva modifiche"}</button>
      {message ? <p className="text-sm text-accent">{message}</p> : null}
      {error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}
    </form>
  );
}
