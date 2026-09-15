"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ensureProfile, requireBrowserUser } from "@/lib/auth/ensure-profile";
import { createClient } from "@/lib/supabaseClient";

const platforms = {
  gaming: [
    ["pc", "PC"],
    ["mobile", "Mobile"],
    ["webgl", "WebGL"],
    ["console", "Console"],
  ],
  software: [
    ["web_saas", "Web / SaaS"],
    ["mobile_ios", "iOS"],
    ["mobile_android", "Android"],
    ["desktop", "Desktop"],
    ["browser_extension", "Estensione browser"],
  ],
} as const;

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

export default function NewProjectPage() {
  const router = useRouter();
  const [category, setCategory] = useState<"gaming" | "software">("gaming");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const supabase = createClient();
      const user = await requireBrowserUser(supabase);
      await ensureProfile(supabase, user);
      const title = String(form.get("title") || "");
      const selectedPlatforms = form.getAll("platforms").map(String);
      const { data, error } = await supabase
        .from("projects")
        .insert({
          owner_id: user.id,
          category,
          title,
          slug: slugify(String(form.get("slug") || title)),
          short_pitch: String(form.get("short_pitch") || ""),
          description: String(form.get("description") || ""),
          development_status: String(form.get("development_status") || "alpha") as never,
          platforms: selectedPlatforms as never,
          tags: String(form.get("tags") || "").split(",").map((tag) => tag.trim()).filter(Boolean),
          cover_image_url: String(form.get("cover_image_url") || "") || null,
          youtube_url: String(form.get("youtube_url") || "") || null,
          iframe_url: String(form.get("iframe_url") || "") || null,
          distribution_kind: String(form.get("distribution_kind") || "") || null,
          distribution_url: String(form.get("distribution_url") || "") || null,
          is_published: form.get("is_published") === "on",
        })
        .select("id")
        .single();
      if (error) throw error;
      router.push(`/dashboard/projects/${data.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Pubblicazione non riuscita.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Nuova scheda</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-ink-800 p-6">
        <label className="block text-sm">Categoria
          <select value={category} onChange={(event) => setCategory(event.target.value as typeof category)} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2">
            <option value="gaming">Gaming</option>
            <option value="software">Software</option>
          </select>
        </label>
        <label className="block text-sm">Titolo
          <input name="title" required minLength={2} maxLength={80} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
        </label>
        <label className="block text-sm">Slug (opzionale)
          <input name="slug" pattern="[a-z0-9-]{3,80}" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
        </label>
        <label className="block text-sm">Descrizione breve
          <input name="short_pitch" required minLength={10} maxLength={180} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
        </label>
        <label className="block text-sm">Descrizione
          <textarea name="description" required rows={6} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
        </label>
        <label className="block text-sm">Stato di sviluppo
          <select name="development_status" defaultValue="alpha" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2">
            <option value="pre_alpha">Pre-alpha</option><option value="alpha">Alpha</option><option value="closed_beta">Closed beta</option><option value="mvp">MVP</option><option value="playtest">Playtest</option>
          </select>
        </label>
        <fieldset className="space-y-2"><legend className="text-sm">Piattaforme</legend>
          <div className="grid gap-2 sm:grid-cols-2">{platforms[category].map(([value, label]) => <label key={value} className="text-sm"><input type="checkbox" name="platforms" value={value} className="mr-2" />{label}</label>)}</div>
        </fieldset>
        <label className="block text-sm">Tag (separati da virgola)
          <input name="tags" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">Cover URL<input name="cover_image_url" type="url" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" /></label>
          <label className="text-sm">YouTube URL<input name="youtube_url" type="url" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" /></label>
          <label className="text-sm">Iframe URL<input name="iframe_url" type="url" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" /></label>
          <label className="text-sm">Tipo distribuzione<select name="distribution_kind" defaultValue="" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"><option value="">Nessuno</option><option value="direct_link">Link diretto</option><option value="testflight">TestFlight</option><option value="play_beta">Play Beta</option><option value="steam_playtest">Steam Playtest</option><option value="itch">itch.io</option><option value="zip">ZIP</option></select></label>
        </div>
        <label className="block text-sm">Link distribuzione<input name="distribution_url" type="url" className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" /></label>
        <label className="flex items-center gap-2 text-sm"><input name="is_published" type="checkbox" /> Pubblica subito</label>
        <button disabled={submitting} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50">{submitting ? "Salvataggio..." : "Salva scheda"}</button>
        {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
      </form>
    </div>
  );
}
