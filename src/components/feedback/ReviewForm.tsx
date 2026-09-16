"use client";

import { FormEvent, useState } from "react";
import { ensureProfile } from "@/lib/auth/ensure-profile";
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
    const comment = String(form.get("comment") ?? "").trim();
    const scores = Object.fromEntries(
      fields
        .map(([, key]) => {
          const value = String(form.get(key) ?? "").trim();
          return [key, value ? Number(value) : null];
        }),
    );
    if (!comment && !Object.values(scores).some((score) => score !== null)) {
      setMessage("Compila almeno un campo prima di inviare.");
      setSubmitting(false);
      return;
    }
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await ensureProfile(supabase, user);
      const cleanPayload = {
        project_id: projectId,
        author_id: user?.id ?? null,
        gameplay: scores.gameplay ?? null,
        graphics: scores.graphics ?? null,
        balance: scores.balance ?? null,
        fun: scores.fun ?? null,
        usability: scores.usability ?? null,
        usefulness: scores.usefulness ?? null,
        ui_quality: scores.ui_quality ?? null,
        comment: comment || null,
      };
      const { error } = await supabase.from("reviews").insert(cleanPayload);
      if (error) {
        console.error("Errore Supabase:", error);
        throw error;
      }
      event.currentTarget.reset();
      setMessage("Recensione pubblicata.");
    } catch (error) {
      console.error("Submit Error:", error);
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
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
            />
          </label>
        ))}
      </div>
      <label className="block text-sm">
        Suggerimenti e critiche costruttive
        <textarea name="comment" maxLength={4000} rows={5} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
      </label>
      <button disabled={submitting} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50">
        {submitting ? "Pubblicazione..." : "Pubblica recensione"}
      </button>
      {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
    </form>
  );
}
