"use client";

import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { requireBrowserUser } from "@/lib/auth/ensure-profile";
import { createClient } from "@/lib/supabaseClient";
import { FormAlert } from "@/components/ui/FormAlert";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { ProjectCategory } from "@/types/database";

export function ReviewForm({ category, projectId }: { category: ProjectCategory; projectId: string }) {
  const { t } = useLocale();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState("");
  const [scoreValues, setScoreValues] = useState<Record<string, string>>({});
  const fields = category === "gaming"
    ? [
        [t("feedback.review.axisGameplay"), "gameplay"],
        [t("feedback.review.axisGraphics"), "graphics"],
        [t("feedback.review.axisBalance"), "balance"],
        [t("feedback.review.axisFun"), "fun"],
      ]
    : [
        [t("feedback.review.axisUsability"), "usability"],
        [t("feedback.review.axisUsefulness"), "usefulness"],
        [t("feedback.review.axisUiQuality"), "ui_quality"],
      ];

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
      setMessage(t("feedback.review.emptyFieldsError"));
      setStatus("error");
      setSubmitting(false);
      return;
    }
    try {
      const supabase = createClient();
      const user = await requireBrowserUser(supabase);
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
        user_id: user.id,
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
      setMessage(t("feedback.review.success"));
      setStatus("success");
    } catch (error) {
      console.error("Submit Error:", error);
      setMessage(error instanceof Error ? error.message : t("feedback.review.failure"));
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-ink-800 p-6">
      <h2 className="text-lg font-medium">{t("feedback.review.title")}</h2>
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
        {t("feedback.review.comment")}
        <textarea name="comment" value={comment} onChange={(event) => setComment(event.target.value)} maxLength={4000} rows={5} className="mt-1 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2" />
      </label>
      <button disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {submitting ? t("feedback.review.sending") : t("feedback.review.submit")}
      </button>
      {message ? <FormAlert variant={status ?? "success"} message={message} /> : null}
    </form>
  );
}