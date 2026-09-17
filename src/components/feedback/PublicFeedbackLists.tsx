"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { FormAlert } from "@/components/ui/FormAlert";
import { useLocale } from "@/components/i18n/LocaleProvider";

type Review = {
  id: string;
  user_id: string | null;
  gameplay?: number | null;
  graphics?: number | null;
  balance?: number | null;
  fun?: number | null;
  usability?: number | null;
  usefulness?: number | null;
  ui_quality?: number | null;
  rating?: number | null;
  comment: string | null;
  status?: string | null;
  created_at: string;
};

function reviewScore(review: Review) {
  const axes = [
    review.gameplay,
    review.graphics,
    review.balance,
    review.fun,
    review.usability,
    review.usefulness,
    review.ui_quality,
  ].filter((score): score is number => typeof score === "number");
  if (axes.length) {
    return axes.reduce((sum, score) => sum + score, 0) / axes.length;
  }
  return typeof review.rating === "number" ? review.rating : null;
}

type Bug = {
  id: string;
  user_id: string | null;
  title: string | null;
  steps: string | null;
  bug_type: string | null;
  status?: string | null;
  created_at: string;
};

function StatusBadge({ status }: { status?: string | null }) {
  const { t } = useLocale();
  const statusStyles: Record<string, string> = {
    pending: "bg-white/10 text-zinc-300",
    approved: "bg-emerald-500/15 text-emerald-300",
    rejected: "bg-red-500/15 text-red-300",
  };
  const statusLabels: Record<string, string> = {
    pending: t("status.pendingApproval"),
    approved: t("status.approved"),
    rejected: t("status.rejected"),
  };
  const value = status ?? "pending";
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[value] ?? statusStyles.pending}`}>
      {statusLabels[value] ?? t("status.pending")}
    </span>
  );
}

export function PublicFeedbackLists({
  projectId,
  projectOwnerId,
}: {
  projectId: string;
  projectOwnerId?: string;
}) {
  const { t } = useLocale();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const isOwner = Boolean(userId && projectOwnerId && userId === projectOwnerId);

  async function loadFeedback() {
    const supabase = createClient();
    const [reviewsResult, bugsResult] = await Promise.all([
      supabase
        .from("project_reviews")
        // select("*") perche' gli assi software esistono solo dopo la migrazione 00012.
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false }),
      supabase
        .from("project_bugs")
        .select("id, user_id, title, steps, bug_type, status, created_at")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false }),
    ]);
    if (!reviewsResult.error) setReviews((reviewsResult.data ?? []) as Review[]);
    if (!bugsResult.error) setBugs((bugsResult.data ?? []) as Bug[]);
    setLoading(false);
  }

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
      await loadFeedback();
    }
    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function updateReviewStatus(id: string, status: "approved" | "rejected") {
    setBusyId(id);
    setError("");
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("project_reviews")
        .update({ status })
        .eq("id", id);
      if (updateError) throw updateError;
      setReviews((current) => current.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : t("feedback.public.unableUpdateReview"));
    } finally {
      setBusyId(null);
    }
  }

  async function updateBugStatus(id: string, status: "approved" | "rejected") {
    setBusyId(id);
    setError("");
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("project_bugs")
        .update({ status })
        .eq("id", id);
      if (updateError) throw updateError;
      setBugs((current) => current.map((b) => (b.id === id ? { ...b, status } : b)));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : t("feedback.public.unableUpdateBug"));
    } finally {
      setBusyId(null);
    }
  }

  async function deleteReview(id: string) {
    if (!window.confirm(t("feedback.public.confirmDeleteReview"))) return;
    setBusyId(id);
    setError("");
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase.from("project_reviews").delete().eq("id", id);
      if (deleteError) throw deleteError;
      setReviews((current) => current.filter((r) => r.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : t("feedback.public.unableDeleteReview"));
    } finally {
      setBusyId(null);
    }
  }

  async function deleteBug(id: string) {
    if (!window.confirm(t("feedback.public.confirmDeleteBug"))) return;
    setBusyId(id);
    setError("");
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase.from("project_bugs").delete().eq("id", id);
      if (deleteError) throw deleteError;
      setBugs((current) => current.filter((b) => b.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : t("feedback.public.unableDeleteBug"));
    } finally {
      setBusyId(null);
    }
  }

  async function saveReviewEdit(id: string) {
    setBusyId(id);
    setError("");
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("project_reviews")
        .update({ comment: editingComment.trim() || null })
        .eq("id", id);
      if (updateError) throw updateError;
      setReviews((current) =>
        current.map((r) => (r.id === id ? { ...r, comment: editingComment.trim() || null } : r)),
      );
      setEditingReviewId(null);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : t("feedback.public.unableSaveEdit"));
    } finally {
      setBusyId(null);
    }
  }

  const scores = reviews
    .map(reviewScore)
    .filter((score): score is number => score !== null);
  const average = scores.length
    ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)
    : null;

  if (loading) return <p className="text-sm text-zinc-400">{t("feedback.public.loading")}</p>;

  return (
    <section className="space-y-4">
      {error ? <FormAlert variant="error" message={error} /> : null}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-ink-800 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">{t("feedback.public.reviewsTitle")}</h2>
            <span className="text-sm text-accent">{average ? `★ ${average}/5` : t("feedback.public.noRating")}</span>
          </div>
          <div className="mt-4 space-y-3">
            {reviews.map((review) => {
              const isAuthor = Boolean(userId && review.user_id === userId);
              return (
                <article key={review.id} className="rounded-lg border border-white/10 bg-ink-900 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-amber-300">{"★".repeat(Math.round(reviewScore(review) ?? 0))}</p>
                    {isAuthor || isOwner ? <StatusBadge status={review.status} /> : null}
                  </div>
                  {editingReviewId === review.id ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={editingComment}
                        onChange={(event) => setEditingComment(event.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={busyId === review.id}
                          onClick={() => void saveReviewEdit(review.id)}
                          className="rounded-md border border-accent/40 px-3 py-1.5 text-xs text-accent disabled:opacity-50"
                        >
                          {t("feedback.public.save")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingReviewId(null)}
                          className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-zinc-300"
                        >
                          {t("feedback.public.cancel")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    review.comment ? <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">{review.comment}</p> : null
                  )}
                  {isAuthor && editingReviewId !== review.id ? (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingReviewId(review.id);
                          setEditingComment(review.comment ?? "");
                        }}
                        className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-zinc-300"
                      >
                        {t("feedback.public.edit")}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === review.id}
                        onClick={() => void deleteReview(review.id)}
                        className="rounded-md border border-red-400/30 px-3 py-1.5 text-xs text-red-300 disabled:opacity-50"
                      >
                        {t("feedback.public.delete")}
                      </button>
                    </div>
                  ) : null}
                  {isOwner && !isAuthor ? (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        disabled={busyId === review.id || review.status === "approved"}
                        onClick={() => void updateReviewStatus(review.id, "approved")}
                        className="rounded-md border border-emerald-400/30 px-3 py-1.5 text-xs text-emerald-300 disabled:opacity-40"
                      >
                        {t("feedback.public.approve")}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === review.id || review.status === "rejected"}
                        onClick={() => void updateReviewStatus(review.id, "rejected")}
                        className="rounded-md border border-red-400/30 px-3 py-1.5 text-xs text-red-300 disabled:opacity-40"
                      >
                        {t("feedback.public.reject")}
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })}
            {!reviews.length ? <p className="text-sm text-zinc-400">{t("feedback.public.noReviews")}</p> : null}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-ink-800 p-6">
          <h2 className="text-xl font-semibold">{t("feedback.public.bugsTitle")}</h2>
          <div className="mt-4 space-y-3">
            {bugs.map((bug) => {
              const isAuthor = Boolean(userId && bug.user_id === userId);
              return (
                <article key={bug.id} className="rounded-lg border border-white/10 bg-ink-900 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-medium">{bug.title || t("feedback.public.untitledBug")}</h3>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-white/10 px-2 py-1 text-xs">
                        {bug.bug_type?.replaceAll("_", " ") || t("feedback.public.genericReport")}
                      </span>
                      {isAuthor || isOwner ? <StatusBadge status={bug.status} /> : null}
                    </div>
                  </div>
                  {bug.steps ? <p className="mt-2 line-clamp-3 text-sm text-zinc-400">{bug.steps}</p> : null}
                  {isAuthor ? (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        disabled={busyId === bug.id}
                        onClick={() => void deleteBug(bug.id)}
                        className="rounded-md border border-red-400/30 px-3 py-1.5 text-xs text-red-300 disabled:opacity-50"
                      >
                        {t("feedback.public.delete")}
                      </button>
                    </div>
                  ) : null}
                  {isOwner && !isAuthor ? (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        disabled={busyId === bug.id || bug.status === "approved"}
                        onClick={() => void updateBugStatus(bug.id, "approved")}
                        className="rounded-md border border-emerald-400/30 px-3 py-1.5 text-xs text-emerald-300 disabled:opacity-40"
                      >
                        {t("feedback.public.approve")}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === bug.id || bug.status === "rejected"}
                        onClick={() => void updateBugStatus(bug.id, "rejected")}
                        className="rounded-md border border-red-400/30 px-3 py-1.5 text-xs text-red-300 disabled:opacity-40"
                      >
                        {t("feedback.public.reject")}
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })}
            {!bugs.length ? <p className="text-sm text-zinc-400">{t("feedback.public.noBugs")}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}