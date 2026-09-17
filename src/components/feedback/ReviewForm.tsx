"use client";

import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { ensureProfile } from "@/lib/auth/ensure-profile";
import { createClient } from "@/lib/supabaseClient";
import { FormAlert } from "@/components/ui/FormAlert";
import type { ProjectCategory } from "@/types/database";

export function ReviewForm({ category, projectId }: { category: ProjectCategory; projectId: string }) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState("");
  const [scoreValues, setScoreValues] = useState<Record<string, string>>({});
  const fields = category === "gaming"
    ? [["Gameplay", "gameplay"], ["Grafica", "graphics"], ["Bilanciamento", "balance"], ["Divertimento", "fun"]]
    : [["Usabilità / UX", "usability"], ["Utilità", "usefulness"], ["Interfaccia / UI", "ui_quality"]];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setStatus(null);
    const cleanComment = comment.trim();
    const scores = Object.fromEntries(
      fields
        .map(([, key]) => {
          const value = (scoreValues[key] ?? "").trim();
          const score = value ? Number(value) : null;
          return [key, score !== null && Number.isFinite(score) ? score : null];
        }),
    );
    if (!cleanComment && !Object.values(scores).some((score) => score !== null)) {
      setMessage("Compila almeno un campo prima di inviare.");
      setStatus("error");
      setSubmitting(false);
      return;
    }
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await ensureProfile(supabase, user);
      const filledScores = Object.values(scores).filter(
        (score): score is number => typeof score === "number",
      );
      const softwareScores = {
        usability: scores.usability ?? null,
        usefulness: scores.usefulness ?? null,
        ui_quality: scores.ui_quality ?? null,
      };
      const cleanPayload = {
        project_id: projectId,
        user_id: user?.id ?? null,
        gameplay: scores.gameplay ?? null,
        graphics: scores.graphics ?? null,
        balance: scores.balance ?? null,
        fun: scores.fun ?? null,
        rating: filledScores.length
          ? Math.round(filledScores.reduce((sum, score) => sum + score, 0) / filledScores.length)
          : null,
        comment: cleanComment || null,
      };
      let { error } = await supabase
        .from("project_reviews")
        .insert({ ...cleanPayload, ...softwareScores });
      if (error?.code === "PGRST204") {
        // Database senza la migrazione 00012: i punteggi software finiscono nel commento.
        const summary = fields
          .filter(([, key]) => key in softwareScores && scores[key] !== null)
          .map(([axis, key]) => `${axis}: ${scores[key]}/5`)
          .join(" · ");
        ({ error } = await supabase.from("project_reviews").insert({
          ...cleanPayload,
          comment: [cleanPayload.comment, summary].filter(Boolean).join("\n\n") || null,
        }));
      }
      if (error) {
        console.error("Errore Supabase:", error);
        throw error;
      }
      setComment("");
      setScoreValues({});
      setMessage("Recensione pubblicata, grazie per il tuo feedback!");
      setStatus("success");
    } catch (error) {
      console.error("Submit Error:", error);
      setMessage(error instanceof Error ? error.message : "Pubblicazione non riuscita.");
      setStatus("error");
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
              value={scoreValues[name] ?? ""}
              onChange={(event) => setScoreValues((current) => ({ ...current, [name]: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2"
            />
          </label>
        ))}
      </div>
      <label className="block text-sm">
        Suggerimenti e critiche costruttive
        <textarea name="comment" value={comment} onChange={(event) => setComment(event.target.value)} maxLength={4000} rows={5} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
      </label>
      <button disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {submitting ? "Pubblicazione in corso..." : "Pubblica recensione"}
      </button>
      {message ? <FormAlert variant={status ?? "success"} message={message} /> : null}
    </form>
  );
}
