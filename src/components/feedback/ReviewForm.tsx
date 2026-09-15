"use client";

import { FormEvent, useState } from "react";
import { ensureProfile, requireBrowserUser } from "@/lib/auth/ensure-profile";
import { createClient } from "@/lib/supabaseClient";
import type { ProjectCategory } from "@/types/database";

export function ReviewForm({ category, projectId }: { category: ProjectCategory; projectId: string }) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fields = category === "gaming"
    ? [["Gameplay", "gameplay"], ["Grafica", "graphics"], ["Bilanciamento", "balance"], ["Divertimento", "fun"]]
    : [["Usabilità / UX", "usability"], ["Utilità", "usefulness"], ["Interfaccia / UI", "ui_quality"]];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const supabase = createClient();
      const user = await requireBrowserUser(supabase);
      await ensureProfile(supabase, user);
      const scores = Object.fromEntries(fields.map(([, key]) => [key, Number(form.get(key))]));
      const { error } = await supabase.from("reviews").insert({
        project_id: projectId,
        author_id: user.id,
        gameplay: scores.gameplay ?? null,
        graphics: scores.graphics ?? null,
        balance: scores.balance ?? null,
        fun: scores.fun ?? null,
        usability: scores.usability ?? null,
        usefulness: scores.usefulness ?? null,
        ui_quality: scores.ui_quality ?? null,
        comment: String(form.get("comment") || ""),
      });
      if (error) throw error;
      event.currentTarget.reset();
      setMessage("Recensione pubblicata.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Pubblicazione non riuscita.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-ink-800 p-6">
      <h2 className="text-lg font-medium">Recensioni &amp; consigli</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map(([axis, name]) => (
          <label key={axis} className="text-sm">
            {axis} (1–5)
            <input
              name={name}
              type="number"
              min={1}
              max={5}
              required
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
            />
          </label>
        ))}
      </div>
      <label className="block text-sm">
        Suggerimenti e critiche costruttive
        <textarea name="comment" required minLength={20} maxLength={4000} rows={5} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
      </label>
      <button disabled={submitting} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50">
        {submitting ? "Pubblicazione..." : "Pubblica recensione"}
      </button>
      {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
    </form>
  );
}
