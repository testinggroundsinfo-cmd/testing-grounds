"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import type { Project } from "@/types/database";

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
        slug: String(form.get("slug") ?? "").trim() || project.slug,
        description,
        youtube_url: valueOrNull(String(form.get("youtube_url") ?? "")),
        iframe_url: valueOrNull(String(form.get("iframe_url") ?? "")),
        distribution_url: valueOrNull(String(form.get("distribution_url") ?? "")),
        is_published: form.get("is_published") === "on",
      };
      const { error: updateError } = await supabase
        .from("projects")
        .update(cleanData)
        .eq("id", project.id)
        .eq("owner_id", user.id);
      if (updateError) throw updateError;

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
        const { error: coverError } = await supabase
          .from("projects")
          .update({ cover_url: data.publicUrl })
          .eq("id", project.id)
          .eq("owner_id", user.id);
        if (coverError) throw coverError;
      }
      setMessage("Progetto aggiornato correttamente.");
      router.refresh();
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
      <label className="block text-sm">Descrizione<textarea name="description" required defaultValue={project.description} rows={7} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">YouTube URL<input name="youtube_url" type="url" defaultValue={project.youtube_url ?? ""} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" /></label>
        <label className="block text-sm">Iframe URL<input name="iframe_url" type="url" defaultValue={project.iframe_url ?? ""} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" /></label>
      </div>
      <label className="block text-sm">Link distribuzione<input name="distribution_url" type="url" defaultValue={project.distribution_url ?? ""} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" /></label>
      <label className="block text-sm">Nuova immagine di copertina<input name="cover_file" type="file" accept="image/jpeg,image/png,image/webp" className="mt-1 block w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm" /></label>
      {project.cover_url ? <img src={project.cover_url} alt="" className="h-32 w-full rounded-lg object-cover" /> : null}
      <label className="flex items-center gap-2 text-sm"><input name="is_published" type="checkbox" defaultChecked={project.is_published} /> Pubblicato</label>
      <button disabled={saving} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50">{saving ? "Salvataggio..." : "Salva modifiche"}</button>
      {message ? <p className="text-sm text-accent">{message}</p> : null}
      {error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}
    </form>
  );
}
