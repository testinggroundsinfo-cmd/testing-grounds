"use client";

import { ArrowBigUp } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useToast } from "@/components/feedback/ToastProvider";

export function ProjectUpvoteButton({
  projectId,
  ownerId,
  initialCount,
}: {
  projectId: string;
  ownerId: string;
  initialCount: number;
}) {
  const { t } = useLocale();
  const { toast } = useToast();
  const [count, setCount] = useState(initialCount);
  const [upvoted, setUpvoted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    void supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return;
      const currentUserId = data.user?.id ?? null;
      setUserId(currentUserId);
      if (!currentUserId) return;
      const { data: existing } = await supabase
        .from("project_upvotes")
        .select("id")
        .eq("project_id", projectId)
        .eq("user_id", currentUserId)
        .maybeSingle();
      if (mounted) setUpvoted(Boolean(existing));
    });

    // Realtime-ish: any update to this project's cached upvote_count
    // (kept in sync by a DB trigger) refreshes the badge across every
    // open tab/session, without polling.
    const channel = supabase
      .channel(`project-upvotes-${projectId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "projects", filter: `id=eq.${projectId}` },
        (payload) => {
          const next = (payload.new as { upvote_count?: number }).upvote_count;
          if (typeof next === "number" && mounted) setCount(next);
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function toggle() {
    if (!userId) {
      setError(t("upvote.loginRequired"));
      return;
    }
    if (userId === ownerId) return;
    setBusy(true);
    setError("");
    const supabase = createClient();
    try {
      if (upvoted) {
        const { error: deleteError } = await supabase
          .from("project_upvotes")
          .delete()
          .eq("project_id", projectId)
          .eq("user_id", userId);
        if (deleteError) throw deleteError;
        setUpvoted(false);
        setCount((current) => Math.max(0, current - 1));
        toast(t("upvote.removed"));
      } else {
        const { error: insertError } = await supabase
          .from("project_upvotes")
          .insert({ project_id: projectId, user_id: userId });
        if (insertError) throw insertError;
        setUpvoted(true);
        setCount((current) => current + 1);
        toast(t("upvote.recorded"));
      }
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : t("upvote.error"));
      toast(t("upvote.error"), "error");
    } finally {
      setBusy(false);
    }
  }

  const isOwnProject = Boolean(userId && userId === ownerId);

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={busy || isOwnProject}
        aria-pressed={upvoted}
        aria-label={t("upvote.button")}
        title={isOwnProject ? t("upvote.ownProject") : undefined}
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
          upvoted
            ? "border-accent bg-accent/15 text-accent"
            : "border-white/15 text-zinc-300 hover:border-accent/40 hover:text-accent"
        }`}
      >
        <ArrowBigUp className={`h-4 w-4 ${upvoted ? "fill-accent" : ""}`} />
        {count}
      </button>
      {error ? <p role="alert" className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
