"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

type Review = {
  id: string;
  gameplay: number | null;
  graphics: number | null;
  balance: number | null;
  fun: number | null;
  usability: number | null;
  usefulness: number | null;
  ui_quality: number | null;
  comment: string | null;
  created_at: string;
};

type Bug = {
  id: string;
  title: string | null;
  steps: string | null;
  bug_type: string | null;
  created_at: string;
};

export function PublicFeedbackLists({ projectId }: { projectId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [reviewsResult, bugsResult] = await Promise.all([
        supabase
          .from("project_reviews")
          .select("id, gameplay, graphics, balance, fun, usability, usefulness, ui_quality, comment, created_at")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false }),
        supabase
          .from("project_bugs")
          .select("id, title, steps, bug_type, created_at")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false }),
      ]);
      if (!reviewsResult.error) setReviews((reviewsResult.data ?? []) as Review[]);
      if (!bugsResult.error) setBugs((bugsResult.data ?? []) as Bug[]);
      setLoading(false);
    }
    void load();
  }, [projectId]);

  const scores = reviews.flatMap((review) =>
    [
      review.gameplay,
      review.graphics,
      review.balance,
      review.fun,
      review.usability,
      review.usefulness,
      review.ui_quality,
    ].filter((score): score is number => typeof score === "number"),
  );
  const average = scores.length
    ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)
    : null;

  if (loading) return <p className="text-sm text-zinc-400">Caricamento feedback pubblici...</p>;

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-ink-800 p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Recensioni &amp; consigli</h2>
          <span className="text-sm text-accent">{average ? `★ ${average}/5` : "Nessun voto"}</span>
        </div>
        <div className="mt-4 space-y-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-lg border border-white/10 bg-ink-900 p-3">
              <p className="text-amber-300">{"★".repeat(Math.round(scores.length ? Number(average) : 0))}</p>
              {review.comment ? <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">{review.comment}</p> : null}
            </article>
          ))}
          {!reviews.length ? <p className="text-sm text-zinc-400">Nessuna recensione pubblica.</p> : null}
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-ink-800 p-6">
        <h2 className="text-xl font-semibold">Bug report della community</h2>
        <div className="mt-4 space-y-3">
          {bugs.map((bug) => (
            <article key={bug.id} className="rounded-lg border border-white/10 bg-ink-900 p-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium">{bug.title || "Segnalazione senza titolo"}</h3>
                <span className="rounded-full bg-white/10 px-2 py-1 text-xs">
                  {bug.bug_type?.replaceAll("_", " ") || "Segnalazione"}
                </span>
              </div>
              {bug.steps ? <p className="mt-2 line-clamp-3 text-sm text-zinc-400">{bug.steps}</p> : null}
            </article>
          ))}
          {!bugs.length ? <p className="text-sm text-zinc-400">Nessun bug report pubblico.</p> : null}
        </div>
      </div>
    </section>
  );
}
